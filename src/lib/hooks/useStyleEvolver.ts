/**
 * useStyleEvolver.ts
 * 
 * Thin React wrapper over the window.StyleEvolver singleton.
 * Guards against missing global injection and provides a typed interface
 * to bridge React state (like VektrLab sliders) into the physical CSS variables.
 */

export function useStyleEvolver() {
  const evolveMatrix = (cssState: Record<string, number>) => {
    const styleEvolver = (window as any).StyleEvolver;
    if (styleEvolver && typeof styleEvolver.evolveMatrix === 'function') {
      styleEvolver.evolveMatrix(cssState);
    } else {
      console.warn('useStyleEvolver: window.StyleEvolver singleton not found or evolveMatrix missing.');
    }
  };

  const readCurrentState = (): Record<string, string> => {
    const styleEvolver = (window as any).StyleEvolver;
    if (styleEvolver && typeof styleEvolver.readCurrentState === 'function') {
      return styleEvolver.readCurrentState();
    }
    return {};
  };

  return {
    evolveMatrix,
    readCurrentState
  };
}
