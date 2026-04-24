import type { ExportMode } from '../types/studio';

export const EXPORT_MODES: ExportMode[] = [
  { ratio: '9:16', label: 'Story / Reel', width: 1080, height: 1920, icon: '📱' },
  { ratio: '1:1', label: 'Square Post', width: 1080, height: 1080, icon: '⬜' },
  { ratio: '16:9', label: 'Widescreen', width: 1920, height: 1080, icon: '🖥' },
];

export const DEMO_LYRICS: Array<{ id: string; time: number; text: string; isActive: boolean }> = [
  { id: 'l1', time: 0, text: '', isActive: false },
  { id: 'l2', time: 4.2, text: 'Running through the static', isActive: false },
  { id: 'l3', time: 8.1, text: 'Signals in the night', isActive: false },
  { id: 'l4', time: 12.5, text: 'Every frequency a memory', isActive: false },
  { id: 'l5', time: 16.8, text: 'Tuned to the right light', isActive: false },
  { id: 'l6', time: 21.0, text: 'We are the broadcast', isActive: false },
  { id: 'l7', time: 25.3, text: 'Breaking through the wall', isActive: false },
  { id: 'l8', time: 30.0, text: 'Transmission never ending', isActive: false },
  { id: 'l9', time: 34.5, text: 'I hear you through it all', isActive: false },
];

export const DEMO_SESSION = {
  trackName: 'Transmission_v3_master',
  artistName: 'VEKTR',
  bpm: 128,
  duration: 214,
  isPlaying: false,
  currentTime: 0,
};
