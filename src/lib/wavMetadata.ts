/**
 * Zero-Dependency BWF (Broadcast Wave Format) & RIFF INFO Injector
 * 
 * Supports the "Double-Buffer" Metadata strategy:
 * 1. BWF `bext` chunk (for Pro-tier DAWs like Pro Tools, Logic, Cubase)
 * 2. Standard `LIST` `INFO` chunk (for standard media players, OS previewers)
 */

export interface WavMetadata {
  title?: string;        // RIFF INAM, bext Description
  artist?: string;       // RIFF IART, bext Originator
  software?: string;     // RIFF ISFT
  date?: string;         // YYYY-MM-DD (bext OriginationDate)
  time?: string;         // HH:MM:SS (bext OriginationTime)
  timeReference?: number;// Sample-accurate start time (for multi-track alignment)
}

function writeString(view: DataView, offset: number, str: string, maxLength?: number) {
  const len = maxLength ? Math.min(str.length, maxLength) : str.length;
  for (let i = 0; i < len; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Wraps a standard WAV Blob into a new WAV Blob with `bext` and `LIST` `INFO` chunks injected right after the `fmt ` chunk.
 */
export async function injectWavMetadata(wavBlob: Blob, metadata: WavMetadata): Promise<Blob> {
  const arrayBuffer = await wavBlob.arrayBuffer();
  const view = new DataView(arrayBuffer);

  // Validate RIFF header
  const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
  if (riff !== 'RIFF' || wave !== 'WAVE') throw new Error("Invalid WAV format");

  // Build `bext` chunk (Exactly 602 bytes standard length without coding history)
  // 4 bytes ID ('bext')
  // 4 bytes size (602)
  const bextSize = 602;
  const bextBuffer = new ArrayBuffer(8 + bextSize);
  const bextView = new DataView(bextBuffer);
  
  writeString(bextView, 0, 'bext');
  bextView.setUint32(4, bextSize, true);
  
  // 256 bytes Description
  writeString(bextView, 8, metadata.title || 'Vektr Audio Asset', 256);
  // 32 bytes Originator
  writeString(bextView, 264, metadata.artist || 'Vektr Studio User', 32);
  // 32 bytes OriginatorReference
  writeString(bextView, 296, 'VEKTR-' + Math.random().toString(36).substr(2, 9).toUpperCase(), 32);
  // 10 bytes OriginationDate (YYYY-MM-DD)
  const dateStr = metadata.date || new Date().toISOString().split('T')[0];
  writeString(bextView, 328, dateStr, 10);
  // 8 bytes OriginationTime (HH:MM:SS)
  const timeStr = metadata.time || new Date().toISOString().split('T')[1].substr(0, 8);
  writeString(bextView, 338, timeStr, 8);
  
  // 8 bytes TimeReference
  // Pro DAWs use this integer (number of samples since midnight) to align tracks!
  const timeRef = metadata.timeReference || 0;
  bextView.setUint32(346, timeRef & 0xFFFFFFFF, true); // Low 32 bits
  bextView.setUint32(350, Math.floor(timeRef / 0x100000000) & 0xFFFFFFFF, true); // High 32 bits

  bextView.setUint16(354, 2, true); // BWF Version 2

  // Build `LIST` `INFO` chunk
  const infoTags: {id: string, text: string}[] = [];
  if (metadata.title) infoTags.push({ id: 'INAM', text: metadata.title });
  if (metadata.artist) infoTags.push({ id: 'IART', text: metadata.artist });
  infoTags.push({ id: 'ISFT', text: metadata.software || 'VEKTR Studio' });
  infoTags.push({ id: 'ICRD', text: dateStr });

  let infoSize = 4; // "INFO"
  for (const tag of infoTags) {
    const textLen = (new TextEncoder().encode(tag.text)).length + 1; // +1 for null termination
    infoSize += 8 + textLen + (textLen % 2); // 8 for header, pad to even
  }

  const listBuffer = new ArrayBuffer(8 + infoSize);
  const listView = new DataView(listBuffer);

  writeString(listView, 0, 'LIST');
  listView.setUint32(4, infoSize, true);
  writeString(listView, 8, 'INFO');

  let listOffset = 12;
  for (const tag of infoTags) {
    writeString(listView, listOffset, tag.id);
    const textBytes = new TextEncoder().encode(tag.text);
    const textLen = textBytes.length + 1;
    listView.setUint32(listOffset + 4, textLen, true);
    for (let i = 0; i < textBytes.length; i++) {
        listView.setUint8(listOffset + 8 + i, textBytes[i]);
    }
    listView.setUint8(listOffset + 8 + textBytes.length, 0); // Null terminator
    listOffset += 8 + textLen + (textLen % 2); // padded to even
  }

  // --- Locate 'fmt ' chunk end ---
  let fmtOffset = 12;
  while (fmtOffset < view.byteLength) {
    const chunkId = String.fromCharCode(view.getUint8(fmtOffset), view.getUint8(fmtOffset+1), view.getUint8(fmtOffset+2), view.getUint8(fmtOffset+3));
    const chunkSize = view.getUint32(fmtOffset + 4, true);
    if (chunkId === 'fmt ') {
      fmtOffset += 8 + chunkSize;
      break;
    }
    fmtOffset += 8 + chunkSize;
  }

  // Slice around fmtOffset
  const head = arrayBuffer.slice(0, fmtOffset);
  const tail = arrayBuffer.slice(fmtOffset);

  // Assemble New WAV
  const totalSize = head.byteLength + bextBuffer.byteLength + listBuffer.byteLength + tail.byteLength;
  const outBuffer = new ArrayBuffer(totalSize);
  const outView = new DataView(outBuffer);
  const outArray = new Uint8Array(outBuffer);

  outArray.set(new Uint8Array(head), 0);
  outArray.set(new Uint8Array(bextBuffer), head.byteLength);
  outArray.set(new Uint8Array(listBuffer), head.byteLength + bextBuffer.byteLength);
  outArray.set(new Uint8Array(tail), head.byteLength + bextBuffer.byteLength + listBuffer.byteLength);

  // Update master RIFF size
  outView.setUint32(4, totalSize - 8, true);

  return new Blob([outBuffer], { type: 'audio/wav' });
}
