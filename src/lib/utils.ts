// Internal zero-dependency class name merger.
// No clsx, no tailwind-merge - we own this.

type ClassValue = string | undefined | null | false | ClassValue[];

function flatten(val: ClassValue): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.flatMap(flatten);
  return [val as string];
}

// Merge Tailwind classes: last conflicting utility wins.
function twMerge(classes: string[]): string {
  const result: Record<string, string> = {};
  for (const cls of classes) {
    // Extract the "prefix" (everything before the last dash-segment value)
    const dash = cls.lastIndexOf('-');
    const prefix = dash > 0 ? cls.slice(0, dash) : cls;
    result[prefix] = cls;
  }
  return Object.values(result).join(' ');
}

export function cn(...inputs: ClassValue[]): string {
  const classes = flatten(inputs)
    .join(' ')
    .split(' ')
    .filter(Boolean);
  return twMerge(classes);
}

/**
 * Reads an image file and crushes it into a small Base64 string.
 * Used for avatars and thumbnails to prevent storage bloating
 * while ensuring permanence (bypassing temporary Blob URLs).
 */
export function resizeImageToBase64(file: File, maxSize: number = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(e.target?.result as string);
        
        ctx.drawImage(img, 0, 0, width, height);
        // Force high-compression JPEG to save IndexedDB space
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => reject('Image load failed');
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject('File read failed');
    reader.readAsDataURL(file);
  });
}

/**
 * Encodes a WebAudio AudioBuffer into a strict PCM WAV Blob.
 * Used for exporting rendered DSP output (Phase 3 True Rendering).
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const samples = buffer.length;
  
  const blockAlign = numChannels * (bitDepth / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples * blockAlign;
  const bufferSize = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  
  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  
  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < samples; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      let sample = buffer.getChannelData(channel)[i];
      // Hard clip bounds
      sample = Math.max(-1, Math.min(1, sample));
      // Convert 32-bit float to 16-bit PCM integer
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}

/**
 * Encodes accumulated raw 32-bit float PCM chunks directly into an IEEE 754
 * float WAV blob (format type 3). No intermediate AudioBuffer required.
 *
 * Used by the AudioWorklet recording path. Produces a lossless, uncompressed
 * WAV that preserves full 32-bit dynamic range from the DSP chain output.
 */
export function encodeFloat32Wav(chunks: Float32Array[], sampleRate: number): Blob {
  const totalSamples = chunks.reduce((sum, c) => sum + c.length, 0);
  const numChannels = 1; // Mono capture
  const bytesPerSample = 4;
  const dataSize = totalSamples * numChannels * bytesPerSample;
  const bufferSize = 44 + dataSize;
  const ab = new ArrayBuffer(bufferSize);
  const view = new DataView(ab);

  const write = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  write(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  write(8, 'WAVE');
  write(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 3, true);             // IEEE_FLOAT format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, 32, true);
  write(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (const chunk of chunks) {
    for (let i = 0; i < chunk.length; i++) {
      view.setFloat32(offset, Math.max(-1, Math.min(1, chunk[i])), true);
      offset += 4;
    }
  }

  return new Blob([ab], { type: 'audio/wav' });
}


