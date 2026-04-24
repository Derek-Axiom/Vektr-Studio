import { cn } from '../../lib/utils';
import React, { useEffect, useRef } from 'react';

export type AmbientMode = 'focus' | 'flow' | 'off';

interface Props {
  mode: AmbientMode;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

export function AmbientBackground({ mode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (mode === 'off' || !mode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Performance optimization: alpha: false reduces blending overhead
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Heavy downscale for performance. We rely on CSS blur (100px) for the soft look.
    const DOWNSCALE = 6;

    const resize = () => {
      canvas.width = window.innerWidth / DOWNSCALE;
      canvas.height = window.innerHeight / DOWNSCALE;
    };

    window.addEventListener('resize', resize);
    resize();

    const palettes: Record<AmbientMode, RGB[]> = {
      focus: [
        { r: 231, g: 229, b: 228 }, // stone-200
        { r: 245, g: 245, b: 244 }, // stone-100
        { r: 214, g: 211, b: 209 }  // stone-300
      ],
      flow: [
        { r: 212, g: 212, b: 216 }, // zinc-300
        { r: 228, g: 228, b: 231 }, // zinc-200
        { r: 214, g: 211, b: 209 }  // stone-300
      ],
      off: []
    };

    const settingsMap = {
      focus: { speed: 0.0002, orbs: 2, bg: '#fafaf9', scale: 1.5, opacity: 0.15 },
      flow: { speed: 0.0008, orbs: 3, bg: '#f5f5f4', scale: 1.2, opacity: 0.40 },
      off: { speed: 0, orbs: 0, bg: '#ffffff', scale: 0, opacity: 0 }
    };

    const settings = settingsMap[mode];
    const palette = palettes[mode];

    const draw = () => {
      const breathingModifier = 0;
      time += settings.speed;

      ctx.fillStyle = settings.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const minDim = Math.min(w, h);

      palette.slice(0, settings.orbs).forEach((color, i) => {
        // Organic, non-repeating orbital math
        const cx = w * (0.5 + Math.sin(time + i * 2.1) * 0.4 + Math.cos(time * 0.4 + i) * 0.2);
        const cy = h * (0.5 + Math.cos(time * 0.8 + i * 1.7) * 0.4 + Math.sin(time * 0.3 + i) * 0.2);

        const baseRadius = minDim * settings.scale;
        const radius = baseRadius * (0.8 + Math.sin(time * 0.5 + i) * 0.2 + breathingModifier);

        if (radius <= 0) return;

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${settings.opacity})`);
        gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "fixed inset-0 pointer-events-none -z-10 w-full h-full transition-opacity duration-1000 ease-in-out",
        mode === 'off' ? 'opacity-0' : (mode === 'focus' ? 'opacity-80' : 'opacity-100')
      )}
      style={{
        filter: 'blur(100px)',
        transform: 'scale(1.25)'
      }}
    />
  );
}
