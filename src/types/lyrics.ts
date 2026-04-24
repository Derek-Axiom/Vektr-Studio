export interface LyricLine {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
}

export interface LyricSection {
  id: string;
  type: string;
  label: string;
  lines: LyricLine[];
}

export interface LyricBook {
  id: string;
  trackId: string;
  title: string;
  content: string;
  syncLines?: LyricLine[];
  updatedAt: number;
}
