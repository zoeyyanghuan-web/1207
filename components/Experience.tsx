import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { StarTopper } from './StarTopper';
import { Snow } from './Snow';
import { COLORS } from '../constants';

interface ExperienceProps {
  isFormed: boolean;
}

export const Experience: React.FC<ExperienceProps> = ({ isFormed }) => {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: false, toneMappingExposure: 1.1 }}
      shadows
      className="bg-[#1A0B2E]" 
    >
      <PerspectiveCamera makeDefault position={[0, 4, 25]} fov={50} />
      
      <OrbitControls 
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
        minDistance={10}
        maxDistance={45}
        autoRotate={isFormed}
        autoRotateSpeed={0.5}
      />

      {/* Magical Lighting Setup */}
      {/* Soft blue ambient light (Moonlight) */}
      <ambientLight intensity={0.8} color="#a5b4fc" />
      
      {/* Main warm spotlight from top */}
      <spotLight
        position={[10, 25, 10]}
        angle={0.5}
        penumbra={1}
        intensity={500}
        castShadow
        shadow-bias={-0.0001}
        color="#fffae0" // Warm white
      />
      
      {/* Magical fill lights */}
      <pointLight position={[-15, 10, -15]} intensity={100} color="#c084fc" /> {/* Purple/Pink rim */}
      <pointLight position={[15, 5, 15]} intensity={80} color="#38bdf8" /> {/* Cyan fill */}

      <Suspense fallback={null}>
        {/* Environment for shiny reflections */}
        <Environment preset="park" background={false} blur={0.8} />
        
        {/* Magical Background */}
        <color attach="background" args={[COLORS.MAGIC_SKY.getStyle()]} />
        <fog attach="fog" args={[COLORS.MAGIC_FOG.getStyle(), 15, 70]} />
        
        {/* Background Stars - Brighter and more plentiful */}
        <Stars radius={60} depth={50} count={8000} factor={6} saturation={0.8} fade speed={1} />
        
        {/* Extra floating magical sparkles in the air */}
        <Sparkles count={500} scale={20} size={4} speed={0.4} opacity={0.5} color="#fbbf24" />

        {/* Falling Snow */}
        <Snow />
        
        {/* 3D Content */}
        <group position={[0, -5, 0]}>
           <Foliage isFormed={isFormed} />
           <Ornaments isFormed={isFormed} />
           <StarTopper isFormed={isFormed} />
        </group>

        {/* Post Processing - Dreamy soft glow */}
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.65} // Lower threshold to make more things glow
            mipmapBlur 
            intensity={0.8} // Softer intensity
            radius={0.7} // Wider bloom for dreaminess
          />
          <Vignette eskil={false} offset={0.1} darkness={0.6} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
};