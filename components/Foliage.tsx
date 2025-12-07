import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TREE_CONFIG, COLORS } from '../constants';

const vertexShader = `
  uniform float uTime;
  uniform float uProgress;
  
  attribute vec3 aPositionChaos;
  attribute vec3 aPositionTarget;
  attribute float aRandom;
  
  varying float vAlpha;
  varying vec2 vUv;
  
  float easeOutCubic(float x) {
    return 1.0 - pow(1.0 - x, 3.0);
  }

  void main() {
    vUv = uv;
    float mixFactor = easeOutCubic(uProgress);
    
    vec3 pos = mix(aPositionChaos, aPositionTarget, mixFactor);
    
    if (uProgress > 0.95) {
      float breathe = sin(uTime * 1.0 + aRandom * 10.0) * 0.08;
      pos += normalize(pos) * breathe;
    }
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Slightly smaller particles for dreamier dust look
    gl_PointSize = (35.0 * aRandom + 15.0) * (1.0 / -mvPosition.z);
    
    float twinkle = sin(uTime * 2.0 + aRandom * 100.0);
    vAlpha = 0.5 + 0.3 * twinkle;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform vec3 uColorBottom;
  uniform vec3 uColorTop;
  
  varying float vAlpha;
  varying vec2 vUv;
  
  void main() {
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
    if (ll > 0.5) discard;
    
    float glow = 1.0 - (ll * 2.0);
    glow = pow(glow, 2.0); // Softer glow
    
    vec3 color = mix(uColorBottom, uColorTop, glow);
    
    gl_FragColor = vec4(color + vec3(0.1), vAlpha * glow);
  }
`;

interface FoliageProps {
  isFormed: boolean;
}

export const Foliage: React.FC<FoliageProps> = ({ isFormed }) => {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { chaosPositions, targetPositions, randoms } = useMemo(() => {
    const count = TREE_CONFIG.PARTICLE_COUNT;
    const chaosPos = new Float32Array(count * 3);
    const targetPos = new Float32Array(count * 3);
    const rands = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Chaos
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = Math.cbrt(Math.random()) * TREE_CONFIG.CHAOS_RADIUS;
      chaosPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      chaosPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      chaosPos[i * 3 + 2] = r * Math.cos(phi);

      // Target
      const h = Math.random() * TREE_CONFIG.HEIGHT;
      const relHeight = h / TREE_CONFIG.HEIGHT;
      const coneRadiusAtHeight = TREE_CONFIG.RADIUS_BASE * (1 - relHeight);
      
      const rCone = Math.sqrt(Math.random()) * coneRadiusAtHeight; 
      const thetaCone = Math.random() * Math.PI * 2;
      
      targetPos[i * 3] = rCone * Math.cos(thetaCone);
      targetPos[i * 3 + 1] = h - (TREE_CONFIG.HEIGHT / 2);
      targetPos[i * 3 + 2] = rCone * Math.sin(thetaCone);

      rands[i] = Math.random();
    }
    return { chaosPositions: chaosPos, targetPositions: targetPos, randoms: rands };
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      const targetProgress = isFormed ? 1.0 : 0.0;
      const currentProgress = materialRef.current.uniforms.uProgress.value;
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        currentProgress,
        targetProgress,
        delta * 1.2
      );
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={TREE_CONFIG.PARTICLE_COUNT} array={targetPositions} itemSize={3} />
        <bufferAttribute attach="attributes-aPositionChaos" count={TREE_CONFIG.PARTICLE_COUNT} array={chaosPositions} itemSize={3} />
        <bufferAttribute attach="attributes-aPositionTarget" count={TREE_CONFIG.PARTICLE_COUNT} array={targetPositions} itemSize={3} />
        <bufferAttribute attach="attributes-aRandom" count={TREE_CONFIG.PARTICLE_COUNT} array={randoms} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uColorBottom: { value: COLORS.EMERALD },
          uColorTop: { value: COLORS.GOLD }
        }}
      />
    </points>
  );
};