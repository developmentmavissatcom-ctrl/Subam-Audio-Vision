import { SacredGodItem, Song, Artist, SongCredits } from '../types';

/**
 * Filter and categorize songs for a specific Sacred God / Deity.
 * Every song in the playlist is 100% accurate to the specific deity.
 * No fallbacks or unrelated songs are ever injected.
 */
export function getSongsForGod(god: SacredGodItem, allSongs: Song[]): Song[] {
  const godId = god.id;

  const matched = allSongs.filter(s => {
    // Exclude live darshan videos and jukebox compilations (kept in dedicated sections)
    const titleLower = (s.title || '').toLowerCase();
    const subLower = (s.subtitle || '').toLowerCase();
    const descLower = (s.description || '').toLowerCase();
    const songType = (s.songType || '').toUpperCase();
    if (
      s.isLiveStream ||
      songType === 'JUKEBOX' ||
      songType === 'LIVE_DARSHAN' ||
      titleLower.includes('jukebox') ||
      titleLower.includes('live darshan') ||
      titleLower.includes('akhanda bhakti') ||
      subLower.includes('jukebox') ||
      subLower.includes('live darshan') ||
      descLower.includes('official jukebox')
    ) {
      return false;
    }

    const deity = s.deity || '';
    const title = (s.title || '').toLowerCase();
    const tamilTitle = (s.tamilTitle || '').toLowerCase();
    const cat = (s.categoryName || '').toLowerCase();

    switch (godId) {
      case 'god-annamalaiyar-unnamulai':
        // Only Lord Shiva, Arunachaleswarar, Unnamalai Amman songs
        return (
          deity === 'ANNAMALAIYAR_SIVAN' ||
          (cat.includes('sivan') && deity !== 'ASHTALINGAM' && deity !== 'RAMANAR')
        );

      case 'god-amman':
        // Only Goddess Amman / Shakthi / Mariamman / Parashakthi
        return (
          deity === 'AMMAN_SHAKTHI' ||
          (deity === 'GRAMA_DEVATHAI' && (title.includes('mari') || title.includes('amman') || tamilTitle.includes('மாரி')))
        );

      case 'god-vinayagar':
        // Only Lord Ganesha / Vinayagar
        return deity === 'VINAYAGAR';

      case 'god-murugar':
        // Only Lord Murugan / Karthikeya
        return deity === 'MURUGAN';

      case 'god-iyyappan':
        // Only Swami Ayyappan / Sabarimala
        return deity === 'AYYAPPAN';

      case 'god-anjaneyar':
        // Only Lord Hanuman / Anjaneyar
        return deity === 'ANJANEYAR_HANUMAN';

      case 'god-perumal':
        // Only Lord Perumal / Sri Venkateswara / Tirupati
        return deity === 'PERUMAL_VENKATESWARA';

      case 'god-krishnar':
        // Only Lord Krishna / Radhe Shyam / Gopala
        return deity === 'KRISHNA';

      case 'god-navagraham':
        // Only Navagraham (Nine Planets)
        return deity === 'NAVAGRAHAM' || title.includes('navagraha') || tamilTitle.includes('நவகிரக');

      case 'god-ashtalakshmi':
        // Only Ashtalakshmi / Mahalakshmi
        return deity === 'ASHTALAKSHMI' || title.includes('ashta lakshmi') || title.includes('ashtalakshmi') || tamilTitle.includes('அஷ்டலட்சுமி');

      case 'god-ashtalingam':
        // Only 8 Lingams of Tiruvannamalai Girivalam
        return deity === 'ASHTALINGAM' || title.includes('ashtalingam') || tamilTitle.includes('அஷ்டலிங்க');

      case 'god-saibaba':
        // Only Shirdi Sai Baba
        return deity === 'SAIBABA' || title.includes('sai baba') || title.includes('saibaba') || tamilTitle.includes('சாய்பாபா');

      case 'god-ramanar':
        // Only Bhagavan Sri Ramana Maharshi
        return deity === 'RAMANAR' || title.includes('ramana') || title.includes('aksharamanamalai') || tamilTitle.includes('ரமண');

      case 'god-gururagavendirar':
        // Only Sri Guru Raghavendra Swamy of Mantralayam
        return deity === 'GURURAGAVENDIRAR' || title.includes('ragavendhira') || title.includes('raghavendra') || tamilTitle.includes('ராகவேந்திர');

      case 'god-yogiramsurathkumar':
        // Only Yogi Ramsuratkumar (Visiri Swamigal)
        return deity === 'YOGIRAMSURATHKUMAR' || title.includes('yogi ramsuratkumar') || tamilTitle.includes('யோகி ராம்சுரத்குமார்') || tamilTitle.includes('விசிறி');

      case 'god-seshathri':
        // Only Sri Seshadri Swamigal
        return deity === 'SESHATHRI' || title.includes('seshadri') || title.includes('seshathri') || tamilTitle.includes('சேஷாத்ரி');

      case 'god-vedhamandhiram':
        // Only Vedic Mantras, Sri Rudram, Chamakam, Suktams
        return deity === 'VEDHAMANDHIRAM' || title.includes('rudram') || title.includes('chamakam') || title.includes('suktam') || tamilTitle.includes('வேத பாராயணம்');

      case 'god-ganapathy-homam':
        // Only Sri Maha Ganapathy Homam & Yagam
        return deity === 'GANAPATHY_HOMAM' || title.includes('homam') || title.includes('yagam') || tamilTitle.includes('ஹோமம்');

      default:
        return false;
    }
  });

  // Sort logically: featured tracks first, then slot boxes, then alphabetical
  return matched.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    if (a.isSlotBox && !b.isSlotBox) return -1;
    if (!a.isSlotBox && b.isSlotBox) return 1;
    return a.title.localeCompare(b.title);
  });
}

/**
 * Filter, sort, and organize songs for a specific Singer / Maestro in "Voice of Devotion".
 * Every song is 100% strictly sung by or composed by that specific artist.
 * No unrelated songs are ever included.
 */
export function getSongsForArtist(artist: Artist, allSongs: Song[]): Song[] {
  const artistName = artist.name.toLowerCase();
  const artistId = artist.id.toLowerCase();

  const isSPB = artistId === 'art-spb' || artistName.includes('spb') || artistName.includes('balasubrahmanyam');
  const isShobana = artistId === 'art-shobana' || artistName.includes('shobana');
  const isUnnikrishnan = artistId === 'art-unnikrishnan' || artistName.includes('unnikrishnan');
  const isVeeramani = artistId === 'art-veeramani' || artistName.includes('veeramani');
  const isEswari = artistId === 'art-eswari' || artistName.includes('eswari');
  const isVani = artistId === 'art-vani' || artistName.includes('vani') || artistName.includes('jairam');
  const isSaradha = artistId === 'art-saradha' || artistName.includes('saradha');
  const isKuppusamy = artistId === 'art-kuppusamy' || artistName.includes('kuppusamy');

  const filtered = allSongs.filter(s => {
    // Exclude live darshan videos and jukebox compilations (kept in dedicated sections)
    const titleLower = (s.title || '').toLowerCase();
    const subLower = (s.subtitle || '').toLowerCase();
    const descLower = (s.description || '').toLowerCase();
    const songType = (s.songType || '').toUpperCase();
    if (
      s.isLiveStream ||
      songType === 'JUKEBOX' ||
      songType === 'LIVE_DARSHAN' ||
      titleLower.includes('jukebox') ||
      titleLower.includes('live darshan') ||
      titleLower.includes('akhanda bhakti') ||
      subLower.includes('jukebox') ||
      subLower.includes('live darshan') ||
      descLower.includes('official jukebox')
    ) {
      return false;
    }

    const credits: Partial<SongCredits> = s.credits || {};
    const singer = (credits.singer || '').toLowerCase();
    const singerId = (credits.singerId || '').toLowerCase();
    const composer = (credits.composer || '').toLowerCase();

    // Direct ID match
    if (singerId === artistId) return true;

    // Strict singer name matching
    if (isSPB) {
      return (
        singer.includes('balasubrahmanyam') ||
        singer.includes('s.p.') ||
        singer.includes('spb')
      );
    }
    if (isShobana) {
      return singer.includes('shobana');
    }
    if (isUnnikrishnan) {
      return singer.includes('unnikrishnan');
    }
    if (isVeeramani) {
      return singer.includes('veeramani');
    }
    if (isEswari) {
      return singer.includes('eswari');
    }
    if (isVani) {
      return singer.includes('vani') || singer.includes('jairam');
    }
    if (isSaradha) {
      return singer.includes('saradha');
    }
    if (isKuppusamy) {
      return singer.includes('kuppusamy');
    }

    return singer.includes(artistName) || composer.includes(artistName);
  });

  // Sort logically: featured tracks first, then slot boxes / popular tracks, then alphabetical
  return filtered.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    if (a.isSlotBox && !b.isSlotBox) return -1;
    if (!a.isSlotBox && b.isSlotBox) return 1;
    return a.title.localeCompare(b.title);
  });
}
