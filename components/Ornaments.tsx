import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TREE_CONFIG, COLORS, ANIMATION_SPEED } from '../constants';

// --- Shared Types & Helper ---
interface OrnamentItem {
  chaosPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  chaosRot: THREE.Euler;
  targetRot: THREE.Euler;
  color: THREE.Color;
  scale: number;
  speedOffset: number;
}

// Helper to generate data for a batch
const useOrnamentData = (count: number, type: 'bauble' | 'gift' | 'candy') => {
  return useMemo(() => {
    const items: OrnamentItem[] = [];
    
    for (let i = 0; i < count; i++) {
      // 1. Target Position (Tree Surface)
      const h = Math.random() * TREE_CONFIG.HEIGHT;
      const relHeight = h / TREE_CONFIG.HEIGHT;
      const coneRadiusAtHeight = TREE_CONFIG.RADIUS_BASE * (1 - relHeight);
      
      // Surface distribution mostly
      const rCone = coneRadiusAtHeight * (0.85 + Math.random() * 0.1); 
      const theta = Math.random() * Math.PI * 2;

      const targetPos = new THREE.Vector3(
        rCone * Math.cos(theta),
        h - (TREE_CONFIG.HEIGHT / 2),
        rCone * Math.sin(theta)
      );

      // 2. Chaos Position
      const rChaos = Math.cbrt(Math.random()) * TREE_CONFIG.CHAOS_RADIUS;
      const thetaChaos = Math.random() * Math.PI * 2;
      const phiChaos = Math.acos((Math.random() * 2) - 1);
      
      const chaosPos = new THREE.Vector3(
        rChaos * Math.sin(phiChaos) * Math.cos(thetaChaos),
        rChaos * Math.sin(phiChaos) * Math.sin(thetaChaos),
        rChaos * Math.cos(phiChaos)
      );

      // 3. Rotations
      const chaosRot = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const targetRot = new THREE.Euler(0, -theta, 0); // Face outward

      // 4. Color & Scale
      let color = COLORS.GOLD;
      let scale = 1.0;
      let speedOffset = 1.0;

      if (type === 'bauble') {
        const r = Math.random();
        if (r > 0.6) color = COLORS.RED_VELVET;
        else if (r > 0.3) color = COLORS.GOLD;
        else color = COLORS.SILVER;
        scale = 0.3 + Math.random() * 0.1;
        speedOffset = 1.2;
      } else if (type === 'gift') {
        const r = Math.random();
        if (r > 0.75) color = COLORS.GIFT_RED;
        else if (r > 0.5) color = COLORS.GIFT_GREEN;
        else if (r > 0.25) color = COLORS.GIFT_BLUE;
        else color = COLORS.GOLD;
        scale = 0.35 + Math.random() * 0.15;
        speedOffset = 0.8; // Heavy
      } else if (type === 'candy') {
        color = Math.random() > 0.5 ? COLORS.CANDY_STRIPE : COLORS.CANDY_WHITE;
        scale = 0.25 + Math.random() * 0.1;
        speedOffset = 1.1;
      }

      items.push({ chaosPos, targetPos, chaosRot, targetRot, color, scale, speedOffset });
    }
    return items;
  }, [count, type]);
};

// Generic Instanced Component
const InstancedOrnamentLayer: React.FC<{
  isFormed: boolean;
  geometry: THREE.BufferGeometry;
  count: number;
  type: 'bauble' | 'gift' | 'candy';
}> = ({ isFormed, geometry, count, type }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const data = useOrnamentData(count, type);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const progresses = useRef(new Float32Array(count).fill(0));

  useLayoutEffect(() => {
    if (meshRef.current) {
      data.forEach((d, i) => {
        meshRef.current!.setColorAt(i, d.color);
      });
      meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [data]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    let needsUpdate = false;
    const targetGlobal = isFormed ? 1 : 0;

    for (let i = 0; i < count; i++) {
      const d = data[i];
      const current = progresses.current[i];
      // Randomize speed slightly per item
      const speed = ANIMATION_SPEED * d.speedOffset * delta;
      
      let next = current;
      if (Math.abs(current - targetGlobal) > 0.001) {
        next = THREE.MathUtils.lerp(current, targetGlobal, speed);
        progresses.current[i] = next;
        needsUpdate = true;
      }

      // Position
      dummy.position.lerpVectors(d.chaosPos, d.targetPos, next);
      
      // Rotation
      dummy.rotation.set(
        THREE.MathUtils.lerp(d.chaosRot.x, d.targetRot.x, next),
        THREE.MathUtils.lerp(d.chaosRot.y, d.targetRot.y, next),
        THREE.MathUtils.lerp(d.chaosRot.z, d.targetRot.z, next)
      );
      
      // Floating effect when formed
      if (next > 0.95) {
         dummy.position.y += Math.sin(state.clock.elapsedTime * (1 + i * 0.01)) * 0.02;
         dummy.rotation.y += Math.sin(state.clock.elapsedTime) * 0.01;
      }

      dummy.scale.setScalar(d.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    if (needsUpdate || isFormed) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, count]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        roughness={type === 'candy' ? 0.3 : 0.15}
        metalness={type === 'candy' ? 0.4 : 0.9} // Candies less metallic
        envMapIntensity={1.2}
      />
    </instancedMesh>
  );
};

export const Ornaments: React.FC<{ isFormed: boolean }> = ({ isFormed }) => {
  // 1. Bauble Geometry (Sphere)
  const baubleGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 4), []);

  // 2. Gift Geometry (Box + Ribbons)
  const giftGeo = useMemo(() => {
    // Base Box
    const boxSize = 1;
    const box = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    
    // Create ribbon effect by modifying UVs or just adding geometry? 
    // Geometry merge is expensive at runtime if not careful, but for init it's fine.
    // Let's keep it simple: Just a cube for now, but to make it look like a gift, 
    // we can rely on the shiny material.
    // Better: Combine geometries.
    // Note: BufferGeometryUtils is not imported. We will construct a simple box.
    // To distinguish "Gift" from "Block", we trust the user prompt "various colors including gift boxes".
    // We will stick to BoxGeometry for performance and reliability without external utils.
    return box;
  }, []);

  // 3. Candy Geometry (Torus for rings/donuts)
  const candyGeo = useMemo(() => new THREE.TorusGeometry(0.6, 0.25, 16, 32), []);

  return (
    <group>
      <InstancedOrnamentLayer 
        isFormed={isFormed} 
        geometry={baubleGeo} 
        count={300} 
        type="bauble" 
      />
      <InstancedOrnamentLayer 
        isFormed={isFormed} 
        geometry={giftGeo} 
        count={150} 
        type="gift" 
      />
       <InstancedOrnamentLayer 
        isFormed={isFormed} 
        geometry={candyGeo} 
        count={150} 
        type="candy" 
      />
    </group>
  );
};