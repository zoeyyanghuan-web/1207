import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TREE_CONFIG, COLORS } from '../constants';

interface StarTopperProps {
  isFormed: boolean;
}

export const StarTopper: React.FC<StarTopperProps> = ({ isFormed }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Calculate star shape
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 1.2;
    const innerRadius = 0.5;
    const points = 5;
    
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    
    const extrudeSettings = {
      depth: 0.4,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.1,
      bevelThickness: 0.1,
    };
    
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center(); // Center the geometry
    return geo;
  }, []);

  const targetPos = new THREE.Vector3(0, TREE_CONFIG.HEIGHT / 2 + 1.0, 0);
  const chaosPos = new THREE.Vector3(0, 25, 0); // Floats high up in chaos

  useFrame((state, delta) => {
    if (groupRef.current) {
      const target = isFormed ? targetPos : chaosPos;
      
      // Smooth movement
      groupRef.current.position.lerp(target, delta * 1.5);
      
      // Spin animation
      groupRef.current.rotation.y += delta * 0.8;
      // Gentle floating bob
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.005;
      
      // Scale pop effect when forming
      const scaleTarget = isFormed ? 1.0 : 0.01;
      groupRef.current.scale.lerp(new THREE.Vector3(scaleTarget, scaleTarget, scaleTarget), delta * 2);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={starGeometry}>
        <meshStandardMaterial 
            color={COLORS.GOLD} 
            emissive={COLORS.GOLD}
            emissiveIntensity={1.5}
            roughness={0.1}
            metalness={1}
        />
      </mesh>
      {/* Light emitted by star */}
      <pointLight color={COLORS.GOLD} intensity={isFormed ? 30 : 0} distance={15} decay={2} />
      {/* Halo effect using a simple sprite or mesh could be added here, but bloom handles it */}
    </group>
  );
};