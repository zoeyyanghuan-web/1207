import React from 'react';

interface OverlayProps {
  isFormed: boolean;
  toggleFormed: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ isFormed, toggleFormed }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between p-8">
      {/* Header */}
      <div className="text-center mt-8">
        <h1 className="font-serif text-5xl md:text-7xl text-luxury-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] tracking-widest uppercase">
          The Grand Tree
        </h1>
      </div>

      {/* Footer / Controls */}
      <div className="flex flex-col items-center mb-12 pointer-events-auto">
        <button
          onClick={toggleFormed}
          className={`
            group relative px-12 py-4 bg-transparent overflow-hidden transition-all duration-500 rounded-full
            border border-luxury-gold hover:border-white shadow-[0_0_20px_rgba(255,215,0,0.2)] hover:shadow-[0_0_30px_rgba(255,215,0,0.6)]
          `}
        >
            {/* Button Background Gradient */}
            <div className={`absolute inset-0 w-full h-full bg-gradient-to-r from-purple-900 via-luxury-emerald to-purple-900 opacity-90 transition-opacity duration-500 ${isFormed ? 'opacity-100' : 'opacity-60'}`}></div>
            
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out_infinite]" />

            {/* Text */}
            <span className="relative font-serif text-xl text-white group-hover:text-luxury-goldLight transition-colors duration-300 tracking-widest">
                {isFormed ? "RELEASE MAGIC" : "MAKE A WISH"}
            </span>
        </button>
      </div>
    </div>
  );
};