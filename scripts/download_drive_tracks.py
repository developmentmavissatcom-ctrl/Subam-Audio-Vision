import os
import re
import json
import urllib.request
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed

AUDIO_DIR = os.path.join(os.getcwd(), 'public', 'audio')
TMP_DIR = '/tmp/sav_raw_audio'
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(TMP_DIR, exist_ok=True)

MANIFEST_FILE = os.path.join(os.getcwd(), 'src', 'data', 'drive_tracks_manifest.json')

with open(MANIFEST_FILE, 'r') as f:
    tracks = json.load(f)

print(f"Total tracks to process: {len(tracks)}")

def sanitize_name(name):
    name = re.sub(r'\.(wma|mp3)$', '', name, flags=re.IGNORECASE)
    name = re.sub(r'[^a-zA-Z0-9]+', '_', name).strip('_').lower()
    return name

def get_audio_duration(file_path):
    try:
        res = subprocess.run(
            ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file_path],
            capture_output=True, text=True, check=True
        )
        dur = float(res.stdout.strip())
        mins = int(dur // 60)
        secs = int(dur % 60)
        return f"{mins:02d}:{secs:02d}", int(dur)
    except Exception as e:
        return "05:00", 300

def process_track(track):
    fid = track['file_id']
    fname = track['filename']
    album = track['album']
    mp3_filename = track.get('mp3_filename')

    album_code = 'sav_acd_102'
    if '102' in album: album_code = 'sav_acd_102'
    elif '107' in album: album_code = 'sav_acd_107'
    elif '111' in album: album_code = 'sav_acd_111'
    elif '115' in album: album_code = 'sav_acd_115'
    elif '118' in album: album_code = 'sav_acd_118'
    elif '119' in album: album_code = 'sav_acd_119'
    elif '120' in album: album_code = 'sav_acd_120'
    elif '122' in album: album_code = 'sav_acd_122'
    elif '123' in album: album_code = 'sav_acd_123'
    elif '124' in album: album_code = 'sav_acd_124'
    elif '126' in album: album_code = 'sav_acd_126'
    elif '140' in album: album_code = 'sav_acd_140'

    clean_track = sanitize_name(fname)
    if not mp3_filename:
        mp3_filename = f"{album_code}_{clean_track}.mp3"

    target_mp3 = os.path.join(AUDIO_DIR, mp3_filename)
    url = f"https://drive.usercontent.google.com/download?id={fid}&export=download"

    # If already exists and valid audio > 100KB, skip re-download
    if os.path.exists(target_mp3) and os.path.getsize(target_mp3) > 100000:
        dur_str, dur_secs = get_audio_duration(target_mp3)
        return {
            **track,
            'mp3_filename': mp3_filename,
            'mp3_path': f"/audio/{mp3_filename}",
            'duration_str': dur_str,
            'duration_secs': dur_secs,
            'file_size': os.path.getsize(target_mp3),
            'status': 'existing'
        }

    is_wma = fname.lower().endswith('.wma')

    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        if is_wma:
            tmp_download = os.path.join(TMP_DIR, f"{album_code}_{clean_track}_{fid}.wma")
            with urllib.request.urlopen(req, timeout=30) as resp, open(tmp_download, 'wb') as out_f:
                out_f.write(resp.read())
            # Convert to mp3 using ffmpeg
            subprocess.run(
                ['ffmpeg', '-y', '-i', tmp_download, '-codec:a', 'libmp3lame', '-b:a', '128k', target_mp3],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True
            )
            if os.path.exists(tmp_download):
                os.remove(tmp_download)
        else:
            # Direct MP3 download
            tmp_mp3 = os.path.join(TMP_DIR, f"{album_code}_{clean_track}_{fid}.mp3")
            with urllib.request.urlopen(req, timeout=30) as resp, open(tmp_mp3, 'wb') as out_f:
                out_f.write(resp.read())
            # Verify and remux/re-encode if needed so every player can read it seamlessly
            subprocess.run(
                ['ffmpeg', '-y', '-i', tmp_mp3, '-codec:a', 'copy', target_mp3],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True
            )
            if os.path.exists(tmp_mp3):
                os.remove(tmp_mp3)

        dur_str, dur_secs = get_audio_duration(target_mp3)
        size = os.path.getsize(target_mp3)
        print(f"✓ Processed [{album_code}] {fname} -> {size / 1024 / 1024:.2f} MB ({dur_str})")
        return {
            **track,
            'mp3_filename': mp3_filename,
            'mp3_path': f"/audio/{mp3_filename}",
            'duration_str': dur_str,
            'duration_secs': dur_secs,
            'file_size': size,
            'status': 'downloaded'
        }
    except Exception as e:
        print(f"✗ Failed {album} / {fname} ({fid}): {e}")
        return {
            **track,
            'error': str(e),
            'status': 'error'
        }

if __name__ == '__main__':
    print("Starting parallel audio download & MP3 conversion...")
    results = []
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(process_track, t): t for t in tracks}
        for future in as_completed(futures):
            results.append(future.result())

    successful = [r for r in results if r.get('status') in ('downloaded', 'existing')]
    print(f"\nSuccessfully downloaded and converted: {len(successful)} / {len(tracks)} tracks")

    # Sort results to match original order
    track_order = {t['file_id']: idx for idx, t in enumerate(tracks)}
    results.sort(key=lambda r: track_order.get(r['file_id'], 999))

    with open(MANIFEST_FILE, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"Updated {MANIFEST_FILE}")
