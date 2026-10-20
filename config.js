// ====== KONFIGURASI ======
// Isi SUPABASE_URL dan SUPABASE_KEY (anon public key) dari Supabase > Project Settings > API.
// Jika dikosongkan, aplikasi berjalan dalam MODE LOKAL (data hanya di browser PC itu,
// pengumuman rekaman dari HP tidak berfungsi).
window.BEL_CONFIG = {
  SUPABASE_URL: "",
  SUPABASE_KEY: "",
  // Kode unik ruang siaran langsung. WAJIB diganti dengan kode acak milik Anda
  // (huruf/angka/tanda minus, tanpa spasi), mis. "pesantren-x7k2q9".
  ROOM: "pesantren-ganti-kode-ini",
  // PIN untuk membuka halaman pengumuman di HP.
  PIN: "1234"
};
