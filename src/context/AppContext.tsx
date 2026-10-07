import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Artist, Order, Playlist, SiteSettings, Song, User, YouTubeStream, SacredGodItem } from '../types';
import { INITIAL_ARTISTS, INITIAL_CATEGORIES, INITIAL_DEMO_USERS, INITIAL_ORDERS, INITIAL_PLAYLISTS, INITIAL_SETTINGS, INITIAL_SONGS, INITIAL_YOUTUBE_STREAMS, SACRED_GODS_LIST } from '../data/initialData';
import { DRIVE_DEVOTIONAL_SONGS } from '../data/driveSongsData';
import { audioEngine } from '../services/audioSynthesizer';
import { Language, getTranslation } from '../data/translations';

export type AppView = 'home' | 'gods' | 'music' | 'slots' | 'artists' | 'live' | 'jukebox' | 'lyrics' | 'about' | 'account' | 'admin';
export type AdminTab = 'overview' | 'songs' | 'artists' | 'youtube' | 'orders' | 'settings';
export type AccountTab = 'DOWNLOADS' | 'FAVORITES' | 'ORDERS' | 'PROFILE';

interface AppContextType {
  currentUser: User | null;
  siteSettings: SiteSettings;
  songs: Song[];
  artists: Artist[];
  categories: typeof INITIAL_CATEGORIES;
  sacredGods: SacredGodItem[];
  playlists: Playlist[];
  youtubeStreams: YouTubeStream[];
  orders: Order[];
  currentTrack: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isPreview: boolean;
  previewTimeLeft: number;
  activeCheckoutSong: Song | null;
  activeLyricsModalSong: Song | null;
  activeArtistModal: Artist | null;
  activeYouTubeModal: YouTubeStream | null;
  isExpandedPlayerOpen: boolean;
  isSearchOpen: boolean;
  currentView: AppView;
  adminTab: AdminTab;
  accountTab: AccountTab;
  selectedCategory: string;
  searchQuery: string;
  toastMessage: { text: string; type: 'success' | 'info' | 'error' } | null;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  isSyncingYouTube: boolean;
  youtubeSyncStatus: {
    configured: boolean;
    channelHandle: string;
    lastSyncedAt?: string | null;
    subscriberCount?: string;
    videoCount?: string;
    syncedSongsCount?: number;
    syncedPlaylistsCount?: number;
    syncedStreamsCount?: number;
    message?: string;
    success?: boolean;
    error?: string;
  } | null;
  
  // Actions
  playSong: (song: Song, forcePreview?: boolean) => void;
  pauseSong: () => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setTrackDuration: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  openInYouTube: (songOrUrl?: Song | string) => void;
  toggleFavorite: (songId: string) => void;
  openCheckout: (song: Song) => void;
  closeCheckout: () => void;
  openLyrics: (song: Song) => void;
  closeLyrics: () => void;
  openArtist: (artist: Artist) => void;
  closeArtist: () => void;
  openYouTubeModal: (stream: YouTubeStream) => void;
  closeYouTubeModal: () => void;
  setIsExpandedPlayerOpen: (open: boolean) => void;
  setIsSearchOpen: (open: boolean) => void;
  setCurrentView: (view: AppView) => void;
  setAdminTab: (tab: AdminTab) => void;
  setAccountTab: (tab: AccountTab) => void;
  setSelectedCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  switchUserRole: (role: 'USER' | 'ADMIN') => void;
  onPaymentSuccess: (order: Order, downloadToken: string) => void;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  refreshData: () => Promise<void>;
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  syncYouTubeChannel: (apiKey?: string, channelHandle?: string) => Promise<{ success: boolean; message: string }>;

  // Admin Catalog CRUD Operations
  addSong: (song: Song) => Promise<void>;
  updateSong: (song: Song) => Promise<void>;
  deleteSong: (songId: string) => Promise<void>;
  addArtist: (artist: Artist) => Promise<void>;
  updateArtist: (artist: Artist) => Promise<void>;
  deleteArtist: (artistId: string) => Promise<void>;
  addYouTubeStream: (stream: YouTubeStream) => Promise<void>;
  updateYouTubeStream: (stream: YouTubeStream) => Promise<void>;
  deleteYouTubeStream: (streamId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_DEMO_USERS[0]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [songs, setSongs] = useState<Song[]>(() => {
    const songMap = new Map<string, Song>();
    [...DRIVE_DEVOTIONAL_SONGS, ...INITIAL_SONGS].forEach(s => songMap.set(s.id, s));
    return Array.from(songMap.values());
  });
  const [artists, setArtists] = useState<Artist[]>(INITIAL_ARTISTS);
  const [categories] = useState(INITIAL_CATEGORIES);
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);
  const [youtubeStreams, setYoutubeStreams] = useState<YouTubeStream[]>(INITIAL_YOUTUBE_STREAMS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  const [currentTrack, setCurrentTrack] = useState<Song | null>(INITIAL_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(INITIAL_SONGS[0].durationSeconds);
  const [volume, setVolState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPreview, setIsPreview] = useState<boolean>(true);
  const [previewTimeLeft, setPreviewTimeLeft] = useState<number>(30);

  const [activeCheckoutSong, setActiveCheckoutSong] = useState<Song | null>(null);
  const [activeLyricsModalSong, setActiveLyricsModalSong] = useState<Song | null>(null);
  const [activeArtistModal, setActiveArtistModal] = useState<Artist | null>(null);
  const [activeYouTubeModal, setActiveYouTubeModal] = useState<YouTubeStream | null>(null);
  const [isExpandedPlayerOpen, setIsExpandedPlayerOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');
  const [accountTab, setAccountTab] = useState<AccountTab>('DOWNLOADS');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('subam_language');
      if (saved === 'en' || saved === 'ta') return saved;
    } catch {
      // ignore
    }
    return 'ta';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('subam_language', lang);
    } catch {
      // ignore
    }
    showToast(
      lang === 'ta' ? 'தமிழ் மொழி தேர்ந்தெடுக்கப்பட்டது' : 'Language switched to English',
      'info'
    );
  };

  const t = (key: string, fallback?: string): string => {
    return getTranslation(key, language, fallback);
  };

  const [isSyncingYouTube, setIsSyncingYouTube] = useState<boolean>(false);
  const [youtubeSyncStatus, setYoutubeSyncStatus] = useState<{
    configured: boolean;
    channelHandle: string;
    lastSyncedAt?: string | null;
    subscriberCount?: string;
    videoCount?: string;
    syncedSongsCount?: number;
    syncedPlaylistsCount?: number;
    syncedStreamsCount?: number;
    message?: string;
    success?: boolean;
    error?: string;
  } | null>(null);

  // Fetch initial data from backend API
  const refreshData = async () => {
    try {
      const [songsRes, artistsRes, ytRes, setRes, ordersRes, plRes, ytStatusRes] = await Promise.all([
        fetch('/api/songs').then(r => r.ok ? r.json() : null),
        fetch('/api/artists').then(r => r.ok ? r.json() : null),
        fetch('/api/youtube/streams').then(r => r.ok ? r.json() : null),
        fetch('/api/settings').then(r => r.ok ? r.json() : null),
        fetch('/api/orders').then(r => r.ok ? r.json() : null),
        fetch('/api/playlists').then(r => r.ok ? r.json() : null),
        fetch('/api/youtube/status').then(r => r.ok ? r.json() : null)
      ]);

      if (songsRes) setSongs(songsRes);
      if (artistsRes) setArtists(artistsRes);
      if (ytRes) setYoutubeStreams(ytRes);
      if (setRes) setSiteSettings(setRes);
      if (ordersRes && Array.isArray(ordersRes)) setOrders(ordersRes);
      if (plRes && Array.isArray(plRes)) setPlaylists(plRes);
      if (ytStatusRes) setYoutubeSyncStatus(ytStatusRes);
    } catch {
      // Fallback already pre-populated
    }
  };

  const syncYouTubeChannel = async (apiKey?: string, channelHandle?: string): Promise<{ success: boolean; message: string }> => {
    setIsSyncingYouTube(true);
    try {
      const res = await fetch('/api/youtube/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey || siteSettings.youtubeApiKey || undefined,
          channelHandle: channelHandle || siteSettings.youtubeChannelHandle || 'subamaudiovision'
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'YouTube channel data synced successfully!', 'success');
        await refreshData();
        return { success: true, message: data.message };
      } else {
        const errorMsg = data.message || 'Failed to sync YouTube channel.';
        showToast(errorMsg, 'error');
        return { success: false, message: errorMsg };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error connecting to server YouTube sync endpoint.';
      showToast(errorMsg, 'error');
      return { success: false, message: errorMsg };
    } finally {
      setIsSyncingYouTube(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => prev?.text === text ? null : prev);
    }, 4000);
  };

  const isSongPurchasedByUser = (songId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN') return true;
    return currentUser.purchasedSongIds.includes(songId);
  };

  const isValidYouTubeId = (id?: string): boolean => {
    if (!id) return false;
    const cleanId = id.trim();
    if (cleanId === '17mC8Z-xK6c') return false;
    // Valid YouTube video IDs are 11 characters alphanumeric + '-' or '_'
    return /^[A-Za-z0-9_-]{11}$/.test(cleanId);
  };

  const openInYouTube = (songOrUrl?: Song | string) => {
    const channelDefault = siteSettings.youtubeChannelUrl || 'https://www.youtube.com/@subamaudiovision';
    
    // Case 1: Direct string URL provided
    if (typeof songOrUrl === 'string' && songOrUrl.trim()) {
      let targetUrl = songOrUrl.trim();
      if (targetUrl.includes('17mC8Z-xK6c')) {
        targetUrl = channelDefault;
      }
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // Determine target song
    const targetSong: Song | null = (songOrUrl && typeof songOrUrl === 'object') 
      ? (songOrUrl as Song) 
      : currentTrack;

    if (!targetSong) {
      window.open(channelDefault, '_blank', 'noopener,noreferrer');
      return;
    }

    // Case 2: Song has a valid, verified YouTube video ID
    if (isValidYouTubeId(targetSong.youtubeVideoId)) {
      const targetUrl = `https://www.youtube.com/watch?v=${targetSong.youtubeVideoId}`;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // Case 3: Song has a valid YouTube URL that does NOT contain dead ID
    if (targetSong.youtubeUrl && !targetSong.youtubeUrl.includes('17mC8Z-xK6c')) {
      window.open(targetSong.youtubeUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // Case 4: No verified ID yet - Open YouTube window and resolve via server YouTube API in real time
    const searchFallback = `https://www.youtube.com/results?search_query=Subam+Audio+Vision+${encodeURIComponent(targetSong.title || targetSong.albumTitle || 'devotional')}`;
    const newWindow = window.open(searchFallback, '_blank', 'noopener,noreferrer');

    // Query backend YouTube API endpoint to find exact video from Subam Audio Vision channel
    const queryParams = new URLSearchParams({
      title: targetSong.title || '',
      tamilTitle: targetSong.tamilTitle || '',
      album: targetSong.albumTitle || '',
      singer: targetSong.credits?.singer || '',
      deity: targetSong.deity || '',
      filename: targetSong.previewAudioUrl ? targetSong.previewAudioUrl.replace('/audio/', '') : ''
    });

    fetch(`/api/youtube/find-video?${queryParams.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.videoUrl && newWindow) {
          try {
            newWindow.location.href = data.videoUrl;
          } catch {
            // Popup location update may be restricted across domains in some browsers; fallback remains open
          }
        }
      })
      .catch(err => {
        console.warn('YouTube live resolver notice:', err);
      });
  };

  const playSong = (song: Song, forcePreview?: boolean) => {
    const purchased = isSongPurchasedByUser(song.id);
    const shouldBePreview = forcePreview !== undefined ? forcePreview : !purchased;

    setCurrentTrack(song);
    setIsPreview(shouldBePreview);
    setDuration(song.durationSeconds || 360);
    setCurrentTime(0);
    setPreviewTimeLeft(shouldBePreview ? Math.min(60, song.durationSeconds || 60) : (song.durationSeconds || 360));
    setIsPlaying(true);
  };

  const pauseSong = () => {
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!currentTrack) {
      if (songs.length > 0) {
        playSong(songs[0]);
      }
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const seek = (seconds: number) => {
    setCurrentTime(seconds);
  };

  const setTrackDuration = (seconds: number) => {
    setDuration(seconds);
  };

  const setVolume = (vol: number) => {
    setVolState(vol);
    if (vol === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFavorite = (songId: string) => {
    if (!currentUser) {
      showToast('Please log in to save favorites', 'info');
      return;
    }
    const isFav = currentUser.favorites.includes(songId);
    const updatedFavs = isFav
      ? currentUser.favorites.filter(id => id !== songId)
      : [...currentUser.favorites, songId];

    setCurrentUser({
      ...currentUser,
      favorites: updatedFavs
    });

    fetch('/api/user/favorites/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, songId })
    }).catch(() => {});

    showToast(isFav ? 'Removed from favorites' : 'Added to sacred favorites ✨', 'success');
  };

  const openCheckout = (song: Song) => {
    setActiveCheckoutSong(song);
  };

  const closeCheckout = () => {
    setActiveCheckoutSong(null);
  };

  const openLyrics = (song: Song) => {
    setActiveLyricsModalSong(song);
  };

  const closeLyrics = () => {
    setActiveLyricsModalSong(null);
  };

  const openArtist = (artist: Artist) => {
    setActiveArtistModal(artist);
  };

  const closeArtist = () => {
    setActiveArtistModal(null);
  };

  const openYouTubeModal = (stream: YouTubeStream) => {
    setActiveYouTubeModal(stream);
  };

  const closeYouTubeModal = () => {
    setActiveYouTubeModal(null);
  };

  const switchUserRole = (role: 'USER' | 'ADMIN') => {
    const targetUser = INITIAL_DEMO_USERS.find(u => u.role === role) || INITIAL_DEMO_USERS[0];
    setCurrentUser(targetUser);
    showToast(`Switched account to: ${targetUser.name} (${targetUser.role})`, 'info');
  };

  const onPaymentSuccess = (order: Order, downloadToken: string) => {
    setOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
    if (currentUser) {
      if (!currentUser.purchasedSongIds.includes(order.songId)) {
        setCurrentUser({
          ...currentUser,
          purchasedSongIds: [...currentUser.purchasedSongIds, order.songId]
        });
      }
    }
    showToast(`Payment successful! ₹${order.amount} verified. Master audio unlocked.`, 'success');
    closeCheckout();
  };

  const updateSiteSettings = async (newSettings: Partial<SiteSettings>) => {
    const updated = { ...siteSettings, ...newSettings };
    setSiteSettings(updated);
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      showToast('Brand and platform settings updated successfully', 'success');
    } catch {
      // Offline fallback
    }
  };

  // Admin Catalog CRUD Implementations
  const addSong = async (song: Song) => {
    setSongs(prev => [song, ...prev]);
    try {
      await fetch('/api/admin/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(song)
      });
    } catch {}
  };

  const updateSong = async (song: Song) => {
    setSongs(prev => prev.map(s => s.id === song.id ? song : s));
    try {
      await fetch(`/api/admin/songs/${song.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(song)
      });
    } catch {}
  };

  const deleteSong = async (songId: string) => {
    setSongs(prev => prev.filter(s => s.id !== songId));
    try {
      await fetch(`/api/admin/songs/${songId}`, { method: 'DELETE' });
    } catch {}
  };

  const addArtist = async (artist: Artist) => {
    setArtists(prev => [...prev, artist]);
    try {
      await fetch('/api/admin/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artist)
      });
    } catch {}
  };

  const updateArtist = async (artist: Artist) => {
    setArtists(prev => prev.map(a => a.id === artist.id ? artist : a));
    try {
      await fetch(`/api/admin/artists/${artist.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artist)
      });
    } catch {}
  };

  const deleteArtist = async (artistId: string) => {
    setArtists(prev => prev.filter(a => a.id !== artistId));
    try {
      await fetch(`/api/admin/artists/${artistId}`, { method: 'DELETE' });
    } catch {}
  };

  const addYouTubeStream = async (stream: YouTubeStream) => {
    setYoutubeStreams(prev => [stream, ...prev]);
    try {
      await fetch('/api/admin/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stream)
      });
    } catch {}
  };

  const updateYouTubeStream = async (stream: YouTubeStream) => {
    setYoutubeStreams(prev => prev.map(s => s.id === stream.id ? stream : s));
    try {
      await fetch(`/api/admin/youtube/${stream.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stream)
      });
    } catch {}
  };

  const deleteYouTubeStream = async (streamId: string) => {
    setYoutubeStreams(prev => prev.filter(s => s.id !== streamId));
    try {
      await fetch(`/api/admin/youtube/${streamId}`, { method: 'DELETE' });
    } catch {}
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        siteSettings,
        songs,
        artists,
        categories,
        sacredGods: SACRED_GODS_LIST,
        playlists,
        youtubeStreams,
        orders,
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isPreview,
        previewTimeLeft,
        activeCheckoutSong,
        activeLyricsModalSong,
        activeArtistModal,
        activeYouTubeModal,
        isExpandedPlayerOpen,
        isSearchOpen,
        currentView,
        adminTab,
        accountTab,
        selectedCategory,
        searchQuery,
        toastMessage,
        language,
        setLanguage,
        t,

        playSong,
        pauseSong,
        togglePlay,
        seek,
        setTrackDuration,
        setVolume,
        toggleMute,
        openInYouTube,
        toggleFavorite,
        openCheckout,
        closeCheckout,
        openLyrics,
        closeLyrics,
        openArtist,
        closeArtist,
        openYouTubeModal,
        closeYouTubeModal,
        setIsExpandedPlayerOpen,
        setIsSearchOpen,
        setCurrentView,
        setAdminTab,
        setAccountTab,
        setSelectedCategory,
        setSearchQuery,
        switchUserRole,
        onPaymentSuccess,
        showToast,
        refreshData,
        updateSiteSettings,
        isSyncingYouTube,
        youtubeSyncStatus,
        syncYouTubeChannel,

        addSong,
        updateSong,
        deleteSong,
        addArtist,
        updateArtist,
        deleteArtist,
        addYouTubeStream,
        updateYouTubeStream,
        deleteYouTubeStream
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
