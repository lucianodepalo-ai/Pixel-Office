// =============================================
// ENGINE-SOUND.JS — Habbo-style Sound Manager
// =============================================
// Uses Web Audio API for UI sounds (synthesized)
// Uses Trax samples from Habbo CDN for ambient music

// ====== AUDIO CONTEXT ======
let _audioCtx = null;
let _soundEnabled = true;
let _musicEnabled = true;
let _soundVolume = 0.5;
let _musicVolume = 0.3;
let _currentMusic = null;
let _musicLoop = null;

function getAudioCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (_audioCtx.state === 'suspended') {
    _audioCtx.resume();
  }
  return _audioCtx;
}

// ====== UI SOUNDS (synthesized — no external files needed) ======

function playSound(type) {
  if (!_soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    switch(type) {
      case 'click': _playClick(ctx); break;
      case 'purchase': _playPurchase(ctx); break;
      case 'coins': _playCoins(ctx); break;
      case 'message': _playMessage(ctx); break;
      case 'notification': _playNotification(ctx); break;
      case 'levelup': _playLevelUp(ctx); break;
      case 'place': _playPlace(ctx); break;
      case 'error': _playError(ctx); break;
      case 'walk': _playWalk(ctx); break;
      case 'open': _playOpen(ctx); break;
      case 'close': _playClose(ctx); break;
    }
  } catch(e) { /* silent fail */ }
}

// Click — short, clean tick
function _playClick(ctx) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
  gain.gain.setValueAtTime(_soundVolume * 0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.08);
}

// Purchase — Habbo "cha-ching" cash register style
function _playPurchase(ctx) {
  const t = ctx.currentTime;
  // First note — bright bell
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'triangle';
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.frequency.setValueAtTime(1200, t);
  osc1.frequency.setValueAtTime(1600, t + 0.08);
  gain1.gain.setValueAtTime(_soundVolume * 0.4, t);
  gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  osc1.start(t);
  osc1.stop(t + 0.25);
  // Second note — higher, delayed
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.frequency.setValueAtTime(1800, t + 0.1);
  osc2.frequency.setValueAtTime(2200, t + 0.18);
  gain2.gain.setValueAtTime(0, t);
  gain2.gain.setValueAtTime(_soundVolume * 0.35, t + 0.1);
  gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  osc2.start(t + 0.1);
  osc2.stop(t + 0.35);
}

// Coins — jingling coins sound
function _playCoins(ctx) {
  const t = ctx.currentTime;
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(2000 + i * 400, t + i * 0.06);
    gain.gain.setValueAtTime(_soundVolume * 0.25, t + i * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.12);
    osc.start(t + i * 0.06);
    osc.stop(t + i * 0.06 + 0.12);
  }
}

// Message sent — soft whoosh
function _playMessage(ctx) {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(400, t);
  osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);
  osc.frequency.exponentialRampToValueAtTime(600, t + 0.15);
  gain.gain.setValueAtTime(_soundVolume * 0.2, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc.start(t);
  osc.stop(t + 0.2);
}

// Notification — Habbo-style double beep
function _playNotification(ctx) {
  const t = ctx.currentTime;
  for (let i = 0; i < 2; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, t + i * 0.15);
    gain.gain.setValueAtTime(_soundVolume * 0.3, t + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.1);
    osc.start(t + i * 0.15);
    osc.stop(t + i * 0.15 + 0.1);
  }
}

// Level Up — ascending triumphant arpeggio
function _playLevelUp(ctx) {
  const t = ctx.currentTime;
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(freq, t + i * 0.1);
    gain.gain.setValueAtTime(_soundVolume * 0.35, t + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.3);
    osc.start(t + i * 0.1);
    osc.stop(t + i * 0.1 + 0.3);
  });
}

// Place furniture — thud/drop
function _playPlace(ctx) {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.exponentialRampToValueAtTime(80, t + 0.15);
  gain.gain.setValueAtTime(_soundVolume * 0.4, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc.start(t);
  osc.stop(t + 0.2);
}

// Error — descending buzz
function _playError(ctx) {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(400, t);
  osc.frequency.exponentialRampToValueAtTime(200, t + 0.2);
  gain.gain.setValueAtTime(_soundVolume * 0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  osc.start(t);
  osc.stop(t + 0.25);
}

// Walk — soft footstep
function _playWalk(ctx) {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = 'square';
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(300, t);
  osc.frequency.setValueAtTime(120 + Math.random() * 40, t);
  gain.gain.setValueAtTime(_soundVolume * 0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  osc.start(t);
  osc.stop(t + 0.06);
}

// Open panel/menu
function _playOpen(ctx) {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.exponentialRampToValueAtTime(600, t + 0.08);
  gain.gain.setValueAtTime(_soundVolume * 0.2, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc.start(t);
  osc.stop(t + 0.12);
}

// Close panel/menu
function _playClose(ctx) {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(600, t);
  osc.frequency.exponentialRampToValueAtTime(300, t + 0.08);
  gain.gain.setValueAtTime(_soundVolume * 0.2, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc.start(t);
  osc.stop(t + 0.12);
}

// ====== AMBIENT MUSIC (Trax samples from Habbo CDN) ======

const AMBIENT_TRACKS = [
  // Calm ambient loops good for office background
  {id: 10, name: 'Ambient 1'},
  {id: 11, name: 'Ambient 2'},
  {id: 12, name: 'Ambient 3'},
  {id: 46, name: 'Ambience 1'},
  {id: 47, name: 'Ambience 2'},
  {id: 48, name: 'Ambience 3'},
  {id: 208, name: 'Compu 1'},
  {id: 209, name: 'Compu 2'},
  {id: 210, name: 'Compu 3'},
];

let _ambientBuffer = null;
let _ambientSource = null;
let _ambientGain = null;

function playAmbientMusic(trackId) {
  if (!_musicEnabled) return;
  stopAmbientMusic();

  const ctx = getAudioCtx();
  const url = 'sounds/trax_sample_' + (trackId || AMBIENT_TRACKS[0].id) + '.mp3';

  fetch(url)
    .then(r => r.arrayBuffer())
    .then(buf => ctx.decodeAudioData(buf))
    .then(decoded => {
      _ambientBuffer = decoded;
      _ambientSource = ctx.createBufferSource();
      _ambientGain = ctx.createGain();
      _ambientSource.buffer = decoded;
      _ambientSource.loop = true;
      _ambientSource.connect(_ambientGain);
      _ambientGain.connect(ctx.destination);
      _ambientGain.gain.setValueAtTime(_musicVolume, ctx.currentTime);
      _ambientSource.start();
      _currentMusic = trackId;
    })
    .catch(e => console.warn('[Sound] Failed to load ambient:', e));
}

function stopAmbientMusic() {
  if (_ambientSource) {
    try { _ambientSource.stop(); } catch(e) {}
    _ambientSource = null;
  }
  _currentMusic = null;
}

function setMusicVolume(vol) {
  _musicVolume = Math.max(0, Math.min(1, vol));
  if (_ambientGain) {
    _ambientGain.gain.setValueAtTime(_musicVolume, getAudioCtx().currentTime);
  }
}

function setSoundVolume(vol) {
  _soundVolume = Math.max(0, Math.min(1, vol));
}

function toggleSound() {
  _soundEnabled = !_soundEnabled;
  if (!_soundEnabled) stopAmbientMusic();
  return _soundEnabled;
}

function toggleMusic() {
  _musicEnabled = !_musicEnabled;
  if (_musicEnabled) {
    playAmbientMusic(AMBIENT_TRACKS[Math.floor(Math.random() * AMBIENT_TRACKS.length)].id);
  } else {
    stopAmbientMusic();
  }
  return _musicEnabled;
}

// ====== INIT: enable audio on first user interaction ======
function initAudio() {
  const unlock = function() {
    getAudioCtx();
    document.removeEventListener('click', unlock);
    document.removeEventListener('touchstart', unlock);
    document.removeEventListener('keydown', unlock);
    console.log('[Sound] Audio context initialized');
  };
  document.addEventListener('click', unlock, { once: false });
  document.addEventListener('touchstart', unlock, { once: false });
  document.addEventListener('keydown', unlock, { once: false });
}

// Auto-init when script loads
initAudio();
