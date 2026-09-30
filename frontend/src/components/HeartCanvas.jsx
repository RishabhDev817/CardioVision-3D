import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import * as THREE from 'three';

// Risk-based color threshold mapping as specified
export const getRiskColor = (prob) => {
  if (prob === undefined || prob === null) return '#94a3b8';
  if (prob < 0.3) return '#22c55e'; // Low: Green
  if (prob <= 0.7) return '#f59e0b'; // Moderate: Yellow/Orange
  return '#ef4444'; // High: Red
};

export const getRiskTier = (prob) => {
  if (prob === undefined || prob === null) return 'Unknown';
  if (prob < 0.3) return 'Low Risk';
  if (prob <= 0.7) return 'Moderate Risk';
  return 'High Risk';
};

// Procedural Curved Vessel Tube Generator
function CurvedVessel({ points, radius = 0.05, color, isSelected, isHovered, onClick, onPointerOver, onPointerOut, name }) {
  const curve = useMemo(() => {
    const vectors = points.map(p => new THREE.Vector3(...p));
    return new THREE.CatmullRomCurve3(vectors);
  }, [points]);

  const geometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 48, radius, 12, false);
  }, [curve, radius]);

  return (
    <mesh
      geometry={geometry}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onPointerOver();
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onPointerOut();
      }}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        emissive={isSelected ? color : isHovered ? color : '#000000'}
        emissiveIntensity={isSelected ? 0.8 : isHovered ? 0.4 : 0.0}
        roughness={0.25}
        metalness={0.3}
      />
    </mesh>
  );
}

// Procedural Anatomical 3D Heart Model with LAD, LCX, RCA Branches
function HeartModel({ ladProb = 0.2, lcxProb = 0.5, rcaProb = 0.8, selectedVessel, onSelectVessel, isPulsing = true }) {
  const heartGroupRef = useRef();
  const [hoveredVessel, setHoveredVessel] = useState(null);

  // Dynamic colors based on probabilities
  const ladColor = useMemo(() => getRiskColor(ladProb), [ladProb]);
  const lcxColor = useMemo(() => getRiskColor(lcxProb), [lcxProb]);
  const rcaColor = useMemo(() => getRiskColor(rcaProb), [rcaProb]);

  // Cardiac cycle pulsation
  useFrame((state) => {
    if (!heartGroupRef.current || !isPulsing) return;
    const t = state.clock.getElapsedTime();
    // Systolic contraction followed by diastolic relaxation
    const pulse = 1 + 0.03 * Math.sin(t * 3.5) * Math.cos(t * 3.5);
    heartGroupRef.current.scale.set(pulse, pulse, pulse);
  });

  // LAD (Left Anterior Descending) anatomical course:
  // Originates at left coronary base, runs down the anterior interventricular groove to the apex
  const ladMainPoints = [
    [0.1, 0.45, 0.65],
    [0.15, 0.2, 0.85],
    [0.18, -0.1, 0.88],
    [0.14, -0.45, 0.78],
    [0.08, -0.85, 0.55],
    [0.02, -1.15, 0.35],
    [0.0, -1.35, 0.15],
  ];

  const ladDiagonalPoints = [
    [0.15, 0.05, 0.86],
    [0.38, -0.15, 0.75],
    [0.55, -0.38, 0.55],
    [0.65, -0.65, 0.35],
  ];

  // LCX (Left Circumflex) anatomical course:
  // Branches from left main, curves around the left atrioventricular sulcus to the posterior wall
  const lcxMainPoints = [
    [0.1, 0.45, 0.65],
    [0.4, 0.4, 0.55],
    [0.72, 0.25, 0.32],
    [0.85, 0.05, 0.0],
    [0.8, -0.2, -0.35],
    [0.65, -0.45, -0.55],
    [0.45, -0.7, -0.65],
  ];

  const lcxMarginalPoints = [
    [0.72, 0.25, 0.32],
    [0.88, 0.0, 0.2],
    [0.92, -0.3, 0.05],
    [0.85, -0.6, -0.08],
  ];

  // RCA (Right Coronary Artery) anatomical course:
  // Originates from anterior right sinus, descends through right AV sulcus towards diaphragmatic surface
  const rcaMainPoints = [
    [-0.15, 0.42, 0.68],
    [-0.45, 0.35, 0.58],
    [-0.72, 0.15, 0.42],
    [-0.82, -0.15, 0.25],
    [-0.78, -0.45, 0.05],
    [-0.65, -0.72, -0.15],
    [-0.42, -0.95, -0.3],
    [-0.15, -1.15, -0.35],
  ];

  const rcaAcuteMarginalPoints = [
    [-0.82, -0.15, 0.25],
    [-0.88, -0.38, 0.28],
    [-0.85, -0.65, 0.22],
  ];

  return (
    <group ref={heartGroupRef} dispose={null}>
      {/* 1. Main Cardiac Myocardial Base (Ventricular Chambers) */}
      <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
        <sphereGeometry args={[1.0, 36, 36]} />
        <meshStandardMaterial
          color="#881337"
          roughness={0.4}
          metalness={0.15}
          bumpScale={0.05}
        />
      </mesh>

      {/* 2. Cardiac Apex (Inferior-pointed cone) */}
      <mesh position={[0, -1.05, 0.1]} rotation={[0.15, 0, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.9, 1.1, 36]} />
        <meshStandardMaterial
          color="#701a2e"
          roughness={0.45}
          metalness={0.15}
        />
      </mesh>

      {/* 3. Left Ventricle Mass (Bulging inferolateral wall) */}
      <mesh position={[0.35, -0.5, 0.1]} scale={[1.05, 1.15, 0.95]} castShadow>
        <sphereGeometry args={[0.75, 28, 28]} />
        <meshStandardMaterial color="#881337" roughness={0.42} metalness={0.12} />
      </mesh>

      {/* 4. Right Ventricle Mass (Anteromedial chamber) */}
      <mesh position={[-0.35, -0.45, 0.25]} scale={[0.95, 1.05, 0.85]} castShadow>
        <sphereGeometry args={[0.7, 28, 28]} />
        <meshStandardMaterial color="#9f1239" roughness={0.42} metalness={0.12} />
      </mesh>

      {/* 5. Left Atrium / Left Auricle */}
      <mesh position={[0.45, 0.45, -0.15]} castShadow>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial color="#4c0519" roughness={0.5} />
      </mesh>

      {/* 6. Right Atrium */}
      <mesh position={[-0.5, 0.38, 0.1]} castShadow>
        <sphereGeometry args={[0.58, 24, 24]} />
        <meshStandardMaterial color="#4c0519" roughness={0.5} />
      </mesh>

      {/* 7. Ascending Aorta and Aortic Arch */}
      <group position={[0.02, 0.75, 0.05]}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.28, 0.75, 24]} />
          <meshStandardMaterial color="#e11d48" roughness={0.3} metalness={0.25} />
        </mesh>
        <mesh position={[0.08, 0.65, -0.1]} rotation={[0.4, 0, -0.3]}>
          <torusGeometry args={[0.3, 0.22, 16, 32, Math.PI * 0.9]} />
          <meshStandardMaterial color="#e11d48" roughness={0.3} metalness={0.25} />
        </mesh>
      </group>

      {/* 8. Pulmonary Trunk */}
      <mesh position={[-0.15, 0.62, 0.38]} rotation={[0.35, -0.2, 0.25]} castShadow>
        <cylinderGeometry args={[0.22, 0.25, 0.68, 24]} />
        <meshStandardMaterial color="#0284c7" roughness={0.35} metalness={0.2} />
      </mesh>

      {/* 9. Superior Vena Cava */}
      <mesh position={[-0.6, 0.85, -0.05]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.6, 20]} />
        <meshStandardMaterial color="#0369a1" roughness={0.35} metalness={0.2} />
      </mesh>

      {/* ================= CORONARY ARTERY NETWORK ================= */}

      {/* LAD Network */}
      <group>
        <CurvedVessel
          points={ladMainPoints}
          radius={0.055}
          color={ladColor}
          isSelected={selectedVessel === 'LAD'}
          isHovered={hoveredVessel === 'LAD'}
          name="LAD"
          onClick={() => onSelectVessel('LAD')}
          onPointerOver={() => setHoveredVessel('LAD')}
          onPointerOut={() => setHoveredVessel(null)}
        />
        <CurvedVessel
          points={ladDiagonalPoints}
          radius={0.038}
          color={ladColor}
          isSelected={selectedVessel === 'LAD'}
          isHovered={hoveredVessel === 'LAD'}
          name="LAD-Diagonal"
          onClick={() => onSelectVessel('LAD')}
          onPointerOver={() => setHoveredVessel('LAD')}
          onPointerOut={() => setHoveredVessel(null)}
        />
        {/* LAD Anatomical Indicator */}
        <Html position={[0.25, -0.2, 0.95]} center distanceFactor={7}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectVessel('LAD');
            }}
            className={`cursor-pointer transition-all duration-200 select-none px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg flex items-center space-x-1.5 border ${
              selectedVessel === 'LAD'
                ? 'bg-rose-950/80 border-rose-500 text-white ring-2 ring-rose-500/50 scale-110'
                : 'bg-slate-900/80 border-slate-700 text-slate-200 hover:scale-105'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full inline-block animate-pulse"
              style={{ backgroundColor: ladColor }}
            />
            <span>LAD: {(ladProb * 100).toFixed(0)}%</span>
          </div>
        </Html>
      </group>

      {/* LCX Network */}
      <group>
        <CurvedVessel
          points={lcxMainPoints}
          radius={0.05}
          color={lcxColor}
          isSelected={selectedVessel === 'LCX'}
          isHovered={hoveredVessel === 'LCX'}
          name="LCX"
          onClick={() => onSelectVessel('LCX')}
          onPointerOver={() => setHoveredVessel('LCX')}
          onPointerOut={() => setHoveredVessel(null)}
        />
        <CurvedVessel
          points={lcxMarginalPoints}
          radius={0.035}
          color={lcxColor}
          isSelected={selectedVessel === 'LCX'}
          isHovered={hoveredVessel === 'LCX'}
          name="LCX-Marginal"
          onClick={() => onSelectVessel('LCX')}
          onPointerOver={() => setHoveredVessel('LCX')}
          onPointerOut={() => setHoveredVessel(null)}
        />
        {/* LCX Anatomical Indicator */}
        <Html position={[0.85, 0.25, 0.35]} center distanceFactor={7}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectVessel('LCX');
            }}
            className={`cursor-pointer transition-all duration-200 select-none px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg flex items-center space-x-1.5 border ${
              selectedVessel === 'LCX'
                ? 'bg-purple-950/80 border-purple-500 text-white ring-2 ring-purple-500/50 scale-110'
                : 'bg-slate-900/80 border-slate-700 text-slate-200 hover:scale-105'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full inline-block animate-pulse"
              style={{ backgroundColor: lcxColor }}
            />
            <span>LCX: {(lcxProb * 100).toFixed(0)}%</span>
          </div>
        </Html>
      </group>

      {/* RCA Network */}
      <group>
        <CurvedVessel
          points={rcaMainPoints}
          radius={0.052}
          color={rcaColor}
          isSelected={selectedVessel === 'RCA'}
          isHovered={hoveredVessel === 'RCA'}
          name="RCA"
          onClick={() => onSelectVessel('RCA')}
          onPointerOver={() => setHoveredVessel('RCA')}
          onPointerOut={() => setHoveredVessel(null)}
        />
        <CurvedVessel
          points={rcaAcuteMarginalPoints}
          radius={0.035}
          color={rcaColor}
          isSelected={selectedVessel === 'RCA'}
          isHovered={hoveredVessel === 'RCA'}
          name="RCA-Marginal"
          onClick={() => onSelectVessel('RCA')}
          onPointerOver={() => setHoveredVessel('RCA')}
          onPointerOut={() => setHoveredVessel(null)}
        />
        {/* RCA Anatomical Indicator */}
        <Html position={[-0.85, 0.1, 0.45]} center distanceFactor={7}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectVessel('RCA');
            }}
            className={`cursor-pointer transition-all duration-200 select-none px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg flex items-center space-x-1.5 border ${
              selectedVessel === 'RCA'
                ? 'bg-pink-950/80 border-pink-500 text-white ring-2 ring-pink-500/50 scale-110'
                : 'bg-slate-900/80 border-slate-700 text-slate-200 hover:scale-105'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full inline-block animate-pulse"
              style={{ backgroundColor: rcaColor }}
            />
            <span>RCA: {(rcaProb * 100).toFixed(0)}%</span>
          </div>
        </Html>
      </group>
    </group>
  );
}

/**
 * Interactive 3D Heart Canvas Component
 * Provides Three.js Canvas, Lighting, OrbitControls, and Stenosis Highlighting
 */
export default function HeartCanvas({
  ladProb = 0.25,
  lcxProb = 0.45,
  rcaProb = 0.75,
  selectedVessel = null,
  onSelectVessel = () => {},
  isPulsing = true,
  className = ''
}) {
  const controlsRef = useRef();

  // Camera presets
  const handlePresetView = (view) => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    if (view === 'anterior') {
      controls.object.position.set(0, 0, 4.2);
    } else if (view === 'left-lateral') {
      controls.object.position.set(4.0, 0, 1.2);
    } else if (view === 'right-lateral') {
      controls.object.position.set(-4.0, 0, 1.2);
    } else if (view === 'inferior') {
      controls.object.position.set(0, -3.8, 1.8);
    }
    controls.target.set(0, -0.2, 0);
    controls.update();
  };

  return (
    <div className={`relative w-full h-full min-h-[460px] bg-gradient-to-b from-[#0b0f19] via-[#0d1322] to-[#080b12] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl ${className}`}>
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0.2, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        {/* Illumination */}
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-5, -2, -5]} intensity={0.4} color="#60a5fa" />
        <pointLight position={[0, 4, 3]} intensity={0.8} color="#ffffff" />
        <pointLight position={[0, -3, 2]} intensity={0.5} color="#fda4af" />

        {/* Orbit Controls with Damping */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          minDistance={2.2}
          maxDistance={8.5}
          maxPolarAngle={Math.PI * 0.9}
          target={[0, -0.2, 0]}
        />

        {/* 3D Heart Geometry */}
        <Suspense fallback={null}>
          <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.2}>
            <HeartModel
              ladProb={ladProb}
              lcxProb={lcxProb}
              rcaProb={rcaProb}
              selectedVessel={selectedVessel}
              onSelectVessel={onSelectVessel}
              isPulsing={isPulsing}
            />
          </Float>
        </Suspense>
      </Canvas>

      {/* Floating View Presets & Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5 backdrop-blur-md bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => handlePresetView('anterior')}
          className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Anterior (Front) View - Highlights LAD"
        >
          Anterior (LAD)
        </button>
        <button
          onClick={() => handlePresetView('left-lateral')}
          className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Left Lateral View - Highlights LCX"
        >
          Left Lateral (LCX)
        </button>
        <button
          onClick={() => handlePresetView('right-lateral')}
          className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Right View - Highlights RCA"
        >
          Right (RCA)
        </button>
        <button
          onClick={() => handlePresetView('inferior')}
          className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Inferior / Diaphragmatic View"
        >
          Inferior
        </button>
      </div>

      {/* Risk Legend */}
      <div className="absolute bottom-4 left-4 z-10 backdrop-blur-md bg-slate-900/70 p-3 rounded-xl border border-slate-800 text-xs flex flex-col gap-1.5 shadow-lg">
        <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider mb-0.5">
          Stenosis Risk Thresholds (&ge;50%)
        </span>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-[#22c55e] inline-block shadow-sm"></span>
          <span className="text-slate-300">Low Risk (&lt; 30%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-[#f59e0b] inline-block shadow-sm"></span>
          <span className="text-slate-300">Moderate Risk (30% – 70%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-[#ef4444] inline-block shadow-sm"></span>
          <span className="text-slate-300">High Risk (&gt; 70%)</span>
        </div>
      </div>

      {/* Navigation Hint */}
      <div className="absolute bottom-4 right-4 z-10 text-[11px] text-slate-500 bg-slate-950/60 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-800/80 pointer-events-none">
        Rotate: Drag | Zoom: Scroll | Pan: Shift+Drag | Click vessel for diagnostics
      </div>
    </div>
  );
}
