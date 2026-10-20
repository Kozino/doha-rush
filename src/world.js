import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const PI = Math.PI;
const AX = new THREE.Object3D();
const UP = new THREE.Vector3(0, 1, 0);
const C = (v) => new THREE.Color(v);
const M = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.68, ...extra });
const lam = (color, extra = {}) => new THREE.MeshLambertMaterial({ color, ...extra });
const SAND = '#d5bea0';

function box(parent, w, h, d, x, y, z, material, shadow = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = shadow;
  mesh.receiveShadow = shadow;
  parent.add(mesh);
  return mesh;
}
function cylinder(parent, rt, rb, h, sides, x, y, z, material, shadow = true) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, sides), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = shadow;
  mesh.receiveShadow = shadow;
  parent.add(mesh);
  return mesh;
}
function circle(parent, radius, x, y, z, material, segments = 72) {
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(radius, segments), material);
  mesh.rotation.x = -PI / 2;
  mesh.position.set(x, y, z);
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
function torus(parent, radius, tube, x, y, z, material, sides = 80) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 5, sides), material);
  mesh.rotation.x = PI / 2;
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}
function seeded(seed) {
  let state = seed >>> 0;
  return () => ((state = (1664525 * state + 1013904223) >>> 0) / 4294967296);
}
function canvasTexture(w, h, paint, repeat = [1, 1]) {
  const can = document.createElement('canvas');
  can.width = w; can.height = h;
  paint(can.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(can);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(...repeat);
  tex.anisotropy = 4;
  return tex;
}
function earthTexture(base, seed) {
  const rng = seeded(seed);
  return canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 5200; i++) {
      const a = rng() * 0.18;
      ctx.fillStyle = rng() > .5 ? `rgba(255,245,219,${a})` : `rgba(92,73,50,${a * .6})`;
      ctx.fillRect(rng() * w, rng() * h, rng() * 3 + .5, rng() * 3 + .5);
    }
  }, [35, 35]);
}
function facadeTexture(style = 'blue', seed = 10) {
  const rng = seeded(seed);
  const colors = {
    blue: ['#263c52', '#84a9ba', '#f0c487'],
    pearl: ['#758891', '#c9d7d4', '#ffe7ba'],
    dark: ['#152839', '#607b92', '#e5ae69'],
    sand: ['#817c70', '#d5c5ad', '#ffe2ae'],
  }[style] || ['#263c52', '#84a9ba', '#f0c487'];
  return canvasTexture(128, 256, (ctx) => {
    ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, 128, 256);
    for (let y = 5; y < 255; y += 13) {
      ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(0, y + 9, 128, 1);
      for (let x = 4; x < 128; x += 13) {
        ctx.fillStyle = rng() > .66 ? colors[2] : colors[1];
        ctx.globalAlpha = .32 + rng() * .48;
        ctx.fillRect(x, y, 8, 8);
      }
    }
    ctx.globalAlpha = 1;
  });
}
function labelTexture(title, subtitle = '', theme = 'maroon', ratio = 4.4) {
  const w = 768, h = Math.round(w / ratio);
  return canvasTexture(w, h, (g) => {
    const bg = theme === 'maroon' ? '#57152f' : theme === 'dark' ? '#092a3e' : '#06343c';
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = theme === 'maroon' ? '#e5ba78' : '#53d7d8'; g.fillRect(0, 0, w, 9);
    g.fillStyle = '#ffffff';
    let size = subtitle ? 56 : 68;
    g.font = `bold ${size}px Arial, sans-serif`;
    while (g.measureText(title).width > w - 68 && size > 27) { size--; g.font = `bold ${size}px Arial, sans-serif`; }
    g.textBaseline = 'middle'; g.fillText(title, 28, subtitle ? h * .46 : h * .53);
    if (subtitle) {
      g.font = 'bold 26px Arial, sans-serif';
      g.fillStyle = '#e2cfa9'; g.fillText(subtitle.toUpperCase(), 30, h * .79);
    }
    g.fillStyle = theme === 'maroon' ? '#e5ba78' : '#53d7d8'; g.fillRect(0, h - 6, w, 6);
  }, [1, 1]);
}
function flatSign(parent, text, subtitle, width = 14, height = 3, theme = 'maroon') {
  const material = new THREE.MeshBasicMaterial({ map: labelTexture(text, subtitle, theme, width / height), side: THREE.FrontSide });
  const holder = new THREE.Group();
  const front = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  front.position.z = .02;
  const back = new THREE.Mesh(front.geometry, material);
  back.rotation.y = PI;
  back.position.z = -.02;
  holder.add(front, back);
  parent.add(holder);
  return holder;
}
// Batch small static details into a single draw call without losing their material.
function mergeStatic(parent, meshes, material) {
  if (!meshes.length) return;
  meshes.forEach(mesh => mesh.updateMatrix());
  const geom = mergeGeometries(meshes.map(mesh => mesh.geometry.clone().applyMatrix4(mesh.matrix)), false);
  meshes.forEach(mesh => parent.remove(mesh));
  if (!geom) return;
  const combined = new THREE.Mesh(geom, material);
  combined.receiveShadow = true;
  parent.add(combined);
  return combined;
}
function namePlaque(group, title, x, z, opts = {}) {
  const { width = 15, y = 5.5, facing = .25, theme = 'dark' } = opts;
  const pole = M('#54717b', { metalness: .55 });
  box(group, .18, y, .18, x - width * .39, y / 2, z, pole, false);
  box(group, .18, y, .18, x + width * .39, y / 2, z, pole, false);
  const sign = flatSign(group, title.toUpperCase(), 'DOHA · QATAR', width, 2.5, theme);
  sign.position.set(x, y - .2, z);
  sign.rotation.y = facing;
}
function foundation(group, x, z, radius = 55, color = '#dfc9a9') {
  const m = M(color, { roughness: 1 });
  circle(group, radius, x, .035, z, m);
  const rim = M('#f1ddba', { roughness: .9 });
  torus(group, radius, .55, x, .09, z, rim);
}
function building(group, cfg, shared) {
  const { x, z, w, d, h, color = '#aab4b4', style = 'blue', roof = true, shadows = false } = cfg;
  const g = new THREE.Group(); g.position.set(x, 0, z); group.add(g);
  const trim = M(color, { metalness: .3, roughness: .55 });
  box(g, w - .35, h + .5, d - .35, 0, h / 2, 0, trim, shadows);
  const glass = M('#ffffff', { map: shared[style], emissive: '#c67b41', emissiveMap: shared[style], emissiveIntensity: .03, metalness: .32, roughness: .32 });
  box(g, w + .16, h - 2.2, d + .16, 0, h / 2, 0, glass, false);
  shared.nightMaterials.push({ material: glass, factor: .18 });
  if (roof) {
    const ledge = M(color, { metalness: .25 });
    box(g, w + 1.45, .75, d + 1.45, 0, h + .12, 0, ledge, false);
  }
  return g;
}

export function createWorld(routeData) {
  const group = new THREE.Group();
  group.name = `${routeData.district} · Doha Rush`;
  const rng = seeded([...routeData.id].reduce((a, ch) => (a * 33 + ch.charCodeAt(0)) >>> 0, 11229));
  const curve = new THREE.CatmullRomCurve3(routeData.points.map(([x, z]) => new THREE.Vector3(x, 0, z)), true, 'catmullrom', .5);
  const N = routeData.large ? 512 : 384;
  const samples = [];
  for (let i = 0; i < N; i++) {
    const p = curve.getPointAt(i / N);
    const f = curve.getTangentAt(i / N).normalize();
    samples.push({ x: p.x, z: p.z, fx: f.x, fz: f.z, rx: f.z, rz: -f.x });
  }
  const lapLength = curve.getLength();
  const nightMaterials = [];
  const shared = {
    nightMaterials,
    blue: facadeTexture('blue', 21), pearl: facadeTexture('pearl', 53),
    sand: facadeTexture('sand', 66), dark: facadeTexture('dark', 73),
  };
  const at = (t, off = 0) => {
    const p = curve.getPointAt(((t % 1) + 1) % 1);
    const f = curve.getTangentAt(((t % 1) + 1) % 1).normalize();
    return new THREE.Vector3(p.x + f.z * off, 0, p.z - f.x * off);
  };
  const angle = (t) => {
    const f = curve.getTangentAt(((t % 1) + 1) % 1);
    return Math.atan2(f.x, f.z);
  };
  const nearest = (x, z) => {
    let best = Infinity, bi = 0;
    for (let i = 0; i < N; i++) {
      const p = samples[i];
      const d = (p.x - x) ** 2 + (p.z - z) ** 2;
      if (d < best) { best = d; bi = i; }
    }
    const p = samples[bi];
    return { i: bi, distance: Math.sqrt(best), lateral: (x - p.x) * p.rx + (z - p.z) * p.rz, sample: p };
  };

  // A sandy mainland, a cobalt gulf, and a circular Pearl island. Water is deliberately
  // outside the playable road; the layout is scenic, not a claim to be a street-level map.
  const groundMap = earthTexture(routeData.id === 'pearl' ? '#d9c3a7' : routeData.setting === 'inland' ? '#c5b89a' : '#c5ad8a', 1051);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(routeData.large ? 1900 : 1400, routeData.large ? 1800 : 1400), M('#ffffff', { map: groundMap, roughness: 1 }));
  ground.rotation.x = -PI / 2; ground.position.y = -.09;
  ground.receiveShadow = true;
  group.add(ground);
  const waterMat = M(routeData.id === 'westbay' ? '#207f9c' : '#2699a8', {
    metalness: .28, roughness: .3, transparent: true, opacity: .98, side: THREE.DoubleSide,
  });
  if (routeData.id === 'pearl') {
    const water = new THREE.Mesh(new THREE.PlaneGeometry(1350, 1350), waterMat);
    water.rotation.x = -PI / 2; water.position.y = -.045; group.add(water);
    circle(group, 192, 0, .005, 0, M('#e2cbae', { roughness: 1 }), 112);
    torus(group, 191, 1.6, 0, .07, 0, M('#f4e8cd'), 112);
  } else if (routeData.coastline !== null) {
    const shore = routeData.coastline || 205;
    const length = routeData.large ? 1650 : 1200;
    const water = new THREE.Mesh(new THREE.PlaneGeometry(880, length), waterMat);
    water.rotation.x = -PI / 2; water.position.set(shore + 440, -.045, 0); group.add(water);
    box(group, 1.5, .75, length, shore, .15, 0, M('#efe1c4'), false);
    const foam = M('#b6e4e0', { emissive: '#55b5b3', emissiveIntensity: .12 });
    box(group, .75, .03, length, shore + 1.5, .025, 0, foam, false);
  }

  // Six layered sandbars on the horizon, unobtrusive under a low-lying fog.
  const duneMat = [M('#c5b095', { roughness: 1 }), M('#ab9f89', { roughness: 1 })];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * PI * 2;
    const r = (routeData.large ? 740 : 470) + rng() * 130;
    const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6), duneMat[i % 2]);
    hill.scale.set(100 + rng() * 90, 18 + rng() * 22, 54 + rng() * 50);
    hill.position.set(Math.cos(a) * r, -12, Math.sin(a) * r);
    hill.castShadow = false;
    group.add(hill);
  }

  // Connected free-drive side streets: an outer boulevard linked to the race loop
  // by six paved cross streets. Both are included in the drivable-surface query.
  const sideRoad = routeData.large ? buildSideStreets(group, at, routeData) : null;

  // Asphalt, margin, pale paving, curbs and road paint are batched into ribbons.
  const surface = (left, right, y, chooseColor) => {
    const positions = [], colors = [], indices = [];
    for (let i = 0; i < N; i++) {
      const a = samples[i], b = samples[(i + 1) % N];
      const vs = [
        [a.x + a.rx * left, y, a.z + a.rz * left],
        [a.x + a.rx * right, y, a.z + a.rz * right],
        [b.x + b.rx * left, y, b.z + b.rz * left],
        [b.x + b.rx * right, y, b.z + b.rz * right],
      ];
      const base = positions.length / 3;
      vs.forEach(v => positions.push(...v));
      const color = C(chooseColor(i));
      for (let j = 0; j < 4; j++) colors.push(color.r, color.g, color.b);
      indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.setIndex(indices); geom.computeVertexNormals();
    const mesh = new THREE.Mesh(geom, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95, metalness: .02, side: THREE.DoubleSide }));
    mesh.receiveShadow = true; group.add(mesh); return mesh;
  };
  if (routeData.id !== 'pearl') {
    // Carefully landscaped boulevards add the greenery around Qatar's urban districts.
    surface(16.2, 33, .025, i => i % 16 < 6 ? '#82a47a' : '#769a72');
    surface(-33, -16.2, .025, i => i % 17 < 5 ? '#83a079' : '#789570');
  }
  surface(-16.6, 16.6, .08, () => routeData.id === 'pearl' ? '#d5cab6' : '#c6b9a6');
  surface(-11.4, 11.4, .105, () => '#a39480');
  surface(-8.7, 8.7, .155, i => i % 9 < 3 ? '#31373a' : '#303438');
  surface(-10.8, -8.75, .175, i => ((i / 2) | 0) % 2 ? '#faf7ee' : '#aa1c43');
  surface(8.75, 10.8, .175, i => ((i / 2) | 0) % 2 ? '#faf7ee' : '#aa1c43');
  surface(-8.38, -8.23, .19, () => '#eeeae0');
  surface(8.23, 8.38, .19, () => '#eeeae0');
  surface(-.11, .11, .19, i => i % 8 < 4 ? '#e9e2cf' : '#303438');
  surface(-13.6, -13.4, .125, () => '#ded0b7');
  surface(13.4, 13.6, .125, () => '#ded0b7');

  // The chequered start line is geometry so it stays crisp at any camera angle.
  const starting = new THREE.Group();
  starting.position.copy(at(0)); starting.rotation.y = angle(0); group.add(starting);
  const white = M('#f4eee5', { roughness: 1, side: THREE.DoubleSide });
  const coal = M('#171b20', { roughness: 1, side: THREE.DoubleSide });
  const tileGeom = new THREE.PlaneGeometry(1.05, 1.45);
  const tileMeshes = [new THREE.InstancedMesh(tileGeom, white, 16), new THREE.InstancedMesh(tileGeom, coal, 16)];
  const tileCounts = [0, 0];
  for (let row = 0; row < 2; row++) for (let col = 0; col < 16; col++) {
    const shade = (col + row) % 2;
    AX.position.set(-7.9 + col * 1.05, .211, -1.45 + row * 1.45);
    AX.rotation.set(-PI / 2, 0, 0); AX.scale.set(1, 1, 1); AX.updateMatrix();
    tileMeshes[shade].setMatrixAt(tileCounts[shade]++, AX.matrix);
  }
  tileMeshes.forEach(tile => { tile.instanceMatrix.needsUpdate = true; starting.add(tile); });
  const pillar = M('#112634', { metalness: .48 });
  const gold = M('#e5bb79', { metalness: .52, roughness: .3, emissive: '#a04d23', emissiveIntensity: .16 });
  for (const side of [-1, 1]) {
    box(starting, .72, 9, .86, side * 10.75, 4.5, 0, pillar);
    box(starting, .85, .32, 1.03, side * 10.75, 8.8, 0, gold);
  }
  box(starting, 22.1, 2.9, .8, 0, 8.3, 0, pillar);
  box(starting, 22.4, .15, 1, 0, 9.82, 0, gold);
  const startLabel = flatSign(starting, 'DOHA RUSH', 'START  /  FINISH   ·   QATAR', 19.8, 2.55);
  startLabel.position.set(0, 8.25, -.45);
  startLabel.rotation.y = PI;
  const reverseLabel = flatSign(starting, 'DOHA RUSH', 'START  /  FINISH   ·   QATAR', 19.8, 2.55);
  reverseLabel.position.set(0, 8.25, .45);

  // Numbered checkpoint arches. Their emissive trim is controlled by the main loop.
  const gates = [];
  for (let g = 0; g < 8; g++) {
    // The last marker is just before the finish gantry rather than on top of it.
    const t = g === 7 ? .946 : (g + 1) / 8;
    const holder = new THREE.Group();
    holder.position.copy(at(t)); holder.rotation.y = angle(t); group.add(holder);
    const neon = M('#36d5dc', { metalness: .42, roughness: .3, emissive: '#36d5dc', emissiveIntensity: .55 });
    const frame = M('#18455a', { metalness: .65, roughness: .3 });
    const frameParts = [], neonParts = [];
    for (const s of [-1, 1]) {
      frameParts.push(box(holder, .32, 6.7, .4, s * 9.7, 3.35, 0, frame));
      neonParts.push(box(holder, .11, 6, .48, s * 9.72, 3.35, -.26, neon, false));
    }
    frameParts.push(box(holder, 19.6, .75, .5, 0, 6.7, 0, frame));
    neonParts.push(box(holder, 19.7, .12, .53, 0, 7.14, -.05, neon, false));
    mergeStatic(holder, frameParts, frame);
    mergeStatic(holder, neonParts, neon);
    const sign = flatSign(holder, `CHECKPOINT 0${g + 1}`, routeData.streets[g], 12.6, 1.8, 'dark');
    sign.position.set(0, 5.62, -.36); sign.rotation.y = PI;
    const signBack = sign.clone(); signBack.position.z = .36; signBack.rotation.y = 0;
    holder.add(signBack);
    gates.push(neon);
  }

  // Repeating safety blocks and palms are instanced rather than hundreds of draw calls.
  const barrierMat = M('#faf9ef', { roughness: .85 });
  const barrierGeom = new THREE.BoxGeometry(6.9, .7, .78);
  const barrierN = 2 * Math.floor(lapLength / 13);
  const barriers = new THREE.InstancedMesh(barrierGeom, barrierMat, barrierN);
  let bc = 0;
  for (let i = 0; i < barrierN / 2; i++) {
    for (const side of [-1, 1]) {
      const t = i / (barrierN / 2);
      const pos = at(t, side * 17.3);
      if (routeData.coastline !== null && routeData.id !== 'pearl' && pos.x > (routeData.coastline || 205) - 5) continue;
      if (sideRoad && side === -1 && sideRoad.junctions.some(j => Math.abs(t - j) < .012)) continue;
      AX.position.set(pos.x, .54, pos.z);
      AX.rotation.set(0, angle(t), 0);
      AX.scale.set(1, 1, 1); AX.updateMatrix();
      barriers.setMatrixAt(bc, AX.matrix);
      barriers.setColorAt(bc, C((i + (side + 1) / 2) % 3 === 0 ? '#9e2142' : '#f5efe1'));
      bc++;
    }
  }
  barriers.count = bc;
  barriers.instanceMatrix.needsUpdate = true;
  group.add(barriers);

  // Road name placards reflect named streets, but the synthetic geometry is not a real map.
  for (let i = 0; i < 8; i++) {
    const t = ((i + .12) / 8) % 1;
    const pos = at(t, i % 2 ? -23 : 23);
    if (routeData.coastline !== null && routeData.id !== 'pearl' && pos.x > (routeData.coastline || 205) - 5) continue;
    const sign = new THREE.Group();
    sign.position.copy(pos); sign.rotation.y = angle(t);
    group.add(sign);
    box(sign, .16, 4.5, .16, -3.15, 2.25, 0, M('#415e68'), false);
    box(sign, .16, 4.5, .16, 3.15, 2.25, 0, M('#415e68'), false);
    const face = flatSign(sign, routeData.streets[i].toUpperCase(), `${routeData.district}  /  QATAR`, 7.15, 1.65, 'dark');
    face.position.set(0, 4.2, 0);
  }

  // Island-specific architectural silhouettes.
  if (routeData.id === 'lusail') buildLusail(group, shared, rng);
  if (routeData.id === 'pearl') buildPearl(group, shared, rng);
  if (routeData.id === 'westbay') buildWestBay(group, shared, rng);
  if (routeData.large) {
    buildNewDistricts(group, routeData, shared, rng, at, angle, nearest);
    buildCityHeart(group, routeData, shared, rng);
  }

  if (!routeData.large) buildOuterCity(group, routeData, shared, rng);
  buildPalms(group, routeData, curve, at, rng);
  buildRoadside(group, routeData, at, angle, rng);
  const traffic = buildTrafficLights(group, routeData, at, angle, sideRoad?.junctions);
  const gateTs = Array.from({ length: 8 }, (_, i) => i === 7 ? .946 : (i + 1) / 8);
  const nearestPaved = (x, z) => {
    const main = nearest(x, z);
    if (!sideRoad) return { ...main, branch: false, distance: main.distance };
    let d2 = Infinity;
    // A coarse uniform sample is sufficient for determining whether tires are on asphalt.
    for (const p of sideRoad.centers) {
      const d = (p.x - x) ** 2 + (p.z - z) ** 2;
      if (d < d2) d2 = d;
    }
    const branch = Math.sqrt(d2) < main.distance;
    return { ...main, branch, distance: Math.min(main.distance, Math.sqrt(d2)) };
  };

  return {
    group, curve, samples, length: lapLength, N, gates, gateTs, sideRoad, traffic, at, angle, nearest, nearestPaved, nightMaterials,
    starting,
    signalPhase(clock, i) { return trafficPhase(clock, i); },
    updateLights(night, clock, nextGate = 0) {
      nightMaterials.forEach(({ material, factor }) => { material.emissiveIntensity = .025 + factor * night; });
      traffic.forEach(({ lamps }, i) => {
        const state = trafficPhase(clock, i);
        lamps.forEach((lamp, n) => {
          const active = lamp.index === state.index;
          lamp.material.emissiveIntensity = active ? 2.9 + night * .8 : .02;
          lamp.material.opacity = active ? 1 : .26;
        });
      });
      gates.forEach((m, i) => {
        const active = i === nextGate;
        m.emissive.set(active ? '#ffc475' : '#36d5dc');
        m.color.set(active ? '#ffc475' : '#36d5dc');
        m.emissiveIntensity = active ? .85 + .4 * Math.sin(clock * 5) : .38 + night * .2;
      });
    },
  };
}

function buildOuterCity(group, route, shared, rng) {
  if (route.id === 'pearl') return; // the island skyline is already on the island
  const colors = route.id === 'westbay'
    ? ['#8da7b5', '#a4adb0', '#6c838c', '#d1c1a7']
    : ['#d2c0a8', '#8eacb2', '#afb9ae', '#ceb89c'];
  const positions = [];
  const count = route.id === 'westbay' ? 53 : 38;
  for (let i = 0; i < count; i++) {
    const a = i / count * PI * 2 + (rng() - .5) * .12;
    const r = 215 + rng() * 125;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (x > 178) continue;
    const w = 13 + rng() * 17, d = w * (.72 + rng() * .5);
    const h = route.id === 'westbay' ? 30 + rng() * 65 : 14 + rng() * 35;
    positions.push({ x, z, w, d, h, color: colors[Math.floor(rng() * colors.length)] });
  }
  const unit = new THREE.BoxGeometry(1, 1, 1);
  const body = new THREE.InstancedMesh(unit, M('#ffffff', { roughness: .59, metalness: .24 }), positions.length);
  const winMat = M('#f2f6ee', { map: route.id === 'westbay' ? shared.dark : shared.blue,
    emissive: '#d5996c', emissiveIntensity: .025, metalness: .38, roughness: .34 });
  const windows = new THREE.InstancedMesh(unit, winMat, positions.length);
  const roof = new THREE.InstancedMesh(unit, M('#b5b6ae', { roughness: .65 }), positions.length);
  positions.forEach(({ x, z, w, d, h, color }, i) => {
    AX.position.set(x, h / 2, z); AX.rotation.set(0, 0, 0);
    AX.scale.set(w - .4, h + .3, d - .4); AX.updateMatrix(); body.setMatrixAt(i, AX.matrix);
    body.setColorAt(i, C(color));
    AX.scale.set(w + .12, h - 2, d + .12); AX.updateMatrix(); windows.setMatrixAt(i, AX.matrix);
    AX.position.y = h + .25; AX.scale.set(w + 1, .55, d + 1); AX.updateMatrix(); roof.setMatrixAt(i, AX.matrix);
  });
  body.instanceMatrix.needsUpdate = windows.instanceMatrix.needsUpdate = roof.instanceMatrix.needsUpdate = true;
  shared.nightMaterials.push({ material: winMat, factor: .22 });
  group.add(body, windows, roof);
}

function buildPalms(group, route, curve, at, rng) {
  const positions = [];
  const n = Math.floor(curve.getLength() / 17);
  for (let i = 0; i < n; i++) {
    const t = (i + .33) / n;
    const off = (i % 2 ? 1 : -1) * (23 + rng() * 4);
    const p = at(t, off);
    if (route.coastline !== null && route.id !== 'pearl' && p.x > (route.coastline || 205) - 11) continue;
    if (route.id === 'pearl' && Math.hypot(p.x, p.z) > 188) continue;
    if (route.id === 'lusail' && Math.hypot(p.x + 75, p.z - 35) < 37) continue;
    positions.push([p.x, p.z, 4.2 + rng() * 2.6, rng() * PI * 2]);
  }
  // Additional palms in the interior plaza, not on the racing line.
  for (let i = 0; i < (route.large ? 48 : 25); i++) {
    const a = rng() * PI * 2, r = 75 + rng() * 25;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (route.id === 'westbay' && Math.hypot(x + 35, z - 10) < 28) continue;
    if (route.id === 'pearl' && Math.hypot(x, z) < 69) continue;
    positions.push([x, z, 3.7 + rng() * 2, rng() * PI * 2]);
  }
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(.13, .25, 1, 6), M('#816349', { roughness: 1 }), positions.length);
  const leaf = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 4), M('#477b65', { roughness: 1, side: THREE.DoubleSide }), positions.length * 7);
  const crown = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 7, 5), M('#517963', { roughness: 1 }), positions.length);
  positions.forEach(([x, z, h, a], i) => {
    AX.position.set(x, h / 2, z); AX.rotation.set(0, 0, .06);
    AX.scale.set(1, h, 1); AX.updateMatrix(); trunk.setMatrixAt(i, AX.matrix);
    AX.position.set(x, h + .15, z); AX.rotation.set(0, 0, 0);
    AX.scale.set(1.15, .36, 1.15); AX.updateMatrix(); crown.setMatrixAt(i, AX.matrix);
    for (let j = 0; j < 7; j++) {
      const theta = a + j * 2 * PI / 7;
      AX.position.set(x + Math.cos(theta) * 1.25, h + .13, z + Math.sin(theta) * 1.25);
      AX.rotation.set(0, -theta + PI / 2, .22);
      AX.scale.set(.47, .16, 2.65);
      AX.updateMatrix(); leaf.setMatrixAt(i * 7 + j, AX.matrix);
      leaf.setColorAt(i * 7 + j, C(j % 3 ? '#487e66' : '#619270'));
    }
  });
  trunk.instanceMatrix.needsUpdate = true; leaf.instanceMatrix.needsUpdate = true;
  crown.instanceMatrix.needsUpdate = true;
  group.add(trunk, leaf, crown);
}

function buildRoadside(group, route, at, angle, rng) {
  const postMat = M('#586c71', { metalness: .7 });
  const glowMat = M('#fff2c9', { emissive: '#ffdb93', emissiveIntensity: .5, roughness: .15 });
  const lampMax = route.large ? 52 : 27;
  const posts = new THREE.InstancedMesh(new THREE.CylinderGeometry(.1, .17, 7.2, 7), postMat, lampMax);
  const heads = new THREE.InstancedMesh(new THREE.BoxGeometry(1.35, .16, .4), postMat, lampMax);
  const bulbs = new THREE.InstancedMesh(new THREE.BoxGeometry(1.05, .055, .33), glowMat, lampMax);
  let lampCount = 0;
  for (let i = 0; i < lampMax; i++) {
    const t = (i + .48) / lampMax;
    const pos = at(t, i % 2 ? 21 : -21);
    if (route.coastline !== null && route.id !== 'pearl' && pos.x > (route.coastline || 205) - 7) continue;
    const side = i % 2 ? -1 : 1, yaw = angle(t);
    AX.rotation.set(0, yaw, 0); AX.scale.set(1, 1, 1);
    AX.position.set(pos.x, 3.6, pos.z); AX.updateMatrix(); posts.setMatrixAt(lampCount, AX.matrix);
    AX.position.set(pos.x + Math.cos(yaw) * side * .65, 7.18, pos.z - Math.sin(yaw) * side * .65);
    AX.rotation.set(0, yaw, side * -.14); AX.updateMatrix(); heads.setMatrixAt(lampCount, AX.matrix);
    AX.position.set(pos.x + Math.cos(yaw) * side * .67, 7.05, pos.z - Math.sin(yaw) * side * .67);
    AX.rotation.set(0, yaw, 0); AX.updateMatrix(); bulbs.setMatrixAt(lampCount, AX.matrix);
    lampCount++;
  }
  [posts, heads, bulbs].forEach(obj => { obj.count = lampCount; obj.instanceMatrix.needsUpdate = true; group.add(obj); });
  // Scenic Qatar flags beside each start line.
  const start = at(.01, 26);
  for (let i = 0; i < 3; i++) {
    const p = start.clone(); p.x += i * 4.4;
    cylinder(group, .05, .08, 10, 7, p.x, 5, p.z, postMat, false);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 1.75),
      new THREE.MeshBasicMaterial({ map: qatarFlag(), side: THREE.DoubleSide, transparent: true }));
    flag.position.set(p.x + 1.6, 8.9, p.z); flag.rotation.y = -.4;
    group.add(flag);
  }
  // A few non-collidable spectators, tucked safely behind the barriers.
  const people = new THREE.InstancedMesh(new THREE.CapsuleGeometry(.25, .75, 3, 6), M('#ffffff'), 55);
  for (let i = 0; i < 55; i++) {
    const t = (i + rng() * .8) / 55;
    const p = at(t, (i % 2 ? -1 : 1) * (21.8 + rng() * 3));
    AX.position.set(p.x, .92, p.z); AX.rotation.set(0, rng() * PI, 0); AX.scale.set(1, 1, 1);
    AX.updateMatrix(); people.setMatrixAt(i, AX.matrix);
    people.setColorAt(i, C(['#f4e9d9', '#3e6683', '#a73552', '#cfad7d', '#eeeeec'][i % 5]));
  }
  people.instanceMatrix.needsUpdate = true; group.add(people);
}
let flagTex;
function qatarFlag() {
  if (flagTex) return flagTex;
  flagTex = canvasTexture(128, 72, (g) => {
    g.fillStyle = '#8a1538'; g.fillRect(0, 0, 128, 72);
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(0, 0); g.lineTo(40, 0);
    for (let i = 0; i < 9; i++) { g.lineTo(i % 2 ? 54 : 40, (i + 1) * 8); }
    g.lineTo(0, 72); g.closePath(); g.fill();
  }, [1, 1]);
  return flagTex;
}
function yacht(group, x, z, scale = 1, yaw = 0) {
  const g = new THREE.Group(); g.position.set(x, .13, z); g.rotation.y = yaw; g.scale.setScalar(scale); group.add(g);
  const hull = M('#f8f8f0', { metalness: .2, roughness: .5 });
  const deck = M('#e5d6bb');
  const glass = M('#194658', { metalness: .5, roughness: .25 });
  const body = new THREE.Mesh(new THREE.ConeGeometry(1.35, 6, 4, 1), hull);
  body.rotation.x = PI / 2; body.position.set(0, .55, 0); g.add(body);
  box(g, 1.55, .35, 3.6, 0, 1, -.5, deck, false);
  box(g, 1.12, .6, 1.6, 0, 1.45, -.55, glass, false);
  return g;
}

function buildLusail(group, shared, rng) {
  const gold = M('#c99e58', { metalness: .36, roughness: .48 });
  const pale = M('#e8d5af', { roughness: .78 });
  const dark = M('#152c39', { metalness: .7, roughness: .3 });
  foundation(group, -22, -18, 59, '#ddc29a');

  // Lusail Stadium — broad lantern-inspired golden bowl, ribbed facade, open roof.
  const stadium = new THREE.Group(); stadium.position.set(-22, 0, -18); group.add(stadium);
  const profile = [[0, 43], [1.5, 46], [8, 52], [15, 51], [19, 46], [19.6, 37]];
  const shape = new THREE.LatheGeometry(profile.map(([y, r]) => new THREE.Vector2(r, y)), 64);
  const shell = new THREE.Mesh(shape, gold); shell.scale.z = .85;
  shell.castShadow = true; shell.receiveShadow = true; stadium.add(shell);
  const open = new THREE.Mesh(new THREE.RingGeometry(29, 46, 64), M('#e6c98f', { metalness: .42, roughness: .4, side: THREE.DoubleSide }));
  open.rotation.x = -PI / 2; open.scale.y = .85; open.position.y = 19.7; stadium.add(open);
  circle(stadium, 28, 0, 17.3, 0, M('#1d3037'), 64);
  const stripes = [];
  for (let i = 0; i < 64; i++) {
    const a = i * 2 * PI / 64;
    stripes.push(49 * Math.cos(a), 2, 49 * Math.sin(a) * .85, 51.1 * Math.cos(a + .08), 16.8, 51.1 * Math.sin(a + .08) * .85);
    stripes.push(51.1 * Math.cos(a + .08), 16.8, 51.1 * Math.sin(a + .08) * .85,
      49 * Math.cos(a + .17), 2, 49 * Math.sin(a + .17) * .85);
  }
  const lineGeom = new THREE.BufferGeometry();
  lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(stripes, 3));
  stadium.add(new THREE.LineSegments(lineGeom, new THREE.LineBasicMaterial({ color: '#f5db9c', transparent: true, opacity: .7 })));
  torus(stadium, 47, .45, 0, 19.7, 0, M('#f8dfa4', { metalness: .5, emissive: '#e09a42', emissiveIntensity: .15 }));
  namePlaque(group, 'LUSAIL STADIUM', -22, -80, { width: 19, facing: .1 });

  // Katara Towers — twin outward-curling scimitars, with warm lit glass bands.
  const tower = new THREE.Group(); tower.position.set(73, 0, 35); tower.rotation.y = -.21; group.add(tower);
  circle(tower, 26, 0, .05, 0, M('#dbd1b9'));
  const glassTex = shared.blue;
  for (const side of [-1, 1]) {
    const rings = 16, sides = 12, verts = [], uvs = [], faces = [];
    for (let j = 0; j <= rings; j++) {
      const t = j / rings, y = t * 73;
      const shift = side * (8 + 13 * t ** 2.25);
      const radius = (6.6 + 1.2 * Math.sin(t * PI)) * (1 - t * .13);
      for (let k = 0; k <= sides; k++) {
        const a = k / sides * 2 * PI;
        verts.push(shift + Math.cos(a) * radius, y, Math.sin(a) * radius * .9);
        uvs.push(k / sides, t);
      }
    }
    for (let j = 0; j < rings; j++) for (let k = 0; k < sides; k++) {
      const a = j * (sides + 1) + k, b = a + sides + 1;
      faces.push(a, b, a + 1, a + 1, b, b + 1);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(faces); geo.computeVertexNormals();
    const mat = M('#c8dad9', { map: glassTex, metalness: .75, roughness: .26,
      emissive: '#cda772', emissiveMap: glassTex, emissiveIntensity: .04, side: THREE.DoubleSide });
    shared.nightMaterials.push({ material: mat, factor: .52 });
    const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = true; tower.add(mesh);
    const points = [];
    for (let j = 0; j <= rings; j++) {
      const t = j / rings;
      points.push(new THREE.Vector3(side * (8 + 13 * t ** 2.25) - side * (6.6 + 1.2 * Math.sin(t * PI)) * (1 - t * .13), t * 73, 0));
    }
    const trim = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 32, .35, 5, false),
      M('#e9bd79', { metalness: .62, emissive: '#f6b365', emissiveIntensity: .25 }));
    tower.add(trim); shared.nightMaterials.push({ material: trim.material, factor: .65 });
  }
  box(tower, 16, 5, 13, 0, 2.5, 0, pale);
  namePlaque(group, 'KATARA TOWERS', 76, 6, { width: 17, facing: .15, theme: 'maroon' });

  // Place Vendôme's pale, symmetrical shopping frontage and water feature.
  const vend = new THREE.Group(); vend.position.set(-87, 0, 38); vend.rotation.y = .24; group.add(vend);
  box(vend, 59, 13, 24, 0, 6.5, 0, pale);
  box(vend, 62, 1, 27, 0, 13.25, 0, M('#e9e2d1'));
  for (let i = 0; i < 13; i++) {
    const xx = -26 + i * 4.32;
    cylinder(vend, .4, .42, 7.7, 8, xx, 4.3, 12.7, pale, false);
    box(vend, 2.7, 4.9, .25, xx, 8.2, 12.25, i % 2 ? dark : M('#aeb9b1'), false);
  }
  box(vend, 12.8, 5, 9, 0, 15.2, 0, pale);
  box(vend, 8, 1.1, 11, 0, 18, 0, gold);
  box(vend, 52, .16, 9, 0, .12, 17, M('#65b8c1', { metalness: .2, roughness: .25 }), false);
  cylinder(vend, 1.6, 1.6, 1, 16, 0, .6, 16, pale, false);
  namePlaque(group, 'PLACE VENDÔME', -89, 80, { width: 17, theme: 'maroon' });

  // Marina's recognizable colourful stacked twin towers.
  for (const [i, x] of [104, 126].entries()) {
    const t = new THREE.Group(); t.position.set(x, 0, -54); group.add(t);
    const colors = ['#74b8bd', '#e7b885', '#85a1bb', '#ead5a2'];
    for (let k = 0; k < 8; k++) {
      const px = (k % 3 - 1) * 1.25;
      box(t, 16, 5.5, 15, px, 2.75 + k * 5, 0, M(colors[(i + k) % 4], { metalness: .26, roughness: .5 }));
      box(t, 15.5, .45, 15.4, px, 5.3 + k * 5, 0, pale, false);
    }
  }
  namePlaque(group, 'MARINA DISTRICT', 109, -17, { width: 18, theme: 'dark' });
  for (let i = 0; i < 8; i++) yacht(group, 254 + rng() * 80, -125 + i * 35, .8 + rng() * .45, rng() * PI);
}

function buildPearl(group, shared, rng) {
  const cream = M('#f1e3d0', { roughness: .82 });
  const stone = M('#c8b89e', { roughness: .88 });
  const marinaBlue = M('#208a9e', { metalness: .27, roughness: .3 });
  foundation(group, 0, 0, 66, '#e8d4b8');
  circle(group, 49, 0, .12, 0, marinaBlue);
  torus(group, 49.2, .8, 0, .22, 0, cream);
  torus(group, 62, 1.3, 0, .19, 0, cream);
  for (let i = 0; i < 9; i++) {
    const a = (i + .2) / 9 * PI * 2;
    yacht(group, Math.cos(a) * (16 + rng() * 15), Math.sin(a) * (16 + rng() * 15), .7 + rng() * .4, -a + .4);
  }
  namePlaque(group, 'PORTO ARABIA', -4, 70, { width: 18, theme: 'maroon' });

  // Crescent of Mediterranean-style towers around Porto Arabia's marina.
  for (let i = 0; i < 11; i++) {
    const a = (.04 + i / 11 * .86) * PI * 2;
    const r = 72 + rng() * 8;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (x < -56 && z > -18) continue;
    building(group, { x, z, w: 10 + rng() * 4, d: 10 + rng() * 4,
      h: 27 + rng() * 14, color: '#e6d5bf', style: 'pearl', shadows: true }, shared);
  }

  // Qanat Quartier's colourful canals and pastel row houses.
  const pastels = ['#e8a89d', '#ebcf93', '#8dbac1', '#dac3af', '#d5a3b8', '#ebe0ba'];
  const canal = box(group, 4.2, .05, 76, -72, .11, 14, marinaBlue, false);
  canal.rotation.y = -.25;
  const canal2 = box(group, 5.4, .05, 44, -92, .12, -18, marinaBlue, false); canal2.rotation.y = .4;
  for (let i = 0; i < 11; i++) {
    const row = i < 6 ? 0 : 1;
    const j = row ? i - 6 : i;
    const x = -91 + row * 24, z = -41 + j * 16;
    const g = new THREE.Group(); g.position.set(x, 0, z); group.add(g);
    box(g, 10, 8.4 + i % 3, 12, 0, 4.3 + (i % 3) / 2, 0, M(pastels[i % pastels.length]));
    box(g, 11.5, .65, 13, 0, 9.2 + i % 3, 0, cream, false);
    for (let k of [-1, 0, 1]) {
      box(g, 1.3, 2.7, .08, k * 2.7, 3.9, 6.05, M('#36515c', { metalness: .4 }), false);
      box(g, 2, .4, 1, k * 2.7, 5.4, 6.3, cream, false);
    }
  }
  const bridge = box(group, 10, 1.5, 6, -81, 2, -2, cream, false); bridge.rotation.y = -.3;
  namePlaque(group, 'QANAT QUARTIER', -98, -79, { width: 18, theme: 'maroon' });

  // Medina Centrale: a sunlit paved square and low Spanish-style arcade.
  foundation(group, 7, -87, 23, '#e8d3b5');
  const medina = new THREE.Group(); medina.position.set(8, 0, -82); group.add(medina);
  box(medina, 43, 9, 10, 0, 4.5, -16, M('#e1c7a8'));
  for (let i = -4; i <= 4; i++) {
    cylinder(medina, .35, .36, 5, 8, i * 4.3, 2.5, -10.6, cream, false);
    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.55, .34, 5, 12, PI), cream);
    arch.rotation.z = PI; arch.position.set(i * 4.3, 5, -10.6); medina.add(arch);
  }
  cylinder(medina, 2.5, 3, 1.2, 16, 0, .6, 0, stone);
  circle(medina, 2.3, 0, 1.24, 0, marinaBlue);
  namePlaque(group, 'MEDINA CENTRALE', 4, -109, { width: 21, theme: 'maroon' });

  // Abraj Quartier twin gateway towers, with discreet geometric pearl crowns.
  for (let side of [-1, 1]) {
    const x = 96 + side * 12, z = 32;
    cylinder(group, 8, 9.2, 52, 12, x, 26, z, M('#dfd5c2', { metalness: .2 }));
    cylinder(group, 8.15, 9.35, 47, 12, x, 26, z, M('#bed2c9', { map: shared.pearl, metalness: .42, roughness: .37 }), false);
    for (let yy = 9; yy <= 51; yy += 7) torus(group, 8.6, .24, x, yy, z, cream, 12);
    cylinder(group, 5, 8, 5, 12, x, 54, z, cream);
  }
  namePlaque(group, 'ABRAJ QUARTIER', 91, 76, { width: 20, theme: 'maroon' });
  building(group, { x: 76, z: -68, w: 32, d: 14, h: 16, color: '#f0dfc9', style: 'pearl' }, shared);
  namePlaque(group, 'VIVA BAHRIYA', 79, -104, { width: 18, theme: 'dark' });
  for (let i = 0; i < 9; i++) {
    const a = i / 9 * PI * 2;
    yacht(group, Math.cos(a) * (223 + rng() * 33), Math.sin(a) * (220 + rng() * 45), .9, a);
  }
}

function buildWestBay(group, shared, rng) {
  const dark = M('#1c3447', { metalness: .64, roughness: .27 });
  const cream = M('#e0cdb3', { roughness: .77 });
  const champagne = M('#d4ad76', { metalness: .47, roughness: .34 });
  // Dense but deliberately composed skyline, not arbitrary cubes.
  const blocks = [
    [-88, 64, 18, 18, 62], [-100, 19, 17, 16, 42], [-72, 17, 19, 19, 57],
    [2, 83, 15, 17, 57], [65, 76, 17, 15, 60], [87, 17, 17, 16, 45],
    [10, -46, 15, 15, 53], [-23, -72, 16, 19, 56], [-74, -25, 19, 18, 38],
    [76, -15, 17, 18, 51], [-4, 38, 15, 17, 48], [-105, -56, 13, 13, 31],
  ];
  blocks.forEach(([x, z, w, d, h], i) => building(group, { x, z, w, d, h,
    color: i % 3 ? '#8da6b2' : '#aab6b5', style: i % 2 ? 'blue' : 'dark', shadows: true }, shared));

  // Burj Doha: copper-glass cylinder with a mashrabiya-inspired overlaid diamond lattice.
  const burj = new THREE.Group(); burj.position.set(42, 0, 27); group.add(burj);
  cylinder(burj, 10.7, 10.7, 83, 32, 0, 41.5, 0, M('#746b61', { metalness: .75, roughness: .29 }));
  cylinder(burj, 11, 11, 79, 32, 0, 41.5, 0, M('#b79a70', {
    map: shared.sand, metalness: .48, roughness: .33, emissive: '#e2a35d', emissiveIntensity: .03,
  }), false);
  const lattice = [];
  for (let y = 3; y < 81; y += 7.5) {
    for (let i = 0; i < 32; i++) {
      const a = i * 2 * PI / 32, b = (i + 1) * 2 * PI / 32;
      lattice.push(Math.cos(a) * 11.08, y, Math.sin(a) * 11.08,
        Math.cos(b) * 11.08, y + 7.5, Math.sin(b) * 11.08);
      lattice.push(Math.cos(b) * 11.08, y, Math.sin(b) * 11.08,
        Math.cos(a) * 11.08, y + 7.5, Math.sin(a) * 11.08);
    }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(lattice, 3));
  burj.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#eed1a3', transparent: true, opacity: .66 })));
  const dome = new THREE.Mesh(new THREE.SphereGeometry(10.7, 24, 10, 0, PI * 2, 0, PI / 2), champagne);
  dome.position.y = 83; burj.add(dome);
  namePlaque(group, 'DOHA TOWER', 45, 61, { width: 16, theme: 'maroon' });

  // Tornado Tower: a glass hourglass clad in a diagonal steel exoskeleton.
  const tornado = new THREE.Group(); tornado.position.set(-33, 0, 7); group.add(tornado);
  const rings = 21, sides = 16, p = [], ix = [], uv = [], wired = [];
  const rad = (t) => 10.9 - 3.6 * Math.sin(t * PI);
  for (let j = 0; j <= rings; j++) {
    const t = j / rings, y = t * 100, r = rad(t), turn = t * .42;
    for (let k = 0; k <= sides; k++) {
      const a = k / sides * PI * 2 + turn;
      p.push(Math.cos(a) * r, y, Math.sin(a) * r); uv.push(k / sides, t);
    }
  }
  for (let j = 0; j < rings; j++) for (let k = 0; k < sides; k++) {
    const a = j * (sides + 1) + k, b = a + sides + 1;
    ix.push(a, b, a + 1, a + 1, b, b + 1);
    if (k % 2 === 0) {
      wired.push(...p.slice(a * 3, a * 3 + 3), ...p.slice((b + 1) * 3, (b + 1) * 3 + 3));
      wired.push(...p.slice((a + 1) * 3, (a + 1) * 3 + 3), ...p.slice(b * 3, b * 3 + 3));
    }
  }
  const tg = new THREE.BufferGeometry();
  tg.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  tg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  tg.setIndex(ix); tg.computeVertexNormals();
  const tm = M('#557582', { map: shared.dark, metalness: .78, roughness: .25, side: THREE.DoubleSide,
    emissive: '#94b9cf', emissiveIntensity: .03 });
  tornado.add(new THREE.Mesh(tg, tm));
  shared.nightMaterials.push({ material: tm, factor: .65 });
  const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(wired, 3));
  tornado.add(new THREE.LineSegments(wg, new THREE.LineBasicMaterial({ color: '#a5bbc2', transparent: true, opacity: .84 })));
  cylinder(tornado, 11, 11, 1.5, 20, 0, 100.5, 0, M('#c4a675', { metalness: .62 }));
  namePlaque(group, 'TORNADO TOWER', -35, 53, { width: 18, theme: 'dark' });

  // Sheraton's iconic pyramidal profile on the Corniche.
  const sher = new THREE.Group(); sher.position.set(68, 0, -65); group.add(sher);
  for (let i = 0; i < 9; i++) {
    const w = 37 - i * 3.3, d = 32 - i * 2.7;
    box(sher, w, 5, d, 0, 2.5 + i * 5, 0, i % 2 ? M('#dfcdb2') : cream);
    box(sher, w + .6, .32, d + .6, 0, 5 + i * 5, 0, champagne, false);
    box(sher, w * .7, 2.7, d + .15, 0, 2.7 + i * 5, 0, M('#4e7786', { metalness: .52 }), false);
  }
  box(sher, 9, 4.5, 8, 0, 47, 0, cream);
  namePlaque(group, 'SHERATON GRAND', 63, -102, { width: 19, theme: 'maroon' });

  // DECC's long hall and floating blade roof.
  const decc = new THREE.Group(); decc.position.set(-70, 0, -67); group.add(decc);
  box(decc, 43, 8, 20, 0, 4, 0, M('#a9bbc0', { metalness: .36 }));
  box(decc, 48, 1.3, 24, 0, 9, -1, M('#e7e8dc', { metalness: .3 }));
  box(decc, 41, 4.8, .25, 0, 4.5, 10.2, dark, false);
  namePlaque(group, 'DOHA · DECC', -78, -93, { width: 17, theme: 'maroon' });

  // Corniche seafront park with dhows in the Gulf.
  const green = M('#8ba886', { roughness: 1 });
  box(group, 22, .16, 205, 171, .01, 8, green, false);
  for (let i = 0; i < 7; i++) yacht(group, 278 + rng() * 75, -150 + i * 51, 1.15, rng() * PI * 2);
  namePlaque(group, 'DOHA CORNICHE', 171, 85, { width: 20, facing: -PI / 2, theme: 'dark' });
}

// These links are intentionally invented; they turn scenic racetracks into explorable
// neighbourhoods, without suggesting the geometry or turn sequence is a real Doha map.
function roadRibbon(group, points, width, height, color, closed = false) {
  const vertices = [], indices = [];
  for (let i = 0; i < points.length; i++) {
    const prev = points[closed ? (i - 1 + points.length) % points.length : Math.max(0, i - 1)];
    const next = points[closed ? (i + 1) % points.length : Math.min(points.length - 1, i + 1)];
    const dx = next.x - prev.x, dz = next.z - prev.z;
    const len = Math.hypot(dx, dz) || 1;
    const nx = dz / len, nz = -dx / len;
    vertices.push(points[i].x + nx * width / 2, height, points[i].z + nz * width / 2,
      points[i].x - nx * width / 2, height, points[i].z - nz * width / 2);
    if (i || closed) {
      const j = i || points.length, a = (j - 1) * 2, b = (j % points.length) * 2;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setIndex(indices); geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, M(color, { side: THREE.DoubleSide, roughness: .96 }));
  mesh.receiveShadow = true; group.add(mesh);
  return mesh;
}
function buildSideStreets(group, at, route) {
  const junctions = [.075, .235, .395, .555, .715, .875];
  const centers = [];
  const ringPath = new THREE.CatmullRomCurve3(
    Array.from({ length: 48 }, (_, i) => at(i / 48, -51)), true, 'catmullrom', .5);
  const ring = Array.from({ length: 385 }, (_, i) => ringPath.getPointAt(i / 384));
  roadRibbon(group, ring.slice(0, -1), 20, .09, '#cdbba5', true);
  roadRibbon(group, ring.slice(0, -1), 14.5, .126, '#33464b', true);
  ring.forEach((p, i) => { if (i % 2 === 0) centers.push({ x: p.x, z: p.z }); });
  for (const j of junctions) {
    const a = at(j, -51), b = at(j, 0);
    const connector = Array.from({ length: 12 }, (_, i) => new THREE.Vector3(
      a.x + (b.x - a.x) * i / 11, 0, a.z + (b.z - a.z) * i / 11));
    roadRibbon(group, connector, 19, .092, '#d2c1a5');
    roadRibbon(group, connector, 15, .13, '#354a50');
    for (let i = 0; i < 11; i++) centers.push({ x: connector[i].x, z: connector[i].z });
  }
  const paint = new THREE.InstancedMesh(new THREE.BoxGeometry(.16, .015, 4.8),
    M('#eee7d3', { roughness: .95 }), 90);
  let k = 0;
  for (let i = 0; i < 384 && k < 90; i += 5) {
    const before = ring[(i + 383) % 384], after = ring[(i + 1) % 384];
    const p = ring[i], a = Math.atan2(after.x - before.x, after.z - before.z);
    AX.position.set(p.x, .149, p.z); AX.rotation.set(0, a, 0); AX.scale.set(1, 1, 1); AX.updateMatrix();
    paint.setMatrixAt(k++, AX.matrix);
  }
  paint.count = k; paint.instanceMatrix.needsUpdate = true; group.add(paint);
  return { junctions, ring, centers };
}

// A real alternating signal cycle: green (9s), amber (2s), red (5s).
// The nearby signal and its remaining seconds are shown on the driving HUD.
function trafficPhase(clock, i) {
  const phase = ((clock + i * 3.3) % 16 + 16) % 16;
  return phase < 9 ? { name: 'GREEN', index: 2, seconds: Math.ceil(9 - phase) }
    : phase < 11 ? { name: 'AMBER', index: 1, seconds: Math.ceil(11 - phase) }
      : { name: 'RED', index: 0, seconds: Math.ceil(16 - phase) };
}
function buildTrafficLights(group, route, at, angle, junctions) {
  const xs = junctions || [.19, .49, .79];
  const signals = [];
  const steel = M('#183644', { metalness: .7, roughness: .32 });
  const trim = M('#ace4d8', { emissive: '#26aa9a', emissiveIntensity: .16 });
  xs.forEach((t, i) => {
    const signal = new THREE.Group(); signal.position.copy(at(t - .009));
    signal.rotation.y = angle(t); group.add(signal);
    const lamps = [];
    for (const side of [-1, 1]) {
      box(signal, .24, 6.5, .24, side * 12.3, 3.25, 0, steel, false);
      box(signal, .84, 3.3, .61, side * 12.3, 6.22, 0, steel, false);
      box(signal, .65, .12, .67, side * 12.3, 7.94, 0, trim, false);
      ['#f95f73', '#ffcd62', '#60f0ba'].forEach((color, n) => {
        const mat = M('#ffffff', { emissive: color, emissiveIntensity: .02,
          transparent: true, opacity: .25, metalness: .05, roughness: .19 });
        const orb = new THREE.Mesh(new THREE.SphereGeometry(.285, 10, 8), mat);
        orb.position.set(side * 12.3, 7.22 - n * .95, -.37);
        signal.add(orb); lamps.push({ material: mat, index: n });
      });
    }
    // A crisp stop line on the approach, without a collision wall across the road.
    const paint = M('#f6eee0', { roughness: 1 });
    box(signal, 17.3, .02, .42, 0, .217, -8.5, paint, false);
    for (let stripe = -5; stripe <= 5; stripe++)
      box(signal, .9, .016, 2.2, stripe * 1.55, .217, -2.9, paint, false);
    signals.push({ t, lamps, index: i });
  });
  return signals;
}

function buildNewDistricts(group, route, shared, rng, at, angle, nearest) {
  const landmarkSpots = [];
  for (const site of route.landmarks || []) {
    const root = new THREE.Group(); root.position.copy(at(site.t, (site.side || 1) * 82));
    root.rotation.y = angle(site.t);
    // Orient the composed miniature towards the stretch of road it decorates.
    group.add(root);
    landmarkSpots.push(root.position.clone());
    destination(root, site, shared, rng, route.accent);
    const sign = flatSign(root, site.name, route.district, 19, 3, 'maroon');
    sign.position.set(-39, 5.2, 0); sign.rotation.y = -PI / 2;
    for (const dz of [-7.5, 7.5]) box(root, .18, 4, .18, -39, 2, dz, M('#425d69'), false);
  }
  // A compact, batched city layer behind the recognisable destinations.
  const locations = [];
  for (let i = 0; i < (route.id === 'grand' ? 86 : 52); i++) {
    const t = (i + rng() * .5) / (route.id === 'grand' ? 86 : 52);
    const p = at(t, 134 + rng() * 76);
    if (nearest(p.x, p.z).distance < 76) continue;
    if (landmarkSpots.some(s => Math.hypot(p.x - s.x, p.z - s.z) < 48)) continue;
    locations.push({ x: p.x, z: p.z, w: 10 + rng() * 13,
      d: 11 + rng() * 12, h: 12 + rng() * (route.id === 'grand' ? 47 : 30),
      tint: ['#d4bca6', '#81a9b3', '#d9b1a0', '#e3d5ba', '#83b8a9', '#c8aac0'][i % 6] });
  }
  if (!locations.length) return;
  const unit = new THREE.BoxGeometry(1, 1, 1);
  const facade = M('#ffffff', { map: shared.blue, emissive: '#e2a978',
    emissiveMap: shared.blue, emissiveIntensity: .02, metalness: .19, roughness: .49 });
  shared.nightMaterials.push({ material: facade, factor: .26 });
  const mesh = new THREE.InstancedMesh(unit, facade, locations.length);
  const cap = new THREE.InstancedMesh(unit, M('#f4d1a5', { roughness: .8 }), locations.length);
  locations.forEach(({ x, z, w, d, h, tint }, i) => {
    AX.position.set(x, h / 2, z); AX.rotation.set(0, 0, 0);
    AX.scale.set(w, h, d); AX.updateMatrix(); mesh.setMatrixAt(i, AX.matrix);
    mesh.setColorAt(i, C(tint));
    AX.position.y = h + .25; AX.scale.set(w + .8, .6, d + .8); AX.updateMatrix(); cap.setMatrixAt(i, AX.matrix);
  });
  mesh.instanceMatrix.needsUpdate = cap.instanceMatrix.needsUpdate = true;
  group.add(mesh, cap);
}

// Recognisable, colourful *illustrations* of each venue rather than reproductions.
function destination(g, site, shared, rng, accent) {
  const pale = M('#f2e2c8', { roughness: .83 });
  const white = M('#fff4df', { roughness: .78 });
  const gold = M('#d6aa68', { metalness: .34, roughness: .5 });
  const teal = M('#42bac5', { metalness: .2, roughness: .34 });
  const blue = M('#477ea0', { metalness: .3, roughness: .37 });
  const rose = M('#d79d9c', { roughness: .78 });
  const grass = M('#80ad85', { roughness: 1 });
  foundation(g, 0, 0, 27, site.type === 'park' || site.type === 'hills' ? '#a9be8e' : '#e2ccaa');
  torus(g, 27, .34, 0, .15, 0, M(accent, { emissive: accent, emissiveIntensity: .2 }), 64);
  switch (site.type) {
    case 'skyline': {
      const blocks = [[-15, -9, 13, 46], [8, -12, 11, 63], [-2, 13, 13, 39], [16, 14, 10, 49]];
      for (const [x, z, w, h] of blocks) building(g, { x, z, w, d: w, h,
        color: '#83b6c6', style: 'blue' }, shared);
      cylinder(g, 5.1, 5.1, 69, 14, 1, 34.5, -6, gold);
      cylinder(g, 5.22, 5.22, 65, 14, 1, 34.5, -6,
        M('#d5b081', { map: shared.sand, metalness: .34 }), false);
      break;
    }
    case 'katara': {
      circle(g, 7.8, 0, .19, 0, teal);
      for (let i = 0; i < 5; i++) {
        const seat = new THREE.Mesh(new THREE.TorusGeometry(8 + i * 3.4, .76, 5, 38, PI * 1.25),
          i % 2 ? M('#dcbf9d') : pale);
        seat.rotation.x = PI / 2; seat.rotation.z = .15; seat.position.y = .6 + i * .55; g.add(seat);
      }
      box(g, 38, 4, 5, 0, 2, -10, pale);
      box(g, 31, .52, 5.8, 0, 4.3, -10, rose, false);
      for (let i = -3; i <= 3; i++) cylinder(g, .5, .5, 7, 7, i * 5, 3.5, -14, white);
      break;
    }
    case 'pearl': {
      circle(g, 16, 0, .22, 0, teal);
      for (const sx of [-1, 1]) {
        cylinder(g, 5, 5.7, 34, 11, sx * 16, 17, -2, white);
        cylinder(g, 4.8, 5.5, 30, 11, sx * 16, 17, -2,
          M('#99c1c9', { map: shared.pearl, roughness: .4, metalness: .32 }), false);
        cylinder(g, 3, 5, 3.5, 11, sx * 16, 36, -2, gold);
      }
      yacht(g, 0, 2, 1.4, .25);
      break;
    }
    case 'stadium': {
      const shell = new THREE.Mesh(new THREE.CylinderGeometry(19, 22, 13, 36, 1, true), gold);
      shell.position.y = 7; g.add(shell);
      const lip = new THREE.Mesh(new THREE.RingGeometry(13, 19, 36), pale);
      lip.rotation.x = -PI / 2; lip.position.y = 13.7; g.add(lip);
      circle(g, 12, 0, 9, 0, M('#315f59'));
      for (let i = 0; i < 24; i++) {
        const a = i * PI / 12;
        box(g, .38, 11, .4, Math.cos(a) * 19.7, 7, Math.sin(a) * 19.7, pale, false);
      }
      break;
    }
    case 'aspire': {
      cylinder(g, 4.5, 7.5, 62, 12, 0, 31, 0, blue);
      cylinder(g, 6.1, 5.2, 8, 12, 0, 43, 0, M('#d5c5b9', { metalness: .3 }));
      for (let y = 13; y < 63; y += 10) torus(g, y > 40 ? 5.7 : 5.8 - y * .02, .36, 0, y, 0, gold, 16);
      const spire = new THREE.Mesh(new THREE.ConeGeometry(2.1, 14, 10), gold);
      spire.position.y = 69; g.add(spire);
      break;
    }
    case 'msheireb': {
      for (let i = 0; i < 5; i++) {
        const x = -16 + (i % 3) * 15, z = -11 + Math.floor(i / 3) * 19;
        box(g, 12, 11 + i % 3 * 3, 13, x, (11 + i % 3 * 3) / 2, z, i % 2 ? pale : white);
        for (let q = -1; q <= 1; q++) box(g, 1.1, 6, .13, x + q * 3, 4.2, z + 6.6, blue, false);
      }
      circle(g, 6, 2, .18, 3, teal);
      break;
    }
    case 'souq': {
      const canvasColours = ['#bb5677', '#50bcb7', '#eac287', '#769bb5'];
      for (let row = 0; row < 3; row++) for (let col = 0; col < 5; col++) {
        const x = -19 + col * 9.3, z = -12 + row * 12;
        box(g, 7.4, 5.4, 8.6, x, 2.7, z, row % 2 ? pale : gold);
        box(g, 8.5, .85, 9.2, x, 5.8, z, row === 2 ? white : pale, false);
        box(g, 7, .24, 2.8, x, 6.37, z + 1.5, M(canvasColours[(row + col) % 4]), false);
        box(g, 7.8, 1.2, 1, x, 3.7, z + 4.6,
          M(canvasColours[col % 4]), false);
      }
      break;
    }
    case 'national': {
      box(g, 32, 6, 27, 0, 3, 0, pale);
      for (let i = 0; i < 9; i++) {
        const petals = new THREE.Mesh(new THREE.CylinderGeometry(12 + i % 3, 12 + i % 3, .72, 12), white);
        const a = i * PI * 2 / 9;
        petals.position.set(Math.cos(a) * 8, 7 + i % 4 * 1.7, Math.sin(a) * 6);
        petals.rotation.set(.35 + i * .09, i * .42, .28 * Math.sin(i * 3));
        petals.castShadow = true; g.add(petals);
      }
      break;
    }
    case 'mina': {
      const palette = ['#ebafaa', '#94c7bf', '#e4ce92', '#aebcdb', '#edc6a4', '#e1b8c7', '#9dbfd0'];
      for (let i = 0; i < 7; i++) {
        const x = -22 + (i % 4) * 13, z = i < 4 ? -11 : 10;
        const h = 7 + (i % 3) * 2.2;
        box(g, 11, h, 11, x, h / 2, z, M(palette[i]));
        box(g, 12, .58, 12, x, h + .25, z, white, false);
        for (let j = -1; j <= 1; j++) box(g, 1.4, 2.1, .1, x + j * 3, 3.5, z + 5.6, blue, false);
      }
      break;
    }
    case 'mia': {
      circle(g, 25.2, 0, .16, 0, teal);
      torus(g, 24.7, .7, 0, .23, 0, white, 64);
      box(g, 35, 1.3, 32, 0, .7, 0, white);
      box(g, 34, 5, 30, 0, 3.5, 0, white);
      box(g, 26, 9, 25, 0, 10.5, 0, pale);
      box(g, 19, 9, 19, 0, 19.5, 0, white);
      box(g, 13, 7, 12, 0, 27, 0, pale);
      box(g, 7, 1.1, 7, 0, 31, 0, white);
      for (const y of [5.9, 15.8, 24.8]) {
        const w = y < 10 ? 35 : y < 20 ? 27 : 20;
        box(g, w + .3, .38, w * .87, 0, y, 0, gold, false);
      }
      box(g, 8, 4.8, .28, 0, 17, 9.65, blue, false);
      box(g, .28, 4.8, 8, 9.65, 17, 0, blue, false);
      box(g, 5.5, 2.7, .2, 0, 29.2, 6.1, blue, false);
      break;
    }
    case 'sheraton': {
      for (let i = 0; i < 8; i++) {
        const w = 28 - i * 2.1;
        box(g, w, 5.8, w * .67, 0, 3 + i * 5.7, 0,
          i % 2 ? M('#e3d3bd') : M('#8eb3b9', { metalness: .15 }));
      }
      break;
    }
    case 'park': case 'hills': {
      if (site.type === 'hills') for (let i = 0; i < 3; i++) {
        const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 7), grass);
        hill.scale.set(12, 4, 8); hill.position.set(-15 + i * 14, 0, i % 2 ? 8 : -7); g.add(hill);
      }
      for (let i = 0; i < 13; i++) {
        const x = (rng() - .5) * 41, z = (rng() - .5) * 38;
        cylinder(g, .35, .49, 3.4, 6, x, 1.7, z, gold, false);
        const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(2.4, 0),
          M(i % 3 ? '#53a787' : '#7bc67c'));
        ball.position.set(x, 4.6, z); g.add(ball);
      }
      break;
    }
    case 'pearlmonument': {
      const pearl = new THREE.Mesh(new THREE.SphereGeometry(6, 20, 12), white);
      pearl.position.y = 9; g.add(pearl);
      for (const side of [-1, 1]) {
        const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), pale);
        shell.scale.set(11, 1.3, 7); shell.rotation.z = side * .38;
        shell.position.set(side * 6, 4, 0); g.add(shell);
      }
      break;
    }
    case 'dhow': {
      circle(g, 23, 0, .15, 0, teal);
      for (let i = 0; i < 3; i++) {
        yacht(g, -10 + i * 9, -4 + i * 5, 2.3, .3);
        cylinder(g, .09, .1, 14, 5, -10 + i * 9, 9.2, -4 + i * 5, gold, false);
        const sail = new THREE.Mesh(new THREE.ConeGeometry(4.3, 10, 3), white);
        sail.scale.z = .12; sail.rotation.z = .35;
        sail.position.set(-7 + i * 9, 10, -4 + i * 5); g.add(sail);
      }
      break;
    }
    case 'mosque': {
      box(g, 26, 9, 22, -3, 4.5, 0, pale);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(9, 18, 9, 0, PI * 2, 0, PI / 2), teal);
      dome.position.set(-3, 9, 0); g.add(dome);
      cylinder(g, 2, 2.8, 33, 10, 18, 16.5, -5, white);
      for (let y = 10; y < 33; y += 6) torus(g, 2.3, .29, 18, y, -5, gold, 12);
      break;
    }
    case 'retail': {
      for (let i = 0; i < 5; i++) {
        box(g, 9, 10 + i % 2 * 3, 21, -19 + i * 10, 5 + i % 2 * 1.5, 0,
          M(i % 2 ? '#d6b8bd' : '#edd6ad'));
        box(g, 8, 5, .15, -19 + i * 10, 3, 10.6, M('#7aafbd'), false);
      }
      break;
    }
    case 'beach': {
      circle(g, 22, 0, .16, 0, M('#f6deb1'));
      for (let i = 0; i < 8; i++) {
        const a = i * PI / 4;
        const x = Math.cos(a) * 15, z = Math.sin(a) * 15;
        cylinder(g, .08, .1, 3.3, 5, x, 1.7, z, gold, false);
        const shade = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1, 8),
          M(i % 2 ? '#fa9eac' : '#45c6c6'));
        shade.position.set(x, 3.7, z); g.add(shade);
      }
      break;
    }
    case 'planetarium': {
      cylinder(g, 16, 16, 4, 20, 0, 2, 0, white);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(15, 20, 12, 0, PI * 2, 0, PI / 2), blue);
      dome.position.y = 4; g.add(dome);
      torus(g, 15.3, .5, 0, 4.3, 0, gold, 40);
      break;
    }
    case 'pigeons': {
      for (let i = 0; i < 4; i++) {
        const x = -14 + i * 10;
        cylinder(g, 3, 3.8, 20 + (i % 2) * 4, 9, x, 10 + (i % 2) * 2, 0, white);
        for (let y = 7; y < 19; y += 4) torus(g, 3.1, .24, x, y, 0, gold, 9);
      }
      break;
    }
    case 'museum321': {
      box(g, 36, 9, 24, 0, 4.5, 0, pale);
      box(g, 29, 5, 22, 0, 11.5, 0, blue);
      box(g, 39, 1, 26, 0, 15, 0, gold);
      break;
    }
    case 'education': {
      box(g, 37, 3, 27, 0, 1.5, 0, white);
      box(g, 34, 12, 23, 0, 9, 0, M('#8cb8b9', { metalness: .35 }));
      const roof = box(g, 43, 2.4, 28, 0, 16, -1, white);
      roof.rotation.x = -.12;
      for (let i = -2; i <= 2; i++) box(g, 1, 11, .45, i * 6.5, 9, 11.9, pale, false);
      break;
    }
    default: box(g, 28, 11, 24, 0, 5.5, 0, rose);
  }
}

// A colourful centre fills the longer routes' interior with a coherent district
// rather than an empty oval. It is scenery, not a representation of street geography.
function buildCityHeart(group, route, shared, rng) {
  if (route.id === 'grand') {
    buildWestBay(group, shared, rng);
    return;
  }
  if (route.id === 'aspire') {
    const lawn = M('#6eaf86', { roughness: 1 });
    circle(group, 116, 0, .03, 0, lawn, 96);
    torus(group, 113, 1.2, 0, .13, 0, M('#dfd5ac'), 96);
    circle(group, 27, 37, .13, -17, M('#56b5be', { metalness: .15, roughness: .32 }));
    torus(group, 27, .85, 37, .2, -17, M('#eee1c4'));
    const path = M('#f0dcb5', { roughness: .94 });
    for (const [x, z, ang] of [[-55, 0, .3], [8, 40, -.45], [62, 51, .2]]) {
      const walk = box(group, 87, .12, 3.2, x, .13, z, path, false);
      walk.rotation.y = ang;
    }
    const football = box(group, 48, .14, 27, -47, .17, -44, M('#3e9965'), false);
    football.rotation.y = -.22;
    for (let i = 0; i < 37; i++) {
      const a = rng() * PI * 2, r = 31 + rng() * 68;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if ((x - 37) ** 2 + (z + 17) ** 2 < 850 || (x + 47) ** 2 + (z + 44) ** 2 < 800) continue;
      cylinder(group, .24, .34, 3, 5, x, 1.5, z, M('#98704f'), false);
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(2.3, 0),
        M(i % 3 ? '#358762' : '#85c07a'));
      crown.position.set(x, 4, z); group.add(crown);
    }
    return;
  }
  const warm = route.id === 'olddoha';
  const pastel = route.id === 'katara';
  const palette = warm
    ? ['#e7d2b4', '#c9bda6', '#e5c79f', '#c8aba0', '#e6dac6']
    : pastel
      ? ['#f2d8bb', '#e9b3a9', '#a8c9c3', '#ecd7ba', '#ddb9c4']
      : ['#f2c9b7', '#a6cace', '#ebdaaa', '#d7c2d4', '#9bcabc'];
  foundation(group, 0, 0, 34, pastel ? '#aad4c4' : '#ebd6ba');
  circle(group, 18, 0, .16, 0, M(pastel ? '#80c6b8' : '#7fc5c5'));
  torus(group, 18, .65, 0, .22, 0, M('#faf0d9'));
  const spots = [];
  for (let i = 0; i < 72; i++) {
    const a = 2 * PI * (i / 72) + (rng() - .5) * .03;
    const r = 48 + rng() * 59;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const w = 7.5 + rng() * 10, d = 8 + rng() * 10;
    const h = warm ? 6 + rng() * 14 : pastel ? 7 + rng() * 18 : 11 + rng() * 31;
    spots.push({ x, z, w, d, h, color: palette[i % palette.length] });
  }
  const unit = new THREE.BoxGeometry(1, 1, 1);
  const mat = M('#ffffff', { map: shared.pearl, metalness: .12, roughness: .55,
    emissive: '#dd9969', emissiveMap: shared.pearl, emissiveIntensity: .01 });
  shared.nightMaterials.push({ material: mat, factor: .24 });
  const body = new THREE.InstancedMesh(unit, mat, spots.length);
  const roofs = new THREE.InstancedMesh(unit, M('#efe5d0'), spots.length);
  spots.forEach(({ x, z, w, d, h, color }, i) => {
    AX.position.set(x, h / 2, z); AX.rotation.set(0, 0, 0);
    AX.scale.set(w, h, d); AX.updateMatrix(); body.setMatrixAt(i, AX.matrix);
    body.setColorAt(i, C(color));
    AX.position.y = h + .22; AX.scale.set(w + .9, .45, d + .9);
    AX.updateMatrix(); roofs.setMatrixAt(i, AX.matrix);
  });
  body.instanceMatrix.needsUpdate = roofs.instanceMatrix.needsUpdate = true;
  group.add(body, roofs);
}
