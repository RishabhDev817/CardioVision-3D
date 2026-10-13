import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// Reference Asset Pipeline: Configured for medical reference illustrations & textures
export const REFERENCE_ASSET_PIPELINE = {
  ready: true,
  referenceDir: '/images/reference/',
  referenceAssetPath: '/images/reference/heart-reference.png',
  anatomyGuide: {
    view: 'Anterior Standard Anatomical Reference',
    orientation: 'Upright front-facing (Aorta & Pulmonary Trunk superior, Apex inferior)',
    proportions: 'Full organ framing with margin clearance for clinical overlays',
  }
};

import { 
  Activity, 
  RotateCw, 
  Eye, 
  EyeOff, 
  Layers, 
  Heart, 
  Compass, 
  Lock, 
  Unlock,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

// Authoritative Project-wide Risk-based color threshold mapping:
// Low risk (< 35%): Medical Emerald (#059669)
// Moderate risk (35% to < 65%): Amber Gold (#d97706)
// High risk (≥ 65%): Clinical Crimson (#dc2626)
// Pending / Unassessed: Neutral Slate (#94a3b8)
export const getRiskColor = (prob) => {
  if (prob === undefined || prob === null || isNaN(prob)) return '#94a3b8';
  if (prob < 0.35) return '#059669'; // Medical Emerald
  if (prob < 0.65) return '#d97706'; // Amber Gold
  return '#dc2626'; // Clinical Crimson
};

export const getRiskTier = (prob) => {
  if (prob === undefined || prob === null || isNaN(prob)) return 'Pending';
  if (prob < 0.35) return 'Low';
  if (prob < 0.65) return 'Moderate';
  return 'High';
};

// Controlled Semantic Vessel Colors according to CardioVision design specification:
// LAD = rose (#f43f5e)
// LCX = teal (#0d9488)
// RCA = orange (#f97316)
// CAD = red (#e11d48)
export const VESSEL_COLORS = {
  LAD: '#f43f5e',
  LCX: '#0d9488',
  RCA: '#f97316',
  CAD: '#e11d48'
};

// Explicit vessel-to-anatomy mapping conforming to project requirements
export const VESSEL_MAPPING = {
  LAD: {
    id: 'LAD',
    label: 'Left Anterior Descending',
    target: 'LAD',
    view: 'anterior',
    color: VESSEL_COLORS.LAD,
    course: 'Originates from Left Main Coronary Artery (LMCA) and courses along the anterior interventricular sulcus to the apex.',
    perfusion: 'Supplies anterior left ventricular myocardium, apex, and anterior 2/3 of interventricular septum.',
    significance: 'Critical vascular conduit. Model predicts probability of ≥50% lumen stenosis.'
  },
  LCX: {
    id: 'LCX',
    label: 'Left Circumflex',
    target: 'LCX',
    view: 'lateral',
    color: VESSEL_COLORS.LCX,
    course: 'Arises from LMCA and runs along the left atrioventricular groove around the left cardiac border to the posterior surface.',
    perfusion: 'Supplies posterolateral myocardial walls of the left ventricle via obtuse marginal branches.',
    significance: 'Stenosis can precipitate lateral wall ischemia and localized hypokinesis.'
  },
  RCA: {
    id: 'RCA',
    label: 'Right Coronary Artery',
    target: 'RCA',
    view: 'rightav',
    color: VESSEL_COLORS.RCA,
    course: 'Originates from right aortic sinus and travels along the right atrioventricular sulcus to the cardiac crux.',
    perfusion: 'Supplies right ventricular free wall, inferior myocardial wall, and conduction system.',
    significance: 'Stenosis frequently triggers inferior wall ischemia and conduction delay.'
  }
};

// Smooth Camera Controller that transitions to presets and releases control to user
function CameraFocusController({
  targetPos,
  targetLookAt,
  isTransitioning,
  onTransitionEnd,
  controlsRef,
  isInteractingRef,
  isLocked
}) {
  useFrame((state, delta) => {
    if (!isTransitioning || isInteractingRef.current || isLocked || !controlsRef.current) {
      return;
    }

    const t = Math.min(1.0, delta * 3.8);
    state.camera.position.lerp(targetPos, t);
    controlsRef.current.target.lerp(targetLookAt, t);
    controlsRef.current.update();

    if (
      state.camera.position.distanceTo(targetPos) < 0.025 &&
      controlsRef.current.target.distanceTo(targetLookAt) < 0.025
    ) {
      state.camera.position.copy(targetPos);
      controlsRef.current.target.copy(targetLookAt);
      controlsRef.current.update();
      onTransitionEnd();
    }
  });

  return null;
}

// Ensure OrbitControls target stays smoothly anchored at cardiac center
function DynamicCameraFitter({ controlsRef }) {
  useEffect(() => {
    if (controlsRef?.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.minDistance = 2.5;
      controlsRef.current.maxDistance = 12.0;
      controlsRef.current.update();
    }
  }, [controlsRef]);

  return null;
}

// Procedural Cardiac Myofibril Normal Map Generator
// Generates realistic directional striated muscle fiber fascicles and micro-grooves
function createMuscleFibersTexture() {
  if (typeof document === 'undefined') return null;
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const heightData = new Float32Array(size * size);

  for (let y = 0; y < size; y++) {
    const ny = y / size;
    for (let x = 0; x < size; x++) {
      const nx = x / size;

      // Primary muscle fiber angle (striations running downward with gentle curvature)
      const u = nx * 36.0 + Math.sin(ny * 7.5) * 2.2;
      const v = ny * 14.0;

      // High-frequency myofibril striation waves
      const f1 = Math.sin(u * Math.PI * 2.0);
      const f2 = Math.sin((u * 2.0 + ny * 12.0) * Math.PI) * 0.42;
      const f3 = Math.cos((nx * 5.0 + ny * 38.0) * Math.PI) * 0.22;

      // Micro cross-striations
      const crossFibers = Math.sin(v * Math.PI * 4.0) * 0.14;

      const h = (f1 + f2 + f3 + crossFibers + 1.8) / 3.6;
      heightData[y * size + x] = Math.max(0, Math.min(1, h));
    }
  }

  // Convert heightmap to Tangent-Space Normal Map (Sobel filter)
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;
  const strength = 3.6;

  for (let y = 0; y < size; y++) {
    const yTop = (y - 1 + size) % size;
    const yBot = (y + 1) % size;

    for (let x = 0; x < size; x++) {
      const xLeft = (x - 1 + size) % size;
      const xRight = (x + 1) % size;

      const dx = (heightData[y * size + xRight] - heightData[y * size + xLeft]) * strength;
      const dy = (heightData[yBot * size + x] - heightData[yTop * size + x]) * strength;

      const nz = 1.0;
      const len = Math.hypot(dx, dy, nz);
      const nx = -dx / len;
      const nyVec = -dy / len;
      const nzv = nz / len;

      const idx = (y * size + x) * 4;
      data[idx] = Math.round((nx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.round((nyVec * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.round((nzv * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// 3D Anatomical Organ Model with Medical-Art Studio Rendering
function AnatomicalHeartScene({
  ladProb = null,
  lcxProb = null,
  rcaProb = null,
  selectedVessel,
  onSelectVessel,
  isPulsing = true,
  heartRate = 72,
  showLabels = true,
  xrayMode = false,
  isLightTheme = true,
}) {
  const groupRef = useRef();
  const [hoveredVessel, setHoveredVessel] = useState(null);

  // Load seamless anatomical GLTF/GLB heart model
  const { scene } = useGLTF('/models/heart.glb');

  // Procedural myocardial muscle striations
  const muscleNormalMap = useMemo(() => createMuscleFibersTexture(), []);

  // Emission intensity: restrained resting state (0.10) for clear contrast without neon halos,
  // controlled highlight (0.45) when selected
  const getVesselEmissive = (prob, isSelected, isHovered) => {
    if (isSelected) {
      return 0.45; // Refined, clean clinical highlight without blinding flare
    }
    if (isHovered) {
      return 0.28;
    }
    if (selectedVessel) {
      return 0.06; // Slightly recessed when another vessel is selected
    }
    return 0.10; // Subtle resting emissive contrast against darker myocardium
  };

  // Medical-Art PBR materials matching the stylized 3D medical illustration
  const materials = useMemo(() => {
    const ladColor = ladProb != null ? getRiskColor(ladProb) : VESSEL_COLORS.LAD;
    const lcxColor = lcxProb != null ? getRiskColor(lcxProb) : VESSEL_COLORS.LCX;
    const rcaColor = rcaProb != null ? getRiskColor(rcaProb) : VESSEL_COLORS.RCA;

    return {
      // LAD: Left Anterior Descending Artery (#f43f5e)
      LAD: new THREE.MeshStandardMaterial({
        color: new THREE.Color(ladColor),
        roughness: 0.30,
        metalness: 0.04,
        emissive: new THREE.Color(ladColor),
        emissiveIntensity: getVesselEmissive(ladProb, selectedVessel === 'LAD', hoveredVessel === 'LAD'),
        wireframe: xrayMode,
        polygonOffset: true,
        polygonOffsetFactor: -1.0,
        polygonOffsetUnits: -2.0,
      }),

      // LCX: Left Circumflex Artery (#0d9488)
      LCX: new THREE.MeshStandardMaterial({
        color: new THREE.Color(lcxColor),
        roughness: 0.30,
        metalness: 0.04,
        emissive: new THREE.Color(lcxColor),
        emissiveIntensity: getVesselEmissive(lcxProb, selectedVessel === 'LCX', hoveredVessel === 'LCX'),
        wireframe: xrayMode,
        polygonOffset: true,
        polygonOffsetFactor: -1.0,
        polygonOffsetUnits: -2.0,
      }),

      // RCA: Right Coronary Artery (#f97316)
      RCA: new THREE.MeshStandardMaterial({
        color: new THREE.Color(rcaColor),
        roughness: 0.30,
        metalness: 0.04,
        emissive: new THREE.Color(rcaColor),
        emissiveIntensity: getVesselEmissive(rcaProb, selectedVessel === 'RCA', hoveredVessel === 'RCA'),
        wireframe: xrayMode,
        polygonOffset: true,
        polygonOffsetFactor: -1.0,
        polygonOffsetUnits: -2.0,
      }),

      // Ventricles / Myocardium: Vibrant living crimson with striated muscle fiber normal map
      Myocardium: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#C62828'),
        normalMap: muscleNormalMap,
        normalScale: new THREE.Vector2(0.55, 0.55),
        roughness: 0.44,
        metalness: 0.02,
        transparent: xrayMode,
        opacity: xrayMode ? 0.35 : 1.0,
      }),

      // Auricles (Atrial Appendages): Deep plum/wine fleshy folds matching reference illustration
      Auricles: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#5C1D27'),
        roughness: 0.50,
        metalness: 0.0,
        transparent: xrayMode,
        opacity: xrayMode ? 0.35 : 1.0,
      }),

      // Atria: Deep crimson upper chambers
      Atria: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#782836'),
        roughness: 0.48,
        metalness: 0.0,
        transparent: xrayMode,
        opacity: xrayMode ? 0.35 : 1.0,
      }),

      // Aorta & Arch Branches: Vibrant arterial scarlet red with glossy sheen and hollow lumen interior
      Aorta: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#E53935'),
        roughness: 0.24,
        metalness: 0.04,
        side: THREE.DoubleSide,
        transparent: xrayMode,
        opacity: xrayMode ? 0.45 : 1.0,
      }),

      // Pulmonary Trunk & Arteries: Vibrant royal clinical blue with hollow lumen interior
      PulmonaryArtery: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1565C0'),
        roughness: 0.24,
        metalness: 0.04,
        side: THREE.DoubleSide,
        transparent: xrayMode,
        opacity: xrayMode ? 0.45 : 1.0,
      }),

      // Vena Cava (SVC/IVC): Royal clinical blue with hollow lumen interior
      VenaCava: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1565C0'),
        roughness: 0.26,
        metalness: 0.04,
        side: THREE.DoubleSide,
        transparent: xrayMode,
        opacity: xrayMode ? 0.45 : 1.0,
      }),

      // Cardiac Surface Veins: Royal blue venules running across myocardium
      CardiacVeins: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1565C0'),
        roughness: 0.28,
        metalness: 0.04,
        transparent: xrayMode,
        opacity: xrayMode ? 0.45 : 1.0,
      }),

      // Epicardial Sulcal Adipose Tissue (Fat Pads)
      EpicardialFat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#E2C4A2'),
        roughness: 0.70,
        metalness: 0.0,
        transparent: true,
        opacity: xrayMode ? 0.20 : 0.85,
      }),
    };
  }, [ladProb, lcxProb, rcaProb, selectedVessel, hoveredVessel, xrayMode, muscleNormalMap]);

  // Clone scene for clean material mapping
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const modelRef = useRef();

  // Automatic Bounding Box Centering using THREE.Box3
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.position.set(0, 0, 0);
      modelRef.current.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(modelRef.current);
      const center = box.getCenter(new THREE.Vector3());

      // Center the model group precisely at coordinate [0, 0, 0]
      modelRef.current.position.x = -center.x;
      modelRef.current.position.y = -center.y;
      modelRef.current.position.z = -center.z;
    }
  }, [scene, clonedScene]);

  // Traverse scene graph to compute smooth vertex normals and assign materials
  useEffect(() => {
    clonedScene.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;

        if (node.geometry) {
          node.geometry.computeVertexNormals();
        }

        const name = (node.name || '').toUpperCase();
        const parentName = (node.parent?.name || '').toUpperCase();

        if (name.includes('LAD') || parentName.includes('LAD')) {
          node.material = materials.LAD;
          node.userData = { vessel: 'LAD' };
          node.renderOrder = 2;
        } else if (name.includes('LCX') || parentName.includes('LCX')) {
          node.material = materials.LCX;
          node.userData = { vessel: 'LCX' };
          node.renderOrder = 2;
        } else if (name.includes('RCA') || parentName.includes('RCA')) {
          node.material = materials.RCA;
          node.userData = { vessel: 'RCA' };
          node.renderOrder = 2;
        } else if (name.includes('CARDIACVEIN')) {
          node.material = materials.CardiacVeins;
          node.renderOrder = 2;
        } else if (name.includes('AORTA') || name.includes('CAROTID') || name.includes('SUBCLAVIAN') || name.includes('BRACHIO') || name.includes('SINUS')) {
          node.material = materials.Aorta;
          node.renderOrder = 1;
        } else if (name.includes('AURICLE')) {
          node.material = materials.Auricles;
          node.renderOrder = 1;
        } else if (name.includes('PULMONARYVEIN')) {
          node.material = materials.Atria;
          node.renderOrder = 1;
        } else if (name.includes('PULMONARY')) {
          node.material = materials.PulmonaryArtery;
          node.renderOrder = 1;
        } else if (name.includes('VENACAVA')) {
          node.material = materials.VenaCava;
          node.renderOrder = 1;
        } else if (name.includes('ATRI')) {
          node.material = materials.Atria;
          node.renderOrder = 1;
        } else if (name.includes('FAT') || parentName.includes('FAT')) {
          node.material = materials.EpicardialFat;
          node.renderOrder = 1;
        } else {
          node.material = materials.Myocardium;
          node.renderOrder = 0;
        }
      }
    });
  }, [clonedScene, materials]);

  // Subtle organic systolic/diastolic pulsing in useFrame
  useFrame((state) => {
    if (!groupRef.current || !isPulsing) return;
    const t = state.clock.getElapsedTime();
    const freq = (heartRate / 60) * Math.PI * 2;
    const pulse = 1.0 + (Math.sin(t * freq) + Math.sin(t * freq * 2) * 0.3) * 0.012;
    groupRef.current.scale.set(pulse, pulse, pulse);
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    const vessel = e.object.userData?.vessel;
    if (vessel) {
      setHoveredVessel(vessel);
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHoveredVessel(null);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e) => {
    e.stopPropagation();
    const vessel = e.object.userData?.vessel;
    if (vessel && onSelectVessel) {
      onSelectVessel(vessel);
    }
  };

  return (
    <group
      ref={groupRef}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
      scale={[1, 1, 1]}
    >
      <group ref={modelRef}>
        <primitive
          object={clonedScene}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        />
      </group>

      {/* Unobtrusive Lateral Callout Indicators: Positioned cleanly off the heart flanks with subtle connectors so coronary paths remain 100% visible */}
      {showLabels && (
        <>
          {/* LAD Callout: Positioned cleanly off the lower-left flank without overlapping anterior sulcus */}
          <Html position={[-1.25, -0.65, 0.85]} center distanceFactor={5.5}>
            <div
              onClick={() => onSelectVessel && onSelectVessel('LAD')}
              className={`cursor-pointer transition-all duration-200 select-none group flex items-center ${
                selectedVessel === 'LAD'
                  ? 'scale-105 z-30'
                  : 'hover:scale-105 opacity-85 hover:opacity-100 z-10'
              }`}
            >
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-xs border transition-all ${
                  selectedVessel === 'LAD'
                    ? 'bg-white shadow-sm ring-2 ring-rose-500/80 border-rose-300'
                    : 'bg-white/90 hover:bg-white text-slate-800 border-slate-200/90'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0 animate-pulse"
                  style={{ backgroundColor: ladProb != null ? getRiskColor(ladProb) : VESSEL_COLORS.LAD }}
                />
                <span className="font-mono font-bold text-[11px] tracking-tight">LAD</span>
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
                  style={{
                    backgroundColor: ladProb != null ? `${getRiskColor(ladProb)}18` : `${VESSEL_COLORS.LAD}18`,
                    color: ladProb != null ? getRiskColor(ladProb) : VESSEL_COLORS.LAD,
                  }}
                >
                  {ladProb != null ? `${(ladProb * 100).toFixed(0)}%` : 'Anterior'}
                </span>
              </div>
              {/* Subtle visual connector indicator towards anterior groove */}
              <div className="w-4 h-px bg-slate-300 hidden sm:block opacity-70 ml-1" />
            </div>
          </Html>

          {/* LCX Callout: Positioned clear off the left flank */}
          <Html position={[-1.65, 0.25, 0.35]} center distanceFactor={5.5}>
            <div
              onClick={() => onSelectVessel && onSelectVessel('LCX')}
              className={`cursor-pointer transition-all duration-200 select-none group flex items-center ${
                selectedVessel === 'LCX'
                  ? 'scale-105 z-30'
                  : 'hover:scale-105 opacity-85 hover:opacity-100 z-10'
              }`}
            >
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-xs border transition-all ${
                  selectedVessel === 'LCX'
                    ? 'bg-white shadow-sm ring-2 ring-teal-500/80 border-teal-300'
                    : 'bg-white/90 hover:bg-white text-slate-800 border-slate-200/90'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0 animate-pulse"
                  style={{ backgroundColor: lcxProb != null ? getRiskColor(lcxProb) : VESSEL_COLORS.LCX }}
                />
                <span className="font-mono font-bold text-[11px] tracking-tight">LCX</span>
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
                  style={{
                    backgroundColor: lcxProb != null ? `${getRiskColor(lcxProb)}18` : `${VESSEL_COLORS.LCX}18`,
                    color: lcxProb != null ? getRiskColor(lcxProb) : VESSEL_COLORS.LCX,
                  }}
                >
                  {lcxProb != null ? `${(lcxProb * 100).toFixed(0)}%` : 'Lateral'}
                </span>
              </div>
              <div className="w-4 h-px bg-slate-300 hidden sm:block opacity-70 ml-1" />
            </div>
          </Html>

          {/* RCA Callout: Positioned clear off the right flank */}
          <Html position={[1.60, 0.05, 0.45]} center distanceFactor={5.5}>
            <div
              onClick={() => onSelectVessel && onSelectVessel('RCA')}
              className={`cursor-pointer transition-all duration-200 select-none group flex items-center flex-row-reverse ${
                selectedVessel === 'RCA'
                  ? 'scale-105 z-30'
                  : 'hover:scale-105 opacity-85 hover:opacity-100 z-10'
              }`}
            >
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-xs border transition-all ${
                  selectedVessel === 'RCA'
                    ? 'bg-white shadow-sm ring-2 ring-orange-500/80 border-orange-300'
                    : 'bg-white/90 hover:bg-white text-slate-800 border-slate-200/90'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0 animate-pulse"
                  style={{ backgroundColor: rcaProb != null ? getRiskColor(rcaProb) : VESSEL_COLORS.RCA }}
                />
                <span className="font-mono font-bold text-[11px] tracking-tight">RCA</span>
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
                  style={{
                    backgroundColor: rcaProb != null ? `${getRiskColor(rcaProb)}18` : `${VESSEL_COLORS.RCA}18`,
                    color: rcaProb != null ? getRiskColor(rcaProb) : VESSEL_COLORS.RCA,
                  }}
                >
                  {rcaProb != null ? `${(rcaProb * 100).toFixed(0)}%` : 'Right AV'}
                </span>
              </div>
              <div className="w-4 h-px bg-slate-300 hidden sm:block opacity-70 mr-1" />
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

// Preload the GLB model in Three.js cache
useGLTF.preload('/models/heart.glb');

// Main HeartCanvas Component
export default function HeartCanvas({
  ladProb = null,
  lcxProb = null,
  rcaProb = null,
  selectedVessel = 'LAD',
  onSelectVessel,
  heartRate = 72,
  compact = false,
  cameraPreset = null,
}) {
  const controlsRef = useRef();
  const isInteractingRef = useRef(false);

  // Permanent Hospital-Grade Light Theme
  const isLightTheme = true;
  const [isLocked, setIsLocked] = useState(false); // Static View lock toggle
  const [autoRotate, setAutoRotate] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [xrayMode, setXrayMode] = useState(false);
  const [viewPreset, setViewPreset] = useState('anterior');

  // Camera transition targets: centered on cardiac organ at [0, 0, 0] with balanced framing
  const [targetPos, setTargetPos] = useState(() => new THREE.Vector3(0.45, 0.20, 5.40));
  const [targetLookAt, setTargetLookAt] = useState(() => new THREE.Vector3(0, 0, 0));
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Smooth Camera View Presets with full anatomical visibility
  const focusOnPreset = (presetName, vesselToSelect = undefined) => {
    isInteractingRef.current = false;
    setAutoRotate(false);
    setViewPreset(presetName);

    const pos = new THREE.Vector3(0.45, 0.20, 5.40);
    const target = new THREE.Vector3(0, 0, 0);

    if (presetName === 'anterior') {
      // Anterior LAD: elevated anterior-oblique angle exposing full anterior groove, LMCA bifurcation, and apex
      pos.set(0.25, 0.10, 5.20);
      target.set(0, 0, 0);
    } else if (presetName === 'lateral') {
      // Lateral LCX: reveals left AV groove, obtuse marginals, and lateral LV wall
      pos.set(-4.80, 0.30, 2.00);
      target.set(-0.10, 0, 0);
    } else if (presetName === 'inferior') {
      // Inferior/Posterior: diaphragmatic crux, posterior descending branch, and pulmonary veins
      pos.set(0.30, -4.40, -2.80);
      target.set(0, -0.10, 0);
    } else if (presetName === 'rightav') {
      // Right AV RCA: exposes right aortic sinus ostium, right AV groove, conus, and acute marginal branches
      pos.set(4.80, 0.30, 2.00);
      target.set(0.10, 0, 0);
    } else if (presetName === 'default') {
      // Balanced overview of complete cardiovascular complex
      pos.set(0.45, 0.20, 5.40);
      target.set(0, 0, 0);
    }

    setTargetPos(pos);
    setTargetLookAt(target);
    setIsTransitioning(true);

    if (vesselToSelect !== undefined && onSelectVessel) {
      onSelectVessel(vesselToSelect);
    }
  };

  // Sync camera when selectedVessel changes from parent
  useEffect(() => {
    if (selectedVessel === 'LAD') {
      focusOnPreset('anterior');
    } else if (selectedVessel === 'LCX') {
      focusOnPreset('lateral');
    } else if (selectedVessel === 'RCA') {
      focusOnPreset('rightav');
    } else if (!selectedVessel) {
      focusOnPreset('default');
    }
  }, [selectedVessel]);

  // Sync camera when cameraPreset prop changes
  useEffect(() => {
    if (cameraPreset) {
      if (cameraPreset === 'orbit' || cameraPreset === 'default') {
        focusOnPreset('default', null);
      } else if (cameraPreset === 'anterior' || cameraPreset === 'LAD') {
        focusOnPreset('anterior', 'LAD');
      } else if (cameraPreset === 'lateral' || cameraPreset === 'LCX') {
        focusOnPreset('lateral', 'LCX');
      } else if (cameraPreset === 'rightav' || cameraPreset === 'RCA') {
        focusOnPreset('rightav', 'RCA');
      } else if (cameraPreset === 'inferior') {
        focusOnPreset('inferior', 'RCA');
      } else {
        focusOnPreset(cameraPreset);
      }
    }
  }, [cameraPreset]);

  // Reset Framing: Smoothly returns camera to default overview without deleting patient prediction
  const resetCamera = () => {
    focusOnPreset('default', null);
  };

  const handleZoom = (direction) => {
    if (controlsRef.current && !isLocked) {
      setIsTransitioning(false);
      const zoomFactor = direction === 'in' ? 0.85 : 1.15;
      controlsRef.current.object.position.multiplyScalar(zoomFactor);
      controlsRef.current.update();
    }
  };

  const hasLivePredictions = ladProb != null || lcxProb != null || rcaProb != null;

  return (
    <div
      className={`relative w-full h-[580px] lg:h-[620px] ${compact ? 'min-h-[280px] h-[320px]' : ''} rounded-xl overflow-hidden shadow-xs border bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#EDF4FF] border-slate-200 text-slate-800`}
    >
      {/* Top Left Anatomical Header Bar: Compact, clean status indicator */}
      {!compact && (
        <div className="absolute top-3.5 left-3.5 z-20 flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-xs bg-white/90 border-slate-200 text-slate-800">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse fill-current" />
            <span className="text-[11px] font-bold tracking-wide uppercase">
              3D Coronary Anatomy
            </span>
          </div>
          <div className="h-3 w-px bg-slate-300" />
          <div className="flex items-center gap-1 text-[11px] font-mono font-medium text-sky-700">
            <Activity className="w-3 h-3" />
            <span>{isPulsing ? `${heartRate} BPM` : 'PAUSED'}</span>
          </div>
          <div className="h-3 w-px bg-slate-300" />
          <div className="flex items-center gap-1 text-[10px] font-mono font-semibold">
            {hasLivePredictions ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Assessment Overlay
              </span>
            ) : (
              <span className="text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Territory Baseline
              </span>
            )}
          </div>
        </div>
      )}

      {/* Floating Toolbar (Top Right): Clean, grouped controls with accessible tooltips */}
      {!compact && (
        <div className="absolute top-3.5 right-3.5 z-20 flex flex-wrap items-center gap-1 p-1 rounded-xl border backdrop-blur-md shadow-xs bg-white/95 border-slate-200 text-slate-700">
          {/* Static / Lock View Toggle Button */}
          <button
            onClick={() => {
              setIsLocked(!isLocked);
              if (!isLocked) setAutoRotate(false);
            }}
            title={isLocked ? 'Unlock 3D Camera & Interaction' : 'Lock / Static View (Prevents Movement)'}
            aria-label={isLocked ? 'Unlock 3D Camera' : 'Lock 3D Camera'}
            className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              isLocked
                ? 'bg-sky-100 text-sky-800 border border-sky-300 font-semibold shadow-2xs'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5 text-sky-600" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
            <span className="text-[11px] hidden sm:inline">{isLocked ? 'Static View' : 'Orbit'}</span>
          </button>

          <div className="h-3.5 w-px mx-0.5 bg-slate-200" />

          {/* View Presets */}
          <button
            onClick={() => focusOnPreset('anterior', 'LAD')}
            title="Anterior LAD (Left Anterior Descending & Apex)"
            aria-label="Anterior LAD View"
            className={`px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewPreset === 'anterior' && selectedVessel === 'LAD'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            Anterior LAD
          </button>
          <button
            onClick={() => focusOnPreset('lateral', 'LCX')}
            title="Lateral LCX (Left Circumflex & Obtuse Marginals)"
            aria-label="Lateral LCX View"
            className={`px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewPreset === 'lateral' && selectedVessel === 'LCX'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            Lateral LCX
          </button>
          <button
            onClick={() => focusOnPreset('rightav', 'RCA')}
            title="Right AV RCA (Right Coronary Artery Groove)"
            aria-label="Right AV RCA View"
            className={`px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewPreset === 'rightav' && selectedVessel === 'RCA'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            Right AV RCA
          </button>
          <button
            onClick={() => focusOnPreset('inferior', 'RCA')}
            title="Inferior/Posterior (PDA & Diaphragmatic Surface)"
            aria-label="Inferior Posterior View"
            className={`px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewPreset === 'inferior'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            Inferior/Posterior
          </button>

          <div className="h-3.5 w-px mx-0.5 bg-slate-200" />

          {/* Zoom Controls */}
          <button
            disabled={isLocked}
            onClick={() => handleZoom('in')}
            title="Zoom In"
            aria-label="Zoom In"
            className="p-1 rounded-md text-xs hover:bg-slate-100 text-slate-600 disabled:opacity-40 cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            disabled={isLocked}
            onClick={() => handleZoom('out')}
            title="Zoom Out"
            aria-label="Zoom Out"
            className="p-1 rounded-md text-xs hover:bg-slate-100 text-slate-600 disabled:opacity-40 cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <div className="h-3.5 w-px mx-0.5 bg-slate-200" />

          {/* Orbit Auto-Rotation */}
          <button
            disabled={isLocked}
            onClick={() => setAutoRotate(!autoRotate)}
            title={isLocked ? 'Unlock view to enable rotation' : autoRotate ? 'Stop Slow Orbit' : 'Start Slow Orbit'}
            aria-label="Toggle Slow Orbit"
            className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
              autoRotate
                ? 'bg-sky-100 text-sky-700'
                : 'hover:bg-slate-100 text-slate-600 disabled:opacity-40'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Floating Labels Toggle */}
          <button
            onClick={() => setShowLabels(!showLabels)}
            title={showLabels ? 'Hide Vessel Callouts' : 'Show Vessel Callouts'}
            aria-label="Toggle Vessel Labels"
            className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
              showLabels ? 'text-sky-700 bg-sky-50' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* X-Ray Mode Toggle */}
          <button
            onClick={() => setXrayMode(!xrayMode)}
            title={xrayMode ? 'Opaque Anatomy' : 'Translucent X-Ray'}
            aria-label="Toggle X-Ray Mode"
            className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
              xrayMode ? 'text-sky-700 bg-sky-50' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Reset Camera Button */}
          <button
            onClick={resetCamera}
            title="Reset Framing (Restores neutral overview)"
            aria-label="Reset Camera Framing"
            className="p-1 rounded-md text-xs hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3D Canvas with Restrained Scientific Lighting */}
      <div className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas
          shadows
          camera={{ position: [0.45, 0.20, 5.40], fov: 36 }}
          className="w-full h-full"
        >
          {/* Medical-Art Studio Lighting Setup */}
          <hemisphereLight
            skyColor="#FFFFFF"
            groundColor="#334155"
            intensity={0.65}
          />
          {/* Key light: principal directional light revealing chamber curvature and myofibrils */}
          <directionalLight
            position={[8, 12, 8]}
            intensity={1.35}
            color="#FFFFFF"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0001}
          />
          {/* High-Contrast Rim Backlight: creates the signature glowing silhouette edge */}
          <directionalLight
            position={[-7, 8, -8]}
            intensity={1.75}
            color="#FFFFFF"
          />
          {/* Front fill light for organic vascular grooves */}
          <directionalLight
            position={[0, -2, 6]}
            intensity={0.45}
            color="#E2E8F0"
          />
          {/* Subtle bottom bounce fill */}
          <directionalLight
            position={[4, -8, -4]}
            intensity={0.30}
            color="#94A3B8"
          />

          <Suspense
            fallback={
              <Html center>
                <div
                  className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl border shadow-sm bg-white/95 text-slate-800 border-slate-200"
                >
                  <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-mono">Loading 3D Anatomy...</span>
                </div>
              </Html>
            }
          >
            {/* Subtle ambient reflection fill */}
            <Environment preset="studio" environmentIntensity={0.14} />

            <AnatomicalHeartScene
              ladProb={ladProb}
              lcxProb={lcxProb}
              rcaProb={rcaProb}
              selectedVessel={selectedVessel}
              onSelectVessel={(vessel) => focusOnPreset(vessel === 'LAD' ? 'anterior' : vessel === 'LCX' ? 'lateral' : 'rightav', vessel)}
              isPulsing={isPulsing}
              heartRate={heartRate}
              showLabels={showLabels}
              xrayMode={xrayMode}
              isLightTheme={isLightTheme}
            />

            <DynamicCameraFitter
              controlsRef={controlsRef}
            />

            <CameraFocusController
              targetPos={targetPos}
              targetLookAt={targetLookAt}
              isTransitioning={isTransitioning}
              onTransitionEnd={() => setIsTransitioning(false)}
              controlsRef={controlsRef}
              isInteractingRef={isInteractingRef}
              isLocked={isLocked}
            />
          </Suspense>

          {/* Controlled post-processing bloom for subtle risk luminescence without fuzzy halos */}
          <EffectComposer multisampling={4} disableNormalPass>
            <Bloom
              luminanceThreshold={0.94}
              luminanceSmoothing={0.25}
              intensity={0.08}
              mipmapBlur
            />
          </EffectComposer>

          <OrbitControls
            ref={controlsRef}
            enableRotate={!isLocked}
            enableZoom={!isLocked}
            enablePan={!isLocked}
            enableDamping
            dampingFactor={0.06}
            minDistance={2.5}
            maxDistance={12.0}
            maxPolarAngle={Math.PI / 1.35}
            minPolarAngle={Math.PI / 8}
            target={[0, 0, 0]}
            autoRotate={!isLocked && autoRotate}
            autoRotateSpeed={0.85}
            onStart={() => {
              isInteractingRef.current = true;
              setIsTransitioning(false);
            }}
            onEnd={() => {
              isInteractingRef.current = false;
            }}
          />
        </Canvas>
      </div>

      {/* Clean Floating Vessel Quick-Focus Bar at Bottom-Left */}
      {!compact && (
        <div className="absolute bottom-3.5 left-3.5 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-xs bg-white/90 border-slate-200 text-slate-800 pointer-events-auto">
          <span className="text-slate-500 text-xs font-medium hidden sm:inline mr-0.5">Focus:</span>
          {[
            { id: 'LAD', label: 'LAD', prob: ladProb, color: ladProb != null ? getRiskColor(ladProb) : VESSEL_COLORS.LAD, preset: 'anterior' },
            { id: 'LCX', label: 'LCX', prob: lcxProb, color: lcxProb != null ? getRiskColor(lcxProb) : VESSEL_COLORS.LCX, preset: 'lateral' },
            { id: 'RCA', label: 'RCA', prob: rcaProb, color: rcaProb != null ? getRiskColor(rcaProb) : VESSEL_COLORS.RCA, preset: 'rightav' },
          ].map((v) => {
            const isSel = selectedVessel === v.id;
            return (
              <button
                key={v.id}
                onClick={() => focusOnPreset(v.preset, v.id)}
                aria-label={`Focus on ${v.label}`}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  isSel
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                style={{
                  borderColor: isSel ? v.color : undefined,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: v.color }} />
                <span>{v.label}</span>
                <span className="text-[10px] opacity-90 font-mono">
                  {v.prob != null ? `${(v.prob * 100).toFixed(0)}%` : 'Baseline'}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => focusOnPreset('default', null)}
            title="Reset to Neutral Anatomy Overview"
            aria-label="Reset to Overview"
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
              !selectedVessel
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            Overview
          </button>
        </div>
      )}
    </div>
  );
}
