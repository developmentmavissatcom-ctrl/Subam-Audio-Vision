import os
import re
import json
import urllib.parse

MANIFEST_PATH = 'src/data/drive_tracks_manifest.json'
with open(MANIFEST_PATH, 'r') as f:
    tracks = json.load(f)

print(f"Total manifest tracks: {len(tracks)}")

# Define album metadata and default image mapping
ALBUM_META = {
    'SAV ACD 102 - AADHI SAKTHI': {
        'code': 'SAV_ACD_102',
        'title': 'Aadhi Sakthi',
        'tamilTitle': 'ஆதி சக்தி',
        'deity': 'AMMAN_SHAKTHI',
        'deityTamil': 'அம்மன் & ஓம்சக்தி / காளியம்மன்',
        'categoryName': 'Amman & Shakthi',
        'categoryId': 'cat-amman_shakthi',
        'singer': 'Mahanadhi Shobana',
        'singerId': 'art-shobana',
        'defaultImage': 'Aadhi Sakthi [SPB] PNG FINAL.png',
        'raga': 'Revati',
        'tala': 'Adi Tala'
    },
    'SAV ACD 107 - SIVAMALAI': {
        'code': 'SAV_ACD_107',
        'title': 'Sivamalai',
        'tamilTitle': 'சிவமாலை',
        'deity': 'ANNAMALAIYAR_SIVAN',
        'deityTamil': 'அண்ணாமலையார் & சிவன்',
        'categoryName': 'Annamalaiyar & Sivan',
        'categoryId': 'cat-annamalaiyar_sivan',
        'singer': 'Dr. S.P. Balasubrahmanyam',
        'singerId': 'art-spb',
        'defaultImage': 'Shivamaalai [SPB] Final.png',
        'raga': 'Bhairav',
        'tala': 'Adi Tala'
    },
    'SAV ACD 111 - Perumal': {
        'code': 'SAV_ACD_111',
        'title': 'Perumal Devotional Songs',
        'tamilTitle': 'பெருமாள் பக்திப் பாடல்கள்',
        'deity': 'PERUMAL_VENKATESWARA',
        'deityTamil': 'பெருமாள் & திருப்பதி வெங்கடேஸ்வரா',
        'categoryName': 'Perumal & Venkateswara',
        'categoryId': 'cat-perumal_venkateswara',
        'singer': 'Dr. S.P. Balasubrahmanyam',
        'singerId': 'art-spb',
        'defaultImage': 'Perumal [SPB] Final.png',
        'raga': 'Kalyani',
        'tala': 'Adi Tala'
    },
    'SAV ACD 115 - VELMURUGA': {
        'code': 'SAV_ACD_115',
        'title': 'Velmuruga',
        'tamilTitle': 'வேல்முருகா',
        'deity': 'MURUGAN',
        'deityTamil': 'முருகன் & கந்த சஷ்டி பாடல்கள்',
        'categoryName': 'Murugan Padalgal',
        'categoryId': 'cat-murugan',
        'singer': 'Dr. S.P. Balasubrahmanyam',
        'singerId': 'art-spb',
        'defaultImage': '/images/playlist_murugan_kandha_1787913891920.jpg',
        'raga': 'Shanmukhapriya',
        'tala': 'Tisra Gati / Adi Tala'
    },
    'SAV ACD 118 - SADHA SIVAM': {
        'code': 'SAV_ACD_118',
        'title': 'Sadha Sivam',
        'tamilTitle': 'சதா சிவம்',
        'deity': 'ANNAMALAIYAR_SIVAN',
        'deityTamil': 'அண்ணாமலையார் & சிவன்',
        'categoryName': 'Annamalaiyar & Sivan',
        'categoryId': 'cat-annamalaiyar_sivan',
        'singer': 'Dr. S.P. Balasubrahmanyam',
        'singerId': 'art-spb',
        'defaultImage': 'Siva Manthiram [SPB] Final.png',
        'raga': 'Mohanam / Charukesi',
        'tala': 'Adi Tala'
    },
    'SAV ACD 119 - ARUL SAKTHI': {
        'code': 'SAV_ACD_119',
        'title': 'Arul Sakthi',
        'tamilTitle': 'அருள் சக்தி',
        'deity': 'AMMAN_SHAKTHI',
        'deityTamil': 'அம்மன் & ஓம்சக்தி / மாரியம்மன்',
        'categoryName': 'Amman & Shakthi',
        'categoryId': 'cat-amman_shakthi',
        'singer': 'Dr. S.P. Balasubrahmanyam',
        'singerId': 'art-spb',
        'defaultImage': 'Arul Sakthi  [SPB] final.png',
        'raga': 'Sindhu Bhairavi',
        'tala': 'Adi Tala'
    },
    'SAV ACD 120 - VEDA SAKTHI': {
        'code': 'SAV_ACD_120',
        'title': 'Veda Sakthi',
        'tamilTitle': 'வேத சக்தி',
        'deity': 'AMMAN_SHAKTHI',
        'deityTamil': 'அம்மன் & ஓம்சக்தி / மாரியம்மன்',
        'categoryName': 'Amman & Shakthi',
        'categoryId': 'cat-amman_shakthi',
        'singer': 'Dr. S.P. Balasubrahmanyam',
        'singerId': 'art-spb',
        'defaultImage': 'Om Sakthi [SPB] Final.png',
        'raga': 'Kalyani',
        'tala': 'Adi Tala'
    },
    'SAV ACD 122 - GANESAYA NAMAHA': {
        'code': 'SAV_ACD_122',
        'title': 'Ganesaya Namaha',
        'tamilTitle': 'கணேசாய நமஹ',
        'deity': 'VINAYAGAR',
        'deityTamil': 'விநாயகர் பாடல்கள்',
        'categoryName': 'Vinayagar Padalgal',
        'categoryId': 'cat-vinayagar',
        'singer': 'Dr. S.P. Balasubrahmanyam',
        'singerId': 'art-spb',
        'defaultImage': 'Ganesaya Namaha [SPB] Final.png',
        'raga': 'Hamsadhwani',
        'tala': 'Adi Tala'
    },
    'SAV ACD 123 - OM GANAPATHY': {
        'code': 'SAV_ACD_123',
        'title': 'Om Ganapathy',
        'tamilTitle': 'ஓம் கணபதி',
        'deity': 'VINAYAGAR',
        'deityTamil': 'விநாயகர் பாடல்கள்',
        'categoryName': 'Vinayagar Padalgal',
        'categoryId': 'cat-vinayagar',
        'singer': 'Mahanadhi Shobana',
        'singerId': 'art-shobana',
        'defaultImage': 'OHM GANAPATHI [MAGANATHI SHOBANA] PNG.png',
        'raga': 'Nattai',
        'tala': 'Adi Tala'
    },
    'SAV ACD 124 -  SRINIVASA': {
        'code': 'SAV_ACD_124',
        'title': 'Srinivasa',
        'tamilTitle': 'ஸ்ரீனிவாசா',
        'deity': 'PERUMAL_VENKATESWARA',
        'deityTamil': 'பெருமாள் & திருப்பதி வெங்கடேஸ்வரா',
        'categoryName': 'Perumal & Venkateswara',
        'categoryId': 'cat-perumal_venkateswara',
        'singer': 'Dr. S.P. Balasubrahmanyam',
        'singerId': 'art-spb',
        'defaultImage': 'Srinivasaa [SPB] Final.png',
        'raga': 'Mohanam',
        'tala': 'Adi Tala'
    },
    'SAV ACD 126 - AYYAPPA': {
        'code': 'SAV_ACD_126',
        'title': 'Ayyappa Devotional',
        'tamilTitle': 'ஐயப்பன் பக்திப் பாடல்கள்',
        'deity': 'AYYAPPAN',
        'deityTamil': 'ஐயப்பன் & சபரிமலை பாடல்கள்',
        'categoryName': 'Ayyappan & Sabarimala',
        'categoryId': 'cat-ayyappan',
        'singer': 'Dr. S.P. Balasubrahmanyam',
        'singerId': 'art-spb',
        'defaultImage': 'Ayyapa [SPB] Final.png',
        'raga': 'Madhyamavathi',
        'tala': 'Adi Tala'
    },
    'SAV ACD 140 - Tamil Sivasthuthi': {
        'code': 'SAV_ACD_140',
        'title': 'Tamil Sivasthuthi',
        'tamilTitle': 'தமிழ் சிவஸ்துதி',
        'deity': 'ANNAMALAIYAR_SIVAN',
        'deityTamil': 'அண்ணாமலையார் & சிவன்',
        'categoryName': 'Annamalaiyar & Sivan',
        'categoryId': 'cat-annamalaiyar_sivan',
        'singer': 'Dr. S.P. Balasubrahmanyam',
        'singerId': 'art-spb',
        'defaultImage': 'Tamil Sivashthuthi [SPB] PNG.png',
        'raga': 'Shivaranjani',
        'tala': 'Adi Tala'
    }
}

# Specific track images
def get_track_image(album_key, filename):
    fn_lower = filename.lower()
    
    # ACD 102
    if 'poovadai' in fn_lower: return 'POURNAMI NAAYAGI PNG.png'
    if 'sandhana' in fn_lower: return 'POURNAMI POOJAI [MAGHANADHI SHOBANA] PNG.png'

    # ACD 107
    if 'ohm namashivaya' in fn_lower or 'namashivaya' in fn_lower: return 'Namashivaya [SPB] Final.png'
    if 'thiru kailaya' in fn_lower: return 'Siva Sambo [SPB] Final.png'
    if 'sivalingam' in fn_lower: return 'Lingam Sivalingam  [SPB] PNG.png'

    # ACD 111
    if 'thirupathi' in fn_lower: return '108 Thirupathi [SPB] Final.png'
    if 'srinivasa namo' in fn_lower: return 'Srinivasa namo namo  [SPB] final.png'

    # ACD 118
    if 'arunachala' in fn_lower: return 'Arunachalam [SPB] PNG.png'
    if 'girivalam' in fn_lower: return 'Girivalam [SPB] PNG.png'
    if 'easan' in fn_lower: return 'Siva Yogam  [SPB] Final.png'

    # ACD 122
    if 'gananaatha' in fn_lower: return 'Gananaatha [SPB] PNG.png'
    if 'pillaiyar' in fn_lower: return 'Pillaiyar [SPB] FINAL.png'
    if 'kanapathi' in fn_lower: return 'Kanapathi [SPB] FINAL.png'

    # ACD 123
    if 'pillaiyar' in fn_lower: return 'Pillaiyar [SPB] FINAL.png'
    if 'kanapathi' in fn_lower: return 'Kanapathi [SPB] FINAL.png'

    # ACD 124
    if 'govindha govindha' in fn_lower: return 'Srinivasa namo namo  [SPB] final.png'
    if 'thirumalai' in fn_lower: return '108 Thirupathi [SPB] Final.png'
    if 'nenjae' in fn_lower: return 'Venkatesh [SPB] PNG.png'
    if 'sriranga' in fn_lower: return 'Perumal [SPB] Final.png'

    # ACD 126
    if 'santhanam' in fn_lower or 'saranam saranamaiyappa' in fn_lower: return 'Saamisaranam [SPB] FINAL.png'
    if 'pallikattu' in fn_lower or 'saranam saranam' in fn_lower: return 'Pallikattu [SPB] FINAL.png'

    # ACD 140
    if 'lingashtakam' in fn_lower: return 'Lingam Sivalingam  [SPB] PNG.png'
    if 'sivashtakam' in fn_lower: return 'Astalingam [SPB].png'
    if 'gangai' in fn_lower: return 'Sankara  [SPB] PNG.png'
    if 'vinnai' in fn_lower: return 'Siva Shivaya [SPB] Final.png'
    if 'arunachalam' in fn_lower: return 'Arunachalam [SPB] PNG.png'
    if 'anbae' in fn_lower: return 'Shivaya Namaha Om Shivaya Namaha [Unnikrishnan] Final.png'
    if 'siva siva' in fn_lower: return 'Siva Siva Sankara  [SPB] FINAL.png'
    if 'thiruneeru' in fn_lower: return 'Siva Yogam  [SPB] Final.png'
    if 'natarajar' in fn_lower: return 'Siva Sambo [SPB] Final.png'

    meta = ALBUM_META.get(album_key, {})
    return meta.get('defaultImage', 'Siva Manthiram [SPB] Final.png')

def clean_title(fname):
    name = re.sub(r'^\d+\s*', '', fname)
    name = re.sub(r'\.(wma|mp3)$', '', name, flags=re.IGNORECASE)
    # capitalize words
    words = name.split()
    return ' '.join(w.capitalize() for w in words)

songs = []
slots = []

for idx, t in enumerate(tracks):
    album_key = t['album']
    meta = ALBUM_META.get(album_key, ALBUM_META['SAV ACD 102 - AADHI SAKTHI'])
    fname = t['filename']
    mp3_file = t.get('mp3_filename', f"track_{idx+1}.mp3")
    
    img_name = get_track_image(album_key, fname)
    if img_name.startswith('/'):
        img_path = img_name
    else:
        img_path = f"/new%20images/{urllib.parse.quote(img_name)}"

    dur_str = t.get('duration_str', '05:30')
    dur_secs = t.get('duration_secs', 330)
    file_size = t.get('file_size', 5242880)

    title = clean_title(fname)
    subam_id = f"track-{meta['code'].lower()}-{idx+1}"

    song = {
        "id": subam_id,
        "title": title,
        "subtitle": f"{title} • {meta['title']} ({meta['code']})",
        "tamilTitle": title,
        "description": f"Official Subam Audio Vision master track from the album {meta['title']} ({meta['tamilTitle']}) rendered by {meta['singer']}.",
        "coverImage": img_path,
        "previewAudioUrl": f"/audio/{mp3_file}",
        "fullAudioUrl": f"/audio/{mp3_file}",
        "price": 49,
        "duration": dur_str,
        "durationSeconds": dur_secs,
        "language": "Tamil",
        "categoryId": meta['categoryId'],
        "categoryName": meta['categoryName'],
        "deity": meta['deity'],
        "deityTamilName": meta['deityTamil'],
        "songType": "DEVOTIONAL_HIT",
        "songTypeLabel": meta['title'],
        "releaseDate": "2026-01-01",
        "status": "PUBLISHED",
        "playCount": 150000 + (idx * 2713) % 200000,
        "downloadCount": 5000 + (idx * 941) % 15000,
        "featured": idx % 4 == 0,
        "trending": idx % 3 == 0,
        "raga": meta['raga'],
        "tala": meta['tala'],
        "credits": {
            "singer": meta['singer'],
            "singerId": meta['singerId'],
            "lyricist": "Traditional Devotional / Subam Guild",
            "composer": "Subam Audio Vision Music Guild",
            "musicDirector": "Subam Audio Vision",
            "studio": "Subam Audio Vision Digital Studio",
            "producer": "Subam Audio Vision (Est. 1997)"
        },
        "customFileName": mp3_file,
        "isSlotBox": True,
        "slotNumber": idx + 1
    }
    songs.append(song)

    slot = {
        "id": subam_id,
        "slotNumber": idx + 1,
        "title": title,
        "subtitle": f"{title} • {meta['title']}",
        "tamilTitle": title,
        "albumCode": meta['code'],
        "albumTitle": meta['title'],
        "imageFileName": img_name if not img_name.startswith('/') else os.path.basename(img_name),
        "imagePath": img_path,
        "singer": meta['singer'],
        "deity": meta['deity'],
        "deityTamilName": meta['deityTamil'],
        "categoryName": meta['categoryName'],
        "raga": meta['raga'],
        "tala": meta['tala'],
        "description": f"Official Subam Audio Vision master track from the album {meta['title']} ({meta['tamilTitle']}) rendered by {meta['singer']}.",
        "audioFile": {
            "name": mp3_file,
            "size": file_size,
            "type": "audio/mpeg",
            "url": f"/audio/{mp3_file}",
            "uploadedAt": 1741760000000
        }
    }
    slots.append(slot)

print(f"Generated {len(songs)} songs and {len(slots)} slots")

# Output to src/data/driveSongsData.ts
ts_content = f"""// Auto-generated Google Drive Devotional Master Tracks
// Subam Audio Vision Official Audio Vault (All 12 Albums • {len(slots)} Tracks)
import {{ Song, DevotionalSlot }} from '../types';

export const DRIVE_DEVOTIONAL_SONGS: Song[] = {json.dumps(songs, indent=2)};

export const DRIVE_DEVOTIONAL_SLOTS: DevotionalSlot[] = {json.dumps(slots, indent=2)};
"""

with open('src/data/driveSongsData.ts', 'w') as f:
    f.write(ts_content)

print("Successfully written src/data/driveSongsData.ts")
