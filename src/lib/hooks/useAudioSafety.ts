import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Soft-Start Gain Ramp ─────────────────────────────────────────────────────
//
// Schedules a linear gain ramp from 0 to targetGain over rampDuration seconds.
// Use when activating live monitoring or playback to prevent sudden gain spikes
// that can damage hearing or speakers - especially critical without headphones.
//
// Usage:
//   const monGain = ctx.createGain();
//   softStartGain(ctx, monGain, 1.0, 2.0);
//   source.connect(monGain);
//   monGain.connect(ctx.destination);

export function softStartGain(
  ctx: AudioContext,
  gainNode: GainNode,
  targetGain: number = 1.0,
  rampDuration: number = 2.0
): void {
  const now = ctx.currentTime;
  // Anchor at silence, then ramp linearly to target over duration.
  // Uses setValueAtTime first to establish a precise start point -
  // without it, linearRamp would ramp from the current scheduled value
  // which may produce an instant jump on some implementations.
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(targetGain, now + rampDuration);
}

// ─── Headphone Keywords ───────────────────────────────────────────────────────
//
// Matched against AudioOutputDevice labels returned by enumerateDevices().
// Labels are only populated after getUserMedia() permission grant.

const HEADPHONE_KEYWORDS = [
  'headphone',
  'headset',
  'earphone',
  'earbud',
  'in-ear',
  'airpod',
  'airpods',
  'buds',
  'bluetooth',
  'earpiece',
  'wired',
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export type HeadphoneStatus = 'detected' | 'not_detected' | 'unknown';

export interface UseAudioSafetyReturn {
  /** Current headphone detection status. 'unknown' until first check. */
  headphoneStatus: HeadphoneStatus;
  /**
   * Run an active enumerateDevices() check.
   * Call this AFTER getUserMedia() has been granted so device labels are
   * populated. Returns true if headphones are detected.
   */
  checkHeadphones: () => Promise<boolean>;
}

/**
 * useAudioSafety
 *
 * Provides headphone presence detection via enumerateDevices().
 * Automatically re-checks when audio hardware changes (devicechange event).
 *
 * This hook is audio-hardware-aware - it does NOT require mic access itself.
 * Pair with softStartGain() when activating monitoring to ensure safe gain
 * ramping regardless of output device type.
 */
export function useAudioSafety(): UseAudioSafetyReturn {
  const [headphoneStatus, setHeadphoneStatus] = useState<HeadphoneStatus>('unknown');
  const lastCheckRef = useRef<boolean | null>(null);

  const checkHeadphones = useCallback(async (): Promise<boolean> => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      // API not available (e.g. insecure context) - assume worst case
      setHeadphoneStatus('not_detected');
      return false;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioOutputs = devices.filter((d) => d.kind === 'audiooutput');

      const detected = audioOutputs.some((device) => {
        const label = device.label.toLowerCase();
        return HEADPHONE_KEYWORDS.some((kw) => label.includes(kw));
      });

      lastCheckRef.current = detected;
      setHeadphoneStatus(detected ? 'detected' : 'not_detected');
      return detected;
    } catch (err) {
      console.warn('useAudioSafety: enumerateDevices() failed.', err);
      setHeadphoneStatus('unknown');
      return false;
    }
  }, []);

  // Re-check automatically when audio hardware changes (USB, Bluetooth, etc.)
  useEffect(() => {
    if (!navigator.mediaDevices?.addEventListener) return;

    const handleDeviceChange = () => {
      // Only re-check if we've already performed at least one check
      // (i.e. we have mic permission and labels are populated)
      if (lastCheckRef.current !== null) {
        checkHeadphones();
      }
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [checkHeadphones]);

  return { headphoneStatus, checkHeadphones };
}

