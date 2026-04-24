import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useWakeLock - Screen Wake Lock for Active Sessions
 *
 * Prevents the OS from dimming or locking the screen while a recording or
 * critical audio session is active. Essential on Android where the OS will
 * suspend the browser tab (and kill the audio engine) after idle timeout.
 *
 * Architecture:
 * - Uses navigator.wakeLock.request('screen') - the W3C Screen Wake Lock API.
 * - The browser auto-releases the sentinel when the document becomes hidden
 *   (tab backgrounded, screen off). The visibilitychange listener re-acquires
 *   it when the user returns to the page, so long as the session still wants
 *   the lock (tracked via wantedRef to avoid stale closure issues).
 * - Falls back silently on unsupported browsers or when battery saver is on.
 *
 * Usage:
 *   const { wakeLockActive, acquireWakeLock, releaseWakeLock } = useWakeLock();
 *   // Call acquireWakeLock() when recording starts.
 *   // Call releaseWakeLock() when recording stops.
 */
export function useWakeLock() {
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  // Tracks intent - separate from sentinelRef which tracks actual API state.
  // Prevents stale closures in the visibilitychange handler.
  const wantedRef = useRef(false);

  const acquireWakeLock = useCallback(async (): Promise<void> => {
    // Bail silently on unsupported environments (HTTP, older browsers)
    if (!('wakeLock' in navigator)) return;

    // Idempotent - don't double-acquire
    if (sentinelRef.current) return;

    wantedRef.current = true;

    try {
      const sentinel = await (navigator as Navigator & {
        wakeLock: { request: (type: string) => Promise<WakeLockSentinel> };
      }).wakeLock.request('screen');

      sentinelRef.current = sentinel;
      setWakeLockActive(true);

      // The sentinel fires 'release' when the OS forces a release
      // (screen off, tab hidden, battery saver, power event).
      sentinel.addEventListener('release', () => {
        sentinelRef.current = null;
        setWakeLockActive(false);
        // Note: wantedRef.current stays true so the visibilitychange
        // handler can re-acquire when the user returns.
      });
    } catch (err) {
      // Common reasons: battery saver active, user agent denies, document hidden.
      // Non-fatal - recording continues without wake lock protection.
      console.warn('useWakeLock: Could not acquire screen wake lock.', err);
      wantedRef.current = false;
    }
  }, []);

  const releaseWakeLock = useCallback(async (): Promise<void> => {
    wantedRef.current = false;

    if (sentinelRef.current) {
      try {
        await sentinelRef.current.release();
      } catch {
        // Sentinel may already be released by system events
      }
      sentinelRef.current = null;
      setWakeLockActive(false);
    }
  }, []);

  // Re-acquire the wake lock when the document regains visibility.
  // The browser always releases the sentinel on document.hidden - this
  // handler restores it transparently so long as the session wants it.
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (
        document.visibilityState === 'visible' &&
        wantedRef.current &&
        !sentinelRef.current
      ) {
        await acquireWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [acquireWakeLock]);

  // Release on scope cleanup (component unmount or hook re-initialization).
  useEffect(() => {
    return () => {
      if (sentinelRef.current) {
        sentinelRef.current.release().catch(() => {});
        sentinelRef.current = null;
      }
      wantedRef.current = false;
    };
  }, []);

  return { wakeLockActive, acquireWakeLock, releaseWakeLock };
}

