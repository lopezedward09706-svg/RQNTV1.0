
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { SimulationMode } from '../types';
import { COLORS, INITIAL_POSITIONS, NUM_NODES, SEGMENT_LENGTH } from '../constants';

// Define local constants for Three.js intrinsic elements to avoid global JSX namespace pollution
// and fix "Property does not exist on type 'JSX.IntrinsicElements'" errors.
// We use capitalized names so React treats them as components rather than intrinsic strings.
const Mesh = 'mesh' as any;
const SphereGeometry = 'sphereGeometry' as any;
const MeshBasicMaterial = 'meshBasicMaterial' as any;
const Group = 'group' as any;
const Primitive = 'primitive' as any;
const LineBasicMaterial = 'lineBasicMaterial' as any;
const Color = 'color' as any;
const AmbientLight = 'ambientLight' as any;
const PointLight = 'pointLight' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;

const Shockwave: React.FC<{ active: boolean }> = ({ active }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    if (active) {
      const t = clock.getElapsedTime() * 4;
      const scale = (t % 2) * 4;
      meshRef.current.scale.set(scale, scale, scale);
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - (t % 2));
    } else {
      meshRef.current.scale.set(0, 0, 0);
    }
  });

  return (
    /* Use local constant Mesh to satisfy JSX types */
    <Mesh ref={meshRef}>
      <SphereGeometry args={[1, 32, 32]} />
      <MeshBasicMaterial color="#ffffff" transparent opacity={0} wireframe />
    </Mesh>
  );
};

const StringMesh: React.FC<{ 
  color: string; 
  initialStart: { x: number, y: number, z: number }; 
  id: string; 
  synthesisActive: boolean;
  isStableNeutron: boolean;
  isStressActive: boolean;
  isCrystal: boolean;
}> = ({ color, initialStart, id, synthesisActive, isStableNeutron, isStressActive, isCrystal }) => {
  const groupRef = useRef<THREE.Group>(null);
  const lineRef = useRef<THREE.Line>(null);
  
  // Fix: Use a stable object for primitive to avoid SVG line element naming conflict in JSX
  const lineObject = useMemo(() => new THREE.Line(), []);

  let currentColor = color;
  if (isCrystal) currentColor = COLORS.CRYSTAL;
  else if (isStableNeutron) currentColor = COLORS.NEUTRON_GOLD;
  else if (synthesisActive) currentColor = COLORS.NEUTRON;

  const points = useMemo(() => {
    return Array.from({ length: NUM_NODES }, (_, i) => 
      new THREE.Vector3(initialStart.x, initialStart.y, (initialStart.z + i * SEGMENT_LENGTH))
    );
  }, [initialStart]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  useFrame(({ clock }) => {
    if (!groupRef.current || !lineRef.current) return;
    const t = clock.getElapsedTime();
    const positions = lineRef.current.geometry.attributes.position.array as Float32Array;

    const dynamicScale = isCrystal ? 0.15 : (isStableNeutron ? 0.25 : (synthesisActive ? 0.4 : 1.0));
    const stiffness = isCrystal ? 12.0 : (isStableNeutron ? 6.0 : (synthesisActive ? 4.0 : 2.0));
    const agitation = isStressActive ? Math.sin(t * 20) * 0.1 : 0;
    const pulse = isCrystal ? Math.sin(t * 2) * 0.01 : 0;

    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        const wave = Math.sin(t * (stiffness) + i * 0.5) * (0.05 * dynamicScale);
        const spiralX = Math.cos(t + i * 0.3 + (id === 'B' ? 1 : id === 'C' ? 2 : 0)) * (0.02 * dynamicScale);
        const spiralY = Math.sin(t + i * 0.3) * (0.02 * dynamicScale);

        const newX = (initialStart.x + spiralX + agitation + pulse) * dynamicScale;
        const newY = (initialStart.y + spiralY + wave + agitation + pulse) * dynamicScale;
        const newZ = (initialStart.z + i * (SEGMENT_LENGTH * dynamicScale));

        child.position.set(newX, newY, newZ);
        
        positions[i * 3] = newX;
        positions[i * 3 + 1] = newY;
        positions[i * 3 + 2] = newZ;
      }
    });
    lineRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Group>
      {/* Use local constant Primitive and LineBasicMaterial to satisfy JSX types */}
      <Primitive ref={lineRef} object={lineObject} geometry={geometry}>
        <LineBasicMaterial color={currentColor} transparent opacity={isCrystal ? 0.9 : (isStableNeutron ? 0.8 : 0.6)} />
      </Primitive>
      <Group ref={groupRef}>
        {points.map((_, i) => (
          <Mesh key={i}>
            <SphereGeometry args={[isCrystal ? 0.015 : (isStableNeutron ? 0.02 : (synthesisActive ? 0.025 : 0.035)), 8, 8]} />
            <MeshBasicMaterial color={currentColor} transparent opacity={isCrystal ? 1 : 0.8} />
          </Mesh>
        ))}
      </Group>
    </Group>
  );
};

const LightPath: React.FC<{ mode: SimulationMode }> = ({ mode }) => {
  const lineRef = useRef<THREE.Line>(null);
  const numPoints = 60;
  
  const lineObject = useMemo(() => new THREE.Line(), []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(numPoints * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!lineRef.current) return;
    const time = clock.getElapsedTime();
    const positions = lineRef.current.geometry.attributes.position.array as Float32Array;
    const startX = -8;
    const center = new THREE.Vector3(0, 0, 0);

    for (let i = 0; i < numPoints; i++) {
      const step = i * 0.3;
      let x = startX + step;
      let y = Math.sin(time * 0.5 + x * 0.2) * 0.1;
      let z = 0;

      const pos = new THREE.Vector3(x, y, z);
      const dist = pos.distanceTo(center);

      if (dist > 0.1) {
        const pull = 0.5 / (dist * dist);
        const direction = center.clone().sub(pos).normalize();
        const c_mod = mode === SimulationMode.VIA_B ? 1 / (1 + (0.8 / dist)) : 1.0;
        
        pos.add(direction.multiplyScalar(pull * 0.1));
        if (mode === SimulationMode.VIA_B) {
            pos.x *= c_mod;
        }
      }

      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;
    }
    lineRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    /* Use local constant Primitive and LineBasicMaterial to satisfy JSX types */
    <Primitive ref={lineRef} object={lineObject} geometry={geometry}>
      <LineBasicMaterial color="#ffffff" transparent opacity={0.8} />
    </Primitive>
  );
};

const Scene: React.FC<{ mode: SimulationMode, synthesisActive: boolean, status?: string }> = ({ mode, synthesisActive, status }) => {
  const isStableNeutron = status === 'MATERIA_ESTABLE_NEUTRON';
  const isStressActive = status === 'ESTRÉS_TOTAL';
  const isCrystal = status === 'CRISTALIZACIÓN';
  
  return (
    <>
      <Color attach="background" args={[COLORS.BACKGROUND]} />
      <AmbientLight intensity={0.5} />
      <PointLight position={[10, 10, 10]} intensity={2} color={COLORS.ACCENT} />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      
      <Mesh position={[0, 0, 0]}>
        <SphereGeometry args={[isCrystal ? 0.08 : (isStableNeutron ? 0.1 : (synthesisActive ? 0.15 : 0.3)), 32, 32]} />
        <MeshStandardMaterial 
            color={isCrystal ? COLORS.CRYSTAL : (isStableNeutron ? COLORS.NEUTRON_GOLD : (synthesisActive ? COLORS.NEUTRON : "#ff0000"))} 
            emissive={isCrystal ? COLORS.CRYSTAL : (isStableNeutron ? COLORS.NEUTRON_GOLD : (synthesisActive ? COLORS.NEUTRON : "#ff0000"))} 
            emissiveIntensity={isCrystal ? 10 : (isStableNeutron ? 5 : (synthesisActive ? 3 : 2))} 
            transparent 
            opacity={0.8}
        />
      </Mesh>

      <Shockwave active={isStressActive} />

      <StringMesh id="A" color={COLORS.STRING_A} initialStart={INITIAL_POSITIONS.A} synthesisActive={synthesisActive} isStableNeutron={isStableNeutron} isStressActive={isStressActive} isCrystal={isCrystal} />
      <StringMesh id="B" color={COLORS.STRING_B} initialStart={INITIAL_POSITIONS.B} synthesisActive={synthesisActive} isStableNeutron={isStableNeutron} isStressActive={isStressActive} isCrystal={isCrystal} />
      <StringMesh id="C" color={COLORS.STRING_C} initialStart={INITIAL_POSITIONS.C} synthesisActive={synthesisActive} isStableNeutron={isStableNeutron} isStressActive={isStressActive} isCrystal={isCrystal} />
      
      <LightPath mode={mode} />
      
      <OrbitControls makeDefault />
    </>
  );
};

const Simulation3D: React.FC<{ mode: SimulationMode, synthesisActive: boolean, status?: string }> = ({ mode, synthesisActive, status }) => {
  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl relative border border-gray-800">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded border border-gray-700 text-xs font-mono text-gray-400">
            SYSTEM: {mode.toUpperCase()}
        </div>
        {(synthesisActive || status) && (
            <div className={`backdrop-blur-md px-3 py-1 rounded border text-[10px] font-bold text-white uppercase animate-pulse ${
              status === 'CRISTALIZACIÓN' ? 'bg-zinc-200 border-zinc-100 text-zinc-900 shadow-lg shadow-white/20' :
              status === 'MATERIA_ESTABLE_NEUTRON' ? 'bg-amber-500 border-amber-400' : 
              status === 'ESTRÉS_TOTAL' ? 'bg-red-600 border-red-400' : 
              'bg-orange-500/80 border-orange-400'
            }`}>
                STATUS: {status || 'NEUTRON_SYNTHESIS_ACTIVE'}
            </div>
        )}
      </div>
      <Canvas 
        shadows={false} 
        gl={{ 
          antialias: true, 
          powerPreference: "high-performance",
          alpha: false,
          stencil: false,
          depth: true
        }}
      >
        <PerspectiveCamera makeDefault position={[5, 5, 8]} fov={50} />
        <Scene mode={mode} synthesisActive={synthesisActive} status={status} />
      </Canvas>
    </div>
  );
};

export default Simulation3D;
