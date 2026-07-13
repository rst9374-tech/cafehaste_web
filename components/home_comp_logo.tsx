import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  size?: number;
  color?: string;
  glow?: boolean;
  animated?: boolean;
}

export const HasteSymbol: React.FC<LogoProps> = ({ 
  className = '', 
  size = 40, 
  color = '#ffbd59', // Extracted yellow from logo SVGs
  glow = false,
  animated = false
}) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ 
        width: size, 
        height: size,
        filter: glow ? `drop-shadow(0 0 12px ${color}80)` : 'none'
      }}
    >
      <svg
        viewBox="0 0 162 161"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Double right-pointing chevrons - Official graphic math path */}
        {animated ? (
          <>
            <motion.path
              d="M 77.375 -40.421875 L 7.21875 -102.390625 L 7.21875 -71.125 L 42.234375 -40.703125 L 7.21875 -10 L 7.21875 20.984375 Z"
              transform="translate(1.341592, 111.251994)"
              fill={color}
              animate={{ opacity: [0, 1, 1, 0, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                times: [0, 0.15, 0.55, 0.7, 1],
                ease: "easeInOut"
              }}
            />
            <motion.path
              d="M 77.375 -40.421875 L 7.21875 -102.390625 L 7.21875 -71.125 L 42.234375 -40.703125 L 7.21875 -10 L 7.21875 20.984375 Z"
              transform="translate(81.221103, 111.251994)"
              fill={color}
              animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                times: [0, 0.15, 0.3, 0.7, 0.85, 1],
                ease: "easeInOut"
              }}
            />
          </>
        ) : (
          <>
            <path
              d="M 77.375 -40.421875 L 7.21875 -102.390625 L 7.21875 -71.125 L 42.234375 -40.703125 L 7.21875 -10 L 7.21875 20.984375 Z"
              transform="translate(1.341592, 111.251994)"
              fill={color}
            />
            <path
              d="M 77.375 -40.421875 L 7.21875 -102.390625 L 7.21875 -71.125 L 42.234375 -40.703125 L 7.21875 -10 L 7.21875 20.984375 Z"
              transform="translate(81.221103, 111.251994)"
              fill={color}
            />
          </>
        )}
      </svg>
    </div>
  );
};

export const HasteWordmark: React.FC<{ className?: string, light?: boolean, sizeClass?: string, color?: string }> = ({ 
  className = '', 
  light = false,
  sizeClass = 'text-xl md:text-2xl',
  color
}) => {
  return (
    <div className={`flex items-center font-sans select-none ${className}`}>
      <span 
        className={`font-[900] tracking-[0.05em] uppercase ${sizeClass} ${color ? '' : (light ? 'text-white' : 'text-[#1C1917] hover:text-[#C5A059] transition-colors')}`}
        style={color ? { color } : undefined}
      >
        HASTE
      </span>
    </div>
  );
};

export const HasteFullLogo: React.FC<{ size?: number; light?: boolean; logoGlow?: boolean; wordmarkSizeClass?: string; color?: string }> = ({ 
  size = 32, 
  light = false,
  logoGlow = false,
  wordmarkSizeClass = 'text-lg md:text-xl',
  color
}) => {
  return (
    <div className="flex items-center gap-3">
      <HasteSymbol size={size} glow={logoGlow} color="#ffbd59" />
      <HasteWordmark light={light} sizeClass={wordmarkSizeClass} color={color} />
    </div>
  );
};
