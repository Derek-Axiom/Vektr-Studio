/**
 * Sampler Intelligence Engine
 * 
 * Auto-detects loops, samples, and stems based on audio characteristics.
 * Provides smart categorization and BPM-matched playback.
 */

export type SampleType = 'loop' | 'one-shot' | 'stem' | 'full-track';
export type StemCategory = 'drums' | 'bass' | 'melody' | 'vocals' | 'fx' | 'unknown';

export interface SampleAnalysis {
  type: SampleType;
  stemCategory?: StemCategory;
  isLooping: boolean;
  loopPoints?: { start: number; end: number };
  bpm?: number;
  key?: string;
  confidence: number; // 0-1
  characteristics: {
    duration: number;
    hasTransients: boolean;
    frequencyRange: { low: number; mid: number; high: number };
    energyProfile: number[]; // Energy over time
    spectralDensity: number; // How "full" the frequency spectrum is
  };
}

/**
 * Analyze audio buffer to determine sample type and characteristics
 */
export async function analyzeSample(audioBuffer: AudioBuffer): Promise<SampleAnalysis> {
  const duration = audioBuffer.duration;
  const sampleRate = audioBuffer.sampleRate;
  const channelData = audioBuffer.getChannelData(0);
  
  // 1. Determine sample type based on duration
  const type = classifySampleType(duration);
  
  // 2. Detect if it's looping
  const loopAnalysis = detectLoop(channelData, sampleRate);
  
  // 3. Analyze frequency content
  const freqAnalysis = analyzeFrequencyContent(audioBuffer);
  
  // 4. Detect transients (for drum/percussion detection)
  const transientAnalysis = detectTransients(channelData, sampleRate);
  
  // 5. Analyze energy profile
  const energyProfile = analyzeEnergyProfile(channelData, sampleRate);
  
  // 6. Determine stem category if applicable
  const stemCategory = classifyStemCategory(freqAnalysis, transientAnalysis, duration);
  
  // 7. Calculate confidence score
  const confidence = calculateConfidence(type, loopAnalysis, freqAnalysis, transientAnalysis);
  
  return {
    type,
    stemCategory: type === 'stem' ? stemCategory : undefined,
    isLooping: loopAnalysis.isLoop,
    loopPoints: loopAnalysis.loopPoints,
    confidence,
    characteristics: {
      duration,
      hasTransients: transientAnalysis.count > 0,
      frequencyRange: freqAnalysis,
      energyProfile,
      spectralDensity: freqAnalysis.density,
    },
  };
}

/**
 * Classify sample type based on duration
 */
function classifySampleType(duration: number): SampleType {
  if (duration < 1) {
    return 'one-shot'; // Very short samples (kicks, snares, etc.)
  } else if (duration < 8) {
    return 'loop'; // Short, likely looping samples
  } else if (duration < 30) {
    return 'stem'; // Medium length, likely a stem or section
  } else {
    return 'full-track'; // Long, likely a full track
  }
}

/**
 * Detect if audio is looping by analyzing waveform similarity
 */
function detectLoop(
  data: Float32Array,
  sampleRate: number
): { isLoop: boolean; loopPoints?: { start: number; end: number } } {
  const duration = data.length / sampleRate;
  
  // Only check for loops in short samples
  if (duration > 8) {
    return { isLoop: false };
  }
  
  // Common loop lengths in seconds
  const commonLoopLengths = [1, 2, 4, 8];
  
  for (const loopLength of commonLoopLengths) {
    const loopSamples = Math.floor(loopLength * sampleRate);
    
    if (loopSamples > data.length / 2) continue;
    
    // Compare first loop with second loop
    const firstLoop = data.slice(0, loopSamples);
    const secondLoop = data.slice(loopSamples, loopSamples * 2);
    
    if (secondLoop.length < loopSamples) continue;
    
    // Calculate correlation
    const correlation = calculateCorrelation(firstLoop, secondLoop);
    
    if (correlation > 0.85) {
      return {
        isLoop: true,
        loopPoints: { start: 0, end: loopLength },
      };
    }
  }
  
  return { isLoop: false };
}

/**
 * Calculate correlation between two arrays
 */
function calculateCorrelation(a: Float32Array, b: Float32Array): number {
  const length = Math.min(a.length, b.length);
  let sum = 0;
  let sumA = 0;
  let sumB = 0;
  
  for (let i = 0; i < length; i++) {
    sum += a[i] * b[i];
    sumA += a[i] * a[i];
    sumB += b[i] * b[i];
  }
  
  return sum / Math.sqrt(sumA * sumB);
}

/**
 * Analyze frequency content using FFT
 */
function analyzeFrequencyContent(audioBuffer: AudioBuffer): {
  low: number;
  mid: number;
  high: number;
  density: number;
} {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  
  // Use a window from the middle of the sample
  const windowSize = 2048;
  const start = Math.floor((channelData.length - windowSize) / 2);
  const window = channelData.slice(start, start + windowSize);
  
  // Simple FFT approximation using bins
  const fft = performFFT(window);
  
  // Frequency ranges (Hz)
  const lowRange = [20, 250];    // Sub-bass and bass
  const midRange = [250, 4000];  // Mids
  const highRange = [4000, 20000]; // Highs
  
  const binSize = sampleRate / windowSize;
  
  let lowEnergy = 0;
  let midEnergy = 0;
  let highEnergy = 0;
  let totalEnergy = 0;
  let nonZeroBins = 0;
  
  for (let i = 0; i < fft.length / 2; i++) {
    const freq = i * binSize;
    const magnitude = Math.sqrt(fft[i] * fft[i]);
    
    totalEnergy += magnitude;
    if (magnitude > 0.01) nonZeroBins++;
    
    if (freq >= lowRange[0] && freq < lowRange[1]) {
      lowEnergy += magnitude;
    } else if (freq >= midRange[0] && freq < midRange[1]) {
      midEnergy += magnitude;
    } else if (freq >= highRange[0] && freq < highRange[1]) {
      highEnergy += magnitude;
    }
  }
  
  // Normalize
  const total = lowEnergy + midEnergy + highEnergy;
  const density = nonZeroBins / (fft.length / 2);
  
  return {
    low: total > 0 ? (lowEnergy / total) * 100 : 0,
    mid: total > 0 ? (midEnergy / total) * 100 : 0,
    high: total > 0 ? (highEnergy / total) * 100 : 0,
    density,
  };
}

/**
 * Simple FFT implementation (for demonstration - use a proper FFT library in production)
 */
function performFFT(data: Float32Array): Float32Array {
  // This is a simplified version - in production, use a proper FFT library like fft.js
  const n = data.length;
  const result = new Float32Array(n);
  
  for (let k = 0; k < n; k++) {
    let real = 0;
    let imag = 0;
    
    for (let t = 0; t < n; t++) {
      const angle = (2 * Math.PI * k * t) / n;
      real += data[t] * Math.cos(angle);
      imag -= data[t] * Math.sin(angle);
    }
    
    result[k] = Math.sqrt(real * real + imag * imag);
  }
  
  return result;
}

/**
 * Detect transients (sudden amplitude changes)
 */
function detectTransients(
  data: Float32Array,
  sampleRate: number
): { count: number; positions: number[] } {
  const windowSize = Math.floor(sampleRate * 0.01); // 10ms window
  const threshold = 0.3; // Amplitude threshold
  
  const positions: number[] = [];
  let lastTransient = -windowSize * 2;
  
  for (let i = windowSize; i < data.length - windowSize; i++) {
    // Calculate local energy
    let energy = 0;
    for (let j = i - windowSize; j < i + windowSize; j++) {
      energy += Math.abs(data[j]);
    }
    energy /= windowSize * 2;
    
    // Check for sudden increase
    if (energy > threshold && i - lastTransient > windowSize) {
      positions.push(i / sampleRate);
      lastTransient = i;
    }
  }
  
  return {
    count: positions.length,
    positions,
  };
}

/**
 * Analyze energy profile over time
 */
function analyzeEnergyProfile(data: Float32Array, sampleRate: number): number[] {
  const segmentCount = 32; // Divide into 32 segments
  const segmentSize = Math.floor(data.length / segmentCount);
  const profile: number[] = [];
  
  for (let i = 0; i < segmentCount; i++) {
    const start = i * segmentSize;
    const end = Math.min(start + segmentSize, data.length);
    
    let energy = 0;
    for (let j = start; j < end; j++) {
      energy += data[j] * data[j];
    }
    energy = Math.sqrt(energy / (end - start));
    
    profile.push(energy);
  }
  
  return profile;
}

/**
 * Classify stem category based on frequency and transient analysis
 */
function classifyStemCategory(
  freqAnalysis: { low: number; mid: number; high: number },
  transientAnalysis: { count: number },
  duration: number
): StemCategory {
  const { low, mid, high } = freqAnalysis;
  const transientDensity = transientAnalysis.count / duration;
  
  // Drums: High transient density, balanced frequency
  if (transientDensity > 5 && low > 20 && mid > 20) {
    return 'drums';
  }
  
  // Bass: Dominant low frequencies
  if (low > 60 && mid < 30) {
    return 'bass';
  }
  
  // Vocals: Dominant mid frequencies, moderate highs
  if (mid > 50 && high > 20 && low < 30) {
    return 'vocals';
  }
  
  // Melody: Balanced mid-high, low transients
  if (mid > 30 && high > 30 && transientDensity < 3) {
    return 'melody';
  }
  
  // FX: High frequencies, sparse transients
  if (high > 50 && transientDensity < 2) {
    return 'fx';
  }
  
  return 'unknown';
}

/**
 * Calculate confidence score for the analysis
 */
function calculateConfidence(
  type: SampleType,
  loopAnalysis: { isLoop: boolean },
  freqAnalysis: { density: number },
  transientAnalysis: { count: number }
): number {
  let confidence = 0.5; // Base confidence
  
  // Increase confidence based on clear indicators
  if (type === 'one-shot' && transientAnalysis.count <= 3) {
    confidence += 0.2;
  }
  
  if (type === 'loop' && loopAnalysis.isLoop) {
    confidence += 0.3;
  }
  
  if (freqAnalysis.density > 0.3) {
    confidence += 0.1; // Clear frequency content
  }
  
  if (freqAnalysis.density < 0.1) {
    confidence -= 0.2; // Very sparse, uncertain
  }
  
  return Math.min(1, Math.max(0, confidence));
}

/**
 * Get recommended playback settings for a sample
 */
export function getPlaybackSettings(analysis: SampleAnalysis, targetBPM?: number): {
  playbackRate: number;
  loop: boolean;
  loopStart?: number;
  loopEnd?: number;
} {
  const settings = {
    playbackRate: 1,
    loop: analysis.isLooping,
    loopStart: analysis.loopPoints?.start,
    loopEnd: analysis.loopPoints?.end,
  };
  
  // Adjust playback rate for BPM matching
  if (targetBPM && analysis.bpm) {
    settings.playbackRate = targetBPM / analysis.bpm;
  }
  
  return settings;
}

/**
 * Auto-categorize uploaded samples
 */
export async function categorizeSample(file: File): Promise<{
  category: string;
  subcategory?: string;
  tags: string[];
}> {
  // Decode audio
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new OfflineAudioContext(2, 44100 * 30, 44100);
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  // Analyze
  const analysis = await analyzeSample(audioBuffer);
  
  // Determine category
  let category = 'Samples';
  let subcategory: string | undefined;
  const tags: string[] = [];
  
  if (analysis.type === 'stem') {
    category = 'Stems';
    subcategory = analysis.stemCategory;
    tags.push('stem', analysis.stemCategory || 'unknown');
  } else if (analysis.type === 'loop') {
    category = 'Samples';
    subcategory = 'Loops';
    tags.push('loop');
    
    if (analysis.loopPoints) {
      tags.push(`${analysis.loopPoints.end}bar`);
    }
  } else if (analysis.type === 'one-shot') {
    category = 'Samples';
    subcategory = 'One-Shots';
    tags.push('one-shot');
    
    if (analysis.stemCategory === 'drums') {
      tags.push('drum', 'percussion');
    }
  }
  
  // Add frequency tags
  const { low, mid, high } = analysis.characteristics.frequencyRange;
  if (low > 50) tags.push('bass-heavy');
  if (mid > 50) tags.push('mid-forward');
  if (high > 50) tags.push('bright');
  
  // Add confidence tag
  if (analysis.confidence > 0.8) {
    tags.push('verified');
  }
  
  return {
    category,
    subcategory,
    tags,
  };
}
