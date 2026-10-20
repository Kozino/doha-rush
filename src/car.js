import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const PI = Math.PI;
const material = (color, props = {}) => new THREE.MeshStandardMaterial({ color, roughness: .55, ...props });
function part(parent, geometry, mat, x, y, z, shadows = true) {
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(x, y, z); mesh.castShadow = shadows;
  mesh.receiveShadow = shadows; parent.add(mesh); return mesh;
}
function cube(parent, w, h, d, x, y, z, mat, shadows = true) {
  return part(parent, new THREE.BoxGeometry(w, h, d), mat, x, y, z, shadows);
}
function round(parent, w, h, d, x, y, z, mat, radius = .1) {
  return part(parent, new RoundedBoxGeometry(w, h, d, 3, radius), mat, x, y, z);
}
function decal(text, bg, fg) {
  const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 100;
  const g = canvas.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, 256, 100);
  g.fillStyle = fg; g.font = '900 67px Arial, sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 128, 54);
  const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
}
let shadowMap;
function shadowTexture() {
  if (shadowMap) return shadowMap;
  const can = document.createElement('canvas'); can.width = 128; can.height = 128;
  const g = can.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 5, 64, 64, 64);
  grd.addColorStop(0, 'rgba(0,0,0,.54)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  shadowMap = new THREE.CanvasTexture(can);
  return shadowMap;
}

export function createCar(config, driverIndex = 0) {
  const root = new THREE.Group();
  const suspended = new THREE.Group(); root.add(suspended);
  const paint = material(config.color, { metalness: .63, roughness: .24 });
  const paintHi = material(config.color, { metalness: .76, roughness: .18 });
  const carbon = material('#101c23', { metalness: .65, roughness: .29 });
  const matte = material('#161c24', { metalness: .17, roughness: .75 });
  const metal = material('#d1d6d3', { metalness: .85, roughness: .23 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#183342', metalness: .42, roughness: .12,
    transparent: true, opacity: .78, clearcoat: 1, clearcoatRoughness: .06, side: THREE.DoubleSide });
  const stripe = material(config.name === 'DUNE PHANTOM' ? '#ffb779' : '#f3ede0', { metalness: .42, roughness: .34 });
  const stop = material('#b92035', { emissive: '#ff243b', emissiveIntensity: .6, roughness: .2 });
  const head = material('#f6f2da', { emissive: '#fff7db', emissiveIntensity: 1.25, roughness: .1 });
  const W = config.width, L = config.length, rally = config.name === 'DESERT FALCON';
  const cabH = rally ? .65 : .52;
  const bodyY = .68;

  round(suspended, W, .6, L, 0, bodyY, 0, paint, .18);
  round(suspended, W * 1.02, .16, L * .96, 0, .39, 0, carbon, .08);
  // Tapered bonnet and a flowing side sill.
  round(suspended, W * .92, .16, L * .36, 0, 1.045, L * .30, paintHi, .07);
  round(suspended, W * .95, .12, L * .20, 0, 1.05, -L * .37, paintHi, .05);
  for (const s of [-1, 1]) {
    round(suspended, .16, .14, L * .68, s * (W / 2 + .045), .41, 0, carbon, .03);
    // Sculpted front and rear fender bulges.
    round(suspended, .33, .34, 1.05, s * (W / 2 - .045), .76, L * .34, paint, .11);
    round(suspended, .33, .34, 1.05, s * (W / 2 - .045), .76, -L * .34, paint, .11);
  }
  // Sloping windshield, black window belt, tinted panoramic glass.
  const cabinZ = rally ? -.20 : -.32;
  round(suspended, W * .76, cabH, L * .44, 0, 1.14 + cabH / 2, cabinZ, glass, .16);
  round(suspended, W * .70, .08, L * .36, 0, 1.17 + cabH, cabinZ, paintHi, .045);
  for (const s of [-1, 1]) {
    const a = cube(suspended, .09, cabH * .98, .10, s * W * .34, 1.15 + cabH * .46, cabinZ + L * .20, carbon);
    a.rotation.x = -.22;
    cube(suspended, .19, .09, .28, s * (W / 2 + .12), 1.19, cabinZ + .53, paint);
  }
  // Two racing stripes on the bonnet and number panels on the doors.
  for (const s of [-1, 1]) {
    cube(suspended, .095, .009, L * .25, s * .23, 1.133, L * .31, stripe, false);
    const sideNumber = part(suspended, new THREE.PlaneGeometry(.74, .31), decal(config.number, '#f2eee2', '#182633'),
      s * (W / 2 + .067), .85, -.16, false);
    sideNumber.rotation.y = s * PI / 2;
  }
  const hoodNumber = part(suspended, new THREE.PlaneGeometry(.48, .30), decal(config.number, '#f3efe6', '#152332'),
    0, 1.146, L * .32, false);
  hoodNumber.rotation.x = -PI / 2;
  // Front grille, horizontal chrome bar and running lights.
  cube(suspended, W * .64, .22, .07, 0, .66, L / 2 + .025, matte);
  cube(suspended, W * .59, .028, .084, 0, .66, L / 2 + .068, metal, false);
  const headlamps = [];
  for (const s of [-1, 1]) {
    round(suspended, .47, .14, .09, s * W * .31, .91, L / 2 + .01, carbon, .04);
    headlamps.push(round(suspended, .37, .085, .057, s * W * .31, .91, L / 2 + .067, head, .025));
    cube(suspended, .54, .11, .08, s * W * .31, .87, -L / 2 - .035, stop);
    cube(suspended, .49, .028, .09, s * W * .31, .56, -L / 2 - .05, metal);
  }
  cube(suspended, W * 1.05, .07, .56, 0, .36, L / 2 + .15, carbon);
  cube(suspended, W * .94, .17, .33, 0, .34, -L / 2 - .11, carbon);
  cube(suspended, .43, .06, .1, 0, 1.12, -L / 2 - .03, stop);

  if (config.wing) {
    const wy = rally ? 1.87 : 1.70;
    for (const s of [-1, 1]) cube(suspended, .085, wy - 1.02, .31, s * W * .33, (wy + 1.02) / 2, -L * .42, carbon);
    round(suspended, W * 1.05, .07, .46, 0, wy, -L * .45, carbon, .025);
    for (const s of [-1, 1]) cube(suspended, .055, .15, .5, s * W * .53, wy, -L * .45, carbon);
  }
  if (rally) {
    round(suspended, .43, .19, .68, .29, 1.18 + cabH, cabinZ + .15, carbon, .08);
    for (const s of [-1, 1]) cube(suspended, .26, .045, .36, s * .42, 1.16, L * .35, carbon);
  }
  // Driver visible through the windscreen; helmet changes with selection.
  const helmetColors = ['#eee9d4', '#e9b46c', '#9ad2dc', '#f299aa'];
  const helmet = material(helmetColors[driverIndex % helmetColors.length], { metalness: .33, roughness: .28 });
  const driver = new THREE.Group(); driver.position.set(.32, 1.29, cabinZ - .07); suspended.add(driver);
  round(driver, .39, .38, .3, 0, .01, 0, material('#d3e4ec'), .09);
  part(driver, new THREE.SphereGeometry(.18, 12, 8), helmet, 0, .38, 0);
  cube(driver, .26, .09, .09, 0, .39, .13, glass);

  const wheelGroups = [];
  const tireMat = material('#111419', { roughness: .96 });
  const rimMat = material('#cdd4d2', { metalness: .9, roughness: .19 });
  for (const s of [-1, 1]) for (const front of [true, false]) {
    const station = new THREE.Group();
    station.position.set(s * (W / 2 - .035), .40, (front ? 1 : -1) * L * .34);
    root.add(station);
    const spin = new THREE.Group(); station.add(spin);
    const tire = part(spin, new THREE.CylinderGeometry(.39, .39, .28, 22), tireMat, 0, 0, 0);
    tire.rotation.z = PI / 2;
    const rim = part(spin, new THREE.CylinderGeometry(.245, .245, .296, 18), rimMat, 0, 0, 0);
    rim.rotation.z = PI / 2;
    for (let i = 0; i < 5; i++) {
      const spoke = cube(spin, .039, .40, .05, s * .155, 0, 0, rimMat, false);
      spoke.rotation.x = i * PI / 5;
    }
    part(spin, new THREE.CylinderGeometry(.07, .07, .31, 12), carbon, 0, 0, 0).rotation.z = PI / 2;
    wheelGroups.push({ station, spin, front });
  }
  // Soft transparent contact shadow, independent of real-time sun shadows.
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, L * 1.48),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }));
  shadow.rotation.x = -PI / 2; shadow.position.y = .055; root.add(shadow);

  root.userData = { suspended, wheels: wheelGroups, brakeMaterial: stop, headMaterial: head, driver };
  root.position.y = .08;
  return root;
}

export function animateCar(root, dt, { speed = 0, steer = 0, brake = false, lateral = 0, acceleration = 0, night = 0 } = {}) {
  if (!root) return;
  const { suspended, wheels, brakeMaterial, headMaterial, driver } = root.userData;
  wheels.forEach(({ station, spin, front }) => {
    if (front) station.rotation.y += (steer * .37 - station.rotation.y) * Math.min(1, dt * 10);
    spin.rotation.x += speed * dt / .39;
  });
  suspended.rotation.z += (Math.max(-.08, Math.min(.08, -lateral * .013)) - suspended.rotation.z) * Math.min(1, dt * 5);
  suspended.rotation.x += (Math.max(-.047, Math.min(.047, -acceleration * .006)) - suspended.rotation.x) * Math.min(1, dt * 5);
  driver.rotation.z = -steer * .07;
  brakeMaterial.emissiveIntensity = brake ? 3.2 : .55 + night * 1.2;
  headMaterial.emissiveIntensity = 1.0 + night * 1.9;
}
