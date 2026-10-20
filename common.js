// Lapisan data bersama: Supabase (mode online) atau localStorage (mode lokal)
(function () {
  const C = window.BEL_CONFIG || {};
  const REMOTE = !!(C.SUPABASE_URL && C.SUPABASE_KEY && window.supabase);
  const sb = REMOTE ? window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_KEY) : null;
  const lsKey = (t) => "bel_" + t;
  const uid = () =>
    crypto.randomUUID ? crypto.randomUUID() : "id" + Date.now() + Math.random().toString(16).slice(2);
  const readLocal = (t) => JSON.parse(localStorage.getItem(lsKey(t)) || "[]");
  const writeLocal = (t, a) => localStorage.setItem(lsKey(t), JSON.stringify(a));

  const DEFAULT_SETTINGS = { voice: "", rate: 0.95, pitch: 1, volume: 1, bell: "klasik" };

  window.DB = {
    remote: REMOTE,
    uid,
    async list(t, order = "created_at") {
      if (REMOTE) {
        const { data, error } = await sb.from(t).select("*").order(order, { ascending: true });
        if (error) throw error;
        return data || [];
      }
      return readLocal(t);
    },
    async save(t, row) {
      if (!row.id) row.id = uid();
      if (REMOTE) {
        const { error } = await sb.from(t).upsert(row);
        if (error) throw error;
        return row;
      }
      const arr = readLocal(t);
      const i = arr.findIndex((r) => r.id === row.id);
      if (i >= 0) arr[i] = { ...arr[i], ...row };
      else arr.push({ created_at: new Date().toISOString(), ...row });
      writeLocal(t, arr);
      return row;
    },
    async del(t, id) {
      if (REMOTE) {
        const { error } = await sb.from(t).delete().eq("id", id);
        if (error) throw error;
        return;
      }
      writeLocal(t, readLocal(t).filter((r) => r.id !== id));
    },
    async upload(blob) {
      if (!REMOTE) throw new Error("Rekaman butuh Supabase. Isi config.js terlebih dahulu.");
      const type = (blob.type || "audio/webm").split(";")[0];
      const ext = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm";
      const path = new Date().toISOString().slice(0, 10) + "/" + uid() + "." + ext;
      const { error } = await sb.storage.from("pengumuman").upload(path, blob, { contentType: type });
      if (error) throw error;
      return path;
    },
    audioUrl(path) {
      return sb.storage.from("pengumuman").getPublicUrl(path).data.publicUrl;
    },
    async removeAudio(path) {
      if (REMOTE && path) await sb.storage.from("pengumuman").remove([path]);
    },
    async getSettings() {
      const l = await this.list("settings", "id");
      const r = l.find((x) => x.id === "main");
      return { ...DEFAULT_SETTINGS, ...((r && r.data) || {}) };
    },
    saveSettings(data) {
      return this.save("settings", { id: "main", data });
    },
  };
})();
