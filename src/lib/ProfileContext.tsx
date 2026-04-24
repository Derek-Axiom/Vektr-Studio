import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ShareableItem, PublicProfile, MediaItem, LyricBook, IngestionResult } from '../types';
import { saveAudioFile, getAudioFile, deleteAudioFile, saveAnalysisData, getAnalysisData, deleteAnalysisData, SyncEngine } from './storage';
import { useOmniRack, DEFAULT_RACK_PARAMS, LOCKED_SAMPLE_RATE, type OmniRackParams } from './useOmniRack';
import { ART_CanvasHash, buildSovereignContext } from './ART_CanvasHasher';
import { processIngestion, buildAutoTags } from './IngestEngine';
import { useAudioSafety, type HeadphoneStatus } from './hooks/useAudioSafety';
import { useSessionGuard, type RecoveredSession } from './hooks/useSessionGuard';
import { getCurrentUser, logOut } from './SovereignAuth';
import { transcribeAudioSmart } from './TranscriptionEngine';

interface ProfileContextType {
  // Profile & Socials
  profile: PublicProfile;
  updateProfile: (updates: Partial<PublicProfile>) => void;
  
  // Shareable LinkVault / Bio Stack
  shareableItems: ShareableItem[];
  addShareableItem: (item: Omit<ShareableItem, 'id' | 'ownerId' | 'createdAt'>) => void;
  updateShareableItem: (id: string, updates: Partial<ShareableItem>) => void;
  removeShareableItem: (id: string) => void;
  reorderShareableItems: (items: ShareableItem[]) => void;
  
  // Authentication
  logout: () => void;

  // Media Vault: The Sovereign Repository
  activeMediaId: string | null;
  setActiveMediaId: (id: string | null) => void;
  
  vault: MediaItem[];
  addMedia: (item: Omit<MediaItem, 'id' | 'createdAt'>) => string;
  uploadMedia: (file: File, category?: MediaItem['category']) => Promise<void>;
  updateMedia: (id: string, updates: Partial<MediaItem>) => void;
  deleteMedia: (id: string) => void;

  lyricBooks: LyricBook[];
  saveLyricBook: (lyricBook: LyricBook) => void;

  // Backward Compatibility (Legacy Handlers)
  tracks: MediaItem[];
  addTrack: (item: any) => void;
  uploadTrack: (file: File) => Promise<void>;
  updateTrack: (id: string, updates: any) => void;
  deleteTrack: (id: string) => void;
  activeTrackId: string | null;
  setActiveTrackId: (id: string | null) => void;

  // Global Audio Engine & DSP
  globalAudioRef: React.RefObject<HTMLAudioElement | null>;
  globalAnalyserRef: React.RefObject<AnalyserNode | null>;
  globalCtxRef: React.RefObject<AudioContext | null>;
  isPlaying: boolean;
  togglePlay: () => void;
  rackParams: OmniRackParams;
  updateRackParams: (updates: Partial<OmniRackParams>) => void;
  // Sample-Rate Watchdog
  sampleRateAlert: boolean;
  dismissSampleRateAlert: () => void;
  // Polymorphic DSP Stream Routing
  connectStream: (stream: MediaStream) => void;
  disconnectStream: () => void;
  // PCM Recorder Tap (DSP chain output, post-clipper)
  recorderTapRef: React.RefObject<GainNode | null>;
  // Hardware Safety
  headphoneStatus: HeadphoneStatus;
  checkHeadphones: () => Promise<boolean>;
  // Session Crash Recovery
  recoveredSessions: RecoveredSession[];
  openSession: (sessionId: string, opfsFile: string) => Promise<void>;
  heartbeat: (sessionId: string, chunkCount: number) => Promise<void>;
  closeSession: (sessionId: string) => Promise<void>;
  dismissRecovery: (sessionId: string) => void;
  checkForCrashedSessions: () => Promise<void>;
  // Global Recording Priority State
  isRecordingSession: boolean;
  setIsRecordingSession: (val: boolean) => void;
}

const defaultProfile: PublicProfile = {
  ownerId: 'new-identity',
  displayName: '',
  bio: 'Creating sounds and visuals.',
  avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=200',
  theme: 'obs-1',
  ambientMode: 'flow',
  cardStyle: 'solid',
  font: 'font-sans',
  slug: '',
  socials: [],
  initialized: false
};

const defaultItems: ShareableItem[] = [];
const defaultVault: MediaItem[] = [];
const defaultLyricBooks: LyricBook[] = [];

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<PublicProfile>(() => SyncEngine.load('', defaultProfile));
  const [shareableItems, setShareableItems] = useState<ShareableItem[]>(() => SyncEngine.load('_items', defaultItems));
  const [vault, setVault] = useState<MediaItem[]>([]);
  const [activeMediaId, setActiveMediaId] = useState<string | null>(null);

  // Mount Effect: Rehydrate Sovereign Vault Blobs from IndexedDB & Migration
  useEffect(() => {
    const initVault = async () => {
      let parsed = SyncEngine.load('_vault', defaultVault);
      
      // LEGACY MIGRATION: Check for old _tracks key from previous session
      const legacyTracks = SyncEngine.load('_tracks', []);
      if (legacyTracks.length > 0) {
        const migrated: MediaItem[] = legacyTracks.map((t: any) => ({
          id: t.id,
          title: t.title,
          artist: t.artist || profile.displayName || 'Vektr Artist',
          type: 'audio',
          category: t.category || 'Single',
          duration: 0,
          fileUrl: t.audioUrl,
          thumbnailUrl: t.coverUrl || t.thumbnailUrl,
          createdAt: t.createdAt || Date.now()
        }));
        parsed = [...migrated, ...parsed];
        SyncEngine.save('_tracks', []); // Clear legacy store
      }

      // --- FIX: Eradicate "Processing" Death Loop & Analysis Erasure ---
      // If the user refreshed while a track was analyzing, the ingest promise died.
      // We must unlock any orphaned tracks back to 'ready' so they are usable,
      // avoiding a perpetual state-lock on reload.
      parsed = parsed.map((t: MediaItem) => 
        t.status === 'processing' ? { ...t, status: 'ready' } : t
      );

      if (!parsed || parsed.length === 0) return;
      
      try {
        const hydrated = await Promise.all(parsed.map(async t => {
          const blob = await getAudioFile(t.id);
          // Rehydrate analysisData (onset arrays, histograms) from IndexedDB
          const analysis = await getAnalysisData<IngestionResult>(t.id);
          return {
            ...t,
            ...(blob ? { fileUrl: URL.createObjectURL(blob) } : {}),
            ...(analysis ? { analysisData: analysis } : {}),
          } as MediaItem;
        }));
        setVault(hydrated);
      } catch { }
    };
    initVault();
  }, []);
  
  const [lyricBooks, setLyricBooks] = useState<LyricBook[]>(() => SyncEngine.load('_lyrics', defaultLyricBooks));
  const [rackParams, setRackParams] = useState<OmniRackParams>(() => SyncEngine.load('_dsp', DEFAULT_RACK_PARAMS));

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sampleRateAlert, setSampleRateAlert] = useState(false);
  const [isRecordingSession, setIsRecordingSession] = useState(false);
  
  const { analyserRef, ctxRef, connectStream, disconnectStream, recorderTapRef } = useOmniRack(audioRef, rackParams, isPlaying);

  const { headphoneStatus, checkHeadphones } = useAudioSafety();
  const { recoveredSessions, openSession, heartbeat, closeSession, dismissRecovery, checkForCrashedSessions } = useSessionGuard();

  // --- SOVEREIGN AUTH CHECK ---
  useEffect(() => {
    getCurrentUser().then(identity => {
      if (identity) {
        setProfile(prev => ({
          ...prev,
          ownerId: identity.ownerId,
          displayName: identity.username,
          bio: identity.bio || prev.bio,
          slug: identity.slug || prev.slug,
          initialized: true,
        }));
      }
    });
  }, []);

  // --- SAMPLE-RATE WATCHDOG ---
  // Monitors for hardware device changes (USB-C interfaces, Bluetooth headsets)
  // that can silently shift the OS audio clock mid-session. The AudioContext holds
  // its locked rate, but if the hardware diverges, pitch and speed will corrupt.
  // On detection: pause immediately and surface a user-facing alert.
  useEffect(() => {
    if (!navigator.mediaDevices?.addEventListener) return;

    const handleDeviceChange = () => {
      const ctx = ctxRef.current;
      if (!ctx) return;

      if (ctx.sampleRate !== LOCKED_SAMPLE_RATE) {
        // Hardware clock has shifted. Pause audio immediately to prevent
        // chipmunk-speed or slow-motion corruption in the recorded signal.
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
        setSampleRateAlert(true);
      }
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  // Refs are stable - intentionally omitted from deps array
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismissSampleRateAlert = () => setSampleRateAlert(false);

  // Autonomous Injection: Auto-buffer & play globally when active track shifts
  useEffect(() => {
    const item = vault.find(t => t.id === activeMediaId);
    if (!item || !item.fileUrl || item.type !== 'audio') return;

    if (audioRef.current && audioRef.current.src !== item.fileUrl) {
      audioRef.current.src = item.fileUrl;
      audioRef.current.load();
      // Resume context if possibly suspended by autoplay policies
      if (ctxRef.current?.state === 'suspended') {
        ctxRef.current.resume();
      }
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [activeMediaId, vault]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    // CRUCIAL: Resume AudioContext on user gesture to unlock DSP pipeline
    if (ctxRef.current?.state === 'suspended') {
      await ctxRef.current.resume();
    }

    // JIT LOAD: Always verify the audio element's src matches the active track.
    // audioRef.current.src returns the fully-resolved absolute URL so we compare
    // against the stored fileUrl. If they diverge (stale blob, navigation, refresh),
    // re-hydrate directly from IndexedDB - the sovereign persistent store.
    const activeItem = vault.find(t => t.id === activeMediaId);
    const currentSrc = audioRef.current.src; // fully resolved by browser
    const needsLoad = activeItem?.fileUrl && currentSrc !== activeItem.fileUrl;

    if (needsLoad) {
      // Try the in-memory blob URL first; if expired, pull fresh from IndexedDB
      let resolvedUrl: string = activeItem!.fileUrl!; // needsLoad guards activeItem?.fileUrl truthy
      try {
        const res = await fetch(resolvedUrl, { method: 'HEAD' });
        if (!res.ok) throw new Error('blob expired');
      } catch {
        // Blob URL is stale - re-hydrate from IndexedDB sovereign store
        const blob = await getAudioFile(activeItem!.id);
        if (blob) {
          resolvedUrl = URL.createObjectURL(blob);
          // Patch vault so future calls skip the re-fetch
          setVault(prev => prev.map(t =>
            t.id === activeItem!.id ? { ...t, fileUrl: resolvedUrl } : t
          ));
        }
      }
      audioRef.current.src = resolvedUrl as string;
      audioRef.current.load();
      // Wait for the browser to buffer enough to start playback
      await new Promise<void>(resolve => {
        const done = () => resolve();
        audioRef.current!.addEventListener('canplay', done, { once: true });
        audioRef.current!.addEventListener('error', done, { once: true });
      });
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => { console.warn('togglePlay play() rejected:', e); setIsPlaying(false); });
    }
  };

  // Persistence Effects (Abstracted via SyncEngine)
  useEffect(() => { SyncEngine.save('', profile); }, [profile]);
  useEffect(() => { SyncEngine.save('_items', shareableItems); }, [shareableItems]);
  useEffect(() => {
    // Strip analysisData and fileUrl before writing to localStorage.
    // analysisData (onset arrays, histograms) is persisted to IndexedDB via saveAnalysisData.
    // fileUrl is a blob:// URL that is invalid after page refresh - no point storing it.
    const compact = vault.map(({ analysisData: _a, fileUrl: _f, ...rest }) => rest);
    SyncEngine.save('_vault', compact);
  }, [vault]);
  useEffect(() => { SyncEngine.save('_lyrics', lyricBooks); }, [lyricBooks]);
  useEffect(() => { SyncEngine.save('_dsp', rackParams); }, [rackParams]);

  const updateProfile = (updates: Partial<PublicProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const updateRackParams = (updates: Partial<OmniRackParams>) => {
    setRackParams(prev => ({ ...prev, ...updates }));
  };

  const addShareableItem = (item: Omit<ShareableItem, 'id' | 'ownerId' | 'createdAt'>) => {
    const newItem: ShareableItem = {
      ...item,
      id: `item-${Date.now()}`,
      ownerId: profile.ownerId,
      createdAt: Date.now(),
    };
    setShareableItems(prev => [newItem, ...prev].map((it, idx) => ({ ...it, sortOrder: idx })));
  };

  const updateShareableItem = (id: string, updates: Partial<ShareableItem>) => {
    setShareableItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeShareableItem = (id: string) => {
    setShareableItems(prev => prev.filter(item => item.id !== id));
  };

  const reorderShareableItems = (items: ShareableItem[]) => {
    setShareableItems(items.map((item, idx) => ({ ...item, sortOrder: idx })));
  };
  
  const logout = () => {
    logOut();
    setProfile(defaultProfile);
    setShareableItems([]);
    setVault([]);
    setLyricBooks([]);
    setActiveMediaId(null);
    localStorage.clear();
  };

  const addMedia = (itemData: Omit<MediaItem, 'id' | 'createdAt'>): string => {
    const newItem: MediaItem = {
      ...itemData,
      id: `media-${Date.now()}`,
      createdAt: Date.now()
    };
    setVault(prev => [newItem, ...prev]);
    if (newItem.type === 'audio') setActiveMediaId(newItem.id);
    return newItem.id;
  };

  const uploadMedia = async (file: File, category?: MediaItem['category'], subcategory?: string) => {
    const id = `media-${Date.now()}`;
    const title = file.name.replace(/\.[^/.]+$/, "");
    await saveAudioFile(id, file); // Save raw binary offline (generic storage)
    
    let type: MediaItem['type'] = 'other';
    let autoCategory: MediaItem['category'] = category || 'Single';

    if (file.type.startsWith('audio/')) { type = 'audio'; }
    else if (file.type.startsWith('video/')) { type = 'video'; autoCategory = category || 'Videos'; }
    else if (file.type.startsWith('image/')) { type = 'image'; autoCategory = category || 'Photos'; }

    const thumbnailUrl = ART_CanvasHash(
      buildSovereignContext(
        { ownerId: profile.ownerId, displayName: profile.displayName || 'VEKTR' },
        { id, title, artist: profile.displayName || 'Vektr Elite', createdAt: Date.now() },
        rackParams,
        '',
        undefined,
        undefined,
        profile.avatarUrl
      )
    );
    
    const newItem: MediaItem = {
      id,
      title,
      artist: profile.displayName || 'Vektr Elite',
      type,
      category: autoCategory,
      subcategory,
      duration: 0,
      fileUrl: URL.createObjectURL(file),
      thumbnailUrl,
      createdAt: Date.now(),
      status: type === 'audio' ? 'processing' : 'ready',
    };
    setVault(prev => [newItem, ...prev]);
    if (type === 'audio') setActiveMediaId(id);

    // ── INGEST PIPELINE: Fire-and-forget background analysis ──────────────
    // Runs after the item is already visible in the vault. Never blocks UI.
    if (type === 'audio') {
      Promise.all([
        processIngestion(file, id),
        transcribeAudioSmart(file).catch(() => null)
      ])
        .then(([result, transcriptionResult]) => {
          const autoTags = buildAutoTags(result);
          // Persist analysisData (onset arrays, histogram) to IndexedDB - NOT localStorage.
          // localStorage has a ~5MB limit; onset arrays for long tracks easily overflow it silently.
          saveAnalysisData(id, result).catch(() => {});
          
          // ✅ AUTO-SAVE TRANSCRIPTION TO LYRIC BOOK
          if (transcriptionResult?.text) {
            const lyricBook: LyricBook = {
              id: `lyrics-${id}`,
              trackId: id,
              title: `${title} - Lyrics`,
              content: transcriptionResult.text,
              updatedAt: Date.now(),
            };
            setLyricBooks(prev => {
              const existing = prev.find(b => b.trackId === id);
              return existing ? prev.map(b => b.trackId === id ? lyricBook : b) : [lyricBook, ...prev];
            });
          }
          setVault(prev => prev.map(item =>
            item.id === id
              ? {
                  ...item,
                  status: 'ready' as const,
                  bpm: result.bpm,
                  key: result.key,
                  duration: result.duration,
                  tags: autoTags,
                  analysisData: result, // In-memory only; persisted to IDB above
                }
              : item
          ));
        })
        .catch(() => {
          setVault(prev => prev.map(item =>
            item.id === id ? { ...item, status: 'ready' as const } : item
          ));
        });
    }
  };

  const updateMedia = (id: string, updates: Partial<MediaItem>) => {
    setVault(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteMedia = async (id: string) => {
    setVault(prev => prev.filter(t => t.id !== id));
    if (activeMediaId === id) setActiveMediaId(null);
    await deleteAudioFile(id);
  };

  const saveLyricBook = (updatedBook: LyricBook) => {
    setLyricBooks(prev => {
      const exists = prev.find(b => b.trackId === updatedBook.trackId);
      if (exists) {
        return prev.map(b => b.trackId === updatedBook.trackId ? updatedBook : b);
      }
      return [...prev, updatedBook];
    });
  };

  return (
    <ProfileContext.Provider value={{
      profile, updateProfile,
      shareableItems, addShareableItem, updateShareableItem, removeShareableItem, reorderShareableItems,
      logout,
      activeMediaId, setActiveMediaId,
      vault, addMedia, uploadMedia, updateMedia, deleteMedia,
      // Backward compatibility aliases
      tracks: vault,
      addTrack: addMedia as any,
      uploadTrack: uploadMedia as any,
      updateTrack: updateMedia as any,
      deleteTrack: deleteMedia as any,
      activeTrackId: activeMediaId,
      setActiveTrackId: setActiveMediaId,
      lyricBooks, saveLyricBook,
      globalAudioRef: audioRef, globalAnalyserRef: analyserRef, globalCtxRef: ctxRef, isPlaying, togglePlay,
      rackParams, updateRackParams,
      sampleRateAlert, dismissSampleRateAlert,
      connectStream, disconnectStream,
      recorderTapRef,
      headphoneStatus, checkHeadphones,
      recoveredSessions, openSession, heartbeat, closeSession, dismissRecovery, checkForCrashedSessions,
      isRecordingSession, setIsRecordingSession
    }}>
      <audio 
        ref={audioRef}  
        onEnded={() => setIsPlaying(false)} 
        onPause={() => setIsPlaying(false)} 
        onPlay={() => setIsPlaying(true)} 
        className="hidden" 
      />
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

