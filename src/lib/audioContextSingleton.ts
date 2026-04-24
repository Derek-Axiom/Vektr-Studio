/**
 * audioContextSingleton - Global AudioContext Registry
 *
 * Enforces a single AudioContext instance across the entire application.
 * All modules that need an AudioContext must route through this module
 * rather than calling new window.AudioContext() directly.
 *
 * Architecture:
 * - useOmniRack is the PRIMARY initializer. It calls getOrCreateGlobalAudioContext()
 *   on its first useEffect, which creates the context at LOCKED_SAMPLE_RATE.
 * - All other modules call getOrCreateGlobalAudioContext() to get the same instance.
 *   If called before useOmniRack has initialized, they get a fresh context at
 *   LOCKED_SAMPLE_RATE, which useOmniRack will then find and adopt.
 * - No module should ever call new window.AudioContext() directly.
 */

import { LOCKED_SAMPLE_RATE } from './useOmniRack';

let _singleton: AudioContext | null = null;

/**
 * Returns the current global AudioContext, or null if not yet initialized.
 * Use this for read-only access in modules that should not create a context.
 */
export function getGlobalAudioContext(): AudioContext | null {
  return _singleton && _singleton.state !== 'closed' ? _singleton : null;
}

/**
 * Returns the global AudioContext, creating it if necessary.
 * All AudioContext creation MUST go through this function.
 * Creates at LOCKED_SAMPLE_RATE to guarantee consistency across all nodes.
 */
export function getOrCreateGlobalAudioContext(): AudioContext {
  if (!_singleton || _singleton.state === 'closed') {
    _singleton = new window.AudioContext({ sampleRate: LOCKED_SAMPLE_RATE });
  }
  return _singleton;
}

/**
 * Called by useOmniRack to formally register the canonical context
 * after it has been created and fully initialized with the DSP chain.
 * If a different context was previously registered (race condition),
 * the old one is closed silently.
 */
export function registerGlobalAudioContext(ctx: AudioContext): void {
  if (_singleton && _singleton !== ctx && _singleton.state !== 'closed') {
    console.warn(
      'audioContextSingleton: Closing duplicate AudioContext. ' +
      'All modules must use getOrCreateGlobalAudioContext().'
    );
    _singleton.close().catch(() => {});
  }
  _singleton = ctx;
}

