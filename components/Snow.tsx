import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../constants';

export const Snow: React.FC = () => {
  const count = 2000;
  const meshRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count); // Fall speed
    
    for (let i = 0; i < count; i++) {
      // Spread wide in the "Universe"
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
      
      vel[i] = 0.5 + Math.random() * 1.5;
    }
    
    return { positions: pos, velocities: vel };
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const posAttribute = meshRef.current.geometry.attributes.position;
    
    for (let i = 0; i < count; i++) {
      let y = posAttribute.getY(i);
      y -= velocities[i] * delta;
      
      // Reset if below threshold
      if (y < -30) {
        y = 30;
      }
      
      posAttribute.setY(i, y);
    }
    posAttribute.needsUpdate = true;
    
    // Gentle rotation of the whole snow system
    meshRef.current.rotation.y += delta * 0.05;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={COLORS.SNOW}
        size={0.15}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};