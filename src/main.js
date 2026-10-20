import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ROUTES, CARS, DRIVERS, CAMERA_NAMES, TIMES } from './data.js';
import { createWorld } from './world.js';
import { createCar, animateCar } from './car.js';
import { GameAudio } from './audio.js';
import './styles.css';

const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${(s % 60).toFixed(2).padStart(5, '0')}`;
const kBest = (id) => `doha-rush:best:${id}`;
const kLap = (id) => `doha-rush:lap:${id}`;
const readNumber = (key) => { try { return Number(localStorage.getItem(key)) || 0; } catch { return 0; } };
const store = (key, value) => { try { localStorage.setItem(key, String(value)); } catch { /* private browsing */ } };
const isTouch = matchMedia('(pointer: coarse)').matches;

const app = $('app');
app.innerHTML = `
  <div class="sky" id="sky"></div>
  <div id="game-canvas" aria-label="Interactive 3D Doha driving game"></div>
  <div class="atmosphere" aria-hidden="true"></div>
  <div class="scanline" aria-hidden="true"></div>
  <div id="loader" class="loader">
    <div class="loader-mark"><span>D</span><i></i><span>R</span></div>
    <div class="loader-label">WELCOME TO THE CITY OF LIGHT</div>
    <div class="load-track"><div class="load-fill"></div></div>
    <small>BUILDING THE CITY...</small>
  </div>
  <header class="global-head" id="global-head">
    <div class="brand-small" data-action="menu" role="button" tabindex="0" aria-label="Doha Rush main menu">
      <span class="brand-mark">DR<span class="brand-mark-point">.</span></span>
      <span class="brand-word">DOHA <strong>RUSH</strong><small>QATAR · 2026</small></span>
    </div>
    <div class="head-right"><span class="live-dot"></span><span id="head-district">LUSAIL, QATAR</span><span class="head-separator">/</span><span id="head-coords">ROUTE 01 / 03</span></div>
  </header>
  <main id="menu" class="menu-screen hidden" aria-label="Main menu">
    <div class="menu-content">
      <div class="hero-eyebrow"><span class="eyebrow-dash"></span> DRIVE THE CITY OF LIGHT <span class="eyebrow-end">/ 01</span></div>
      <h1 class="hero-title"><span>DOHA</span><em>RUSH<span class="hero-period">.</span></em></h1>
      <p class="hero-description">Three iconic districts. One unforgettable drive.<br>Find your line through <strong>Lusail, The Pearl &amp; West Bay.</strong></p>
      <div class="hero-divider"><span></span><i>SELECT YOUR DRIVE</i><span></span></div>
      <nav class="menu-actions" aria-label="Game modes">
        <button class="action-primary" data-action="start"><span class="action-icon">↗</span><span>START RALLY<small>8 CHECKPOINTS · RACE THE CLOCK</small></span><span class="action-arrow">→</span></button>
        <button class="action-secondary" data-action="free"><span class="secondary-icon">◉</span><span>FREE DRIVE</span><span class="action-arrow">↗</span></button>
        <button class="action-secondary" data-action="garage"><span class="secondary-icon">▦</span><span>GARAGE &amp; ROUTES</span><span class="action-arrow">↗</span></button>
        <div class="menu-action-row">
          <button class="action-quiet" data-action="photo"><span>⌗</span> PHOTO MODE</button>
          <button class="action-quiet" data-action="how"><span>?</span> HOW TO PLAY</button>
        </div>
        <div class="menu-action-row menu-action-sub">
          <button class="action-link" data-action="settings">SETTINGS <span>↗</span></button>
          <button class="action-link" data-action="credits">ABOUT THE GAME <span>↗</span></button>
        </div>
      </nav>
      <div class="no-login"><span class="no-login-dot"></span> NO ACCOUNT. NO DOWNLOAD. JUST DRIVE.</div>
    </div>
    <aside class="menu-route-picker" aria-label="Select your route">
      <div class="picker-heading"><span>CHOOSE YOUR DISTRICT</span><span id="route-picker-count">01 / 03</span></div>
      <div class="route-options" id="menu-route-options"></div>
      <div class="picker-footer"><span>◀</span> A STYLISED DRIVE THROUGH QATAR <span>▶</span></div>
    </aside>
    <div class="menu-edge-label">BUILT FOR THE OPEN ROAD <span>✳</span> MADE FOR QATAR</div>
  </main>
  <section id="garage" class="garage-screen hidden" aria-label="Garage and routes">
    <div class="garage-sidebar">
      <div class="garage-top"><span class="section-kicker">01 / CHOOSE YOUR DRIVE</span><button class="round-close" data-action="back" aria-label="Back to main menu">×</button></div>
      <h2 class="section-title">THE <em>GARAGE.</em></h2>
      <p class="garage-intro">Pick your machine. Pick your streets. The whole city is yours.</p>
      <div class="garage-overflow">
        <div class="panel-label"><span>01</span> SELECT YOUR CAR</div>
        <div id="garage-car"></div>
        <div class="panel-label"><span>02</span> SELECT YOUR ROUTE</div>
        <div id="garage-routes"></div>
        <div class="panel-label"><span>03</span> DRIVER</div>
        <div id="garage-drivers"></div>
      </div>
      <div class="garage-footer">
        <button class="garage-start" data-action="start">START RALLY <span>↗</span></button>
        <button class="garage-free" data-action="free">JUST DRIVE <span>→</span></button>
      </div>
    </div>
    <div class="garage-visual-label"><span>IN THE GARAGE</span><strong id="garage-visual-car">DESERT FALCON</strong><small id="garage-visual-route">LUSAIL · QATAR</small></div>
  </section>
  <section id="hud" class="hud hidden" aria-label="Driving dashboard">
    <div class="race-board glass">
      <div class="race-title"><span class="board-indicator"></span><span id="hud-stage">LUSAIL LIGHTS</span><span id="mode-tag">RALLY</span></div>
      <div class="timer-row"><div><small>RACE TIME</small><strong id="race-time">00:00.00</strong></div><div class="best-small"><small>BEST TIME</small><span id="best-time">--:--.--</span></div></div>
      <div class="race-divider"></div>
      <div class="race-facts"><div><small>LAP</small><b id="lap-value">01 / 03</b></div><div><small>CHECKPOINT</small><b id="checkpoint-value">00 / 08</b></div><div><small>NEXT UP</small><b id="distance-value">-- M</b></div></div>
      <div class="race-progress"><i id="progress-fill"></i></div>
    </div>
    <div class="hud-right-top">
      <div class="mini-panel glass">
        <div class="mini-heading"><span>LIVE ROUTE</span><span class="mini-north">N ↑</span></div>
        <canvas id="minimap" width="480" height="278" aria-label="Racing circuit minimap"></canvas>
        <div class="mini-street"><span class="street-symbol">↗</span><span id="street-name">LUSAIL BOULEVARD</span></div>
      </div>
      <button class="pause-control glass" data-action="pause" title="Pause (P)" aria-label="Pause game">Ⅱ</button>
    </div>
    <div class="hud-bottom-left glass"><div class="controls-label">DRIVING CONTROLS</div><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> DRIVE</span><span><kbd>SPACE</kbd> HANDBRAKE &nbsp; <kbd>C</kbd> CAMERA</span><span><kbd>R</kbd> RESET &nbsp; <kbd>P</kbd> PAUSE</span></div>
    <div class="telemetry glass"><div class="telemetry-gear"><small>GEAR</small><strong id="gear-number">1</strong></div><div class="telemetry-center"><div class="telem-top"><span>ENGINE RPM</span><b id="rpm-value">2,400</b></div><div class="rpm-track"><i id="rpm-fill"></i></div><div class="pedals"><div><span>THROTTLE</span><i class="pedal-track"><i id="throttle-fill"></i></i></div><div><span>BRAKE</span><i class="pedal-track"><i id="brake-fill"></i></i></div></div></div><div class="gforce" id="gforce"><div class="gforce-dot" id="gforce-dot"></div></div></div>
    <div class="speed-box glass"><div class="speed-disc" id="speed-disc"><span class="speed-label">KM/H</span><strong id="speed-number">0</strong><small id="camera-name">CHASE CAM</small></div></div>
    <div class="hud-bottom-brand" id="hud-bottom-brand">DOHA RUSH <span>✳</span> RACE THE CITY</div>
    <div id="touch-controls" class="touch-controls"><div class="touch-steer"><button data-control="left" aria-label="Steer left">←</button><button data-control="right" aria-label="Steer right">→</button></div><div class="touch-pedals"><button class="touch-brake" data-control="brake" aria-label="Brake">BRK</button><button class="touch-gas" data-control="throttle" aria-label="Accelerate">GO <span>↗</span></button></div><button class="touch-drift" data-control="handbrake" aria-label="Handbrake">DRIFT</button></div>
  </section>
  <section id="photo-toolbar" class="photo-toolbar hidden" aria-label="Photo mode controls">
    <div class="photo-header"><span class="photo-symbol">⌗</span><div><strong>PHOTO MODE</strong><small>ORBIT THE CITY · FRAME THE SHOT</small></div></div>
    <div class="photo-actions"><button data-action="time-day">DAY</button><button data-action="time-sunset">GOLDEN</button><button data-action="time-dusk">DUSK</button><button data-action="time-night">NIGHT</button><i></i><button data-action="grid">GRID</button><button class="photo-save" data-action="capture">↧ SAVE PNG</button><button data-action="photo-exit">✕ EXIT</button></div>
  </section>
  <div id="photo-grid" class="photo-grid hidden" aria-hidden="true"></div>
  <div id="modal-backdrop" class="modal-backdrop hidden"></div>
  <div id="modal" class="modal hidden" role="dialog" aria-modal="true"></div>
  <div id="announcement" class="announcement hidden" aria-live="assertive"><small id="announcement-label">GET READY</small><strong id="announcement-big">3</strong><span id="announcement-sub">LUSAIL · QATAR</span></div>
  <div id="toast" class="toast hidden" aria-live="polite"><span class="toast-spark">✳</span><span id="toast-text"></span></div>
  <footer id="site-footer" class="site-footer">AN ORIGINAL, FICTIONAL RACING EXPERIENCE &nbsp; · &nbsp; ROUTES ARE ARTISTIC INTERPRETATIONS, NOT STREET MAPS <span>✳</span> MADE FOR THE LOVE OF DOHA</footer>
`;

const canvasHolder = $('game-canvas');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
} catch (error) {
  $('loader').innerHTML = `<div class="loader-label">3D GRAPHICS UNAVAILABLE</div><p>Please enable WebGL or use a recent browser.</p>`;
  throw error;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch ? 1.25 : 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
canvasHolder.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xd1a792, .00165);
const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, .3, 2200);
camera.position.set(208, 88, 205);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enabled = false;
orbit.enableDamping = true; orbit.dampingFactor = .055;
orbit.minDistance = 8; orbit.maxDistance = 350;
orbit.maxPolarAngle = Math.PI * .49;
const sun = new THREE.DirectionalLight('#ffca96', 2.4);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -180; sun.shadow.camera.right = 180;
sun.shadow.camera.top = 180; sun.shadow.camera.bottom = -180;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 850;
sun.shadow.bias = -.0004; sun.shadow.normalBias = .025;
scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight('#cde7f4', '#a08468', 1.35); scene.add(hemi);
const ambience = new THREE.AmbientLight('#a9bcd2', .17); scene.add(ambience);

const audio = new GameAudio();
const keys = Object.create(null);
const touch = { throttle: false, brake: false, left: false, right: false, handbrake: false };
const pointers = new Map();
const cache = new Map();
let selected = 0, carIndex = 0, driverIndex = 0, cameraIndex = 0;
let state = 'loading', beforePause = 'race', gameMode = 'race', modalType = '', settingsFrom = '';
let world = createWorld(ROUTES[0]); cache.set(0, world); scene.add(world.group);
let car = createCar(CARS[0], 0); scene.add(car);
let player = { x: 0, z: 0, yaw: 0, speed: 0, drift: 0, steer: 0,
  offroad: false, lateral: 0, prevSpeed: 0, heading: 0 };
let raceTime = 0, lapTime = 0, cpTotal = 0, progress = 0, prevTrackIdx = 0;
let best = 0, bestLap = 0, record = false;
let countdown = 0, lastCountNumber = 4, finishDelay = 0;
let timeKey = ROUTES[0].time, timeTarget = TIMES[timeKey];
let currentTime = {
  top: new THREE.Color(TIMES.sunset.top), horizon: new THREE.Color(TIMES.sunset.horizon),
  fog: new THREE.Color(TIMES.sunset.fog), sun: new THREE.Color(TIMES.sunset.sun),
  intensity: TIMES.sunset.sunIntensity, ambient: TIMES.sunset.ambient,
  exposure: TIMES.sunset.exposure, light: new THREE.Vector3(...TIMES.sunset.light), night: TIMES.sunset.night,
};
let elapsed = 0, uiClock = 0, skyClock = 0, hudOn = true;
let toastTimeout, announcingTimeout;
const camDesired = new THREE.Vector3(), camTarget = new THREE.Vector3();
const colorBuffer = new THREE.Color();
const touchDevice = isTouch || innerWidth < 700;

function placeCar(t = 0, off = 0) {
  const p = world.at(t, off);
  player.x = p.x; player.z = p.z; player.yaw = world.angle(t);
  player.heading = player.yaw;
  player.speed = 0; player.drift = 0; player.steer = 0;
  player.prevSpeed = 0; player.lateral = 0; player.offroad = false;
  car.position.set(p.x, .20, p.z);
  car.rotation.set(0, player.yaw, 0);
  prevTrackIdx = world.nearest(p.x, p.z).i;
}
function refreshRecords() {
  best = readNumber(kBest(ROUTES[selected].id));
  bestLap = readNumber(kLap(ROUTES[selected].id));
}
function selectRoute(index) {
  index = (Number(index) + ROUTES.length) % ROUTES.length;
  if (index !== selected) {
    scene.remove(world.group);
    selected = index;
    if (!cache.has(index)) cache.set(index, createWorld(ROUTES[index]));
    world = cache.get(index); scene.add(world.group);
    placeCar(0);
  }
  refreshRecords();
  setTime(ROUTES[selected].time);
  $('head-district').textContent = `${ROUTES[selected].district}, QATAR`;
  $('head-coords').textContent = `ROUTE ${ROUTES[selected].number} / 03`;
  $('route-picker-count').textContent = `${ROUTES[selected].number} / 03`;
  $('garage-visual-route').textContent = `${ROUTES[selected].district} · QATAR`;
  renderRouteChoices(); renderGarage();
  if (state === 'menu') resetMenuCamera();
  if (state === 'garage') garagePose(true);
}
function resetMenuCamera() {
  const y = selected === 2 ? 108 : selected === 1 ? 90 : 91;
  camera.position.set(47, y, 230);
  camera.lookAt(0, selected === 2 ? 29 : selected === 0 ? 21 : 6, 0);
}
function buildCar() {
  scene.remove(car);
  car = createCar(CARS[carIndex], driverIndex);
  scene.add(car);
  placeCar(0);
  $('garage-visual-car').textContent = CARS[carIndex].name;
  renderGarage();
}
function setTime(key) {
  timeKey = key;
  timeTarget = TIMES[key] || TIMES.day;
  document.querySelectorAll('#photo-toolbar [data-action^="time-"]').forEach(b => {
    b.classList.toggle('active', b.dataset.action === `time-${key}`);
  });
  if (state === 'menu') renderRouteChoices();
}
function renderRouteChoices() {
  $('menu-route-options').innerHTML = ROUTES.map((r, i) => `
    <button class="route-option ${i === selected ? 'selected' : ''}" data-action="select-route" data-index="${i}" aria-pressed="${i === selected}">
      <span class="route-index">${r.number}</span><span class="route-main"><strong>${r.district}</strong><small>${r.tagline}</small></span><span class="route-select-arrow">${i === selected ? '✳' : '↗'}</span>
    </button>`).join('');
}
function renderGarage() {
  const c = CARS[carIndex];
  $('garage-car').innerHTML = `
    <div class="selected-car"><div class="car-topline"><span class="car-type">${c.type}</span><span class="car-number">NO. ${c.number}</span></div>
    <div class="car-selector"><button data-action="prev-car" aria-label="Previous car">←</button><div><strong>${c.name}</strong><span>${c.description}</span></div><button data-action="next-car" aria-label="Next car">→</button></div>
    <div class="car-color-line"><span style="background:${c.color}"></span><small>0${carIndex + 1} OF 03 MACHINES</small></div>
    <div class="car-stats">${['TOP SPEED', 'ACCELERATION', 'HANDLING', 'BRAKING'].map((name, i) => `<div class="stat"><small>${name}</small><div class="stat-track"><i style="width:${c.stats[i]}%"></i></div><b>${c.stats[i]}</b></div>`).join('')}</div></div>`;
  $('garage-routes').innerHTML = ROUTES.map((r, i) => `
    <button class="garage-route ${selected === i ? 'selected' : ''}" data-action="select-route" data-index="${i}" aria-pressed="${selected === i}">
      <span class="garage-route-num">${r.number}</span><span><strong>${r.name}</strong><small>${r.highlights.slice(0, 3).join(' · ')}</small></span><span class="route-laps">${r.laps} LAPS</span>
    </button>`).join('');
  $('garage-drivers').innerHTML = DRIVERS.map((d, i) => `<button class="driver-chip ${i === driverIndex ? 'selected' : ''}" data-action="driver" data-index="${i}">${i === 0 ? '◉ ' : ''}${d}</button>`).join('');
  $('garage-visual-car').textContent = c.name;
  $('garage-visual-route').textContent = `${ROUTES[selected].district} · QATAR`;
}
function showMenu() {
  state = 'menu'; gameMode = 'race';
  orbit.enabled = false; hideModal();
  $('garage').classList.add('hidden'); $('hud').classList.add('hidden');
  $('photo-toolbar').classList.add('hidden'); $('photo-grid').classList.add('hidden');
  $('announcement').classList.add('hidden');
  $('menu').classList.remove('hidden'); $('site-footer').classList.remove('hidden');
  document.body.classList.remove('playing', 'photo-active');
  placeCar(0); resetMenuCamera();
  audio.update({ playing: false });
  renderRouteChoices();
}
function showGarage() {
  state = 'garage';
  hideModal();
  $('menu').classList.add('hidden'); $('site-footer').classList.add('hidden');
  $('garage').classList.remove('hidden');
  $('hud').classList.add('hidden');
  document.body.classList.remove('playing');
  placeCar(0); renderGarage();
  garagePose(true);
  camera.fov = 52; camera.updateProjectionMatrix();
  audio.update({ playing: false });
}
function garagePose(snap = false, dt = .016) {
  const a = .82 + Math.sin(elapsed * .27) * .16;
  camDesired.set(player.x + Math.cos(a) * 11.5, 4.4, player.z + Math.sin(a) * 11.5);
  if (snap) camera.position.copy(camDesired);
  else camera.position.lerp(camDesired, 1 - Math.exp(-dt * 4));
  camera.lookAt(player.x - Math.sin(a) * 5.5, 1.05, player.z + Math.cos(a) * 5.5);
}
function snapChase() {
  const fx = Math.sin(player.yaw), fz = Math.cos(player.yaw);
  camera.position.set(player.x - fx * 8.8, 4.1, player.z - fz * 8.8);
  camera.lookAt(player.x + fx * 13, 1.5, player.z + fz * 13);
  camera.fov = 65; camera.updateProjectionMatrix();
}
function startGame(type = 'race') {
  audio.start();
  hideModal();
  $('menu').classList.add('hidden'); $('garage').classList.add('hidden');
  $('photo-toolbar').classList.add('hidden'); $('site-footer').classList.add('hidden');
  $('hud').classList.remove('hidden');
  document.body.classList.add('playing'); document.body.classList.remove('photo-active');
  orbit.enabled = false;
  gameMode = type;
  cameraIndex = 0;
  raceTime = 0; lapTime = 0; cpTotal = 0; progress = 0; record = false;
  refreshRecords();
  placeCar(type === 'race' ? -.028 : .016);
  if (type === 'race') progress = -.028;
  snapChase();
  $('hud-stage').textContent = ROUTES[selected].name;
  $('mode-tag').textContent = type === 'race' ? 'RALLY' : 'FREE DRIVE';
  $('race-time').textContent = type === 'race' ? '00:00.00' : '--:--.--';
  $('best-time').textContent = best ? fmt(best) : '--:--.--';
  document.querySelector('.race-facts').classList.toggle('hidden-facts', type === 'free');
  document.querySelector('.race-progress').classList.toggle('hidden-facts', type === 'free');
  $('camera-name').textContent = 'CHASE CAM';
  hudOn = true; $('hud').style.opacity = '1';
  if (type === 'race') {
    setTime(ROUTES[selected].time);
    state = 'countdown'; countdown = 0; lastCountNumber = 4;
    announce('GET READY', '3', `${ROUTES[selected].name}  ·  ${ROUTES[selected].laps} LAPS`, 0);
    audio.beep(370, .15);
    lastCountNumber = 3;
  } else {
    state = 'free';
    $('announcement').classList.add('hidden');
    toast(`FREE DRIVE  ·  ${ROUTES[selected].district}`);
  }
}
function showPhoto() {
  hideModal();
  state = 'photo'; orbit.enabled = true;
  $('menu').classList.add('hidden'); $('garage').classList.add('hidden');
  $('hud').classList.add('hidden'); $('site-footer').classList.add('hidden');
  $('photo-toolbar').classList.remove('hidden');
  document.body.classList.remove('playing'); document.body.classList.add('photo-active');
  camera.position.set(119, 80, 152); camera.fov = 58; camera.updateProjectionMatrix();
  orbit.target.set(0, selected === 2 ? 32 : selected === 0 ? 21 : 6, 0);
  orbit.update();
  toast('DRAG TO ORBIT  ·  SCROLL TO ZOOM');
}
function announce(label, big, sub, hideAfter = 1000) {
  clearTimeout(announcingTimeout);
  $('announcement-label').textContent = label;
  $('announcement-big').textContent = big;
  $('announcement-sub').textContent = sub;
  $('announcement').classList.remove('hidden');
  $('announcement').classList.remove('pop'); void $('announcement').offsetWidth;
  $('announcement').classList.add('pop');
  if (hideAfter) announcingTimeout = setTimeout(() => $('announcement').classList.add('hidden'), hideAfter);
}
function toast(message, hold = 1700) {
  $('toast-text').textContent = message;
  $('toast').classList.remove('hidden');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => $('toast').classList.add('hidden'), hold);
}
function hideModal() {
  $('modal').classList.add('hidden'); $('modal-backdrop').classList.add('hidden');
  modalType = '';
}
function modal(html, type) {
  modalType = type;
  $('modal').innerHTML = html;
  $('modal-backdrop').classList.remove('hidden'); $('modal').classList.remove('hidden');
}
function showHow() {
  const rows = [
    ['W / ↑', 'ACCELERATE'], ['S / ↓', 'BRAKE & REVERSE'], ['A D / ← →', 'STEER'],
    ['SPACE', 'HANDBRAKE / DRIFT'], ['C', 'CHANGE CAMERA'], ['R', 'RESET ON ROAD'],
    ['P / ESC', 'PAUSE GAME'], ['M / H', 'MUTE / HIDE HUD'], ['1 — 4', 'DAY / GOLDEN / DUSK / NIGHT'],
  ];
  modal(`<div class="modal-top"><span class="section-kicker">THE ROAD IS YOURS</span><button class="round-close" data-action="close-modal" aria-label="Close">×</button></div>
    <h2 class="section-title">HOW TO <em>PLAY.</em></h2><p class="modal-lead">Pass all eight checkpoints in order each lap. Follow the highlighted gate, stay on the asphalt, and beat your best time.</p>
    <div class="help-grid">${rows.map(([k, v]) => `<div><kbd>${k}</kbd><span>${v}</span></div>`).join('')}</div>
    <div class="modal-note"><b>ON A PHONE?</b> Use the on-screen steering and pedals. No keyboard required.</div>
    <button class="modal-cta" data-action="close-modal">GOT IT <span>↗</span></button>`, 'how');
}
function showSettings() {
  settingsFrom = state;
  modal(`<div class="modal-top"><span class="section-kicker">MAKE IT YOURS</span><button class="round-close" data-action="close-modal" aria-label="Close">×</button></div>
    <h2 class="section-title">SET<em>TINGS.</em></h2><p class="modal-lead">Tune the atmosphere. Change the light. Stay in the moment.</p>
    <div class="setting-line"><div><strong>MASTER VOLUME</strong><small>Procedural engine + race cues</small></div><span id="volume-percent">${Math.round(audio.volume * 100)}%</span></div>
    <input id="volume-slider" type="range" min="0" max="1" step=".01" value="${audio.volume}" aria-label="Master volume">
    <div class="setting-line time-setting"><div><strong>TIME OF DAY</strong><small>Change any time with keys 1–4</small></div></div>
    <div class="time-choices">${Object.entries(TIMES).map(([key, t]) => `<button class="${timeKey === key ? 'selected' : ''}" data-action="time-${key}">${t.label}</button>`).join('')}</div>
    <div class="setting-line mute-line"><div><strong>MUTE SOUND</strong><small>You can also press M while driving</small></div><button class="switch ${audio.muted ? 'on' : ''}" data-action="mute" aria-label="Toggle mute" aria-pressed="${audio.muted}"><i></i></button></div>
    <button class="modal-cta" data-action="close-modal">DONE <span>↗</span></button>`, 'settings');
}
function showCredits() {
  modal(`<div class="modal-top"><span class="section-kicker">BUILT FOR THE OPEN ROAD</span><button class="round-close" data-action="close-modal" aria-label="Close">×</button></div>
    <h2 class="section-title">ABOUT <em>DOHA RUSH.</em></h2>
    <p class="modal-lead">A playable, original 3D racing demo inspired by a love of Qatar and the spirit of the reference game. No account, ads or external game assets.</p>
    <div class="about-districts"><div><b>01</b><span>LUSAIL</span><small>Stadium · Katara Towers · Place Vendôme</small></div><div><b>02</b><span>THE PEARL</span><small>Porto Arabia · Qanat Quartier · Medina Centrale</small></div><div><b>03</b><span>WEST BAY</span><small>Doha Tower · Tornado Tower · Corniche</small></div></div>
    <p class="disclaimer">Real location and street names appear as inspiration; routes, buildings, road connections and proportions are stylised and should never be used for navigation. Independent fan project, not affiliated with any venue or public authority.</p>
    <button class="modal-cta" data-action="close-modal">BACK TO THE CITY <span>↗</span></button>`, 'credits');
}
function pause() {
  if (state === 'paused') { resume(); return; }
  if (!['race', 'free', 'countdown'].includes(state)) return;
  beforePause = state; state = 'paused';
  audio.update({ playing: false });
  showPauseModal();
}
function showPauseModal() {
  modal(`<div class="modal-top"><span class="section-kicker">TAKE A BREATHER</span><span class="pause-mark">Ⅱ</span></div>
    <h2 class="section-title">GAME <em>PAUSED.</em></h2><p class="modal-lead">${ROUTES[selected].district} will be right here when you return.</p>
    <div class="pause-buttons"><button class="modal-cta" data-action="resume">RESUME DRIVE <span>↗</span></button><button data-action="restart">RESTART ${gameMode === 'race' ? 'RALLY' : 'DRIVE'} <span>↗</span></button><button data-action="settings">SETTINGS <span>↗</span></button><button data-action="garage">CHANGE CAR / ROUTE <span>↗</span></button><button data-action="menu">MAIN MENU <span>↗</span></button></div>`, 'pause');
}
function resume() {
  state = beforePause; hideModal();
}
function finishRace() {
  state = 'results';
  record = best === 0 || raceTime < best;
  if (record) { best = raceTime; store(kBest(ROUTES[selected].id), best); }
  audio.update({ playing: false });
  audio.beep(740, .55, 'triangle', .18);
  announce('THE FINISH LINE', 'FINISH!', ROUTES[selected].district, 2100);
  finishDelay = 2.25;
}
function showResults() {
  modal(`<div class="modal-top"><span class="section-kicker">RACE COMPLETE · ${ROUTES[selected].district}</span><span class="result-star">✳</span></div>
    <h2 class="section-title">WHAT A <em>RUN.</em></h2>${record ? '<div class="new-record">✳ &nbsp; NEW PERSONAL BEST</div>' : ''}
    <div class="result-time"><small>YOUR TIME</small><strong>${fmt(raceTime)}</strong></div>
    <div class="result-meta"><div><small>BEST TIME</small><b>${fmt(best)}</b></div><div><small>FASTEST LAP</small><b>${bestLap ? fmt(bestLap) : '--:--.--'}</b></div><div><small>CHECKPOINTS</small><b>${ROUTES[selected].laps * 8} / ${ROUTES[selected].laps * 8}</b></div></div>
    <div class="pause-buttons"><button class="modal-cta" data-action="restart">RACE AGAIN <span>↗</span></button><button data-action="garage">CHANGE CAR / ROUTE <span>↗</span></button><button data-action="menu">MAIN MENU <span>↗</span></button></div>`, 'results');
}
function closeModal() {
  if (state === 'paused') showPauseModal();
  else hideModal();
}
function resetCar() {
  const near = world.nearest(player.x, player.z);
  const p = world.samples[near.i];
  player.x = p.x; player.z = p.z;
  player.yaw = Math.atan2(p.fx, p.fz);
  player.speed = 0; player.drift = 0; player.steer = 0;
  player.heading = player.yaw;
  prevTrackIdx = near.i;
  car.position.set(player.x, .2, player.z);
  toast('CAR RESET  ·  BACK ON THE ROAD');
}
function capture() {
  try {
    renderer.render(scene, camera);
    const link = document.createElement('a');
    link.download = `doha-rush-${ROUTES[selected].id}-${timeKey}.png`;
    link.href = renderer.domElement.toDataURL('image/png');
    document.body.appendChild(link); link.click(); link.remove();
    toast('PHOTO SAVED  ·  DOHA RUSH');
  } catch { toast('SCREENSHOT UNAVAILABLE IN THIS BROWSER'); }
}

app.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action !== 'select-route') audio.start();
  audio.beep(650, .048, 'sine', .09);
  if (action === 'select-route') {
    if (['menu', 'garage'].includes(state)) selectRoute(button.dataset.index);
  } else if (action === 'start') startGame('race');
  else if (action === 'free') startGame('free');
  else if (action === 'garage') showGarage();
  else if (action === 'menu' || action === 'back') showMenu();
  else if (action === 'photo') showPhoto();
  else if (action === 'photo-exit') showMenu();
  else if (action === 'how') showHow();
  else if (action === 'settings') showSettings();
  else if (action === 'credits') showCredits();
  else if (action === 'close-modal') closeModal();
  else if (action === 'prev-car') { carIndex = (carIndex + CARS.length - 1) % CARS.length; buildCar(); }
  else if (action === 'next-car') { carIndex = (carIndex + 1) % CARS.length; buildCar(); }
  else if (action === 'driver') { driverIndex = +button.dataset.index; buildCar(); }
  else if (action === 'pause') pause();
  else if (action === 'resume') resume();
  else if (action === 'restart') startGame(gameMode);
  else if (action === 'mute') {
    audio.toggleMute();
    button.classList.toggle('on', audio.muted);
    button.setAttribute('aria-pressed', String(audio.muted));
  } else if (action.startsWith('time-')) {
    setTime(action.slice(5));
    document.querySelectorAll('.time-choices button').forEach(b => b.classList.toggle('selected', b === button));
  } else if (action === 'grid') {
    $('photo-grid').classList.toggle('hidden');
    button.classList.toggle('active', !$('photo-grid').classList.contains('hidden'));
  } else if (action === 'capture') capture();
});
app.addEventListener('input', (event) => {
  if (event.target.id === 'volume-slider') {
    audio.setVolume(event.target.value);
    $('volume-percent').textContent = `${Math.round(audio.volume * 100)}%`;
  }
});
function touchUpdate() {
  Object.keys(touch).forEach(key => { touch[key] = [...pointers.values()].includes(key); });
}
app.addEventListener('pointerdown', (event) => {
  const button = event.target.closest('[data-control]');
  if (!button) return;
  event.preventDefault();
  pointers.set(event.pointerId, button.dataset.control); button.setPointerCapture(event.pointerId);
  touchUpdate(); button.classList.add('pressed');
});
for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  app.addEventListener(eventName, (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.delete(event.pointerId); touchUpdate();
    event.target.closest('[data-control]')?.classList.remove('pressed');
  });
}
window.addEventListener('keydown', (event) => {
  const code = event.code;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) event.preventDefault();
  keys[code] = true;
  if (event.repeat) return;
  if (code === 'KeyP' || code === 'Escape') {
    if (state === 'photo') showMenu();
    else if (state === 'garage') showMenu();
    else if (modalType === 'settings' || modalType === 'how' || modalType === 'credits') closeModal();
    else if (state === 'paused') resume();
    else pause();
  }
  if (code === 'KeyC' && ['race', 'free', 'countdown'].includes(state)) {
    cameraIndex = (cameraIndex + 1) % CAMERA_NAMES.length;
    toast(`${CAMERA_NAMES[cameraIndex]} CAMERA`);
  }
  if (code === 'KeyR' && ['race', 'free'].includes(state)) resetCar();
  if (code === 'KeyM') { audio.toggleMute(); toast(audio.muted ? 'SOUND OFF' : 'SOUND ON'); }
  if (code === 'KeyH' && ['race', 'free', 'countdown'].includes(state)) {
    hudOn = !hudOn; $('hud').style.opacity = hudOn ? '1' : '0';
  }
  if (code === 'KeyG' && state === 'photo') $('photo-grid').classList.toggle('hidden');
  const presets = { Digit1: 'day', Digit2: 'sunset', Digit3: 'dusk', Digit4: 'night' };
  if (presets[code]) { setTime(presets[code]); toast(TIMES[timeKey].label); }
});
window.addEventListener('keyup', (event) => { keys[event.code] = false; });
window.addEventListener('blur', () => {
  Object.keys(keys).forEach(k => { keys[k] = false; });
  pointers.clear(); touchUpdate();
  document.querySelectorAll('[data-control]').forEach(b => b.classList.remove('pressed'));
});
window.addEventListener('resize', () => {
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.25 : 1.5));
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
});

function physics(dt) {
  const cfg = CARS[carIndex];
  const throttle = !!(keys.KeyW || keys.ArrowUp || touch.throttle);
  const brake = !!(keys.KeyS || keys.ArrowDown || touch.brake);
  const steer = (keys.KeyD || keys.ArrowRight || touch.right ? 1 : 0) - (keys.KeyA || keys.ArrowLeft || touch.left ? 1 : 0);
  const handbrake = !!(keys.Space || touch.handbrake);
  player.steer += (steer - player.steer) * Math.min(1, dt * 9);
  player.prevSpeed = player.speed;
  if (throttle) player.speed += cfg.acceleration * (1 - Math.max(0, player.speed) / cfg.topSpeed * .7) * dt * (player.speed < 0 ? 1.6 : 1);
  if (brake) player.speed += (player.speed > 1 ? -cfg.braking : -cfg.acceleration * .65) * dt;
  if (!throttle && !brake) player.speed -= Math.sign(player.speed) * Math.min(Math.abs(player.speed), (1.45 + Math.abs(player.speed) * .085) * dt);
  if (handbrake) player.speed *= (1 - .36 * dt);
  if (player.offroad) player.speed *= (1 - .65 * dt);
  player.speed = clamp(player.speed, -13, cfg.topSpeed);
  if (!throttle && !brake && Math.abs(player.speed) < .12) player.speed = 0;
  const yawRate = player.steer * cfg.handling * clamp(player.speed / 9, -1, 1) /
    (1 + Math.abs(player.speed) * .034) * (handbrake ? 1.45 : 1);
  player.yaw += yawRate * dt;
  // Gentle lateral dynamics for controllable, visible powerslides.
  player.drift += player.steer * Math.abs(player.speed) * (handbrake ? .48 : .055) * dt;
  player.drift *= Math.exp(-cfg.grip * (handbrake ? .28 : 1) * dt);
  const fx = Math.sin(player.yaw), fz = Math.cos(player.yaw);
  const rx = Math.cos(player.yaw), rz = -Math.sin(player.yaw);
  player.x += (fx * player.speed + rx * player.drift) * dt;
  player.z += (fz * player.speed + rz * player.drift) * dt;

  // Characteristic buildings remain solid even in free drive.
  const colliders = selected === 0 ? [[-22, -18, 52], [73, 35, 23], [-87, 38, 31]]
    : selected === 1 ? [[0, 0, 51], [96, 32, 14]]
      : [[42, 27, 14], [-33, 7, 14], [68, -65, 24], [-70, -67, 27]];
  for (const [cx, cz, radius] of colliders) {
    const dx = player.x - cx, dz = player.z - cz;
    const distance = Math.hypot(dx, dz);
    if (distance < radius + 1.1 && distance > .001) {
      player.x = cx + dx / distance * (radius + 1.1);
      player.z = cz + dz / distance * (radius + 1.1);
      if (Math.abs(player.speed) > 8) audio.beep(85, .08, 'sawtooth', .08);
      player.speed *= -.21;
    }
  }
  const near = world.nearest(player.x, player.z);
  const absSide = Math.abs(near.lateral);
  player.lateral = near.lateral;
  player.offroad = absSide > 9;
  if (gameMode === 'race' && absSide > 16.8) {
    const s = Math.sign(near.lateral);
    player.x -= near.sample.rx * s * (absSide - 16.8);
    player.z -= near.sample.rz * s * (absSide - 16.8);
    player.speed *= .72; player.drift *= -.2;
  }
  // No driving a fictional car into the Gulf.
  const inSea = selected === 1 ? (Math.hypot(player.x, player.z) > 192 || Math.hypot(player.x, player.z) < 48)
    : player.x > 206;
  if (inSea) resetCar();

  if (state === 'race') {
    let delta = near.i - prevTrackIdx;
    if (delta > world.N / 2) delta -= world.N;
    if (delta < -world.N / 2) delta += world.N;
    // A very large jump usually means a reset, not a legitimately completed section.
    if (Math.abs(delta) < world.N * .075) progress += delta / world.N;
    prevTrackIdx = near.i;
    while (progress >= (cpTotal + 1) / 8 && absSide < 13 && player.speed > 1.5 && cpTotal < ROUTES[selected].laps * 8) {
      cpTotal++;
      audio.beep(cpTotal % 8 ? 720 : 940, .22, 'triangle', .16);
      if (cpTotal % 8 === 0) {
        if (!bestLap || lapTime < bestLap) { bestLap = lapTime; store(kLap(ROUTES[selected].id), bestLap); }
        lapTime = 0;
      }
      if (cpTotal >= ROUTES[selected].laps * 8) { finishRace(); break; }
      if (cpTotal % 8 === 0) toast(`LAP ${cpTotal / 8 + 1} / ${ROUTES[selected].laps}  ·  KEEP GOING!`, 2200);
      else toast(`CHECKPOINT 0${cpTotal % 8} / 08  ·  ${ROUTES[selected].streets[(cpTotal - 1) % 8].toUpperCase()}`);
    }
  } else prevTrackIdx = near.i;
  car.position.set(player.x, .19, player.z);
  car.rotation.y = player.yaw;
  animateCar(car, dt, { speed: player.speed, steer: player.steer, brake: brake || handbrake,
    lateral: player.drift, acceleration: (player.speed - player.prevSpeed) / Math.max(dt, .001), night: currentTime.night });
  audio.update({ speed: player.speed, throttle: throttle ? 1 : 0,
    playing: true, maxSpeed: cfg.topSpeed });
}
function updateCamera(dt) {
  const sp = Math.abs(player.speed);
  let desiredFov = 65;
  const fx = Math.sin(player.yaw), fz = Math.cos(player.yaw);
  player.heading += Math.atan2(Math.sin(player.yaw - player.heading), Math.cos(player.yaw - player.heading)) * (1 - Math.exp(-dt * 4.5));
  const sx = Math.sin(player.heading), sz = Math.cos(player.heading);
  if (cameraIndex <= 1) {
    const wide = cameraIndex === 1;
    camDesired.set(player.x - sx * (wide ? 15 : 8.3 + sp * .045), wide ? 6.3 : 3.55,
      player.z - sz * (wide ? 15 : 8.3 + sp * .045));
    camera.position.lerp(camDesired, 1 - Math.exp(-dt * 6));
    camTarget.set(player.x + sx * 13, 1.32, player.z + sz * 13);
    desiredFov = (wide ? 69 : 63) + sp * .27;
  } else if (cameraIndex === 2) {
    camera.position.set(player.x + fx * 1.58, 1.12, player.z + fz * 1.58);
    camTarget.set(player.x + fx * 28, 1.05, player.z + fz * 28);
    desiredFov = 73;
  } else if (cameraIndex === 3) {
    camera.position.set(player.x + fx * -.26 + fz * .37, 1.62,
      player.z + fz * -.26 - fx * .37);
    camTarget.set(player.x + fx * 28 + fz * .3, 1.51, player.z + fz * 28 - fx * .3);
    desiredFov = 76;
  } else {
    camDesired.set(player.x + Math.cos(player.yaw) * 16 + fx * 15, 5.5,
      player.z - Math.sin(player.yaw) * 16 + fz * 15);
    camera.position.lerp(camDesired, 1 - Math.exp(-dt * 2));
    camTarget.set(player.x, 1.1, player.z);
    desiredFov = 55;
  }
  camera.lookAt(camTarget);
  camera.fov += (desiredFov - camera.fov) * Math.min(1, dt * 3.2);
  camera.updateProjectionMatrix();
  car.visible = cameraIndex !== 2 && cameraIndex !== 3;
}
function updateTime(dt) {
  const k = 1 - Math.exp(-dt * 1.4), t = timeTarget;
  currentTime.top.lerp(colorBuffer.set(t.top), k);
  currentTime.horizon.lerp(colorBuffer.set(t.horizon), k);
  currentTime.fog.lerp(colorBuffer.setHex(t.fog), k);
  currentTime.sun.lerp(colorBuffer.setHex(t.sun), k);
  currentTime.intensity += (t.sunIntensity - currentTime.intensity) * k;
  currentTime.ambient += (t.ambient - currentTime.ambient) * k;
  currentTime.exposure += (t.exposure - currentTime.exposure) * k;
  currentTime.night += (t.night - currentTime.night) * k;
  currentTime.light.lerp(new THREE.Vector3(...t.light), k);
  sun.color.copy(currentTime.sun); sun.intensity = currentTime.intensity;
  hemi.intensity = currentTime.ambient;
  scene.fog.color.copy(currentTime.fog);
  scene.fog.density = .00155 + currentTime.night * .0006;
  renderer.toneMappingExposure = currentTime.exposure;
  const targetX = ['race', 'free', 'countdown', 'paused', 'results'].includes(state) ? player.x : 0;
  const targetZ = ['race', 'free', 'countdown', 'paused', 'results'].includes(state) ? player.z : 0;
  sun.target.position.set(targetX, 0, targetZ);
  sun.position.copy(currentTime.light).add(sun.target.position);
  sun.target.updateMatrixWorld();
  world.updateLights(currentTime.night, elapsed, cpTotal % 8);
  skyClock += dt;
  if (skyClock > .11) {
    skyClock = 0;
    document.documentElement.style.setProperty('--sky-top', `#${currentTime.top.getHexString()}`);
    document.documentElement.style.setProperty('--sky-horizon', `#${currentTime.horizon.getHexString()}`);
  }
}
function drawMap() {
  const canvas = $('minimap'); const g = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const px = x => w / 2 + x * .94;
  const pz = z => h / 2 + z * .61;
  g.clearRect(0, 0, w, h);
  g.fillStyle = selected === 1 ? 'rgba(20,88,113,.18)' : 'rgba(35,79,105,.14)';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(205,225,221,.08)'; g.lineWidth = 1;
  for (let i = 0; i < w; i += 35) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); }
  for (let j = 0; j < h; j += 34) { g.beginPath(); g.moveTo(0, j); g.lineTo(w, j); g.stroke(); }
  if (selected === 1) {
    g.fillStyle = 'rgba(73,173,187,.25)'; g.beginPath(); g.arc(px(0), pz(0), 31, 0, PI2); g.fill();
  } else {
    g.fillStyle = 'rgba(50,170,192,.18)'; g.fillRect(px(208), 0, w - px(208), h);
  }
  const route = world.samples;
  g.beginPath(); route.forEach((p, i) => i ? g.lineTo(px(p.x), pz(p.z)) : g.moveTo(px(p.x), pz(p.z))); g.closePath();
  g.strokeStyle = 'rgba(218,245,236,.16)'; g.lineWidth = 22; g.lineJoin = 'round'; g.stroke();
  g.strokeStyle = '#d6e5df'; g.lineWidth = 8; g.shadowColor = 'rgba(84,202,211,.4)'; g.shadowBlur = 14; g.stroke(); g.shadowBlur = 0;
  for (let i = 0; i < 8; i++) {
    const p = world.at((i + 1) / 8);
    g.beginPath(); g.arc(px(p.x), pz(p.z), i === cpTotal % 8 ? 8 : 4, 0, PI2);
    g.fillStyle = i === cpTotal % 8 && gameMode === 'race' ? '#ffd398' : 'rgba(255,255,255,.52)';
    g.fill();
  }
  const start = world.samples[0];
  g.fillStyle = '#f8e7c4'; g.fillRect(px(start.x) - 4, pz(start.z) - 4, 8, 8);
  // Player triangle, rotated to match the car's world heading.
  g.save(); g.translate(px(player.x), pz(player.z)); g.rotate(-player.yaw);
  g.shadowColor = '#69e5e7'; g.shadowBlur = 13;
  g.beginPath(); g.moveTo(0, -10); g.lineTo(-7, 8); g.lineTo(0, 5); g.lineTo(7, 8); g.closePath();
  g.fillStyle = '#52dbde'; g.fill(); g.restore();
}
const PI2 = Math.PI * 2;
function updateHUD() {
  const route = ROUTES[selected], carCfg = CARS[carIndex];
  const speed = Math.round(Math.abs(player.speed) * 3.6);
  const rev = player.speed < -.7;
  const fraction = clamp(Math.abs(player.speed) / carCfg.topSpeed, 0, 1);
  const gear = rev ? 'R' : Math.max(1, Math.min(6, Math.ceil(fraction * 6)));
  const rpm = Math.round((2200 + (fraction * 7300 % 1450) + (keys.KeyW ? 300 : 0)) / 100) * 100;
  $('speed-number').textContent = speed;
  $('speed-disc').style.setProperty('--speed-angle', `${Math.min(300, fraction * 290)}deg`);
  $('gear-number').textContent = gear;
  $('rpm-value').textContent = rpm.toLocaleString('en-US');
  $('rpm-fill').style.width = `${Math.min(100, (rpm - 2000) / 17)}%`;
  $('throttle-fill').style.width = keys.KeyW || keys.ArrowUp || touch.throttle ? '100%' : '0%';
  $('brake-fill').style.width = keys.KeyS || keys.ArrowDown || touch.brake ? '100%' : '0%';
  $('gforce-dot').style.transform = `translate(${clamp(player.steer * speed / 150, -.75, .75) * 17}px, ${clamp((player.speed - player.prevSpeed) * 9, -14, 14)}px)`;
  $('camera-name').textContent = `${CAMERA_NAMES[cameraIndex]} CAM`;
  if (gameMode === 'race') {
    $('race-time').textContent = fmt(raceTime);
    $('lap-value').textContent = `${String(Math.min(route.laps, Math.floor(cpTotal / 8) + 1)).padStart(2, '0')} / ${String(route.laps).padStart(2, '0')}`;
    $('checkpoint-value').textContent = `${String(cpTotal % 8).padStart(2, '0')} / 08`;
    $('distance-value').textContent = `${Math.max(0, Math.round(((cpTotal + 1) / 8 - progress) * world.length))} M`;
    $('progress-fill').style.width = `${clamp((progress / route.laps) * 100, 0, 100)}%`;
    $('best-time').textContent = best ? fmt(best) : '--:--.--';
  }
  let ix = Math.floor((((world.nearest(player.x, player.z).i / world.N) * 8) + .001)) % 8;
  if (ix < 0) ix = 0;
  $('street-name').textContent = player.offroad ? 'OFF ROAD · FIND THE CIRCUIT' : route.streets[ix].toUpperCase();
  $('street-name').classList.toggle('offroad', player.offroad);
  drawMap();
}

let lastFrame = performance.now();
let qualityFrames = 0, qualitySum = 0, qualityAdjusted = false;
function frame(now) {
  requestAnimationFrame(frame);
  const rawDt = Math.max(.001, (now - lastFrame) / 1000);
  // Honour wall-clock time even on software-rendered browsers. Physics subdivides long frames.
  const dt = Math.min(.32, rawDt);
  lastFrame = now; elapsed += dt;
  if (!qualityAdjusted && state !== 'loading') {
    qualityFrames++; qualitySum += rawDt;
    if (qualityFrames >= 16) {
      qualityAdjusted = true;
      if (qualitySum / qualityFrames > .12) {
        renderer.setPixelRatio(Math.min(devicePixelRatio, .78));
        renderer.shadowMap.enabled = false;
        sun.castShadow = false;
      }
    }
  }
  updateTime(dt);
  if (state === 'menu' || state === 'loading') {
    const orbitAngle = 1.34 + elapsed * .026;
    camDesired.set(Math.cos(orbitAngle) * 235, selected === 2 ? 105 : selected === 1 ? 89 : 92, Math.sin(orbitAngle) * 235);
    camera.position.lerp(camDesired, 1 - Math.exp(-dt * .35));
    camera.lookAt(0, selected === 2 ? 31 : selected === 0 ? 19 : 7, 0);
    camera.fov += (55 - camera.fov) * .06; camera.updateProjectionMatrix();
    car.visible = true;
  } else if (state === 'garage') {
    garagePose(false, dt);
    camera.fov += (52 - camera.fov) * .06; camera.updateProjectionMatrix();
    car.visible = true;
  } else if (state === 'photo') {
    orbit.update(); car.visible = true;
  } else {
    if (state === 'countdown') {
      countdown += dt;
      const n = 3 - Math.floor(countdown);
      if (n !== lastCountNumber && n > 0) {
        lastCountNumber = n;
        announce('GET READY', String(n), `${ROUTES[selected].district}  ·  QATAR`, 0);
        audio.beep(430 + (3 - n) * 60, .17, 'sine', .13);
      }
      if (countdown >= 3.05) {
        state = 'race'; raceTime = 0; lapTime = 0;
        announce('GREEN LIGHT', 'GO!', 'RACE THE CITY', 950);
        audio.beep(880, .43, 'triangle', .16);
      }
    }
    if (state === 'race' || state === 'free') {
      const steps = Math.min(18, Math.ceil(dt / .018));
      const stepTime = dt / steps;
      for (let k = 0; k < steps; k++) {
        if (state === 'race' || state === 'free') physics(stepTime);
      }
      if (state === 'race') { raceTime += dt; lapTime += dt; }
    } else if (state === 'results' && finishDelay > 0) {
      finishDelay -= dt;
      if (finishDelay <= 0) showResults();
    }
    updateCamera(dt);
    uiClock += dt;
    if (uiClock >= .075 && ['race', 'free', 'paused', 'countdown', 'results'].includes(state)) {
      updateHUD(); uiClock = 0;
    }
  }
  renderer.render(scene, camera);
}

refreshRecords();
renderRouteChoices(); renderGarage(); placeCar(0);
setTime(ROUTES[0].time);
requestAnimationFrame(frame);
setTimeout(() => {
  $('loader').classList.add('fade-out');
  showMenu();
  setTimeout(() => $('loader').remove(), 850);
}, 900);
