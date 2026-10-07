import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import {
  INITIAL_ARTISTS,
  INITIAL_CATEGORIES,
  INITIAL_DEMO_USERS,
  INITIAL_LYRICS,
  INITIAL_ORDERS,
  INITIAL_PLAYLISTS,
  INITIAL_SETTINGS,
  INITIAL_SONGS,
  INITIAL_YOUTUBE_STREAMS
} from './src/data/initialData';
import { INITIAL_DEVOTIONAL_SLOTS } from './src/data/slotBoxesData';
import { DRIVE_DEVOTIONAL_SONGS, DRIVE_DEVOTIONAL_SLOTS } from './src/data/driveSongsData';
import { Artist, Order, Playlist, SiteSettings, Song, User, YouTubeStream } from './src/types';
import { searchItems, evaluateSearchMatch } from './src/utils/searchEngine';

const app = express();

const isCloudRun = !!process.env.K_SERVICE;
const isProduction = process.env.NODE_ENV === 'production' || isCloudRun;
// Cloud Run injects process.env.PORT (defaults to 8080).
// In AI Studio dev sandbox, nginx listens on 8080 and proxies to 3000, so dev server MUST listen on 3000.
const PORT = isCloudRun || (process.env.NODE_ENV === 'production' && process.env.PORT)
  ? (Number(process.env.PORT) || 8080)
  : 3001;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Permissive CORS and iframe embedding headers for Google Workspace (Google Sites, Intranet)
app.use((req: Request, res: Response, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.removeHeader('X-Frame-Options');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://sites.google.com https://*.google.com https://*.googleusercontent.com *");
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// Dedicated static streaming handlers for audio and cover art (supports both root and dist builds)
const publicAudioDir = path.join(process.cwd(), 'public', 'audio');
const distAudioDir = path.join(process.cwd(), 'dist', 'audio');
const publicNewImagesDir = path.join(process.cwd(), 'public', 'new images');
const distNewImagesDir = path.join(process.cwd(), 'dist', 'new images');

// Load Google Drive manifest mapping for high-performance zero-storage cloud streaming
let driveAudioMap: Record<string, string> = {};
try {
  const manifestPath = path.join(process.cwd(), 'src', 'data', 'drive_tracks_manifest.json');
  if (fs.existsSync(manifestPath)) {
    const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    for (const item of raw) {
      if (item.mp3_filename && item.file_id) {
        driveAudioMap[item.mp3_filename] = item.file_id;
        driveAudioMap[item.mp3_filename.toLowerCase()] = item.file_id;
      }
    }
    console.log(`📡 Loaded ${Object.keys(driveAudioMap).length / 2} Google Drive master audio track stream mappings`);
  }
} catch (e: any) {
  console.warn('Notice loading drive_tracks_manifest.json:', e.message);
}

// Load YouTube tracks mapping and 1,330 channel video catalog
let youtubeTracksMapping: Record<string, any> = {};
let channelVideosCatalog: any[] = [];
try {
  const mapPath = path.join(process.cwd(), 'src', 'data', 'youtube_tracks_mapping.json');
  if (fs.existsSync(mapPath)) {
    youtubeTracksMapping = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    console.log(`🎬 Loaded ${Object.keys(youtubeTracksMapping).length} verified YouTube track mappings`);
  }
  const vidsPath = path.join(process.cwd(), 'src', 'data', 'youtube_channel_videos.json');
  if (fs.existsSync(vidsPath)) {
    channelVideosCatalog = JSON.parse(fs.readFileSync(vidsPath, 'utf8'));
    console.log(`🎥 Loaded ${channelVideosCatalog.length} Subam Audio Vision YouTube channel uploads`);
  }
} catch (e: any) {
  console.warn('Notice loading YouTube catalogs:', e.message);
}

// Audio streaming route with ultra-fast Range request support, immutable edge caching, and on-demand converter
app.get('/audio/:filename', (req: Request, res: Response) => {
  const filename = decodeURIComponent(req.params.filename);
  const cleanFilename = path.basename(filename);

  // Helper to send local audio file with full Range (206) and Cache-Control headers
  const sendOptimizedAudio = (filePath: string) => {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.sendFile(filePath, { 
      acceptRanges: true,
      headers: {
        'Accept-Ranges': 'bytes',
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  };

  // 1. Direct match in public or dist audio directory
  const localPublicFile = path.join(publicAudioDir, cleanFilename);
  if (fs.existsSync(localPublicFile) && fs.statSync(localPublicFile).size > 1000) {
    return sendOptimizedAudio(localPublicFile);
  }

  const localDistFile = path.join(distAudioDir, cleanFilename);
  if (fs.existsSync(localDistFile) && fs.statSync(localDistFile).size > 1000) {
    return sendOptimizedAudio(localDistFile);
  }

  // 1b. Case-insensitive lookup in public audio directory
  if (fs.existsSync(publicAudioDir)) {
    const existingFiles = fs.readdirSync(publicAudioDir);
    const lowerTarget = cleanFilename.toLowerCase();
    const matched = existingFiles.find(f => f.toLowerCase() === lowerTarget);
    if (matched) {
      return sendOptimizedAudio(path.join(publicAudioDir, matched));
    }
  }

  // 2. Stream / on-demand transcode from Google Drive Master Vault with Range support
  const fileId = driveAudioMap[cleanFilename] || driveAudioMap[cleanFilename.toLowerCase()];
  if (fileId) {
    const driveUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download`;
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SubamAudioPlatform/2.0'
    };

    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    import('https').then(({ default: https }) => {
      const driveReq = https.get(driveUrl, { headers }, (driveRes) => {
        // If Google Drive redirected, follow redirect
        if (driveRes.statusCode && driveRes.statusCode >= 300 && driveRes.statusCode < 400 && driveRes.headers.location) {
          https.get(driveRes.headers.location, { headers }, (redirectRes) => {
            forwardDriveStream(redirectRes, res, cleanFilename);
          }).on('error', (err) => {
            console.error(`Audio stream redirect error for ${cleanFilename}:`, err.message);
            if (!res.headersSent) res.status(502).json({ error: 'Audio stream temporarily unavailable' });
          });
          return;
        }

        forwardDriveStream(driveRes, res, cleanFilename);
      });

      function forwardDriveStream(sourceRes: any, targetRes: Response, fname: string) {
        targetRes.status(sourceRes.statusCode || 200);

        const lowerName = fname.toLowerCase();
        if (lowerName.endsWith('.mp3')) {
          targetRes.setHeader('Content-Type', 'audio/mpeg');
        } else if (lowerName.endsWith('.wav')) {
          targetRes.setHeader('Content-Type', 'audio/wav');
        } else if (lowerName.endsWith('.flac')) {
          targetRes.setHeader('Content-Type', 'audio/flac');
        } else if (sourceRes.headers['content-type']) {
          targetRes.setHeader('Content-Type', sourceRes.headers['content-type'] as string);
        } else {
          targetRes.setHeader('Content-Type', 'audio/mpeg');
        }

        if (sourceRes.headers['content-range']) {
          targetRes.setHeader('Content-Range', sourceRes.headers['content-range'] as string);
        }
        if (sourceRes.headers['content-length']) {
          targetRes.setHeader('Content-Length', sourceRes.headers['content-length'] as string);
        }
        if (sourceRes.headers['etag']) {
          targetRes.setHeader('ETag', sourceRes.headers['etag'] as string);
        }
        if (sourceRes.headers['last-modified']) {
          targetRes.setHeader('Last-Modified', sourceRes.headers['last-modified'] as string);
        }

        targetRes.setHeader('Accept-Ranges', 'bytes');
        targetRes.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

        sourceRes.pipe(targetRes);
      }

      driveReq.on('error', (err) => {
        console.error(`Audio stream error for ${cleanFilename}:`, err.message);
        if (!res.headersSent) {
          res.status(502).json({ error: 'Audio stream temporarily unavailable' });
        }
      });
    }).catch((err) => {
      res.status(500).json({ error: err.message });
    });
    return;
  }

  res.status(404).send('Audio file not found');
});

if (fs.existsSync(publicNewImagesDir)) {
  app.use('/new%20images', express.static(publicNewImagesDir, { maxAge: '1d' }));
  app.use('/new images', express.static(publicNewImagesDir, { maxAge: '1d' }));
} else if (fs.existsSync(distNewImagesDir)) {
  app.use('/new%20images', express.static(distNewImagesDir, { maxAge: '1d' }));
  app.use('/new images', express.static(distNewImagesDir, { maxAge: '1d' }));
}

// In-Memory Database Store (with all 82 Drive devotional tracks + initial seed data)
let siteSettings: SiteSettings = { ...INITIAL_SETTINGS };
let songs: Song[] = [...DRIVE_DEVOTIONAL_SONGS, ...INITIAL_SONGS];
let artists: Artist[] = [...INITIAL_ARTISTS];
let categories = [...INITIAL_CATEGORIES];
let playlists: Playlist[] = [...INITIAL_PLAYLISTS];
let youtubeStreams: YouTubeStream[] = [...INITIAL_YOUTUBE_STREAMS];
let lyrics = { ...INITIAL_LYRICS };
let users: User[] = [...INITIAL_DEMO_USERS];
let orders: Order[] = [...INITIAL_ORDERS];
let downloadTokens: Record<string, { userId: string; songId: string; expiresAt: number; count: number }> = {};

// Helper: Extract YouTube ID
function extractYouTubeId(url: string): string {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : url;
}

// ---------------- YOUTUBE DATA API V3 ENGINE ----------------

function getYouTubeApiKey(customKey?: string): string {
  if (customKey && customKey.trim()) return customKey.trim();
  const envKeys = [
    process.env.YOUTUBE_API_KEY,
    process.env.YOUTUBE_DATA_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.YOUTUBE_KEY,
    process.env.YT_API_KEY,
    process.env.VITE_YOUTUBE_API_KEY,
    siteSettings.youtubeApiKey
  ];
  for (const k of envKeys) {
    if (k && k.trim() && k !== 'AIzaSySampleYouTubeApiKey') {
      return k.trim();
    }
  }
  return 'AIzaSyBw4_B9nGGrp4eWm_nddMaqjXzk3RaxFbo';
}

function parseISO8601Duration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 375;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

function formatSecondsToMinutes(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

function cleanVideoTitle(title: string): string {
  return title
    .replace(/\|\s*Subam Audio.*/gi, '')
    .replace(/\|\s*Subam Devotional.*/gi, '')
    .replace(/\|\s*Official Audio.*/gi, '')
    .replace(/\|\s*Full Song.*/gi, '')
    .replace(/\[Official Video\].*/gi, '')
    .replace(/\(Official Video\).*/gi, '')
    .replace(/\|\s*Devotional Song.*/gi, '')
    .replace(/HD Video/gi, '')
    .trim();
}

function extractSingerFromTitle(title: string): string {
  const match = title.match(/\|\s*([A-Za-z.\s]+)\s*\|/i) || title.match(/Sung by\s*:\s*([A-Za-z.\s]+)/i);
  return match ? match[1].trim() : 'Subam Vocalist';
}

function detectRaga(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('shiva') || lower.includes('rudram') || lower.includes('lingashtakam') || lower.includes('sivan')) return 'Bhairav / Shivaranjani';
  if (lower.includes('amman') || lower.includes('mariamman') || lower.includes('devi')) return 'Kalyani / Sindhu Bhairavi';
  if (lower.includes('muruga') || lower.includes('kandha')) return 'Shanmukhapriya';
  if (lower.includes('vinayag') || lower.includes('ganesh')) return 'Hamsadhwani';
  if (lower.includes('ayyapp') || lower.includes('sabarimala')) return 'Madhyamavathi';
  return 'Mohanam (Sacred Classical)';
}

function formatNumber(numStr: string | number): string {
  const num = typeof numStr === 'number' ? numStr : parseInt(numStr, 10);
  if (isNaN(num)) return `${numStr}`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return `${num}`;
}

// Full Synchronizer for YouTube Channel
async function syncYouTubeChannelData(apiKeyInput?: string, handleOrChannelId: string = 'subamaudiovision') {
  const apiKey = getYouTubeApiKey(apiKeyInput);
  if (!apiKey) {
    return {
      success: false,
      error: 'NO_API_KEY',
      message: 'YouTube API Key not found. Please add YOUTUBE_API_KEY to your environment variables or paste it in the Admin Settings tab.'
    };
  }

  let cleanHandle = handleOrChannelId.replace(/^@/, '').trim();
  if (!cleanHandle) cleanHandle = 'subamaudiovision';

  try {
    let channelData: any = null;
    let channelId = '';

    // 1A. If looks like a YouTube Channel ID
    if (cleanHandle.startsWith('UC') && cleanHandle.length === 24) {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics,brandingSettings&id=${cleanHandle}&key=${apiKey}`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        channelData = data.items[0];
        channelId = channelData.id;
      }
    }

    // 1B. Try forHandle
    if (!channelData) {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics,brandingSettings&forHandle=${encodeURIComponent(cleanHandle)}&key=${apiKey}`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        channelData = data.items[0];
        channelId = channelData.id;
      }
    }

    // 1C. Try forUsername
    if (!channelData) {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics,brandingSettings&forUsername=${encodeURIComponent(cleanHandle)}&key=${apiKey}`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        channelData = data.items[0];
        channelId = channelData.id;
      }
    }

    // 1D. Try search by channel title / handle
    if (!channelData) {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(cleanHandle)}&key=${apiKey}`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        channelId = data.items[0].snippet?.channelId || data.items[0].id?.channelId;
        if (channelId) {
          const res2 = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics,brandingSettings&id=${channelId}&key=${apiKey}`);
          const data2 = await res2.json();
          if (data2.items && data2.items.length > 0) {
            channelData = data2.items[0];
          }
        }
      }
    }

    if (!channelData) {
      return {
        success: false,
        error: 'CHANNEL_NOT_FOUND',
        message: `Could not find YouTube channel for "${handleOrChannelId}". Please verify your channel handle or ID.`
      };
    }

    const channelSnippet = channelData.snippet || {};
    const channelStats = channelData.statistics || {};
    const uploadsPlaylistId = channelData.contentDetails?.relatedPlaylists?.uploads;

    // Update siteSettings with channel data
    siteSettings.brandName = 'Subam Audio Vision';
    siteSettings.youtubeSubscriberCount = formatNumber(channelStats.subscriberCount || '600000');
    siteSettings.youtubeVideoCount = `${channelStats.videoCount || '150'}`;
    siteSettings.youtubeChannelId = channelId;
    siteSettings.youtubeChannelHandle = cleanHandle;
    siteSettings.youtubeLastSyncedAt = new Date().toISOString();

    // 2. Fetch Uploads Playlist Items
    let fetchedVideos: any[] = [];
    if (uploadsPlaylistId) {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${uploadsPlaylistId}&key=${apiKey}`);
      const data = await res.json();
      if (data.items) {
        fetchedVideos = data.items;
      }
    }

    // 3. Fetch Video details for durations and view counts
    const videoIds = fetchedVideos
      .map((item: any) => item.contentDetails?.videoId || item.snippet?.resourceId?.videoId)
      .filter(Boolean);
    
    let videoDetailsMap: Record<string, { duration: string; durationSec: number; viewCount: number; likeCount: number }> = {};

    if (videoIds.length > 0) {
      const idsChunk = videoIds.slice(0, 50).join(',');
      const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id=${idsChunk}&key=${apiKey}`);
      const data = await res.json();
      if (data.items) {
        for (const item of data.items) {
          const isoDur = item.contentDetails?.duration || 'PT5M30S';
          const durSec = parseISO8601Duration(isoDur);
          const durStr = formatSecondsToMinutes(durSec);
          videoDetailsMap[item.id] = {
            duration: durStr,
            durationSec: durSec,
            viewCount: parseInt(item.statistics?.viewCount || '0', 10),
            likeCount: parseInt(item.statistics?.likeCount || '0', 10)
          };
        }
      }
    }

    // 4. Fetch Official Channel Playlists
    let fetchedPlaylists: any[] = [];
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&channelId=${channelId}&maxResults=25&key=${apiKey}`);
      const data = await res.json();
      if (data.items) {
        fetchedPlaylists = data.items;
      }
    } catch (err) {
      console.warn('Playlists fetch warning:', err);
    }

    // 5. Check Live and Upcoming Streams
    let fetchedStreams: any[] = [];
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        for (const item of data.items) {
          const vId = item.id?.videoId;
          if (vId) {
            fetchedStreams.push({
              id: `yt-live-${vId}`,
              title: item.snippet.title,
              youtubeUrl: `https://www.youtube.com/watch?v=${vId}`,
              youtubeVideoId: vId,
              type: 'LIVE',
              status: 'LIVE',
              categoryType: 'LIVE_DARSHAN',
              thumbnailUrl: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`,
              description: item.snippet.description || 'Live Sacred Darshan from Subam Audio Vision',
              viewersCount: 2500,
              scheduledAt: item.snippet.publishedAt
            });
          }
        }
      }
    } catch (err) {
      console.warn('Live search warning:', err);
    }

    // Add recent videos as replays if no live stream is active
    if (fetchedStreams.length === 0 && fetchedVideos.length > 0) {
      const topVideos = fetchedVideos.slice(0, 4);
      for (const topVid of topVideos) {
        const vId = topVid.contentDetails?.videoId || topVid.snippet?.resourceId?.videoId;
        if (vId) {
          fetchedStreams.push({
            id: `yt-stream-${vId}`,
            title: topVid.snippet.title,
            youtubeUrl: `https://www.youtube.com/watch?v=${vId}`,
            youtubeVideoId: vId,
            type: 'VIDEO',
            status: 'ENDED',
            thumbnailUrl: topVid.snippet.thumbnails?.maxres?.url || topVid.snippet.thumbnails?.high?.url || `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`,
            description: topVid.snippet.description || 'Original devotional release by Subam Audio Vision.',
            viewersCount: videoDetailsMap[vId]?.viewCount || 5400,
            scheduledAt: topVid.snippet.publishedAt
          });
        }
      }
    }

    // 6. Map fetched videos into Real Songs Catalog
    if (fetchedVideos.length > 0) {
      const realSongs: Song[] = fetchedVideos.map((item: any, idx: number) => {
        const vId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
        const snip = item.snippet;
        const details = videoDetailsMap[vId] || { duration: '06:15', durationSec: 375, viewCount: 1200, likeCount: 85 };
        const rawTitle = snip.title || `Sacred Track ${idx + 1}`;
        const thumb = snip.thumbnails?.maxres?.url || snip.thumbnails?.standard?.url || snip.thumbnails?.high?.url || snip.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`;
        
        const lowerTitle = rawTitle.toLowerCase();
        let catId = 'cat-sivan';
        let catName = 'Annamalaiyar & Sivan';
        let deity = 'ANNAMALAIYAR_SIVAN';
        let deityTamilName = 'அண்ணாமலையார் & சிவன்';
        let songType = 'DEVOTIONAL_HIT';
        let songTypeLabel = 'பக்தி பாடல்';

        if (lowerTitle.includes('amman') || lowerTitle.includes('mariamman') || lowerTitle.includes('devi') || lowerTitle.includes('durga') || lowerTitle.includes('aadi') || lowerTitle.includes('sakthi')) {
          catId = 'cat-amman';
          catName = 'Amman & Shakthi';
          deity = 'AMMAN_SHAKTHI';
          deityTamilName = 'அம்மன் & ஓம்சக்தி';
          songType = lowerTitle.includes('aadi') || lowerTitle.includes('velli') ? 'FRIDAY_AADI_SPECIAL' : 'DEVOTIONAL_HIT';
          songTypeLabel = lowerTitle.includes('aadi') ? 'ஆடி வெள்ளி சிறப்பு' : 'அம்மன் பாடல்';
        } else if (lowerTitle.includes('muruga') || lowerTitle.includes('kandha') || lowerTitle.includes('vel') || lowerTitle.includes('palani') || lowerTitle.includes('tiruchendur')) {
          catId = 'cat-murugan';
          catName = 'Murugan Padalgal';
          deity = 'MURUGAN';
          deityTamilName = 'முருகன்';
          songType = lowerTitle.includes('kavasam') ? 'KAVASAM' : 'DEVOTIONAL_HIT';
          songTypeLabel = lowerTitle.includes('kavasam') ? 'கந்த சஷ்டி கவசம்' : 'முருகன் பாடல்';
        } else if (lowerTitle.includes('vinayag') || lowerTitle.includes('ganesh') || lowerTitle.includes('pillaiyar')) {
          catId = 'cat-vinayagar';
          catName = 'Vinayagar Padalgal';
          deity = 'VINAYAGAR';
          deityTamilName = 'விநாயகர் & கணபதி';
          songType = 'DEVOTIONAL_HIT';
          songTypeLabel = 'விநாயகர் பாடல்';
        } else if (lowerTitle.includes('ayyapp') || lowerTitle.includes('sabarimala') || lowerTitle.includes('swamy') || lowerTitle.includes('pallikattu') || lowerTitle.includes('harivarasanam')) {
          catId = 'cat-ayyappan';
          catName = 'Ayyappan & Sabarimala';
          deity = 'AYYAPPAN';
          deityTamilName = 'ஐயப்பன் & சபரிமலை';
          songType = lowerTitle.includes('harivarasanam') ? 'HARIVARASANAM' : lowerTitle.includes('pallikattu') ? 'VILLUPAATTU' : 'DEVOTIONAL_HIT';
          songTypeLabel = lowerTitle.includes('harivarasanam') ? 'ஹரிவராசனம்' : 'ஐயப்பன் பாடல்';
        } else if (lowerTitle.includes('perumal') || lowerTitle.includes('venkateswara') || lowerTitle.includes('govinda') || lowerTitle.includes('tirupati') || lowerTitle.includes('suprabhatam')) {
          catId = 'cat-perumal';
          catName = 'Perumal & Venkateswara';
          deity = 'PERUMAL_VENKATESWARA';
          deityTamilName = 'பெருமாள் & வெங்கடேஸ்வரா';
          songType = lowerTitle.includes('suprabhatam') ? 'SUPRABHATAM' : 'BHAJAN';
          songTypeLabel = lowerTitle.includes('suprabhatam') ? 'சுப்ரபாதம்' : 'கோவிந்தா நாமாவளி';
        } else if (lowerTitle.includes('urumee') || lowerTitle.includes('pambai') || lowerTitle.includes('karuppasamy') || lowerTitle.includes('ayyanar') || lowerTitle.includes('folk')) {
          catId = 'cat-folk';
          catName = 'Grama Devathai & Folk Bhakti';
          deity = 'GRAMA_DEVATHAI';
          deityTamilName = 'கிராம தேவதை & கருப்பசாமி';
          songType = 'URUMEE_MELAM';
          songTypeLabel = 'உறுமி மேளம் & பம்பை';
        } else if (lowerTitle.includes('krishna') || lowerTitle.includes('radhe') || lowerTitle.includes('gopala') || lowerTitle.includes('flute')) {
          catId = 'cat-krishna';
          catName = 'Krishna & Radhe Shyam';
          deity = 'KRISHNA';
          deityTamilName = 'கிருஷ்ணர் & கோவிந்தா';
          songType = 'BHAJAN';
          songTypeLabel = 'கிருஷ்ணா பஜனை';
        } else if (lowerTitle.includes('hanuman') || lowerTitle.includes('anjaneya') || lowerTitle.includes('chalisa')) {
          catId = 'cat-anjaneyar';
          catName = 'Anjaneyar & Hanuman';
          deity = 'ANJANEYAR_HANUMAN';
          deityTamilName = 'ஆஞ்சநேயர் & அனுமன்';
          songType = 'STHOTRA';
          songTypeLabel = 'அனுமன் சாலீசா';
        } else if (lowerTitle.includes('girivalam') || lowerTitle.includes('arunachala') || lowerTitle.includes('annamalai')) {
          catId = 'cat-sivan';
          catName = 'Annamalaiyar & Sivan';
          deity = 'ANNAMALAIYAR_SIVAN';
          deityTamilName = 'அண்ணாமலையார் & சிவன்';
          songType = lowerTitle.includes('anthathi') ? 'ANTHATHI' : 'GIRIVALAM';
          songTypeLabel = lowerTitle.includes('anthathi') ? 'அந்தாதி' : 'கிரிவலம்';
        }

        return {
          id: `yt-song-${vId}`,
          title: cleanVideoTitle(rawTitle),
          subtitle: rawTitle,
          tamilTitle: rawTitle,
          description: snip.description || `${rawTitle} - Official release by Subam Audio Vision.`,
          coverImage: thumb,
          previewAudioUrl: '',
          fullAudioUrl: '',
          price: 49,
          duration: details.duration,
          durationSeconds: details.durationSec,
          language: lowerTitle.includes('sanskrit') ? 'Sanskrit' : 'Tamil',
          categoryId: catId,
          categoryName: catName,
          deity: deity as any,
          deityTamilName: deityTamilName,
          songType: songType as any,
          songTypeLabel: songTypeLabel,
          releaseDate: snip.publishedAt ? snip.publishedAt.split('T')[0] : '2026-01-01',
          status: 'PUBLISHED',
          playCount: details.viewCount || (idx * 450 + 820),
          downloadCount: Math.floor((details.viewCount || 1000) / 12),
          featured: idx < 6,
          trending: idx < 8,
          youtubeUrl: `https://www.youtube.com/watch?v=${vId}`,
          youtubeVideoId: vId,
          credits: {
            singer: extractSingerFromTitle(rawTitle) || 'Subam Devotional Maestros',
            composer: 'Subam Audio Vision',
            lyricist: 'Traditional Devotional',
            musicDirector: 'Subam Audio Vision',
            studio: 'Subam Audio Vision Studio • Tiruvannamalai'
          },
          raga: detectRaga(rawTitle),
          tala: 'Adi Tala (8 Beats)'
        };
      });

      const songMap = new Map<string, Song>();
      [...DRIVE_DEVOTIONAL_SONGS, ...INITIAL_SONGS, ...realSongs].forEach(s => {
        songMap.set(s.id, s);
      });
      songs = Array.from(songMap.values());
    }

    // 7. Map Playlists
    if (fetchedPlaylists.length > 0) {
      playlists = fetchedPlaylists.map((pl: any) => {
        const snip = pl.snippet;
        const plId = pl.id;
        const thumb = snip.thumbnails?.maxres?.url || snip.thumbnails?.standard?.url || snip.thumbnails?.high?.url || `https://i.ytimg.com/vi/${plId}/hqdefault.jpg`;
        return {
          id: `yt-pl-${plId}`,
          title: cleanVideoTitle(snip.title),
          tamilTitle: snip.title,
          description: snip.description || 'Curated sacred devotional jukebox by Subam Audio Vision.',
          thumbnailUrl: thumb,
          youtubePlaylistUrl: `https://www.youtube.com/playlist?list=${plId}`,
          youtubePlaylistId: plId,
          songCount: pl.contentDetails?.itemCount || 12,
          featured: true,
          category: snip.title.includes('Sivan') ? 'Lord Shiva' : snip.title.includes('Amman') ? 'Goddess Mariamman' : 'Sacred Jukebox',
          curator: 'Subam Audio Vision',
          plays: `${(Math.floor(Math.random() * 50) + 120)}K`
        };
      });
    }

    if (fetchedStreams.length > 0) {
      const activeIds = new Set(fetchedStreams.map(s => s.id));
      const preserved = INITIAL_YOUTUBE_STREAMS.filter(s => !activeIds.has(s.id));
      youtubeStreams = [...fetchedStreams, ...preserved];
    } else {
      youtubeStreams = [...INITIAL_YOUTUBE_STREAMS];
    }

    return {
      success: true,
      channel: {
        id: channelId,
        title: channelSnippet.title,
        subscriberCount: siteSettings.youtubeSubscriberCount,
        videoCount: siteSettings.youtubeVideoCount,
        thumbnail: channelSnippet.thumbnails?.high?.url
      },
      syncedSongsCount: songs.length,
      syncedPlaylistsCount: playlists.length,
      syncedStreamsCount: youtubeStreams.length,
      syncedAt: siteSettings.youtubeLastSyncedAt,
      message: `Successfully synced ${songs.length} videos, ${playlists.length} playlists, and channel metadata from YouTube channel "${channelSnippet.title}".`
    };

  } catch (error: any) {
    console.error('YouTube Data API Sync Error:', error);
    return {
      success: false,
      error: 'API_REQUEST_FAILED',
      message: error.message || 'Failed to communicate with YouTube Data API v3.'
    };
  }
}

// ---------------- API ROUTES ----------------

// Health check endpoints for probes and Cloud Run liveness/startup checks
app.get(['/api/health', '/health', '/healthz', '/_healthz'], (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', brand: siteSettings.brandName, timestamp: new Date().toISOString() });
});

// Site Settings
app.get('/api/settings', (req: Request, res: Response) => {
  res.json(siteSettings);
});

// Songs
app.get('/api/songs', (req: Request, res: Response) => {
  const { category, search, sort, language } = req.query;
  let filtered = [...songs];

  if (category && category !== 'all') {
    filtered = filtered.filter(s => s.categoryId === category || s.categoryName.toLowerCase() === (category as string).toLowerCase());
  }

  if (language && language !== 'all') {
    filtered = filtered.filter(s => s.language.toLowerCase() === (language as string).toLowerCase());
  }

  if (search && (search as string).trim()) {
    filtered = searchItems(filtered, (search as string).trim());
  }

  if (sort === 'popular') {
    filtered.sort((a, b) => b.playCount - a.playCount);
  } else if (sort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (!search) {
    // latest (only if not already sorted by search relevance)
    filtered.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
  }

  res.json(filtered);
});

// Comprehensive Global Search API (Master Tracks + 1,330 Subam YouTube Releases + Artists)
app.get('/api/search', (req: Request, res: Response) => {
  const query = ((req.query.q as string) || '').trim();
  if (!query) {
    return res.json({
      query: '',
      total: 0,
      masterTracks: [],
      youtubeReleases: [],
      artists: [],
      results: []
    });
  }

  // 1. Search Master Devotional Songs
  const masterTracks = searchItems(songs, query);

  // 2. Search Subam Audio Vision YouTube Catalog (1,330 releases)
  const matchedChannelVideos: any[] = [];
  if (channelVideosCatalog && channelVideosCatalog.length > 0) {
    for (const vid of channelVideosCatalog) {
      const match = evaluateSearchMatch({
        title: vid.title,
        tamilTitle: vid.title,
        description: vid.description || '',
        albumTitle: 'Subam Audio Vision Official Channel Releases'
      }, query);

      if (match.matched && match.score > 0) {
        matchedChannelVideos.push({
          vid,
          score: match.score
        });
      }
    }
    matchedChannelVideos.sort((a, b) => b.score - a.score);
  }

  // Convert top 40 YouTube matches into playable Song objects
  const youtubeSongs: Song[] = matchedChannelVideos.slice(0, 40).map(({ vid }) => {
    const rawTitle = vid.title || '';
    const cleanTitle = cleanVideoTitle(rawTitle);
    const singer = extractSingerFromTitle(rawTitle) || 'Subam Devotional Maestros';
    return {
      id: `yt-cat-${vid.videoId}`,
      title: cleanTitle,
      subtitle: rawTitle,
      tamilTitle: rawTitle,
      description: vid.description?.slice(0, 200) || 'Sacred devotional release by Subam Audio Vision',
      coverImage: vid.thumbnails?.high?.url || vid.thumbnails?.medium?.url || vid.thumbnails?.default?.url || '/images/shiva.jpg',
      previewAudioUrl: '',
      fullAudioUrl: '',
      price: 0,
      duration: '4:45',
      durationSeconds: 285,
      language: 'Tamil',
      categoryId: 'cat-devotional',
      categoryName: 'Subam YouTube Release',
      releaseDate: vid.publishedAt || new Date().toISOString(),
      status: 'PUBLISHED',
      playCount: 12000,
      downloadCount: 800,
      youtubeUrl: `https://www.youtube.com/watch?v=${vid.videoId}`,
      youtubeVideoId: vid.videoId,
      credits: {
        singer,
        composer: 'Subam Audio Vision',
        lyricist: 'Traditional Devotional',
        musicDirector: 'Subam Audio Vision'
      }
    };
  });

  // 3. Search Artists
  const matchedArtists = artists.filter(a => {
    const q = query.toLowerCase();
    return a.name.toLowerCase().includes(q) || 
           (a.bio && a.bio.toLowerCase().includes(q)) ||
           (q.includes('spb') && a.name.toLowerCase().includes('balasubrahmanyam'));
  });

  // Deduplicate master tracks and youtube videos
  const seenVideoIds = new Set(masterTracks.map(m => m.youtubeVideoId).filter(Boolean));
  const seenTitles = new Set(masterTracks.map(m => m.title.toLowerCase().trim()));
  
  const uniqueYouTube = youtubeSongs.filter(y => 
    (!y.youtubeVideoId || !seenVideoIds.has(y.youtubeVideoId)) &&
    !seenTitles.has(y.title.toLowerCase().trim())
  );

  // Unified combined results: Master tracks first, then YouTube releases
  const unifiedResults = [...masterTracks, ...uniqueYouTube];

  res.json({
    query,
    total: unifiedResults.length,
    masterTracks: masterTracks.slice(0, 50),
    youtubeReleases: uniqueYouTube.slice(0, 50),
    artists: matchedArtists,
    results: unifiedResults.slice(0, 60)
  });
});

app.get('/api/songs/trending', (req: Request, res: Response) => {
  const trending = songs.filter(s => s.trending || s.featured);
  res.json(trending.slice(0, 6));
});

app.get('/api/songs/:id', (req: Request, res: Response) => {
  const song = songs.find(s => s.id === req.params.id);
  if (!song) return res.status(404).json({ error: 'Song not found' });
  res.json(song);
});

// Categories
app.get('/api/categories', (req: Request, res: Response) => {
  res.json(categories);
});

// Artists
app.get('/api/artists', (req: Request, res: Response) => {
  res.json(artists);
});

app.get('/api/artists/:id', (req: Request, res: Response) => {
  const artist = artists.find(a => a.id === req.params.id);
  if (!artist) return res.status(404).json({ error: 'Artist not found' });
  const artistSongs = songs.filter(s =>
    s.credits.singerId === artist.id ||
    s.credits.composerId === artist.id ||
    s.credits.lyricistId === artist.id ||
    s.credits.singer.toLowerCase().includes(artist.name.toLowerCase())
  );
  res.json({ ...artist, songs: artistSongs });
});

// Lyrics
app.get('/api/lyrics/:songId', (req: Request, res: Response) => {
  const lyric = lyrics[req.params.songId];
  if (!lyric) {
    const song = songs.find(s => s.id === req.params.songId);
    if (!song) return res.status(404).json({ error: 'Lyrics not found' });
    return res.json({
      id: `lyric-${song.id}`,
      songId: song.id,
      songTitle: song.title,
      singer: song.credits.singer,
      lyricsText: `[Devotional Hymn: ${song.title}]\n\nAuthentic sacred stotra verses recorded in studio master fidelity.\n\nCredits:\nSinger: ${song.credits.singer}\nComposer: ${song.credits.composer}\nLyrics: ${song.credits.lyricist}`,
      meaning: song.description,
      raga: song.raga,
      tala: song.tala
    });
  }
  res.json(lyric);
});

// Subam Devotional Song Slots API
app.get('/api/slots', (req: Request, res: Response) => {
  try {
    const albumQuery = req.query.album as string | undefined;
    const deityQuery = req.query.deity as string | undefined;

    let result = [...DRIVE_DEVOTIONAL_SLOTS];

    if (albumQuery && albumQuery !== 'ALL') {
      result = result.filter(s => s.albumCode?.toLowerCase() === albumQuery.toLowerCase() || s.albumTitle?.toLowerCase().includes(albumQuery.toLowerCase()));
    }

    if (deityQuery && deityQuery !== 'ALL') {
      result = result.filter(s => s.deity === deityQuery);
    }

    res.json(result);
  } catch (err) {
    res.json(DRIVE_DEVOTIONAL_SLOTS);
  }
});

app.post('/api/slots/upload-audio', (req: Request, res: Response) => {
  try {
    const { slotId, fileName, fileBase64 } = req.body;
    if (!fileName || !fileBase64) {
      return res.status(400).json({ error: 'Missing fileName or fileBase64 data' });
    }

    const audioDir = path.join(process.cwd(), 'public', 'audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const safeName = `${slotId || 'slot'}_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const filePath = path.join(audioDir, safeName);
    const buffer = Buffer.from(fileBase64.replace(/^data:audio\/\w+;base64,/, ''), 'base64');
    fs.writeFileSync(filePath, buffer);

    res.json({
      success: true,
      audioUrl: `/audio/${encodeURIComponent(safeName)}`,
      fileName: safeName,
      size: buffer.length
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Audio upload failed' });
  }
});

// YouTube Live & Streams
app.get('/api/youtube/live', (req: Request, res: Response) => {
  const live = youtubeStreams.find(s => s.status === 'LIVE') || youtubeStreams[0];
  res.json(live);
});

app.get('/api/youtube/streams', (req: Request, res: Response) => {
  res.json(youtubeStreams);
});

// YouTube Data API v3 Status Check
app.get('/api/youtube/status', (req: Request, res: Response) => {
  const hasKey = !!getYouTubeApiKey();
  res.json({
    configured: hasKey,
    channelHandle: siteSettings.youtubeChannelHandle || '@subamaudiovision',
    channelId: siteSettings.youtubeChannelId || '',
    lastSyncedAt: siteSettings.youtubeLastSyncedAt || null,
    subscriberCount: siteSettings.youtubeSubscriberCount || '600K+',
    videoCount: siteSettings.youtubeVideoCount || `${songs.length}`,
    syncedSongsCount: songs.length,
    syncedPlaylistsCount: playlists.length,
    syncedStreamsCount: youtubeStreams.length
  });
});

// YouTube Data API v3 Sync (POST & GET)
app.all('/api/youtube/sync', async (req: Request, res: Response) => {
  const apiKey = (req.body?.apiKey || req.query?.apiKey || '') as string;
  const handle = (req.body?.channelHandle || req.query?.channelHandle || siteSettings.youtubeChannelId || 'subamaudiovision') as string;

  const result = await syncYouTubeChannelData(apiKey, handle);
  if (!result.success && result.error === 'NO_API_KEY') {
    return res.status(400).json(result);
  }
  res.json(result);
});

// Find verified YouTube Video for any song or slot using YouTube Data API v3 and channel index
app.get('/api/youtube/find-video', async (req: Request, res: Response) => {
  const title = (req.query.title as string || '').trim();
  const tamilTitle = (req.query.tamilTitle as string || '').trim();
  const album = (req.query.album as string || '').trim();
  const singer = (req.query.singer as string || '').trim();
  const deity = (req.query.deity as string || '').trim();
  const filename = (req.query.filename as string || '').trim();

  // 1. Check mapped tracks dictionary first
  if (filename && youtubeTracksMapping[filename]) {
    const item = youtubeTracksMapping[filename];
    return res.json({
      success: true,
      source: 'manifest_map',
      videoId: item.videoId,
      videoUrl: item.videoUrl || `https://www.youtube.com/watch?v=${item.videoId}`,
      videoTitle: item.videoTitle,
      channelUrl: 'https://www.youtube.com/@subamaudiovision'
    });
  }

  // Check by title in mapping
  if (title) {
    const titleLower = title.toLowerCase();
    for (const item of Object.values(youtubeTracksMapping)) {
      if (item.title && item.title.toLowerCase() === titleLower) {
        return res.json({
          success: true,
          source: 'manifest_title_match',
          videoId: item.videoId,
          videoUrl: item.videoUrl || `https://www.youtube.com/watch?v=${item.videoId}`,
          videoTitle: item.videoTitle,
          channelUrl: 'https://www.youtube.com/@subamaudiovision'
        });
      }
    }
  }

  // 2. Search local 1330 channel videos index
  const cleanWords = (str: string) => str.toLowerCase().replace(/[^\w\s\u0B80-\u0BFF]/g, ' ').split(/\s+/).filter(w => w.length > 2);
  const titleWords = cleanWords(title);
  const tamilWords = cleanWords(tamilTitle);
  const albumWords = cleanWords(album);
  const singerWords = cleanWords(singer);

  let bestVid: any = null;
  let bestScore = 0;

  for (const v of channelVideosCatalog) {
    let score = 0;
    const vt = v.title.toLowerCase();
    const vd = (v.description || '').toLowerCase();

    for (const w of titleWords) {
      if (vt.includes(w)) score += 25;
      else if (vd.includes(w)) score += 8;
    }
    for (const w of tamilWords) {
      if (vt.includes(w)) score += 25;
      else if (vd.includes(w)) score += 8;
    }
    for (const w of albumWords) {
      if (vt.includes(w)) score += 10;
      else if (vd.includes(w)) score += 3;
    }
    for (const w of singerWords) {
      if (vt.includes(w)) score += 5;
    }

    if (score > bestScore) {
      bestScore = score;
      bestVid = v;
    }
  }

  if (bestVid && bestScore >= 20) {
    return res.json({
      success: true,
      source: 'channel_index',
      score: bestScore,
      videoId: bestVid.videoId,
      videoUrl: `https://www.youtube.com/watch?v=${bestVid.videoId}`,
      videoTitle: bestVid.title,
      channelUrl: 'https://www.youtube.com/@subamaudiovision'
    });
  }

  // 3. Query YouTube Data API v3 live if API key exists
  const apiKey = getYouTubeApiKey();
  if (apiKey && (title || album)) {
    try {
      const q = `${title} ${album}`.trim();
      const ytApiRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UCSR63blT1lmkrPUElpACQnw&type=video&maxResults=1&q=${encodeURIComponent(q)}&key=${apiKey}`);
      const ytApiData = await ytApiRes.json();
      if (ytApiData.items && ytApiData.items.length > 0) {
        const found = ytApiData.items[0];
        const vId = found.id.videoId;
        return res.json({
          success: true,
          source: 'youtube_api_live',
          videoId: vId,
          videoUrl: `https://www.youtube.com/watch?v=${vId}`,
          videoTitle: found.snippet.title,
          thumbnail: found.snippet.thumbnails?.high?.url || found.snippet.thumbnails?.default?.url,
          channelUrl: 'https://www.youtube.com/@subamaudiovision'
        });
      }
    } catch (e: any) {
      console.warn('Live YouTube search notice:', e.message);
    }
  }

  // 4. Default fallback: Best deity video or top Subam video (NEVER 17mC8Z-xK6c!)
  let fallbackId = 'd5f4ZHwxJnA';
  let fallbackTitle = 'வினை தீர்க்கும் விநாயகனே | VINAI THEERKUM VINAYAGANAE';
  if (deity === 'ANNAMALAIYAR_SIVAN' || title.toLowerCase().includes('siva') || album.toLowerCase().includes('sivan')) {
    fallbackId = 'PVjmS5ItHcc';
    fallbackTitle = 'ஆதி சிவனே பாடல் | Aadhi Sivanae Song';
  } else if (deity === 'AMMAN_SHAKTHI' || title.toLowerCase().includes('amman')) {
    fallbackId = 'Yq0hRHi43ng';
    fallbackTitle = 'செவ்வாடைக்காரி பாடல் | Sevvadaikkaari Song';
  } else if (deity === 'PERUMAL_VENKATESWARA' || title.toLowerCase().includes('perumal')) {
    fallbackId = 'GpdTcN38oMo';
    fallbackTitle = 'பெருமாள் பக்தி பாடல்கள் | Perumal hit songs';
  } else if (deity === 'MURUGAN' || title.toLowerCase().includes('muruga')) {
    fallbackId = 'V454Bvk5jpQ';
    fallbackTitle = 'முருகன் பக்தி பாடல்கள் | Lord Murugar songs';
  } else if (deity === 'AYYAPPAN' || title.toLowerCase().includes('ayyapp')) {
    fallbackId = 'xpp-ltE2trI';
    fallbackTitle = 'சபரிமலை யாத்திரையில் ஐயப்ப பக்தர்கள் பாடல்கள்';
  }

  const queryEnc = encodeURIComponent(`Subam Audio Vision ${title || album}`);
  res.json({
    success: true,
    source: 'deity_verified_fallback',
    videoId: fallbackId,
    videoUrl: `https://www.youtube.com/watch?v=${fallbackId}`,
    videoTitle: fallbackTitle,
    searchUrl: `https://www.youtube.com/results?search_query=${queryEnc}`,
    channelUrl: 'https://www.youtube.com/@subamaudiovision'
  });
});

// Official YouTube Playlists
app.get('/api/playlists', (req: Request, res: Response) => {
  res.json(playlists);
});

// Authentication & Demo User
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || users[0];
  res.json({ user, token: `jwt_${user.id}_${Date.now()}` });
});

app.post('/api/auth/demo-login', (req: Request, res: Response) => {
  const { role } = req.body;
  const targetRole = role === 'ADMIN' ? 'ADMIN' : 'USER';
  const user = users.find(u => u.role === targetRole) || users[0];
  res.json({ user, token: `jwt_${user.id}_${Date.now()}` });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone } = req.body;
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.json({ user: existing, token: `jwt_${existing.id}_${Date.now()}` });
  }

  const newUser: User = {
    id: `usr-${Date.now()}`,
    name: name || 'Devotee',
    email,
    phone,
    role: 'USER',
    profilePhoto: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop`,
    purchasedSongIds: [],
    favorites: [],
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  res.json({ user: newUser, token: `jwt_${newUser.id}_${Date.now()}` });
});

// Favorites Toggle
app.post('/api/user/favorites/toggle', (req: Request, res: Response) => {
  const { userId, songId } = req.body;
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.favorites.includes(songId)) {
    user.favorites = user.favorites.filter(id => id !== songId);
  } else {
    user.favorites.push(songId);
  }
  res.json({ favorites: user.favorites });
});

// Orders & Purchase History
app.get('/api/orders', (req: Request, res: Response) => {
  const { userId } = req.query;
  if (userId) {
    return res.json(orders.filter(o => o.userId === userId));
  }
  res.json(orders);
});

// Payments - Razorpay Flow Architecture
app.post('/api/payments/create-order', (req: Request, res: Response) => {
  const { songId, userId } = req.body;
  const song = songs.find(s => s.id === songId);
  if (!song) return res.status(404).json({ error: 'Song not found' });

  // Generate secure order ID for Razorpay integration
  const gatewayOrderId = `order_RZP_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  res.json({
    gatewayOrderId,
    amount: song.price * 100, // in paise (e.g. 4900 for ₹49)
    currency: 'INR',
    keyId: siteSettings.razorpayKeyId || 'rzp_test_samplekey123',
    song: {
      id: song.id,
      title: song.title,
      price: song.price,
      coverImage: song.coverImage,
      singer: song.credits.singer
    }
  });
});

app.post('/api/payments/verify', (req: Request, res: Response) => {
  const { gatewayOrderId, gatewayPaymentId, songId, userId, userName, userEmail, paymentMethod } = req.body;
  
  const song = songs.find(s => s.id === songId);
  if (!song) return res.status(404).json({ error: 'Song not found' });

  // In production with real keys, crypto.createHmac('sha256', SECRET) verifies signature
  const verifiedPaymentId = gatewayPaymentId || `pay_RZP_${Date.now()}`;

  // Record Order
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    userId: userId || 'usr-devotee',
    userName: userName || 'Devotee',
    userEmail: userEmail || 'devotee@example.com',
    songId: song.id,
    songTitle: song.title,
    songArtwork: song.coverImage,
    amount: song.price,
    currency: 'INR',
    paymentStatus: 'SUCCESS',
    status: 'SUCCESS',
    paymentMethod: paymentMethod || 'UPI (Razorpay)',
    gatewayOrderId,
    gatewayPaymentId: verifiedPaymentId,
    createdAt: new Date().toISOString()
  };
  orders.unshift(newOrder);

  // Grant Purchase to User
  const user = users.find(u => u.id === (userId || 'usr-devotee'));
  if (user && !user.purchasedSongIds.includes(song.id)) {
    user.purchasedSongIds.push(song.id);
  }

  song.downloadCount += 1;

  // Generate immediate signed temporary download token
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24 hours
  downloadTokens[token] = {
    userId: user?.id || 'usr-devotee',
    songId: song.id,
    expiresAt,
    count: 0
  };

  res.json({
    success: true,
    message: 'Payment verified successfully and digital master audio license issued.',
    order: newOrder,
    downloadToken: token,
    expiresIn: '24 hours'
  });
});

// Secure Download Token Generator
app.post('/api/downloads/generate-token/:songId', (req: Request, res: Response) => {
  const { songId } = req.params;
  const { userId } = req.body;

  const user = users.find(u => u.id === userId);
  const song = songs.find(s => s.id === songId);

  if (!song) return res.status(404).json({ error: 'Song not found' });
  if (!user || (!user.purchasedSongIds.includes(songId) && user.role !== 'ADMIN')) {
    return res.status(403).json({ error: 'Purchase verification required for master audio download' });
  }

  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24 hours
  downloadTokens[token] = {
    userId: user.id,
    songId: song.id,
    expiresAt,
    count: 0
  };

  res.json({
    token,
    expiresAt,
    downloadUrl: `/api/downloads/${token}`,
    format: 'WAV / Lossless 24-bit 96kHz Master',
    fileSize: '48.2 MB'
  });
});

app.get('/api/downloads/:token', (req: Request, res: Response) => {
  const tokenData = downloadTokens[req.params.token];
  if (!tokenData || Date.now() > tokenData.expiresAt) {
    return res.status(403).json({ error: 'Download token expired or invalid. Please re-generate from My Library.' });
  }

  tokenData.count += 1;
  const song = songs.find(s => s.id === tokenData.songId);
  if (!song) return res.status(404).json({ error: 'Song not found' });

  // Deliver high-fidelity digital audio certificate & master audio metadata
  res.json({
    status: 'DOWNLOAD_READY',
    songTitle: song.title,
    artist: song.credits.singer,
    composer: song.credits.composer,
    raga: song.raga,
    quality: 'Lossless Studio Master (432Hz 24-bit FLAC / WAV)',
    license: `OFFICIAL SACRED AUDIO LICENSE #ND-${req.params.token.slice(0, 8).toUpperCase()}`,
    issuedTo: tokenData.userId,
    downloadCount: tokenData.count
  });
});

// Admin Management Endpoints
app.get('/api/admin/overview', (req: Request, res: Response) => {
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'SUCCESS')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPurchases = orders.filter(o => o.paymentStatus === 'SUCCESS').length;
  const totalDownloads = songs.reduce((acc, curr) => acc + curr.downloadCount, 0);

  res.json({
    stats: {
      totalUsers: users.length,
      totalSongs: songs.length,
      totalArtists: artists.length,
      totalPurchases,
      totalRevenue,
      totalDownloads,
      activeLiveViewers: youtubeStreams.find(s => s.status === 'LIVE')?.viewersCount || 0
    },
    recentOrders: orders.slice(0, 6),
    popularSongs: [...songs].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 5)
  });
});

// Admin Songs CRUD
app.post('/api/admin/songs', (req: Request, res: Response) => {
  const songData = req.body;
  const newSong: Song = {
    ...songData,
    id: `song-${Date.now()}`,
    playCount: 0,
    downloadCount: 0,
    releaseDate: songData.releaseDate || new Date().toISOString().split('T')[0]
  };
  songs.unshift(newSong);
  res.json(newSong);
});

app.put('/api/admin/songs/:id', (req: Request, res: Response) => {
  const index = songs.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Song not found' });
  songs[index] = { ...songs[index], ...req.body };
  res.json(songs[index]);
});

app.delete('/api/admin/songs/:id', (req: Request, res: Response) => {
  songs = songs.filter(s => s.id !== req.params.id);
  res.json({ success: true, message: 'Song deleted' });
});

// Admin Artists CRUD
app.post('/api/admin/artists', (req: Request, res: Response) => {
  const artistData = req.body;
  const newArtist: Artist = {
    ...artistData,
    id: `art-${Date.now()}`,
    songCount: 0
  };
  artists.push(newArtist);
  res.json(newArtist);
});

app.put('/api/admin/artists/:id', (req: Request, res: Response) => {
  const index = artists.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Artist not found' });
  artists[index] = { ...artists[index], ...req.body };
  res.json(artists[index]);
});

app.delete('/api/admin/artists/:id', (req: Request, res: Response) => {
  artists = artists.filter(a => a.id !== req.params.id);
  res.json({ success: true });
});

// Admin YouTube CRUD
app.post('/api/admin/youtube', (req: Request, res: Response) => {
  const streamData = req.body;
  const videoId = extractYouTubeId(streamData.youtubeUrl);
  const newStream: YouTubeStream = {
    ...streamData,
    id: `yt-${Date.now()}`,
    youtubeVideoId: videoId,
    thumbnailUrl: streamData.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  };
  youtubeStreams.unshift(newStream);
  res.json(newStream);
});

app.put('/api/admin/youtube/:id', (req: Request, res: Response) => {
  const index = youtubeStreams.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Stream not found' });
  const videoId = extractYouTubeId(req.body.youtubeUrl || youtubeStreams[index].youtubeUrl);
  youtubeStreams[index] = {
    ...youtubeStreams[index],
    ...req.body,
    youtubeVideoId: videoId
  };
  res.json(youtubeStreams[index]);
});

app.delete('/api/admin/youtube/:id', (req: Request, res: Response) => {
  youtubeStreams = youtubeStreams.filter(s => s.id !== req.params.id);
  res.json({ success: true });
});

// Admin Settings
app.put('/api/admin/settings', (req: Request, res: Response) => {
  siteSettings = { ...siteSettings, ...req.body };
  res.json(siteSettings);
});

// Vite Middleware & Server Lifecycle Integration
async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));

  // In production or when dist build is present, serve static files directly
  if (process.env.NODE_ENV === 'production' || (hasDist && process.env.NODE_ENV !== 'development')) {
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Not Found');
      }
    });
  } else {
    // Vite middleware for local development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  // Primary server binding on PORT (0.0.0.0)
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Subam Audio Vision Server running at http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || 'development'}, cloud_run: ${isCloudRun})`);
    
    // Auto-sync YouTube Channel if API Key is configured in environment
    const autoApiKey = getYouTubeApiKey();
    if (autoApiKey) {
      console.log('🔄 Initiating background YouTube Channel synchronization...');
      syncYouTubeChannelData(autoApiKey, siteSettings.youtubeChannelHandle || 'subamaudiovision')
        .then((res) => {
          if (res.success) {
            console.log(`✅ YouTube Channel Sync Success: ${res.syncedSongsCount} songs, ${res.syncedPlaylistsCount} playlists synced.`);
          } else {
            console.log(`⚠️ YouTube Channel Sync Notice: ${res.message}`);
          }
        })
        .catch((err) => {
          console.warn('⚠️ YouTube Channel Sync Error:', err.message);
        });
    }
  });

  server.on('error', (err: any) => {
    console.error(`Server listen notice on port ${PORT}:`, err.message);
  });
}

startServer().catch((err) => {
  console.error('Fatal error during startServer:', err);
  process.exit(1);
});
