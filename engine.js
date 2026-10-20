// Mesin suara: bunyi bel (WebAudio, tanpa file), suara AI (TTS browser), antrean pemutaran
const Engine = (() => {
  let ctx, master;
  let volume = 1;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function ac() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // Satu pukulan lonceng: beberapa harmonik dengan peluruhan eksponensial
  function strike(freq, t, dur, vol = 0.35) {
    const c = ac();
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(master);
    [1, 2.01, 3.2, 4.1].forEach((p, i) => {
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.value = freq * p;
      const pg = c.createGain();
      pg.gain.value = 1 / (i + 1.5);
      o.connect(pg).connect(g);
      o.start(t);
      o.stop(t + dur + 0.05);
    });
  }

  const BELLS = {
    klasik: {
      label: "Bel Klasik (bel listrik)",
      dur: 3.2,
      play(t) {
        const c = ac();
        const g = c.createGain();
        g.connect(master);
        [1180, 1490].forEach((f) => {
          const o = c.createOscillator();
          o.type = "sine";
          o.frequency.value = f;
          o.connect(g);
          o.start(t);
          o.stop(t + 3.2);
        });
        for (let i = 0; i < 64; i++) g.gain.setValueAtTime(i % 2 === 0 ? 0.28 : 0.0, t + i * 0.05);
        g.gain.setValueAtTime(0, t + 3.2);
      },
    },
    westminster: {
      label: "Westminster Chime",
      dur: 9,
      play(t) {
        const seq = [415.3, 369.99, 329.63, 246.94, 329.63, 415.3, 369.99, 246.94];
        seq.forEach((f, i) => strike(f, t + i * 0.85 + (i >= 4 ? 0.6 : 0), 2.4));
      },
    },
    dingdong: {
      label: "Ding Dong",
      dur: 3,
      play(t) {
        strike(659.25, t, 1.8);
        strike(523.25, t + 0.95, 2.0);
      },
    },
  };

  function playBell(id, repeat = 1) {
    const b = BELLS[id] || BELLS.klasik;
    const c = ac();
    let t = c.currentTime + 0.1;
    for (let i = 0; i < repeat; i++) {
      b.play(t);
      t += b.dur + 0.3;
    }
    return sleep((t - c.currentTime) * 1000);
  }

  // ----- Suara AI (Text-to-Speech bawaan browser) -----
  let voiceList = [];
  function loadVoices() {
    return new Promise((res) => {
      if (!("speechSynthesis" in window)) return res([]);
      const v = speechSynthesis.getVoices();
      if (v.length) {
        voiceList = v;
        return res(v);
      }
      speechSynthesis.onvoiceschanged = () => {
        voiceList = speechSynthesis.getVoices();
        res(voiceList);
      };
      setTimeout(() => {
        voiceList = speechSynthesis.getVoices();
        res(voiceList);
      }, 1500);
    });
  }

  function speak(text, opt = {}) {
    return new Promise((res) => {
      if (!text || !("speechSynthesis" in window)) return res();
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "id-ID";
      const v = voiceList.find((x) => x.name === opt.voice);
      if (v) {
        u.voice = v;
        u.lang = v.lang;
      }
      u.rate = opt.rate ?? 1;
      u.pitch = opt.pitch ?? 1;
      u.volume = opt.volume ?? 1;
      u.onend = () => res();
      u.onerror = () => res();
      speechSynthesis.speak(u);
    });
  }

  function playUrl(url, vol = 1) {
    return new Promise((res) => {
      const a = new Audio(url);
      a.volume = Math.min(1, vol);
      a.onended = () => res();
      a.onerror = () => res();
      a.play().catch(() => res());
    });
  }

  // ----- Antrean: bunyi bel & pengumuman tidak saling tumpang tindih -----
  const E = {
    BELLS,
    live: false,
    sleep,
    unlock: ac,
    playBell,
    speak,
    playUrl,
    loadVoices,
    voices: () => voiceList,
    setVolume(v) {
      volume = v;
      if (master) master.gain.value = v;
    },
    _chain: Promise.resolve(),
    enqueue(fn) {
      this._chain = this._chain.then(async () => {
        while (E.live) await sleep(500);
        try {
          await fn();
        } catch (e) {
          console.error(e);
        }
      });
      return this._chain;
    },
  };
  return E;
})();
