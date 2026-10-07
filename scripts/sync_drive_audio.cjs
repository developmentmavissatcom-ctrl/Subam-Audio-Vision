const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const manifestPath = path.join(__dirname, '..', 'src', 'data', 'drive_tracks_manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const publicAudioDir = path.join(__dirname, '..', 'public', 'audio');
if (!fs.existsSync(publicAudioDir)) {
  fs.mkdirSync(publicAudioDir, { recursive: true });
}

console.log(`Starting processing for ${manifest.length} tracks...`);

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(true));
      });
    });
    req.on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function processTrack(item, index) {
  const targetMp3Name = item.mp3_filename;
  const targetMp3Path = path.join(publicAudioDir, targetMp3Name);

  // If already exists and is > 500KB and is valid MP3, check probe
  if (fs.existsSync(targetMp3Path)) {
    const size = fs.statSync(targetMp3Path).size;
    if (size > 500000) {
      try {
        const probe = execSync(`ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${targetMp3Path}"`).toString().trim();
        if (probe === 'mp3') {
          console.log(`[${index + 1}/${manifest.length}] Already cached & valid MP3: ${targetMp3Name} (${(size / 1024 / 1024).toFixed(1)}MB)`);
          return true;
        }
      } catch (e) {}
    }
  }

  const tempDownloadPath = path.join('/tmp', `raw_${item.file_id}_${path.basename(item.filename)}`);
  const downloadUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(item.file_id)}&export=download`;

  try {
    console.log(`[${index + 1}/${manifest.length}] Downloading: ${item.filename} (ID: ${item.file_id})...`);
    await downloadFile(downloadUrl, tempDownloadPath);
    const dlSize = fs.statSync(tempDownloadPath).size;
    console.log(`  Downloaded ${(dlSize / 1024 / 1024).toFixed(1)}MB. Converting to optimized MP3...`);

    // If already MP3, directly copy to save time and preserve original quality!
    if (item.filename.toLowerCase().endsWith('.mp3')) {
      fs.copyFileSync(tempDownloadPath, targetMp3Path);
    } else {
      // Convert WMA or others with ffmpeg to 160k MP3 with faststart
      const tempOut = path.join('/tmp', `out_${targetMp3Name}`);
      execSync(`ffmpeg -y -i "${tempDownloadPath}" -codec:a libmp3lame -b:a 160k -ar 44100 -id3v2_version 3 -write_xing 1 "${tempOut}" 2>/dev/null`);
      fs.copyFileSync(tempOut, targetMp3Path);
      try { fs.unlinkSync(tempOut); } catch (e) {}
    }

    try { fs.unlinkSync(tempDownloadPath); } catch (e) {}

    const outSize = fs.statSync(targetMp3Path).size;
    console.log(`  Saved ${targetMp3Name} (${(outSize / 1024 / 1024).toFixed(1)}MB)`);
    return true;
  } catch (err) {
    console.error(`  ERROR on ${item.filename}:`, err.message);
    try { if (fs.existsSync(tempDownloadPath)) fs.unlinkSync(tempDownloadPath); } catch (e) {}
    return false;
  }
}

async function run() {
  const concurrency = 6;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < manifest.length; i += concurrency) {
    const slice = manifest.slice(i, i + concurrency);
    const results = await Promise.all(slice.map((item, idx) => processTrack(item, i + idx)));
    for (const r of results) {
      if (r) successCount++; else failCount++;
    }
  }

  console.log(`\nFINISHED! Success: ${successCount}/${manifest.length}, Failed: ${failCount}`);
}

run();
