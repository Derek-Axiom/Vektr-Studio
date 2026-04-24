/**
 * useAtmosphere - Environment CSS Variable Bridge
 *
 * Extracted from: src/external/ere-keep/StyleEvolver.js
 *
 * What was stripped (bloat):
 *   - HeuristicCore 6-axis vector math (analyze, build, express, etc.)
 *   - calculateTemperature() (weighted W1/W2 linguistic + kinetic formula)
 *   - Tier Gating system (_tiers, _exponentialVars, requiredTier checks)
 *   - Morphological Engine (_isMorphing, morph lock, setTimeout drift)
 *   - KineticTracker / EPS normalization
 *   - applyDecayTick() / 24h recurrence decay
 *   - _baselines cache / delta interpolation math
 *   - window.StyleEvolver singleton pattern
 *   - All console.log identity branding
 *
 * What was kept (CSS Bridge only):
 *   - requestAnimationFrame batching (prevents layout thrash)
 *   - document.documentElement.style.setProperty() writes
 *   - --accent-glow linear map (0px → 20px)
 *   - --color-saturation linear map (40% → 100%)
 *   - --motion-scale linear map (0.8 → 2.0)
 *   - --active-ease cubic-bezier switch at 0.7 threshold
 *
 * Usage:
 *   useAtmosphere(amplitude); // 0.0 to 1.0 from useResonance or any signal
 */
import { useEffect } from 'react';

export function useAtmosphere(intensity: number) {
  useEffect(() => {
    // Clamp - never let bad input corrupt the UI
    const clamped = Math.min(1, Math.max(0, intensity));

    // Batch all DOM writes into one rAF - zero layout thrash
    const rafId = requestAnimationFrame(() => {
      const r = document.documentElement;

      // --accent-glow: 0px (silent) → 20px (full signal)
      const glow = Math.round(clamped * 20);
      r.style.setProperty('--accent-glow', `${glow}px`);

      // --color-saturation: 40% (resting) → 100% (full signal)
      const saturation = 40 + (clamped * 60);
      r.style.setProperty('--color-saturation', `${saturation.toFixed(1)}%`);

      // --motion-scale: 0.8x (calm) → 2.0x (energized)
      const motionScale = 0.8 + (clamped * 1.2);
      r.style.setProperty('--motion-scale', motionScale.toFixed(3));

      // --active-ease: smooth below 0.7, elastic spring above
      const easing = clamped > 0.7
        ? 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' // Elastic
        : 'ease-out';
      r.style.setProperty('--active-ease', easing);
    });

    return () => cancelAnimationFrame(rafId);
  }, [intensity]);
}

