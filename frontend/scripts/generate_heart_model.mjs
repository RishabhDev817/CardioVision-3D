import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Node.js FileReader polyfill for Three.js GLTFExporter
class FileReaderPolyfill {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(buf => {
      this.result = buf;
      if (this.onloadend) this.onloadend({ target: this });
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then(buf => {
      const base64 = Buffer.from(buf).toString('base64');
      this.result = `data:${blob.type || 'application/octet-stream'};base64,${base64}`;
      if (this.onloadend) this.onloadend({ target: this });
    });
  }
}
globalThis.FileReader = FileReaderPolyfill;

console.log('[Heart Generator] Synthesizing Medical-Art 3D Anatomical Heart with Hollow Lumens, Auricular Flaps & Rich Vascular Tree...');

const scene = new THREE.Scene();
const rootGroup = new THREE.Group();
rootGroup.name = 'HumanHeart';

// ==========================================
// 1. PBR MATERIALS - Medical Art Studio Aesthetics
// Matching the stylized high-end medical illustration
// ==========================================
const myocardiumMat = new THREE.MeshStandardMaterial({
  name: 'Mat_Myocardium',
  color: new THREE.Color('#C62828'), // Vibrant medical crimson
  roughness: 0.46,
  metalness: 0.02,
});

const auriclesMat = new THREE.MeshStandardMaterial({
  name: 'Mat_Auricles',
  color: new THREE.Color('#5C1D27'), // Deep plum/wine atrial appendage tone
  roughness: 0.52,
  metalness: 0.0,
});

const atriaMat = new THREE.MeshStandardMaterial({
  name: 'Mat_Atria',
  color: new THREE.Color('#782836'), // Deep crimson atrial tone
  roughness: 0.50,
  metalness: 0.0,
});

const aortaMat = new THREE.MeshStandardMaterial({
  name: 'Mat_Aorta',
  color: new THREE.Color('#E53935'), // Glossy arterial scarlet red
  roughness: 0.28,
  metalness: 0.04,
});

const pulmonaryMat = new THREE.MeshStandardMaterial({
  name: 'Mat_PulmonaryArtery',
  color: new THREE.Color('#1565C0'), // Vibrant royal clinical blue
  roughness: 0.28,
  metalness: 0.04,
});

const venaCavaMat = new THREE.MeshStandardMaterial({
  name: 'Mat_VenaCava',
  color: new THREE.Color('#1565C0'), // Systemic royal clinical blue
  roughness: 0.28,
  metalness: 0.04,
});

const fatPadMat = new THREE.MeshStandardMaterial({
  name: 'Mat_EpicardialFat',
  color: new THREE.Color('#E2C4A2'), // Subepicardial sulcal fat pad
  roughness: 0.70,
  metalness: 0.0,
});

// Interactive coronary artery materials
const ladMat = new THREE.MeshStandardMaterial({
  name: 'Mat_LAD',
  color: new THREE.Color('#F43F5E'), // LAD Rose (#f43f5e)
  roughness: 0.32,
  metalness: 0.04,
  emissive: new THREE.Color('#F43F5E'),
  emissiveIntensity: 0.12,
});

const lcxMat = new THREE.MeshStandardMaterial({
  name: 'Mat_LCX',
  color: new THREE.Color('#0D9488'), // LCX Teal (#0d9488)
  roughness: 0.32,
  metalness: 0.04,
  emissive: new THREE.Color('#0D9488'),
  emissiveIntensity: 0.12,
});

const rcaMat = new THREE.MeshStandardMaterial({
  name: 'Mat_RCA',
  color: new THREE.Color('#F97316'), // RCA Orange (#f97316)
  roughness: 0.32,
  metalness: 0.04,
  emissive: new THREE.Color('#F97316'),
  emissiveIntensity: 0.12,
});

// ==========================================
// 2. HELPER: TAPERED VASCULAR GEOMETRY
// High-precision vascular geometry with smooth Frenet frames
// ==========================================
function createTaperedTubeGeometry(pointsArr, radStart, radEnd, tubularSegments = 84, radialSegments = 20) {
  const vectors = pointsArr.map(p => new THREE.Vector3(...p));
  const curve = new THREE.CatmullRomCurve3(vectors);
  const points = curve.getPoints(tubularSegments);
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const { tangents, normals, binormals } = frames;

  const vertices = [];
  const vertexNormals = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    const radius = radStart + (radEnd - radStart) * t;
    const P = points[i];
    const N = normals[i];
    const B = binormals[i];

    for (let j = 0; j <= radialSegments; j++) {
      const theta = (j / radialSegments) * Math.PI * 2;
      const sin = Math.sin(theta);
      const cos = -Math.cos(theta);

      const norm = new THREE.Vector3()
        .copy(N).multiplyScalar(cos)
        .addScaledVector(B, sin)
        .normalize();

      const v = new THREE.Vector3().copy(P).addScaledVector(norm, radius);

      vertices.push(v.x, v.y, v.z);
      vertexNormals.push(norm.x, norm.y, norm.z);
      uvs.push(t, j / radialSegments);
    }
  }

  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * (radialSegments + 1) + j;
      const b = (i + 1) * (radialSegments + 1) + j;
      const c = (i + 1) * (radialSegments + 1) + (j + 1);
      const d = i * (radialSegments + 1) + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  // Rounded end cap at proximal tip
  const startCapCenter = new THREE.Vector3().copy(points[0]).addScaledVector(tangents[0], -radStart * 0.35);
  const startCapNormal = new THREE.Vector3().copy(tangents[0]).negate().normalize();
  const startCapIdx = vertices.length / 3;
  vertices.push(startCapCenter.x, startCapCenter.y, startCapCenter.z);
  vertexNormals.push(startCapNormal.x, startCapNormal.y, startCapNormal.z);
  uvs.push(0, 0.5);

  for (let j = 0; j < radialSegments; j++) {
    indices.push(startCapIdx, j + 1, j);
  }

  // Rounded end cap at distal tip
  const endCapCenter = new THREE.Vector3().copy(points[tubularSegments]).addScaledVector(tangents[tubularSegments], radEnd * 0.35);
  const endCapNormal = new THREE.Vector3().copy(tangents[tubularSegments]).normalize();
  const endCapIdx = vertices.length / 3;
  vertices.push(endCapCenter.x, endCapCenter.y, endCapCenter.z);
  vertexNormals.push(endCapNormal.x, endCapNormal.y, endCapNormal.z);
  uvs.push(1, 0.5);

  const lastRingOffset = tubularSegments * (radialSegments + 1);
  for (let j = 0; j < radialSegments; j++) {
    indices.push(endCapIdx, lastRingOffset + j, lastRingOffset + j + 1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(vertexNormals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ==========================================
// 3. HELPER: HOLLOW TUBE WITH OPEN CIRCULAR LUMEN
// Creates open vascular conduit with visible inner lumen wall and annular rim
// ==========================================
function createHollowTubeGeometry(pointsArr, outerRadius, wallThickness, tubularSegments = 36, radialSegments = 24) {
  const vectors = pointsArr.map(p => new THREE.Vector3(...p));
  const curve = new THREE.CatmullRomCurve3(vectors);
  const points = curve.getPoints(tubularSegments);
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const { tangents, normals, binormals } = frames;

  const innerRadius = Math.max(0.012, outerRadius - wallThickness);
  const vertices = [];
  const vertexNormals = [];
  const uvs = [];
  const indices = [];

  const stride = radialSegments + 1;

  // 1. Outer Surface
  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    const P = points[i];
    const N = normals[i];
    const B = binormals[i];

    for (let j = 0; j <= radialSegments; j++) {
      const theta = (j / radialSegments) * Math.PI * 2;
      const sin = Math.sin(theta);
      const cos = -Math.cos(theta);

      const norm = new THREE.Vector3()
        .copy(N).multiplyScalar(cos)
        .addScaledVector(B, sin)
        .normalize();

      const v = new THREE.Vector3().copy(P).addScaledVector(norm, outerRadius);
      vertices.push(v.x, v.y, v.z);
      vertexNormals.push(norm.x, norm.y, norm.z);
      uvs.push(t, j / radialSegments);
    }
  }

  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * stride + j;
      const b = (i + 1) * stride + j;
      const c = (i + 1) * stride + (j + 1);
      const d = i * stride + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  // 2. Inner Surface (Inward Normals)
  const innerBaseIdx = vertices.length / 3;
  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    const P = points[i];
    const N = normals[i];
    const B = binormals[i];

    for (let j = 0; j <= radialSegments; j++) {
      const theta = (j / radialSegments) * Math.PI * 2;
      const sin = Math.sin(theta);
      const cos = -Math.cos(theta);

      const norm = new THREE.Vector3()
        .copy(N).multiplyScalar(cos)
        .addScaledVector(B, sin)
        .normalize();

      const v = new THREE.Vector3().copy(P).addScaledVector(norm, innerRadius);
      vertices.push(v.x, v.y, v.z);
      vertexNormals.push(-norm.x, -norm.y, -norm.z); // Facing inward into lumen
      uvs.push(t, j / radialSegments);
    }
  }

  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = innerBaseIdx + i * stride + j;
      const b = innerBaseIdx + (i + 1) * stride + j;
      const c = innerBaseIdx + (i + 1) * stride + (j + 1);
      const d = innerBaseIdx + i * stride + (j + 1);
      indices.push(a, d, b);
      indices.push(b, d, c);
    }
  }

  // 3. Distal Annular Rim Cap
  const distalOuterStart = tubularSegments * stride;
  const distalInnerStart = innerBaseIdx + tubularSegments * stride;

  for (let j = 0; j < radialSegments; j++) {
    const o1 = distalOuterStart + j;
    const o2 = distalOuterStart + j + 1;
    const i1 = distalInnerStart + j;
    const i2 = distalInnerStart + j + 1;

    indices.push(o1, o2, i1);
    indices.push(o2, i2, i1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(vertexNormals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return geo;
}

// ==========================================
// 4. SCULPTED VENTRICULAR MYOCARDIUM
// Conical, muscular form with conus arteriosus, apex sweep, and sulcal furrows
// ==========================================
function createUnifiedVentricularMass() {
  const geo = new THREE.SphereGeometry(1.0, 128, 128);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    const ny = Math.max(-1.0, Math.min(1.0, v.y));
    const t = (ny + 1.0) * 0.5;
    const s = t * t * (3.0 - 2.0 * t); // Smooth Hermite curve

    // Organic conical taper: broad base tapering to an anatomical apex
    const taper = 0.28 + 0.82 * s;
    v.x *= taper * 1.08;
    v.z *= taper * 0.98;

    // Vertical elongation
    v.y = -1.34 + 1.76 * (0.15 * t + 0.85 * s);

    // Left ventricular apex sweep
    const apicalSweep = (1.0 - s) * (1.0 - s);
    v.x -= apicalSweep * 0.17;
    v.z += apicalSweep * 0.15;

    // Right Ventricle Bulge
    const theta = Math.atan2(v.x, v.z);
    const thetaCenter = 0.78;
    const thetaWidth = 0.65;
    const dTheta = Math.abs(theta - thetaCenter);
    const yCenter = -0.40;
    const yWidth = 0.65;
    const dY = Math.abs(v.y - yCenter);

    if (dTheta < thetaWidth && dY < yWidth) {
      const wTheta = 0.5 * (1.0 + Math.cos((dTheta / thetaWidth) * Math.PI));
      const wY = 0.5 * (1.0 + Math.cos((dY / yWidth) * Math.PI));
      const rvBulge = wTheta * wY * 0.15;
      v.x += rvBulge * Math.sin(theta);
      v.z += rvBulge * Math.cos(theta);
    }

    // Conus Arteriosus (Infundibulum of RV Outflow)
    const conusTheta = 0.55;
    const conusWidth = 0.45;
    const dConus = Math.abs(theta - conusTheta);
    if (dConus < conusWidth && v.y > 0.08 && v.y < 0.42) {
      const wCTheta = 0.5 * (1.0 + Math.cos((dConus / conusWidth) * Math.PI));
      const wCY = Math.sin(((v.y - 0.08) / 0.34) * Math.PI);
      const infundibulum = wCTheta * wCY * 0.16;
      v.x += infundibulum * 0.45;
      v.z += infundibulum * 0.88;
    }

    // Anterior Interventricular Sulcus (LAD Groove)
    const aivsTheta = 0.26 - 0.14 * (1.0 - s);
    const dAivs = Math.abs(theta - aivsTheta);
    if (dAivs < 0.28 && v.y > -1.25 && v.y < 0.35) {
      const wAivs = 0.5 * (1.0 + Math.cos((dAivs / 0.28) * Math.PI));
      const wY = Math.sin(((v.y + 1.25) / 1.60) * Math.PI);
      const depth = wAivs * wY * 0.052;
      v.x -= depth * Math.sin(theta);
      v.z -= depth * Math.cos(theta);
    }

    // Posterior Interventricular Sulcus
    const pivsTheta = -2.25;
    const dPivs = Math.abs(theta - pivsTheta);
    if (dPivs < 0.26 && v.y > -1.15 && v.y < 0.20) {
      const wPivs = 0.5 * (1.0 + Math.cos((dPivs / 0.26) * Math.PI));
      const wY = Math.sin(((v.y + 1.15) / 1.35) * Math.PI);
      const depth = wPivs * wY * 0.042;
      v.x -= depth * Math.sin(theta);
      v.z -= depth * Math.cos(theta);
    }

    // Helical myocardial muscle ridge waves (micro-striations in 3D geometry)
    const myofibrilAngle = theta * 3.0 + v.y * 5.0;
    const muscleRidge = Math.sin(myofibrilAngle) * 0.006 * (1.0 - 0.4 * s);
    v.x += muscleRidge * Math.sin(theta);
    v.z += muscleRidge * Math.cos(theta);

    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, myocardiumMat);
  mesh.name = 'Myocardium';
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const rvGroup = new THREE.Group();
  rvGroup.name = 'RightVentricle';
  mesh.add(rvGroup);

  return mesh;
}

// ==========================================
// 5. ATRIAL CHAMBERS & FLAP-LIKE AURICLES
// Sculpted ear-shaped auricular appendages with folded surface texture
// ==========================================
function createAtriaAndAuricles() {
  const atriaGroup = new THREE.Group();
  atriaGroup.name = 'Atria_Group';

  // Left Atrium (posterior)
  const laGeo = new THREE.SphereGeometry(0.54, 48, 48);
  const laMesh = new THREE.Mesh(laGeo, atriaMat);
  laMesh.name = 'LeftAtrium';
  laMesh.position.set(-0.35, 0.55, -0.24);
  laMesh.scale.set(1.08, 0.85, 0.98);
  laMesh.castShadow = true;
  atriaGroup.add(laMesh);

  // Right Atrium (smooth vertical chamber)
  const raGeo = new THREE.SphereGeometry(0.58, 48, 48);
  const raMesh = new THREE.Mesh(raGeo, atriaMat);
  raMesh.name = 'RightAtrium';
  raMesh.position.set(0.48, 0.48, 0.05);
  raMesh.scale.set(1.00, 1.05, 0.90);
  raMesh.castShadow = true;
  atriaGroup.add(raMesh);

  // LEFT AURICLE (Sculpted prominent flap in deep plum/wine)
  // Flap curving anteriorly and laterally around the pulmonary trunk base
  const laAuricleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.38, 0.52, 0.06),
    new THREE.Vector3(-0.52, 0.50, 0.22),
    new THREE.Vector3(-0.58, 0.40, 0.36),
    new THREE.Vector3(-0.50, 0.28, 0.44),
  ]);
  const laAuricleGeo = new THREE.TubeGeometry(laAuricleCurve, 32, 0.16, 20, false);
  const laAuricle = new THREE.Mesh(laAuricleGeo, auriclesMat);
  laAuricle.name = 'LeftAuricle';
  laAuricle.castShadow = true;
  atriaGroup.add(laAuricle);

  // Folded lobule on Left Auricle
  const laLobeGeo = new THREE.SphereGeometry(0.18, 24, 24);
  const laLobe = new THREE.Mesh(laLobeGeo, auriclesMat);
  laLobe.name = 'LeftAuricle_Lobe';
  laLobe.position.set(-0.56, 0.36, 0.40);
  laLobe.scale.set(1.1, 0.8, 1.2);
  laLobe.castShadow = true;
  atriaGroup.add(laLobe);

  // RIGHT AURICLE (Sculpted prominent flap in deep plum/wine)
  // Triangular appendage hugging the right border of ascending aorta
  const raAuricleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.44, 0.52, 0.20),
    new THREE.Vector3(0.38, 0.58, 0.38),
    new THREE.Vector3(0.24, 0.48, 0.48),
    new THREE.Vector3(0.14, 0.38, 0.52),
  ]);
  const raAuricleGeo = new THREE.TubeGeometry(raAuricleCurve, 32, 0.17, 20, false);
  const raAuricle = new THREE.Mesh(raAuricleGeo, auriclesMat);
  raAuricle.name = 'RightAuricle';
  raAuricle.castShadow = true;
  atriaGroup.add(raAuricle);

  // Folded lobule on Right Auricle
  const raLobeGeo = new THREE.SphereGeometry(0.19, 24, 24);
  const raLobe = new THREE.Mesh(raLobeGeo, auriclesMat);
  raLobe.name = 'RightAuricle_Lobe';
  raLobe.position.set(0.22, 0.44, 0.50);
  raLobe.scale.set(1.2, 0.8, 1.0);
  raLobe.castShadow = true;
  atriaGroup.add(raLobe);

  // 4 Pulmonary Veins (posterior left atrium)
  const pvPoints = [
    [new THREE.Vector3(-0.52, 0.65, -0.32), new THREE.Vector3(-0.72, 0.70, -0.38)],
    [new THREE.Vector3(-0.50, 0.46, -0.34), new THREE.Vector3(-0.70, 0.42, -0.40)],
    [new THREE.Vector3(-0.16, 0.68, -0.42), new THREE.Vector3(0.04, 0.72, -0.46)],
    [new THREE.Vector3(-0.16, 0.48, -0.44), new THREE.Vector3(0.04, 0.44, -0.48)],
  ];
  pvPoints.forEach((pts, idx) => {
    const pvCurve = new THREE.CatmullRomCurve3(pts);
    const pvMesh = new THREE.Mesh(new THREE.TubeGeometry(pvCurve, 14, 0.08, 14, false), atriaMat);
    pvMesh.name = `PulmonaryVein_${idx + 1}`;
    pvMesh.castShadow = true;
    atriaGroup.add(pvMesh);
  });

  return atriaGroup;
}

// ==========================================
// 6. GREAT VESSELS WITH HOLLOW OPEN LUMENS
// Aorta with 3 open arch branches, Pulmonary Trunk with open left/right arteries,
// and Superior Vena Cava with open top lumen.
// ==========================================
function createGreatVessels() {
  const vesselsGroup = new THREE.Group();
  vesselsGroup.name = 'GreatVessels';

  // 1. ASCENDING AORTA & AORTIC ARCH
  const aortaCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.02, 0.26, 0.12),   // Aortic root annulus
    new THREE.Vector3(0.01, 0.52, 0.10),   // Ascending aorta mid
    new THREE.Vector3(-0.03, 0.88, 0.04),  // Ascending aorta superior
    new THREE.Vector3(-0.14, 1.25, -0.12), // Aortic arch summit
    new THREE.Vector3(-0.28, 1.06, -0.38), // Arch turning postero-inferiorly
    new THREE.Vector3(-0.28, 0.42, -0.52), // Descending thoracic aorta
  ]);
  const aortaGeo = new THREE.TubeGeometry(aortaCurve, 64, 0.21, 24, false);
  const aortaMesh = new THREE.Mesh(aortaGeo, aortaMat);
  aortaMesh.name = 'Aorta';
  aortaMesh.castShadow = true;
  vesselsGroup.add(aortaMesh);

  // Aortic Sinuses of Valsalva
  const rcsMesh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 18), aortaMat);
  rcsMesh.position.set(0.12, 0.32, 0.22);
  rcsMesh.name = 'RightCoronarySinus';
  vesselsGroup.add(rcsMesh);

  const lcsMesh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 18), aortaMat);
  lcsMesh.position.set(-0.06, 0.32, 0.20);
  lcsMesh.name = 'LeftCoronarySinus';
  vesselsGroup.add(lcsMesh);

  const ncsMesh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 18), aortaMat);
  ncsMesh.position.set(0.04, 0.30, 0.02);
  ncsMesh.name = 'NonCoronarySinus';
  vesselsGroup.add(ncsMesh);

  // 2. OPEN HOLLOW SUPRA-AORTIC ARCH BRANCHES
  // Branch 1: Brachiocephalic Artery (Innominate) - Open hollow lumen
  const bPoints = [
    [-0.06, 1.20, -0.08],
    [0.04, 1.42, -0.04],
    [0.12, 1.64, -0.02],
  ];
  const bGeo = createHollowTubeGeometry(bPoints, 0.080, 0.016, 24, 20);
  const bMesh = new THREE.Mesh(bGeo, aortaMat);
  bMesh.name = 'BrachiocephalicArtery';
  bMesh.castShadow = true;
  vesselsGroup.add(bMesh);

  // Branch 2: Left Common Carotid Artery - Open hollow lumen
  const lccPoints = [
    [-0.14, 1.24, -0.14],
    [-0.13, 1.46, -0.14],
    [-0.10, 1.68, -0.12],
  ];
  const lccGeo = createHollowTubeGeometry(lccPoints, 0.062, 0.014, 24, 20);
  const lccMesh = new THREE.Mesh(lccGeo, aortaMat);
  lccMesh.name = 'LeftCommonCarotid';
  lccMesh.castShadow = true;
  vesselsGroup.add(lccMesh);

  // Branch 3: Left Subclavian Artery - Open hollow lumen
  const lscPoints = [
    [-0.22, 1.22, -0.24],
    [-0.25, 1.44, -0.26],
    [-0.28, 1.66, -0.28],
  ];
  const lscGeo = createHollowTubeGeometry(lscPoints, 0.062, 0.014, 24, 20);
  const lscMesh = new THREE.Mesh(lscGeo, aortaMat);
  lscMesh.name = 'LeftSubclavian';
  lscMesh.castShadow = true;
  vesselsGroup.add(lscMesh);

  // 3. PULMONARY TRUNK & BIFURCATION (Royal Blue)
  // Starts directly on RV infundibulum [0.10, 0.32, 0.44]
  const ptCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.10, 0.32, 0.44),   // RV infundibulum junction
    new THREE.Vector3(0.04, 0.56, 0.40),   // Ascending anterior to aorta
    new THREE.Vector3(-0.06, 0.82, 0.28),  // Crossing left of ascending aorta
    new THREE.Vector3(-0.16, 1.02, 0.12),  // Pulmonary bifurcation summit
  ]);
  const ptGeo = new THREE.TubeGeometry(ptCurve, 48, 0.20, 24, false);
  const ptMesh = new THREE.Mesh(ptGeo, pulmonaryMat);
  ptMesh.name = 'PulmonaryTrunk';
  ptMesh.castShadow = true;
  vesselsGroup.add(ptMesh);

  // Left Pulmonary Artery - Open hollow lumen curving posterolaterally
  const lpaPoints = [
    [-0.16, 1.02, 0.12],
    [-0.34, 1.02, -0.04],
    [-0.56, 0.96, -0.20],
  ];
  const lpaGeo = createHollowTubeGeometry(lpaPoints, 0.125, 0.022, 24, 20);
  const lpaMesh = new THREE.Mesh(lpaGeo, pulmonaryMat);
  lpaMesh.name = 'LeftPulmonaryArtery';
  lpaMesh.castShadow = true;
  vesselsGroup.add(lpaMesh);

  // Right Pulmonary Artery - Open hollow lumen passing beneath aortic arch
  const rpaPoints = [
    [-0.16, 1.02, 0.12],
    [0.08, 0.98, -0.02],
    [0.38, 0.94, -0.16],
  ];
  const rpaGeo = createHollowTubeGeometry(rpaPoints, 0.125, 0.022, 24, 20);
  const rpaMesh = new THREE.Mesh(rpaGeo, pulmonaryMat);
  rpaMesh.name = 'RightPulmonaryArtery';
  rpaMesh.castShadow = true;
  vesselsGroup.add(rpaMesh);

  // 4. SUPERIOR VENA CAVA (SVC) - Open hollow circular lumen at top
  const svcPoints = [
    [0.50, 0.62, -0.08],
    [0.48, 0.96, -0.10],
    [0.44, 1.34, -0.12],
  ];
  const svcGeo = createHollowTubeGeometry(svcPoints, 0.165, 0.025, 28, 22);
  const svcMesh = new THREE.Mesh(svcGeo, venaCavaMat);
  svcMesh.name = 'SuperiorVenaCava';
  svcMesh.castShadow = true;
  vesselsGroup.add(svcMesh);

  // Inferior Vena Cava (IVC)
  const ivcCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.50, -0.48, -0.28),
    new THREE.Vector3(0.52, -0.72, -0.32),
    new THREE.Vector3(0.54, -0.92, -0.36),
  ]);
  const ivcMesh = new THREE.Mesh(new THREE.TubeGeometry(ivcCurve, 18, 0.15, 18, false), venaCavaMat);
  ivcMesh.name = 'InferiorVenaCava';
  ivcMesh.castShadow = true;
  vesselsGroup.add(ivcMesh);

  return vesselsGroup;
}

// ==========================================
// 7. EPICARDIAL ADIPOSE SULCAL CUSHIONS
// Smooth organic cushions nestled in the AV and Interventricular sulci
// ==========================================
function createEpicardialFatPads() {
  const fatGroup = new THREE.Group();
  fatGroup.name = 'EpicardialFat';

  const avCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.42, 0.30, 0.48),
    new THREE.Vector3(-0.10, 0.34, 0.58),
    new THREE.Vector3(0.20, 0.32, 0.54),
    new THREE.Vector3(0.48, 0.26, 0.44),
    new THREE.Vector3(0.66, 0.12, -0.04),
    new THREE.Vector3(0.46, 0.06, -0.46),
  ]);
  const avFat = new THREE.Mesh(new THREE.TubeGeometry(avCurve, 44, 0.048, 14, false), fatPadMat);
  fatGroup.add(avFat);

  const aivFatCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.06, 0.30, 0.60),
    new THREE.Vector3(-0.03, 0.10, 0.78),
    new THREE.Vector3(0.00, -0.16, 0.88),
    new THREE.Vector3(-0.04, -0.50, 0.84),
    new THREE.Vector3(-0.09, -0.82, 0.68),
    new THREE.Vector3(-0.14, -1.14, 0.44),
  ]);
  const aivFat = new THREE.Mesh(new THREE.TubeGeometry(aivFatCurve, 40, 0.042, 14, false), fatPadMat);
  fatGroup.add(aivFat);

  return fatGroup;
}

// ==========================================
// 8. RICH CORONARY ARTERY TREES (LAD, LCX, RCA)
// Multi-tier branching network with tapered calibers
// ==========================================

// LAD System (Left Anterior Descending)
function createLADSystem() {
  const vesselGroup = new THREE.Group();
  vesselGroup.name = 'LAD';

  // Main Trunk (LMCA origin to apex)
  const ladMain = [
    [-0.06, 0.34, 0.20],  // Left Coronary Sinus Ostium
    [-0.08, 0.36, 0.36],  // LMCA
    [-0.08, 0.34, 0.52],  // Bifurcation
    [-0.04, 0.24, 0.76],  // Proximal LAD
    [0.00, 0.06, 0.94],   // Mid LAD (D1)
    [0.01, -0.18, 1.00],  // Mid LAD (S1)
    [-0.03, -0.48, 0.94], // Distal LAD (D2)
    [-0.08, -0.80, 0.78], // Pre-apical
    [-0.13, -1.08, 0.54], // Apical
    [-0.16, -1.30, 0.28], // Apex terminal
  ];
  const geoMain = createTaperedTubeGeometry(ladMain, 0.038, 0.018, 84, 18);
  const meshMain = new THREE.Mesh(geoMain, ladMat);
  meshMain.name = 'LAD_Segment_1';
  meshMain.castShadow = true;
  vesselGroup.add(meshMain);

  // First Diagonal Branch (D1)
  const d1Branch = [
    [0.00, 0.06, 0.94],
    [-0.22, -0.06, 0.92],
    [-0.44, -0.26, 0.80],
    [-0.58, -0.50, 0.60],
  ];
  const geoD1 = createTaperedTubeGeometry(d1Branch, 0.024, 0.012, 48, 16);
  const meshD1 = new THREE.Mesh(geoD1, ladMat);
  meshD1.name = 'LAD_Segment_2';
  meshD1.castShadow = true;
  vesselGroup.add(meshD1);

  // D1-sub-branch (Tertiary arteriole)
  const d1Sub = [
    [-0.32, -0.15, 0.88],
    [-0.42, -0.18, 0.84],
    [-0.54, -0.28, 0.76],
  ];
  const geoD1Sub = createTaperedTubeGeometry(d1Sub, 0.014, 0.008, 24, 12);
  const meshD1Sub = new THREE.Mesh(geoD1Sub, ladMat);
  meshD1Sub.name = 'LAD_Segment_2_Sub';
  vesselGroup.add(meshD1Sub);

  // Second Diagonal Branch (D2)
  const d2Branch = [
    [-0.03, -0.48, 0.94],
    [-0.24, -0.62, 0.84],
    [-0.44, -0.80, 0.60],
  ];
  const geoD2 = createTaperedTubeGeometry(d2Branch, 0.020, 0.010, 36, 16);
  const meshD2 = new THREE.Mesh(geoD2, ladMat);
  meshD2.name = 'LAD_Segment_3';
  meshD2.castShadow = true;
  vesselGroup.add(meshD2);

  // Third Diagonal Branch (D3)
  const d3Branch = [
    [-0.08, -0.80, 0.78],
    [-0.22, -0.92, 0.66],
    [-0.32, -1.06, 0.48],
  ];
  const geoD3 = createTaperedTubeGeometry(d3Branch, 0.016, 0.008, 30, 14);
  const meshD3 = new THREE.Mesh(geoD3, ladMat);
  meshD3.name = 'LAD_Segment_5';
  vesselGroup.add(meshD3);

  // Septal Perforator (S1)
  const s1Branch = [
    [0.01, -0.18, 1.00],
    [0.08, -0.28, 0.90],
    [0.14, -0.44, 0.76],
  ];
  const geoS1 = createTaperedTubeGeometry(s1Branch, 0.020, 0.010, 32, 16);
  const meshS1 = new THREE.Mesh(geoS1, ladMat);
  meshS1.name = 'LAD_Segment_4';
  meshS1.castShadow = true;
  vesselGroup.add(meshS1);

  return vesselGroup;
}

// LCX System (Left Circumflex Artery)
function createLCXSystem() {
  const vesselGroup = new THREE.Group();
  vesselGroup.name = 'LCX';

  const lcxMain = [
    [-0.08, 0.34, 0.52],
    [-0.30, 0.34, 0.58],
    [-0.60, 0.28, 0.52],
    [-0.84, 0.16, 0.28],
    [-0.94, -0.04, -0.02],
    [-0.88, -0.28, -0.30],
    [-0.70, -0.52, -0.46],
    [-0.46, -0.72, -0.52],
  ];
  const geoMain = createTaperedTubeGeometry(lcxMain, 0.036, 0.018, 76, 18);
  const meshMain = new THREE.Mesh(geoMain, lcxMat);
  meshMain.name = 'LCX_Segment_1';
  meshMain.castShadow = true;
  vesselGroup.add(meshMain);

  // OM1 (First Obtuse Marginal)
  const om1Branch = [
    [-0.84, 0.16, 0.28],
    [-0.96, -0.06, 0.20],
    [-1.00, -0.34, 0.06],
    [-0.92, -0.62, -0.08],
  ];
  const geoOM1 = createTaperedTubeGeometry(om1Branch, 0.024, 0.012, 48, 16);
  const meshOM1 = new THREE.Mesh(geoOM1, lcxMat);
  meshOM1.name = 'LCX_Segment_2';
  meshOM1.castShadow = true;
  vesselGroup.add(meshOM1);

  // OM1-sub-branch
  const om1Sub = [
    [-0.96, -0.06, 0.20],
    [-1.04, -0.14, 0.16],
    [-1.06, -0.32, 0.12],
  ];
  const geoOM1Sub = createTaperedTubeGeometry(om1Sub, 0.014, 0.008, 24, 12);
  const meshOM1Sub = new THREE.Mesh(geoOM1Sub, lcxMat);
  meshOM1Sub.name = 'LCX_Segment_2_Sub';
  vesselGroup.add(meshOM1Sub);

  // OM2 (Second Obtuse Marginal)
  const om2Branch = [
    [-0.88, -0.28, -0.30],
    [-0.92, -0.52, -0.28],
    [-0.80, -0.74, -0.22],
  ];
  const geoOM2 = createTaperedTubeGeometry(om2Branch, 0.020, 0.010, 36, 16);
  const meshOM2 = new THREE.Mesh(geoOM2, lcxMat);
  meshOM2.name = 'LCX_Segment_3';
  meshOM2.castShadow = true;
  vesselGroup.add(meshOM2);

  return vesselGroup;
}

// RCA System (Right Coronary Artery)
function createRCASystem() {
  const vesselGroup = new THREE.Group();
  vesselGroup.name = 'RCA';

  const rcaMain = [
    [0.12, 0.32, 0.22],
    [0.34, 0.30, 0.52],
    [0.62, 0.18, 0.54],
    [0.78, -0.02, 0.42],
    [0.84, -0.26, 0.18],
    [0.78, -0.54, -0.10],
    [0.65, -0.74, -0.30],
    [0.45, -0.90, -0.44],
  ];
  const geoMain = createTaperedTubeGeometry(rcaMain, 0.038, 0.018, 76, 18);
  const meshMain = new THREE.Mesh(geoMain, rcaMat);
  meshMain.name = 'RCA_Segment_1';
  meshMain.castShadow = true;
  vesselGroup.add(meshMain);

  // Conus Branch
  const conusBranch = [
    [0.22, 0.32, 0.38],
    [0.28, 0.44, 0.52],
    [0.36, 0.50, 0.46],
  ];
  const geoConus = createTaperedTubeGeometry(conusBranch, 0.020, 0.010, 32, 16);
  const meshConus = new THREE.Mesh(geoConus, rcaMat);
  meshConus.name = 'RCA_Segment_2';
  meshConus.castShadow = true;
  vesselGroup.add(meshConus);

  // Acute Marginal (AM1)
  const amBranch = [
    [0.78, -0.02, 0.42],
    [0.84, -0.22, 0.48],
    [0.82, -0.48, 0.46],
    [0.72, -0.74, 0.36],
  ];
  const geoAM = createTaperedTubeGeometry(amBranch, 0.022, 0.012, 48, 16);
  const meshAM = new THREE.Mesh(geoAM, rcaMat);
  meshAM.name = 'RCA_Segment_3';
  meshAM.castShadow = true;
  vesselGroup.add(meshAM);

  // AM1-sub-branch
  const amSub = [
    [0.84, -0.22, 0.48],
    [0.76, -0.34, 0.56],
    [0.64, -0.52, 0.60],
  ];
  const geoAMSub = createTaperedTubeGeometry(amSub, 0.014, 0.008, 24, 12);
  const meshAMSub = new THREE.Mesh(geoAMSub, rcaMat);
  meshAMSub.name = 'RCA_Segment_3_Sub';
  vesselGroup.add(meshAMSub);

  // Posterior Descending Artery (PDA)
  const pdaBranch = [
    [0.45, -0.90, -0.44],
    [0.32, -1.04, -0.32],
    [0.16, -1.18, -0.14],
    [-0.03, -1.26, 0.05],
  ];
  const geoPDA = createTaperedTubeGeometry(pdaBranch, 0.024, 0.012, 44, 16);
  const meshPDA = new THREE.Mesh(geoPDA, rcaMat);
  meshPDA.name = 'RCA_Segment_4';
  meshPDA.castShadow = true;
  vesselGroup.add(meshPDA);

  return vesselGroup;
}

// ==========================================
// 9. CARDIAC VEINS (VIBRANT ROYAL BLUE VEIN TREE)
// Creates the distinct blue venules running across myocardium seen in the medical art
// ==========================================
function createCardiacVeinTree() {
  const veinsGroup = new THREE.Group();
  veinsGroup.name = 'CardiacVeins';

  // Great Cardiac Vein (anterior interventricular vein running alongside LAD)
  const gcvPoints = [
    [-0.14, -1.10, 0.50],
    [-0.09, -0.84, 0.72],
    [-0.04, -0.52, 0.88],
    [0.00, -0.20, 0.94],
    [-0.02, 0.04, 0.88],
    [-0.12, 0.24, 0.74],
    [-0.32, 0.32, 0.60],
    [-0.62, 0.26, 0.48],
  ];
  const geoGCV = createTaperedTubeGeometry(gcvPoints, 0.016, 0.028, 64, 14);
  const meshGCV = new THREE.Mesh(geoGCV, venaCavaMat);
  meshGCV.name = 'GreatCardiacVein';
  meshGCV.castShadow = true;
  veinsGroup.add(meshGCV);

  // Anterior RV Tributary Vein
  const rvVein = [
    [0.34, -0.52, 0.68],
    [0.22, -0.32, 0.80],
    [0.08, -0.12, 0.90],
    [0.00, -0.20, 0.94],
  ];
  const geoRVVein = createTaperedTubeGeometry(rvVein, 0.010, 0.018, 32, 12);
  const meshRVVein = new THREE.Mesh(geoRVVein, venaCavaMat);
  meshRVVein.name = 'CardiacVein_RV';
  veinsGroup.add(meshRVVein);

  // Lateral LV Tributary Vein
  const lvVein = [
    [-0.52, -0.64, 0.54],
    [-0.38, -0.42, 0.74],
    [-0.18, -0.28, 0.88],
    [-0.04, -0.52, 0.88],
  ];
  const geoLVVein = createTaperedTubeGeometry(lvVein, 0.010, 0.018, 32, 12);
  const meshLVVein = new THREE.Mesh(geoLVVein, venaCavaMat);
  meshLVVein.name = 'CardiacVein_LV';
  veinsGroup.add(meshLVVein);

  return veinsGroup;
}

// ==========================================
// 10. ASSEMBLE COMPLETE ORGAN HIERARCHY
// ==========================================
rootGroup.add(createUnifiedVentricularMass());
rootGroup.add(createAtriaAndAuricles());
rootGroup.add(createGreatVessels());
rootGroup.add(createEpicardialFatPads());

// Coronary Arteries (Interactive territories)
rootGroup.add(createLADSystem());
rootGroup.add(createLCXSystem());
rootGroup.add(createRCASystem());

// Medical Art Cardiac Vein Tree (Royal Blue surface venules)
rootGroup.add(createCardiacVeinTree());

scene.add(rootGroup);

// Export to .glb binary
const outputPath = path.resolve(__dirname, '../public/models/heart.glb');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const exporter = new GLTFExporter();
exporter.parse(
  scene,
  (glbBuffer) => {
    fs.writeFileSync(outputPath, Buffer.from(glbBuffer));
    const stats = fs.statSync(outputPath);
    console.log(`[Heart Generator] Medical-Art 3D Heart Model generated successfully!`);
    console.log(`  Path: ${outputPath}`);
    console.log(`  Size: ${(stats.size / 1024).toFixed(1)} KB`);

    const distPath = path.resolve(__dirname, '../dist/models/heart.glb');
    if (fs.existsSync(path.dirname(distPath))) {
      fs.writeFileSync(distPath, Buffer.from(glbBuffer));
      console.log(`  Updated dist: ${distPath}`);
    }
  },
  (err) => {
    console.error('[Heart Generator] Error exporting GLB:', err);
    process.exit(1);
  },
  { binary: true }
);
