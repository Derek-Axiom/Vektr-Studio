import { useRef, useEffect } from 'react';
import { getOrCreateGlobalAudioContext, registerGlobalAudioContext } from './audioContextSingleton';

// The canonical sample rate for this engine. All DSP curve buffers (distortion,
// bitcrusher, gate, soft-clipper) are computed at this rate. Mismatching the
// AudioContext rate would silently corrupt pitch and timing across the entire chain.
export const LOCKED_SAMPLE_RATE = 44100;

// --- ZERO-DEPENDENCY DSP CURVES ---

function makeDistortionCurve(amount = 0) {
  const k = typeof amount === 'number' ? amount : 50;
  const n = 44100;
  const curve = new Float32Array(n);
  const deg = Math.PI / 180;
  for (let i = 0; i < n; ++i) {
    const x = (i * 2) / n - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

function makeBitCrusherCurve(bits = 16) {
  const n = 44100;
  const curve = new Float32Array(n);
  const steps = Math.pow(2, bits);
  for (let i = 0; i < n; ++i) {
    const x = (i * 2) / n - 1;
    curve[i] = Math.round(x * steps) / steps;
  }
  return curve;
}

function makeGateCurve(threshold = 0) {
  const n = 44100;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = Math.abs(x) < threshold ? 0 : x;
  }
  return curve;
}

function makeSoftClipperCurve() {
  const n = 44100;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; ++i) {
    const x = (i * 2) / n - 1;
    curve[i] = x < -1 ? -1 : x > 1 ? 1 : x - Math.pow(x, 3) / 3;
  }
  return curve;
}

function generateImpulseResponse(ctx: AudioContext, duration = 2, decay = 2) {
  const length = ctx.sampleRate * duration;
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);
  for (let i = 0; i < length; i++) {
    const multi = Math.pow(1 - i / length, decay);
    left[i] = (Math.random() * 2 - 1) * multi;
    right[i] = (Math.random() * 2 - 1) * multi;
  }
  return impulse;
}

// --- DSP PARAMETER STATE ---

export interface OmniRackParams {
  // Transport
  tempo: number;
  vinylPitch: number;
  transportActive: boolean;
  // Dynamics & Distortion
  gateThresh: number;
  compression: number;
  limiter: number;
  saturation: number;
  bitcrush: number;
  dynamicsActive: boolean;
  // Filters
  lpfCutoff: number;
  lpfRes: number;
  hpfCutoff: number;
  hpfRes: number;
  bpfFreq: number;
  notchFreq: number;
  filtersActive: boolean;
  // 12-Band EQ
  eqBands: number[];
  graphicActive: boolean;
  // Spatial Echo & Reverb
  echoTime: number;
  echoFbk: number;
  echoMix: number;
  reverbMix: number;
  spaceActive: boolean;
  // Modulation
  chorusMix: number;
  chorusRate: number;
  flangerMix: number;
  flangerRate: number;
  phaserMix: number;
  phaserRate: number;
  modActive: boolean;
  // 8D Audio
  speed8d: number;
  radius8d: number;
  audio8dActive: boolean;
  // Monitor
  directMonitorActive: boolean;
}

export const DEFAULT_RACK_PARAMS: OmniRackParams = {
  tempo: 100,
  vinylPitch: 100,
  transportActive: true,
  gateThresh: 0,
  compression: 0,
  limiter: 0,
  saturation: 0,
  bitcrush: 16,
  dynamicsActive: false, // Transparent by default
  lpfCutoff: 100,
  lpfRes: 0,
  hpfCutoff: 0,
  hpfRes: 0,
  bpfFreq: 0,
  notchFreq: 0,
  filtersActive: false, // Transparent by default
  eqBands: new Array(12).fill(0),
  graphicActive: false, // Transparent by default
  echoTime: 25,
  echoFbk: 30,
  echoMix: 0,
  reverbMix: 0,
  spaceActive: false, // Transparent by default
  chorusMix: 0,
  chorusRate: 50,
  flangerMix: 0,
  flangerRate: 30,
  phaserMix: 0,
  phaserRate: 15,
  modActive: false, // Transparent by default
  speed8d: 50,
  radius8d: 20,
  audio8dActive: false,
  directMonitorActive: false,
};

// --- THE HOOK ---

export function useOmniRack(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  params: OmniRackParams,
  isPlaying: boolean
) {
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  // Polymorphic stream source - connected on demand via connectStream()
  const streamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // DSP Node Refs
  const gateRef = useRef<WaveShaperNode | null>(null);
  const compRef = useRef<DynamicsCompressorNode | null>(null);
  const limitRef = useRef<DynamicsCompressorNode | null>(null);
  const distRef = useRef<WaveShaperNode | null>(null);
  const bitCrushRef = useRef<WaveShaperNode | null>(null);

  const lpfRef = useRef<BiquadFilterNode | null>(null);
  const hpfRef = useRef<BiquadFilterNode | null>(null);
  const bpfRef = useRef<BiquadFilterNode | null>(null);
  const notchRef = useRef<BiquadFilterNode | null>(null);

  const eqNodesRef = useRef<BiquadFilterNode[]>([]);

  const delayRef = useRef<DelayNode | null>(null);
  const feedbackRef = useRef<GainNode | null>(null);
  const delayMixRef = useRef<GainNode | null>(null);

  const reverbRef = useRef<ConvolverNode | null>(null);
  const reverbMixRef = useRef<GainNode | null>(null);

  const chorusMixRef = useRef<GainNode | null>(null);
  const chorusLfoRef = useRef<OscillatorNode | null>(null);

  const flangerMixRef = useRef<GainNode | null>(null);
  const flangerLfoRef = useRef<OscillatorNode | null>(null);

  const panner8dRef = useRef<PannerNode | null>(null);

  const angleRef = useRef(0);
  const rafRef = useRef<number>(0);

  const directMonitorGainRef = useRef<GainNode | null>(null);
  const wetMonitorGainRef = useRef<GainNode | null>(null);

  // Output tap for the PCM recorder - unity gain node connected in parallel
  // off the clipper (chain output). Gives usePcmRecorder a clean isolated
  // connection point without interfering with the analyser or destination.
  const recorderTapRef = useRef<GainNode | null>(null);

  // 8D Orbital Engine
  useEffect(() => {
    const render8D = () => {
      if (params.audio8dActive && panner8dRef.current && ctxRef.current && isPlaying) {
        angleRef.current += (params.speed8d / 100) * 0.05;
        const x = Math.sin(angleRef.current) * (params.radius8d / 2);
        const z = Math.cos(angleRef.current) * (params.radius8d / 2);
        panner8dRef.current.positionX.setTargetAtTime(x, ctxRef.current.currentTime, 0.05);
        panner8dRef.current.positionZ.setTargetAtTime(z, ctxRef.current.currentTime, 0.05);
      } else if (!params.audio8dActive && panner8dRef.current && ctxRef.current) {
        panner8dRef.current.positionX.setTargetAtTime(0, ctxRef.current.currentTime, 0.1);
        panner8dRef.current.positionZ.setTargetAtTime(0, ctxRef.current.currentTime, 0.1);
        angleRef.current = 0;
      }
      rafRef.current = requestAnimationFrame(render8D);
    };
    rafRef.current = requestAnimationFrame(render8D);
    return () => cancelAnimationFrame(rafRef.current!);
  }, [params.audio8dActive, params.speed8d, params.radius8d, isPlaying]);

  // INITIALIZE 29-NODE MEGA-RACK (once, on first audio element)
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    // Guard: only create one MediaElementSource per audio element
    if (sourceRef.current) return;

    try {
      const ctx = ctxRef.current ?? getOrCreateGlobalAudioContext();
      registerGlobalAudioContext(ctx);
      const source = ctx.createMediaElementSource(audioEl);

      const gate = ctx.createWaveShaper();
      gate.curve = makeGateCurve(0);

      const lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass';
      const hpf = ctx.createBiquadFilter(); hpf.type = 'highpass';
      const bpf = ctx.createBiquadFilter(); bpf.type = 'bandpass'; bpf.Q.value = 1; bpf.frequency.value = 1000;
      const notch = ctx.createBiquadFilter(); notch.type = 'notch'; notch.Q.value = 10; notch.frequency.value = 1000;

      const freqs = [30, 60, 120, 250, 500, 1000, 2000, 4000, 8000, 12000, 16000, 20000];
      const eqNodes = freqs.map((freq, i) => {
        const node = ctx.createBiquadFilter();
        node.type = i === 0 ? 'lowshelf' : i === 11 ? 'highshelf' : 'peaking';
        node.frequency.value = freq;
        if (node.type === 'peaking') node.Q.value = 1.41;
        return node;
      });
      for (let i = 0; i < eqNodes.length - 1; i++) eqNodes[i].connect(eqNodes[i + 1]);

      const bit = ctx.createWaveShaper();
      const comp = ctx.createDynamicsCompressor();
      const dist = ctx.createWaveShaper(); dist.oversample = '4x';

      const dryNode = ctx.createGain();

      const delay = ctx.createDelay(2.0);
      const fbk = ctx.createGain();
      const dlyMix = ctx.createGain(); dlyMix.gain.value = 0;

      const rev = ctx.createConvolver();
      rev.buffer = generateImpulseResponse(ctx, 2.5, 3);
      const revMix = ctx.createGain(); revMix.gain.value = 0;

      const chorusDelay = ctx.createDelay(0.05); chorusDelay.delayTime.value = 0.02;
      const chLfo = ctx.createOscillator(); chLfo.type = 'sine'; chLfo.frequency.value = 1.5;
      const chDepth = ctx.createGain(); chDepth.gain.value = 0.005;
      const chMixNode = ctx.createGain(); chMixNode.gain.value = 0;
      chLfo.connect(chDepth); chDepth.connect(chorusDelay.delayTime); chLfo.start();

      const flangerDelay = ctx.createDelay(0.01); flangerDelay.delayTime.value = 0.003;
      const flLfo = ctx.createOscillator(); flLfo.type = 'sine'; flLfo.frequency.value = 0.5;
      const flDepth = ctx.createGain(); flDepth.gain.value = 0.002;
      const flFbk = ctx.createGain(); flFbk.gain.value = 0.6;
      const flMixNode = ctx.createGain(); flMixNode.gain.value = 0;
      flLfo.connect(flDepth); flDepth.connect(flangerDelay.delayTime); flLfo.start();

      const limit = ctx.createDynamicsCompressor();
      limit.attack.value = 0.001; limit.release.value = 0.050; limit.ratio.value = 20;

      const panner = ctx.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.refDistance = 1;
      panner.maxDistance = 10000;
      panner.rolloffFactor = 1;
      panner.coneInnerAngle = 360;
      panner.coneOuterAngle = 0;
      panner.coneOuterGain = 0;

      const clipper = ctx.createWaveShaper();
      clipper.curve = makeSoftClipperCurve();

      // --- THE WIRING MEGA-CHAIN ---
      source.connect(gate);
      gate.connect(hpf); hpf.connect(lpf); lpf.connect(bpf); bpf.connect(notch);
      notch.connect(eqNodes[0]);
      eqNodes[11].connect(bit);
      bit.connect(comp);
      comp.connect(dist);
      dist.connect(dryNode);

      dryNode.connect(delay); delay.connect(fbk); fbk.connect(delay); delay.connect(dlyMix);
      dryNode.connect(rev); rev.connect(revMix);
      dryNode.connect(chorusDelay); chorusDelay.connect(chMixNode);
      dryNode.connect(flangerDelay); flangerDelay.connect(flFbk); flFbk.connect(flangerDelay); flangerDelay.connect(flMixNode);

      dryNode.connect(limit);
      dlyMix.connect(limit);
      revMix.connect(limit);
      chMixNode.connect(limit);
      flMixNode.connect(limit);

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;

      limit.connect(panner);
      panner.connect(clipper);
      clipper.connect(analyser);

      const wetMonitorGain = ctx.createGain();
      wetMonitorGain.gain.value = 1.0;
      analyser.connect(wetMonitorGain);
      wetMonitorGain.connect(ctx.destination);

      const directMonitorGain = ctx.createGain();
      directMonitorGain.gain.value = 0;
      directMonitorGain.connect(ctx.destination);

      // Recorder tap - unity gain node at chain output for PCM capture.
      // Connected in parallel to clipper, does not affect the signal path.
      const recorderTap = ctx.createGain();
      recorderTap.gain.value = 1.0;
      clipper.connect(recorderTap);

      // Store Refs
      ctxRef.current = ctx;
      sourceRef.current = source;
      gateRef.current = gate;
      lpfRef.current = lpf; hpfRef.current = hpf; bpfRef.current = bpf; notchRef.current = notch;
      eqNodesRef.current = eqNodes;
      bitCrushRef.current = bit;
      compRef.current = comp; distRef.current = dist;
      delayRef.current = delay; feedbackRef.current = fbk; delayMixRef.current = dlyMix;
      reverbRef.current = rev; reverbMixRef.current = revMix;
      chorusMixRef.current = chMixNode; chorusLfoRef.current = chLfo;
      flangerMixRef.current = flMixNode; flangerLfoRef.current = flLfo;
      limitRef.current = limit;
      panner8dRef.current = panner;
      analyserRef.current = analyser;
      recorderTapRef.current = recorderTap;
      wetMonitorGainRef.current = wetMonitorGain;
      directMonitorGainRef.current = directMonitorGain;
    } catch (e) {
      console.warn('OmniRack: Audio Context blocked.', e);
    }
  }, [audioRef]);

  // LIVE PARAMETER SYNC
  useEffect(() => {
    const mapFreq = (val: number, _reverse = false) => {
      const v = _reverse ? 100 - val : val;
      return Math.max(20, Math.min(20000, 20 * Math.pow(1000, v / 100)));
    };

    const audioEl = audioRef.current;
    if (audioEl) {
      if (params.transportActive) {
        if (params.vinylPitch !== 100) {
          audioEl.preservesPitch = false;
          audioEl.playbackRate = params.vinylPitch / 100;
        } else if (params.tempo !== 100) {
          audioEl.preservesPitch = true;
          audioEl.playbackRate = params.tempo / 100;
        } else {
          audioEl.preservesPitch = true;
          audioEl.playbackRate = 1.0;
        }
      } else {
        audioEl.preservesPitch = true;
        audioEl.playbackRate = 1.0;
      }
    }

    if (params.dynamicsActive) {
      if (gateRef.current) gateRef.current.curve = params.gateThresh > 0 ? makeGateCurve(params.gateThresh / 1000) : null;
      if (compRef.current) { compRef.current.threshold.value = -10 - (params.compression / 2); compRef.current.ratio.value = 1 + (params.compression / 5); }
      if (distRef.current) distRef.current.curve = params.saturation > 0 ? makeDistortionCurve(params.saturation * 8) : null;
      if (bitCrushRef.current) bitCrushRef.current.curve = params.bitcrush < 16 ? makeBitCrusherCurve(params.bitcrush) : null;
      if (limitRef.current) { limitRef.current.threshold.value = params.limiter > 0 ? -(params.limiter / 5) : 0; limitRef.current.ratio.value = params.limiter > 0 ? 20 : 1; }
    } else {
      if (gateRef.current) gateRef.current.curve = null;
      if (compRef.current) { compRef.current.threshold.value = 0; compRef.current.ratio.value = 1; }
      if (distRef.current) distRef.current.curve = null;
      if (bitCrushRef.current) bitCrushRef.current.curve = null;
      if (limitRef.current) limitRef.current.threshold.value = 0;
    }

    if (params.filtersActive) {
      if (lpfRef.current) { lpfRef.current.frequency.value = mapFreq(params.lpfCutoff); lpfRef.current.Q.value = params.lpfRes; }
      if (hpfRef.current) { hpfRef.current.frequency.value = mapFreq(params.hpfCutoff); hpfRef.current.Q.value = params.hpfRes; }
      if (bpfRef.current) { bpfRef.current.frequency.value = params.bpfFreq === 0 ? 20000 : mapFreq(params.bpfFreq); bpfRef.current.Q.value = params.bpfFreq === 0 ? 0 : 2; }
      if (notchRef.current) { notchRef.current.frequency.value = params.notchFreq === 0 ? 20 : mapFreq(params.notchFreq); notchRef.current.Q.value = params.notchFreq === 0 ? 0 : 10; }
    } else {
      if (lpfRef.current) lpfRef.current.frequency.value = 20000;
      if (hpfRef.current) hpfRef.current.frequency.value = 20;
      if (bpfRef.current) bpfRef.current.frequency.value = 20000;
      if (notchRef.current) notchRef.current.frequency.value = 20;
    }

    if (params.graphicActive && eqNodesRef.current.length === 12) {
      params.eqBands.forEach((gain, i) => { if (eqNodesRef.current[i]) eqNodesRef.current[i].gain.value = gain; });
    } else if (eqNodesRef.current.length === 12) {
      eqNodesRef.current.forEach(n => n.gain.value = 0);
    }

    if (params.spaceActive) {
      if (delayRef.current) delayRef.current.delayTime.value = (params.echoTime / 100) * 1.5;
      if (feedbackRef.current) feedbackRef.current.gain.value = params.echoFbk / 100;
      if (delayMixRef.current) delayMixRef.current.gain.value = params.echoMix / 100;
      if (reverbMixRef.current) reverbMixRef.current.gain.value = params.reverbMix / 100;
    } else {
      if (delayMixRef.current) delayMixRef.current.gain.value = 0;
      if (reverbMixRef.current) reverbMixRef.current.gain.value = 0;
    }

    if (params.modActive) {
      if (chorusMixRef.current) chorusMixRef.current.gain.value = params.chorusMix / 100;
      if (chorusLfoRef.current) chorusLfoRef.current.frequency.value = 0.1 + (params.chorusRate / 100) * 5;
      if (flangerMixRef.current) flangerMixRef.current.gain.value = params.flangerMix / 100;
      if (flangerLfoRef.current) flangerLfoRef.current.frequency.value = 0.1 + (params.flangerRate / 100) * 3;
    } else {
      if (chorusMixRef.current) chorusMixRef.current.gain.value = 0;
      if (flangerMixRef.current) flangerMixRef.current.gain.value = 0;
    }

    if (directMonitorGainRef.current && wetMonitorGainRef.current) {
      if (params.directMonitorActive) {
        directMonitorGainRef.current.gain.value = 1.0;
        wetMonitorGainRef.current.gain.value = 0; // Mute wet monitor to prevent echo
      } else {
        directMonitorGainRef.current.gain.value = 0;
        wetMonitorGainRef.current.gain.value = 1.0; // Restore wet monitor
      }
    }
  }, [
    params.gateThresh, params.compression, params.limiter, params.saturation, params.bitcrush,
    params.lpfCutoff, params.lpfRes, params.hpfCutoff, params.hpfRes, params.bpfFreq, params.notchFreq,
    params.eqBands,
    params.echoTime, params.echoFbk, params.echoMix, params.reverbMix,
    params.chorusMix, params.chorusRate, params.flangerMix, params.flangerRate,
    params.tempo, params.vinylPitch,
    params.filtersActive, params.graphicActive, params.spaceActive,
    params.dynamicsActive, params.transportActive, params.modActive,
    params.directMonitorActive,
    audioRef
  ]);

  // --- POLYMORPHIC SOURCE API ---

  // Routes any MediaStream (microphone, instrument, screen capture) through the
  // full 29-node DSP chain by connecting it to the gate node - the first node
  // in the signal path. The HTMLAudioElement source is completely unaffected.
  const connectStream = (stream: MediaStream): void => {
    const ctx = ctxRef.current;
    const gate = gateRef.current;

    if (!ctx || !gate) {
      // Chain not yet initialized - this shouldn't happen in normal flow since
      // the <audio> element mounts with ProfileContext, initializing the chain.
      console.warn('OmniRack: DSP chain not ready. Cannot connect stream.');
      return;
    }

    // Tear down any existing stream source before connecting a new one.
    if (streamSourceRef.current) {
      streamSourceRef.current.disconnect();
      streamSourceRef.current = null;
    }

    // Resume context if suspended by autoplay policy.
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const streamSource = ctx.createMediaStreamSource(stream);
    streamSource.connect(gate);

    if (directMonitorGainRef.current) {
      streamSource.connect(directMonitorGainRef.current);
    }

    streamSourceRef.current = streamSource;
  };

  // Safely removes the stream source from the chain. Call this when
  // recording stops or the mic is released.
  const disconnectStream = (): void => {
    if (streamSourceRef.current) {
      streamSourceRef.current.disconnect();
      streamSourceRef.current = null;
    }
  };

  return { ctxRef, analyserRef, connectStream, disconnectStream, recorderTapRef };
}

// --- TRUE RENDERING ENGINE (Phase 3) ---
// Duplicates the live DSP graph into an OfflineAudioContext to bounce out precisely mixed audio.
export async function renderOfflineDSP(buffer: AudioBuffer, params: OmniRackParams): Promise<AudioBuffer> {
  const offlineCtx = new window.OfflineAudioContext(2, buffer.length, buffer.sampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;

  // 1. Recreate Nodes
  const gate = offlineCtx.createWaveShaper();
  const lpf = offlineCtx.createBiquadFilter(); lpf.type = 'lowpass';
  const hpf = offlineCtx.createBiquadFilter(); hpf.type = 'highpass';
  const bpf = offlineCtx.createBiquadFilter(); bpf.type = 'bandpass'; bpf.Q.value = 1;
  const notch = offlineCtx.createBiquadFilter(); notch.type = 'notch'; notch.Q.value = 10;

  const freqs = [30, 60, 120, 250, 500, 1000, 2000, 4000, 8000, 12000, 16000, 20000];
  const eqNodes = freqs.map((freq, i) => {
    const node = offlineCtx.createBiquadFilter();
    node.type = i === 0 ? 'lowshelf' : i === 11 ? 'highshelf' : 'peaking';
    node.frequency.value = freq;
    if (node.type === 'peaking') node.Q.value = 1.41;
    return node;
  });
  for (let i = 0; i < eqNodes.length - 1; i++) eqNodes[i].connect(eqNodes[i + 1]);

  const bit = offlineCtx.createWaveShaper();
  const comp = offlineCtx.createDynamicsCompressor();
  const dist = offlineCtx.createWaveShaper(); dist.oversample = '4x';

  const dryNode = offlineCtx.createGain();

  const delay = offlineCtx.createDelay(2.0);
  const fbk = offlineCtx.createGain();
  const dlyMix = offlineCtx.createGain(); dlyMix.gain.value = 0;

  const rev = offlineCtx.createConvolver();
  // Using offlineCtx as fake Context just for Impulse generator
  rev.buffer = generateImpulseResponse(offlineCtx as any, 2.5, 3);
  const revMix = offlineCtx.createGain(); revMix.gain.value = 0;

  const limit = offlineCtx.createDynamicsCompressor();
  limit.attack.value = 0.001; limit.release.value = 0.050; limit.ratio.value = 20;

  const clipper = offlineCtx.createWaveShaper();
  clipper.curve = makeSoftClipperCurve();

  // 2. Wire Graph
  source.connect(gate);
  gate.connect(hpf); hpf.connect(lpf); lpf.connect(bpf); bpf.connect(notch);
  notch.connect(eqNodes[0]);
  eqNodes[11].connect(bit);
  bit.connect(comp);
  comp.connect(dist);
  dist.connect(dryNode);

  dryNode.connect(delay); delay.connect(fbk); fbk.connect(delay); delay.connect(dlyMix);
  dryNode.connect(rev); rev.connect(revMix);

  dryNode.connect(limit);
  dlyMix.connect(limit);
  revMix.connect(limit);

  limit.connect(clipper);
  clipper.connect(offlineCtx.destination);

  // 3. Map Parameters
  const mapFreq = (val: number, _reverse = false) => {
    const v = _reverse ? 100 - val : val;
    return Math.max(20, Math.min(20000, 20 * Math.pow(1000, v / 100)));
  };

  if (params.transportActive) {
    if (params.vinylPitch !== 100) source.playbackRate.value = params.vinylPitch / 100;
    else if (params.tempo !== 100) source.playbackRate.value = params.tempo / 100;
  }

  if (params.dynamicsActive) {
    gate.curve = params.gateThresh > 0 ? makeGateCurve(params.gateThresh / 1000) : null;
    comp.threshold.value = -10 - (params.compression / 2); comp.ratio.value = 1 + (params.compression / 5);
    dist.curve = params.saturation > 0 ? makeDistortionCurve(params.saturation * 8) : null;
    bit.curve = params.bitcrush < 16 ? makeBitCrusherCurve(params.bitcrush) : null;
    limit.threshold.value = params.limiter > 0 ? -(params.limiter / 5) : 0; limit.ratio.value = params.limiter > 0 ? 20 : 1;
  }

  if (params.filtersActive) {
    lpf.frequency.value = mapFreq(params.lpfCutoff); lpf.Q.value = params.lpfRes;
    hpf.frequency.value = mapFreq(params.hpfCutoff); hpf.Q.value = params.hpfRes;
    bpf.frequency.value = params.bpfFreq === 0 ? 20000 : mapFreq(params.bpfFreq); bpf.Q.value = params.bpfFreq === 0 ? 0 : 2;
    notch.frequency.value = params.notchFreq === 0 ? 20 : mapFreq(params.notchFreq); notch.Q.value = params.notchFreq === 0 ? 0 : 10;
  } else {
    lpf.frequency.value = 20000; hpf.frequency.value = 20; bpf.frequency.value = 20000; notch.frequency.value = 20;
  }

  if (params.graphicActive) {
    params.eqBands.forEach((gain, i) => eqNodes[i].gain.value = gain);
  }

  if (params.spaceActive) {
    delay.delayTime.value = (params.echoTime / 100) * 1.5;
    fbk.gain.value = params.echoFbk / 100;
    dlyMix.gain.value = params.echoMix / 100;
    revMix.gain.value = params.reverbMix / 100;
  }

  source.start(0);
  return await offlineCtx.startRendering();
}

