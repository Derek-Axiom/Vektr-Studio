import React from 'react';
import { motion } from 'motion/react';

export default function VektrLogo() {
  return (
    <div
      style={{
        position: 'relative',
        width: 240,
        height: 240,
        display: 'grid',
        placeItems: 'center',
        isolation: 'isolate',
      }}
      aria-label="VEKTR Studio logo"
      className="mb-8"
    >
      <motion.div
        style={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: 999,
          background:
            'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(120,160,255,0.12) 35%, rgba(120,160,255,0.05) 55%, rgba(120,160,255,0) 75%)',
          filter: 'blur(24px)',
          zIndex: 1,
        }}
        animate={{
          scale: [0.96, 1.1, 0.96],
          opacity: [0.45, 0.82, 0.45],
        }}
        transition={{
          duration: 3.2,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      />

      <motion.img
        src="/logo.png"
        alt="VEKTR Studio Centerpiece Logo"
        style={{
          width: 190,
          height: 190,
          zIndex: 2,
          filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.18))',
          objectFit: 'contain'
        }}
        animate={{
          scale: [1, 1.025, 1],
          opacity: [0.98, 1, 0.98],
        }}
        transition={{
          duration: 3.2,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      />
    </div>
  );
}
