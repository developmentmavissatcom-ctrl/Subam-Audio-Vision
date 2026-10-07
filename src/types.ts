export type UserRole = 'USER' | 'EDITOR' | 'ADMIN';

export type ArtistRole = 'SINGER' | 'LYRICIST' | 'COMPOSER' | 'MUSIC_DIRECTOR';

export interface Artist {
  id: string;
  name: string;
  role: ArtistRole;
  photoUrl: string;
  bio: string;
  songCount: number;
  featured?: boolean;
  famousFor?: string;
  socialLinks?: {
    youtube?: string;
    instagram?: string;
    spotify?: string;
  };
}

export interface SongCredits {
  singer: string;
  singerId?: string;
  lyricist: string;
  lyricistId?: string;
  composer: string;
  composerId?: string;
  musicDirector: string;
  musicDirectorId?: string;
  studio?: string;
  producer?: string;
}

export type SacredDeity = 
  | 'ANNAMALAIYAR_SIVAN'
  | 'AMMAN_SHAKTHI'
  | 'MURUGAN'
  | 'VINAYAGAR'
  | 'AYYAPPAN'
  | 'PERUMAL_VENKATESWARA'
  | 'GRAMA_DEVATHAI'
  | 'KRISHNA'
  | 'ANJANEYAR_HANUMAN'
  | 'NAVAGRAHAM'
  | 'ASHTALAKSHMI'
  | 'ASHTALINGAM'
  | 'SAIBABA'
  | 'RAMANAR'
  | 'GURURAGAVENDIRAR'
  | 'YOGIRAMSURATHKUMAR'
  | 'SESHATHRI'
  | 'VEDHAMANDHIRAM'
  | 'GANAPATHY_HOMAM';

export type SongType =
  | 'GIRIVALAM'
  | 'KAVASAM'
  | 'FRIDAY_AADI_SPECIAL'
  | 'SUPRABHATAM'
  | 'VILLUPAATTU'
  | 'URUMEE_MELAM'
  | 'HARIVARASANAM'
  | 'ANTHATHI'
  | 'STHOTRA'
  | 'BHAJAN'
  | 'MANTRA_CHANT'
  | 'DEVOTIONAL_HIT';

export interface Song {
  id: string;
  title: string;
  subtitle?: string;
  tamilTitle?: string;
  description: string;
  coverImage: string;
  previewAudioUrl: string;
  audioStorageKey?: string;
  fullAudioUrl?: string;
  price: number; // in INR e.g. 49, 99
  duration: string; // "5:24"
  durationSeconds: number;
  language: 'Sanskrit' | 'Hindi' | 'Tamil' | 'Telugu' | 'Kannada' | 'Bengali' | 'Universal';
  categoryId: string;
  categoryName: string;
  deity?: SacredDeity;
  deityTamilName?: string;
  songType?: SongType;
  songTypeLabel?: string;
  releaseDate: string;
  status: 'PUBLISHED' | 'DRAFT';
  playCount: number;
  downloadCount: number;
  featured?: boolean;
  trending?: boolean;
  isPurchased?: boolean;
  isFavorited?: boolean;
  isLiveStream?: boolean;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  credits: SongCredits;
  raga?: string;
  tala?: string;
  keyNote?: string;
  lyricsId?: string;
  customUploadedAudioUrl?: string;
  customFileName?: string;
  customFileSize?: number;
  customUploadedAt?: string;
  isSlotBox?: boolean;
  slotNumber?: number;
  albumCode?: string;
  albumTitle?: string;
  trackNumber?: number;
}

export interface DevotionalSlot {
  id: string;
  slotNumber: number;
  trackNumber?: number;
  title: string;
  subtitle?: string;
  tamilTitle?: string;
  albumCode?: string;
  albumTitle?: string;
  imageFileName: string;
  imagePath: string;
  singer: string;
  deity: SacredDeity;
  deityTamilName: string;
  categoryName: string;
  raga?: string;
  tala?: string;
  description?: string;
  audioFile?: {
    name: string;
    size: number;
    type: string;
    url: string;
    duration?: number;
    uploadedAt: number;
  };
  youtubeVideoId?: string;
  youtubeUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  tamilName?: string;
  slug: string;
  image: string;
  description: string;
  songCount: number;
  sacredIcon: string;
  accentColor: string;
  deity: SacredDeity;
  popularSongTypes?: string[];
  youtubePlaylistId?: string;
}

export interface LyricLine {
  time: number; // seconds
  text: string;
  translation?: string;
}

export interface LyricsData {
  id: string;
  songId: string;
  songTitle: string;
  singer: string;
  lyricsText: string;
  timestamps?: LyricLine[];
  meaning?: string;
  raga?: string;
  tala?: string;
  deity?: string;
}

export interface YouTubeStream {
  id: string;
  title: string;
  tamilTitle?: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  type: 'LIVE' | 'VIDEO' | 'PREMIERE' | 'REPLAY';
  status: 'LIVE' | 'UPCOMING' | 'ENDED';
  thumbnailUrl: string;
  description: string;
  scheduledAt?: string;
  viewersCount?: number;
  featured?: boolean;
  categoryType?: 'LIVE_DARSHAN' | 'JUKEBOX';
  templeName?: string;
  timing?: string;
  broadcastDate?: string;
  festivalName?: string;
  trackCount?: number;
  durationLabel?: string;
  artists?: string;
  tracksList?: string[];
  deityCategory?: string;
}

export interface Playlist {
  id: string;
  title: string;
  tamilTitle?: string;
  description: string;
  thumbnailUrl: string;
  youtubePlaylistUrl?: string;
  youtubePlaylistId?: string;
  songCount: number;
  featured?: boolean;
  category: string;
  curator: string;
  plays?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  profilePhoto?: string;
  purchasedSongIds: string[];
  favorites: string[];
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  songId: string;
  songTitle: string;
  songArtwork: string;
  amount: number;
  currency: string;
  paymentStatus: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
  status?: string;
  paymentMethod?: string;
  gatewayOrderId: string;
  gatewayPaymentId?: string;
  createdAt: string;
}

export interface DownloadRecord {
  id: string;
  userId: string;
  songId: string;
  songTitle: string;
  purchaseId: string;
  downloadCount: number;
  lastDownloadAt: string;
  token?: string;
  expiresAt?: string;
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  supportEmail: string;
  razorpayKeyId: string;
  youtubeChannelUrl: string;
  announcementText: string;
  enable3DEffects: boolean;
  youtubeApiKey?: string;
  youtubeChannelId?: string;
  youtubeChannelHandle?: string;
  youtubeSubscriberCount?: string;
  youtubeVideoCount?: string;
  youtubeLastSyncedAt?: string;
}

export interface SacredGodItem {
  id: string;
  number: number;
  name: string;
  tamilName: string;
  group: 'PRIMAL_GODS' | 'SACRED_KSHETRAMS' | 'MAHA_GURUS' | 'VEDA_HOMAMS';
  groupLabel: string;
  image: string;
  mantra: string;
  mantraTamil: string;
  description: string;
  templeAbode: string;
  searchKeyword: string;
  accentColor: string;
  tagline: string;
}
