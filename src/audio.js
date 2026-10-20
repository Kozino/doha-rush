// Small procedurally synthesised motor, wind and UI cues. No audio downloads needed.
export class GameAudio {
  constructor() {
    this.context = null;
    this.volume = 0.45;
    this.muted = false;
  }
  start() {
    if (this.context) { this.context.resume().catch(() => {}); return; }
    try {
      const A = window.AudioContext || window.webkitAudioContext;
      if (!A) return;
      const ctx = this.context = new A();
      this.master = ctx.createGain(); this.master.gain.value = this.volume;
      this.master.connect(ctx.destination);
      this.filter = ctx.createBiquadFilter(); this.filter.type = 'lowpass'; this.filter.frequency.value = 380;
      this.engineGain = ctx.createGain(); this.engineGain.gain.value = 0;
      this.filter.connect(this.engineGain); this.engineGain.connect(this.master);
      this.o1 = ctx.createOscillator(); this.o1.type = 'sawtooth'; this.o1.frequency.value = 80;
      this.o2 = ctx.createOscillator(); this.o2.type = 'triangle'; this.o2.frequency.value = 120;
      this.o1.connect(this.filter); this.o2.connect(this.filter);
      this.o1.start(); this.o2.start();
      const buff = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 1.5), ctx.sampleRate);
      const dat = buff.getChannelData(0);
      for (let i = 0; i < dat.length; i++) dat[i] = Math.random() * 2 - 1;
      const windSource = ctx.createBufferSource(); windSource.buffer = buff; windSource.loop = true;
      const windFilter = ctx.createBiquadFilter(); windFilter.type = 'bandpass'; windFilter.frequency.value = 1100;
      this.windGain = ctx.createGain(); this.windGain.gain.value = 0;
      windSource.connect(windFilter); windFilter.connect(this.windGain); this.windGain.connect(this.master);
      windSource.start();
    } catch (_) { this.context = null; }
  }
  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, +v));
    if (this.master && this.context) this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.context.currentTime, .035);
  }
  toggleMute() { this.muted = !this.muted; this.setVolume(this.volume); return this.muted; }
  update({ speed = 0, throttle = 0, playing = false, maxSpeed = 50 } = {}) {
    if (!this.context || !this.engineGain) return;
    const t = this.context.currentTime;
    const velocity = Math.min(1, Math.abs(speed) / maxSpeed);
    const rpm = .18 + velocity * .78 + throttle * .2;
    this.o1.frequency.setTargetAtTime(56 + rpm * 175, t, .07);
    this.o2.frequency.setTargetAtTime(84 + rpm * 263, t, .07);
    this.filter.frequency.setTargetAtTime(250 + rpm * 760, t, .08);
    this.engineGain.gain.setTargetAtTime(playing ? .043 + throttle * .047 + velocity * .035 : 0, t, .12);
    this.windGain.gain.setTargetAtTime(playing ? velocity * .025 : 0, t, .14);
  }
  beep(frequency = 620, duration = .11, type = 'sine', loudness = .13) {
    if (!this.context) return;
    const ctx = this.context;
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = type; osc.frequency.value = frequency;
    gain.gain.setValueAtTime(Math.max(.0001, loudness), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration);
    osc.connect(gain); gain.connect(this.master);
    osc.start(); osc.stop(ctx.currentTime + duration);
  }
}
