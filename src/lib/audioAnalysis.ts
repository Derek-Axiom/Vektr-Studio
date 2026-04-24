/**
 * ART_EuclideanOnsetter (Vocal Transient Analysis Engine)
 * This utility analyzes the mathematical amplitude envelope of an AudioBuffer 
 * to detect high-energy onsets (transients) suitable for lyric syncopation.
 */

export interface Onset {
  time: number;
  magnitude: number;
}

export async function detectVocalOnsets(audioBuffer: AudioBuffer): Promise<Onset[]> {
  const data = audioBuffer.getChannelData(0); // Analyze mono for speed
  const sampleRate = audioBuffer.sampleRate;
  
  // Step 1: Energy Envelope (Root Mean Square)
  const windowSize = Math.floor(sampleRate * 0.05); // 50ms window
  const hopSize = Math.floor(sampleRate * 0.02);   // 20ms hop
  const energy: number[] = [];
  
  for (let i = 0; i < data.length - windowSize; i += hopSize) {
    let sum = 0;
    for (let j = 0; j < windowSize; j++) {
      sum += data[i + j] * data[i + j];
    }
    energy.push(Math.sqrt(sum / windowSize));
  }
  
  // Step 2: Flux Analysis (Differential Energy)
  const flux: number[] = [0];
  for (let i = 1; i < energy.length; i++) {
    flux.push(Math.max(0, energy[i] - energy[i - 1]));
  }
  
  // Step 3: Peak Picking (Local Maxima above dynamic threshold)
  const onsets: Onset[] = [];
  const meanFlux = flux.reduce((a, b) => a + b, 0) / flux.length;
  const thresholdMultiplier = 1.5;
  
  for (let i = 1; i < flux.length - 1; i++) {
    if (flux[i] > flux[i - 1] && flux[i] > flux[i + 1] && flux[i] > meanFlux * thresholdMultiplier) {
      onsets.push({
        time: (i * hopSize) / sampleRate,
        magnitude: flux[i]
      });
    }
  }
  
  return onsets;
}

/**
 * Heuristic Syllabic Aligner
 * Maps lines of text to the most probable transient seeds based on track duration.
 */
export function alignLyricsToOnsets(content: string, onsets: Onset[], duration: number): any[] {
  const lines = content.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('['));
    
  if (lines.length === 0 || onsets.length === 0) return [];
  
  const synchronized: any[] = [];
  
  // Crude but effective distribution for Alpha proof:
  // We match lines to onsets by partitioning the onset array.
  const onsetsPerLine = Math.floor(onsets.length / lines.length);
  
  lines.forEach((text, i) => {
    const onsetIdx = Math.min(i * onsetsPerLine, onsets.length - 1);
    const startTime = onsets[onsetIdx].time;
    const nextOnsetIdx = Math.min((i + 1) * onsetsPerLine, onsets.length - 1);
    const endTime = i === lines.length - 1 ? duration : onsets[nextOnsetIdx].time;
    
    synchronized.push({
      id: `line-${i}-${Date.now()}`,
      text,
      startTime,
      endTime
    });
  });
  
  return synchronized;
}
