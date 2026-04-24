export type AspectRatio = '16:9' | '9:16' | '1:1';
export type ExportQuality = '720p' | '1080p' | '4K';

export interface ExportMode {
  ratio: AspectRatio;
  label: string;
  width: number;
  height: number;
  icon: string;
}

export interface VisualizerTemplate {
  id: string;
  name: string;
  previewUrl: string;
  aspectRatio: AspectRatio;
}

export interface SessionState {
  trackName: string;
  artistName: string;
  bpm: number | null;
  duration: number;
  isPlaying: boolean;
  currentTime: number;
}
