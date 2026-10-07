export type Language = 'en' | 'ta';

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    ta: string;
  };
}

export const UI_TRANSLATIONS: TranslationDictionary = {
  // Navigation
  'nav.home': { en: 'Home', ta: 'முகப்பு' },
  'nav.gods': { en: '18 Gods & Songs', ta: '18 தெய்வங்கள் & பாடல்கள்' },
  'nav.artists': { en: 'Voices of Devotion', ta: 'பக்தி குரல்கள்' },
  'nav.live': { en: 'Live Darshan', ta: 'நேரலை தரிசனம்' },
  'nav.jukebox': { en: 'Sacred Jukebox', ta: 'பக்தி ஜூக்க்பாக்ஸ்' },
  'nav.about': { en: 'About Subam', ta: 'சுபம் பற்றி' },
  'nav.search': { en: 'Search...', ta: 'தேடுக...' },
  'nav.searchTitle': { en: 'Search music, artists, lyrics (Cmd+K)', ta: 'பாடல்கள், கலைஞர்கள், வரிகளைத் தேடுக (Cmd+K)' },
  'nav.youtube': { en: 'YOUTUBE', ta: 'யூடியூப்' },
  'nav.subscribers': { en: '597K+ Devotees', ta: '597K+ பக்தர்கள்' },
  'nav.tagline': { en: 'Sacred Music & Vision • Est. 1997', ta: 'புனித பக்தி இசை & காவியம் • தொடக்கம் 1997' },
  'nav.officialChannel': { en: 'Official Channel', ta: 'அதிகாரப்பூர்வ தளம்' },
  'nav.announcement': {
    en: '🔥 Subam Audio Vision Official Channel: 597K+ Devotees • Daily Tiruvannamalai Girivalam, Friday Amman & Ayyappan Special Broadcasts',
    ta: '🔥 சுபம் ஆடியோ விஷன் அதிகாரப்பூர்வ தளம்: 597K+ பக்தர்கள் • தினசரி திருவண்ணாமலை கிரிவலம், வெள்ளி அம்மன் & ஐயப்பன் சிறப்பு ஒளிபரப்புகள்'
  },
  'nav.languageSwitch': { en: 'Language', ta: 'மொழி' },

  // Subam Banner Showcase
  'banner.badge': { en: 'Official Master Vault', ta: 'அதிகாரப்பூர்வ மாஸ்டர் ஆவணகம்' },
  'banner.subline': { en: 'Tiruvannamalai • Est. 1997 • 1,200+ Master Tracks • 600K+ Devotees Worldwide', ta: 'திருவண்ணாமலை • தொடக்கம் 1997 • 1,200+ மாஸ்டர் பாடல்கள் • 600K+ உலகளாவிய பக்தர்கள்' },
  'banner.playTrack': { en: 'Play Master Track', ta: 'மாஸ்டர் பாடல் கேட்க' },
  'banner.watchYoutube': { en: 'Watch on YouTube', ta: 'YouTube-ல் காண' },
  'banner.established': { en: 'Est. 1997', ta: 'தொடக்கம் 1997' },
  'banner.masterTracks': { en: '1,200+ Master Tracks', ta: '1,200+ மாஸ்டர் பாடல்கள்' },
  'banner.devoteesCount': { en: '600K+ Devotees Worldwide', ta: '600K+ பக்தர்கள்' },

  // 18 Sacred Gods Gallery
  'gods.badge': { en: '18 SACRED GODS & DEVOTIONAL SONG PLAYLISTS', ta: '18 தெய்வ தரிசனம் & பக்திப் பாடல் தொகுப்புகள்' },
  'gods.title': { en: '18 Sacred Divine Forms & Devotional Hymns', ta: '18 திருவுருவ தரிசனம் & பக்திப் பாடல்கள்' },
  'gods.subtitle': {
    en: 'Explore the consecrated digital audio vault of 18 sacred deities, sthalams, and immortal bhakti tracks by Subam Audio Vision.',
    ta: 'சுபம் ஆடியோ விஷனின் 18 தெய்வீக திருவுருவங்கள், புண்ணிய ஸ்தலங்கள் மற்றும் அழியா பக்திப் பாடல்களின் தெய்வீக சங்கமம்.'
  },
  'gods.searchPlaceholder': { en: 'Search God, Guru, Mantra, Sthalam...', ta: 'தெய்வம், குரு, மந்திரம், தலம் தேடுக...' },
  'gods.clear': { en: 'Clear', ta: 'நீக்குக' },
  'gods.reset': { en: 'Reset Search & Filters', ta: 'தேடலை மீட்டமைக்க' },
  'gods.noMatch': { en: 'No sacred deity found matching', ta: 'பொருத்தமான தெய்வங்கள் கிடைக்கவில்லை' },
  'gods.tabAll': { en: 'All 18 Divine Forms', ta: 'அனைத்து 18 தெய்வ தரிசனம்' },
  'gods.tabPrimal': { en: 'Primal Gods', ta: 'முதன்மைக் கடவுள்கள்' },
  'gods.tabKshetrans': { en: 'Sacred Kshetrans', ta: 'புண்ணிய தலங்கள்' },
  'gods.tabGurus': { en: 'Maha Gurus', ta: 'மகான்கள் & சித்தர்கள்' },
  'gods.tabHomams': { en: 'Vedic Mantras', ta: 'வேத மந்திரங்கள் & ஹோமம்' },
  'gods.playAll': { en: 'Play All Songs', ta: 'அனைத்து பாடல்கள்' },
  'gods.viewSongs': { en: 'View Songs', ta: 'பாடல்கள்' },
  'gods.masterTracks': { en: 'Original Master Tracks', ta: 'அசல் மாஸ்டர் பாடல்கள்' },
  'gods.officialYoutube': { en: 'Official YouTube', ta: 'YouTube-ல் காண' },
  'gods.mantraLabel': { en: 'Sacred Mantra', ta: 'புனித மூல மந்திரம்' },
  'gods.templeAbode': { en: 'Temple Sthalam', ta: 'புண்ணிய ஸ்தலம்' },
  'gods.modalBack': { en: 'Back to 18 Gods Gallery', ta: '18 தெய்வங்கள் பகுதிக்கு திரும்புக' },
  'gods.modalSearch': { en: 'Search tracks in this collection...', ta: 'இத்தொகுப்பில் உள்ள பாடல்களைத் தேடுக...' },
  'gods.playAllTracks': { en: 'Play All Tracks', ta: 'அனைத்துப் பாடல்களையும் இயக்கு' },
  'gods.shuffle': { en: 'Shuffle', ta: 'கலக்கு' },
  'gods.nowPlaying': { en: 'Now Playing', ta: 'ஒலிப்பது' },
  'gods.masterQuality': { en: 'Studio Master 160kbps', ta: 'ஸ்டுடியோ மாஸ்டர் 160kbps' },

  // Voices of Devotion (Artist Showcase)
  'artists.badge': { en: 'MAESTROS OF SACRED BHAKTI', ta: 'புனித பக்தி மேஸ்ட்ரோக்கள்' },
  'artists.title': { en: 'Voices of Devotion', ta: 'பக்தி குரல்கள் - மேஸ்ட்ரோக்கள்' },
  'artists.subtitle': {
    en: 'Immortal vocalists who brought Tamil divine music to millions of hearts under Subam Audio Vision’s iconic production.',
    ta: 'சுபம் ஆடியோ விஷன் தயாரிப்பில் லட்சக்கணக்கான பக்தர்களின் உள்ளங்களை உருக வைத்த தெய்வீக குரல் வேந்தர்கள்.'
  },
  'artists.exploreSongs': { en: 'Explore Songs', ta: 'பாடல்களை கேட்க' },
  'artists.famousFor': { en: 'Celebrated For', ta: 'புகழ் பெற்ற பாடல்கள்' },
  'artists.singer': { en: 'Legendary Vocalist', ta: 'புகழ்பெற்ற பாடகர்' },
  'artists.masterRecordings': { en: 'Studio Master Recordings', ta: 'ஸ்டுடியோ மாஸ்டர் ஆடியோ' },

  // Live Darshan Section
  'live.badge': { en: 'SACRED TEMPLE TELECASTS', ta: 'புனித கோவில் நேரலைகள்' },
  'live.title': { en: 'Sacred Live Temple Darshan & Previous Telecasts', ta: 'புனித நேரலை கோவில் தரிசனம் & முந்தைய ஒளிபரப்புகள்' },
  'live.subtitle': {
    en: 'Experience Tiruvannamalai Girivalam, Friday Amman Abhishekam, and 100+ archival live temple broadcasts.',
    ta: 'திருவண்ணாமலை கிரிவலம், வெள்ளி அம்மன் அபிஷேகம் மற்றும் 100+ பழம்பெரும் கோவில் நேரலை ஒளிபரப்புகள்.'
  },
  'live.now': { en: 'LIVE NOW', ta: 'நேரலை' },
  'live.previous': { en: 'Previous Live Temple Telecasts', ta: 'முந்தைய நேரலை கோவில் ஒளிபரப்புகள்' },
  'live.watchDarshan': { en: 'Watch Darshan', ta: 'தரிசனம் காண்க' },
  'live.channelSubscribers': { en: '597K+ Devotees Subscribed', ta: '597K+ பக்தர்கள் இணைத்துள்ளனர்' },
  'live.filterAll': { en: 'All Broadcasts', ta: 'அனைத்து ஒளிபரப்புகள்' },
  'live.filterGirivalam': { en: 'Girivalam', ta: 'கிரிவலம்' },
  'live.filterAmman': { en: 'Amman Temples', ta: 'அம்மன் கோவில்கள்' },
  'live.filterFestivals': { en: 'Festivals', ta: 'திருவிழாக்கள்' },

  // Sacred Jukebox Section
  'jukebox.badge': { en: 'CONTINUOUS DEVOTIONAL STREAMS', ta: 'தொடர் பக்தி இசைத் தொகுப்புகள்' },
  'jukebox.title': { en: 'Sacred Devotional Jukeboxes', ta: 'புனித பக்தி ஜூக்க்பாக்ஸ்' },
  'jukebox.subtitle': {
    en: 'Non-stop curated devotional audio albums, morning mantras, and temple suites for prayer, meditation and home worship.',
    ta: 'தினசரி வழிபாடு, தியானம் மற்றும் பண்டிகைகளுக்கான தடையற்ற பக்தி இசை ஆல்பங்கள் மற்றும் ஜூக்க்பாக்ஸ்கள்.'
  },
  'jukebox.playJukebox': { en: 'Play Jukebox', ta: 'ஜூக்க்பாக்ஸ் கேட்க' },
  'jukebox.listenYoutube': { en: 'Listen on YouTube', ta: 'YouTube-ல் கேட்க' },
  'jukebox.songs': { en: 'Songs', ta: 'பாடல்கள்' },
  'jukebox.curator': { en: 'Curated by Subam Audio Vision', ta: 'சுபம் ஆடியோ விஷன் தொகுப்பு' },

  // About Brand Section
  'about.badge': { en: 'OUR SACRED HERITAGE', ta: 'நமது புனித பாரம்பரியம்' },
  'about.title': { en: 'About Subam Audio Vision', ta: 'சுபம் ஆடியோ விஷன் பற்றி' },
  'about.subline': { en: 'Tiruvannamalai • Preserving Sacred Devotional Heritage Since 1997', ta: 'திருவண்ணாமலை • 1997 முதல் அழியா பக்தி பாரம்பரியம்' },
  'about.heritageTitle': { en: '28+ Years of Consecrated Music Tradition', ta: '28+ ஆண்டுகால தெய்வீக இசைப் பயணம்' },
  'about.heritageDesc': {
    en: 'Founded in the spiritual capital of Tiruvannamalai under the sacred shadow of Mount Arunachala, Subam Audio Vision has produced and preserved over 1,200 devotional master recordings. From the reverberating drums of Amman folk urumee to the tranquil morning chants of Sivan Agni Lingam, our studio recordings serve millions of devotees across Tamil Nadu, Kerala, Karnataka, and the global diaspora.',
    ta: 'புனித திருவண்ணாமலையில் அண்ணாமலையார் திருவருளால் தொடங்கப்பட்ட சுபம் ஆடியோ விஷன், 1,200-க்கும் மேற்பட்ட பக்தி மாஸ்டர் பாடல்களை தயாரித்து பாதுகாத்து வருகிறது. அம்மன் கிராமிய உறுமி மேளம் முதல் சிவன் அக்னி லிங்க கிரிவல கீதங்கள் வரை லட்சக்கணக்கான பக்தர்களுக்கு ஆன்மீக அமைதியை வழங்கி வருகிறது.'
  },
  'about.statsMasters': { en: '1,200+ Master Tracks', ta: '1,200+ மாஸ்டர் பாடல்கள்' },
  'about.statsDevotees': { en: '597K+ Devotees', ta: '597K+ உலகளாவிய பக்தர்கள்' },
  'about.statsArtists': { en: '50+ Divine Maestros', ta: '50+ புகழ்பெற்ற பாடகர்கள்' },
  'about.statsYears': { en: '28+ Years Legacy', ta: '28+ ஆண்டுகள் பாரம்பரியம்' },
  'about.contactTitle': { en: 'Contact & Audio Inquiries', ta: 'தொடர்பு & ஆடியோ விசாரணைகள்' },
  'about.address': { en: 'Tiruvannamalai, Tamil Nadu, India - 606601', ta: 'திருவண்ணாமலை, தமிழ்நாடு, இந்தியா - 606601' },

  // Music Player & Common Controls
  'player.nowPlaying': { en: 'NOW PLAYING', ta: 'தற்போது ஒலிப்பது' },
  'player.masterAudio': { en: 'High-Fidelity Master Audio (Instant Zero-Buffer)', ta: 'உயர்தர மாஸ்டர் ஆடியோ (உடனடி இயக்கம்)' },
  'player.lyrics': { en: 'Lyrics', ta: 'வரிகள்' },
  'player.volume': { en: 'Volume', ta: 'ஒலி அளவு' },
  'player.previous': { en: 'Previous Track', ta: 'முந்தைய பாடல்' },
  'player.next': { en: 'Next Track', ta: 'அடுத்த பாடல்' },
  'player.play': { en: 'Play', ta: 'இயக்கு' },
  'player.pause': { en: 'Pause', ta: 'நிறுத்து' },
  'player.download': { en: 'Download Track', ta: 'பதிவிறக்கம்' },
  'player.share': { en: 'Share', ta: 'பகிர்' },
  'player.raagam': { en: 'Raagam', ta: 'ராகம்' },
  'player.taalam': { en: 'Taalam', ta: 'தாளம்' },
  'player.deity': { en: 'Deity', ta: 'தெய்வம்' },
  'player.singer': { en: 'Singer', ta: 'பாடகர்' },

  // Footer
  'footer.rights': { en: 'All Rights Reserved. Subam Audio Vision.', ta: 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை. சுபம் ஆடியோ விஷன்.' },
  'footer.studio': { en: 'Tiruvannamalai Master Audio Vault', ta: 'திருவண்ணாமலை மாஸ்டர் ஆடியோ ஆவணகம்' },
  'footer.quickLinks': { en: 'Quick Navigation', ta: 'முக்கிய இணைப்புகள்' }
};

// Helper function to translate a key
export const getTranslation = (key: string, lang: Language, fallback?: string): string => {
  const item = UI_TRANSLATIONS[key];
  if (item && item[lang]) {
    return item[lang];
  }
  return fallback || (item ? item.en : key);
};

// Bilingual descriptions for the 18 deities
export const DEITY_DESCRIPTIONS: Record<string, { en: string; ta: string }> = {
  'god-annamalaiyar-unnamulai': {
    en: 'The supreme Agni Sthalam of Lord Shiva and Goddess Unnamulai Amman at Tiruvannamalai Arunachala, the eternal column of divine fire where salvation is attained by merely remembering.',
    ta: 'திருவண்ணாமலை அருணாசலேஸ்வரர் மற்றும் உண்ணாமலையம்மனின் திவ்ய அக்னி தலம். நினைத்தாலே முக்தி தரும் பஞ்ச பூத தலங்களில் அக்னி ஸ்தலத்தின் அற்புத பக்திப் பாடல்கள்.'
  },
  'god-amman': {
    en: 'The Divine Mother and primordial cosmic energy, protector of families, celebrated in Friday Aadi Viratham, Samayapuram, Thiruverkadu, and Melmaruvathur temples.',
    ta: 'சமயபுரம் மாரியம்மன், மேல்மருவத்தூர் ஆதிபராசக்தி மற்றும் திருவேற்காடு அம்மனின் அருள் பொழியும் வெள்ளிக்கிழமை மற்றும் ஆடி மாத சிறப்பு பக்திப் பாடல்கள்.'
  },
  'god-vinayagar': {
    en: 'The auspicious remover of obstacles, first deity of all prayers, bestower of intellect and prosperity celebrated at Pillaiyarpatti, Karpaga Vinayagar and Uchipillayar temples.',
    ta: 'விக்னங்களை தீர்க்கும் முழுமுதற் கடவுள் பிள்ளையார்பட்டி கற்பக விநாயகர், உச்சிப் பிள்ளையாரின் மங்களகரமான திருநாம பக்திப் பாடல்கள்.'
  },
  'god-murugan': {
    en: 'The commander of divine forces, Lord of Kurinji land, residing in the sacred Arupadai Veedu: Palani, Tiruchendur, Swamimalai, Thiruthani, Pazhamudircholai, and Thirupparankundram.',
    ta: 'கந்த சஷ்டி கவசம், பழனி ஆண்டவர் காவடிச் சிந்து, திருச்செந்தூர் சுப்ரமண்யசுவாமி மற்றும் அறுபடை வீடுகளின் வெற்றிவேல் முருகன் பக்தி பாடல்கள்.'
  },
  'god-ayyappan': {
    en: 'The Dharma Sastha of Sabarimala, child of Shiva and Vishnu, protector of devotees observing the sacred 48-day Mandala Vratham with the 18 golden steps.',
    ta: 'ஹரிவராசனம், பள்ளிக்கட்டு சபரிமலைக்கு, வீரமணிதாசன் பாடிய 18 படிகள் கொண்ட சபரிமலை தர்ம சாஸ்தா ஐயப்ப சுவாமியின் அமுத கானங்கள்.'
  },
  'god-perumal': {
    en: 'Lord Venkateswara of Tirumala Tirupati, Sri Ranganatha, and Mahavishnu, the preserver of the universe, worshipped in Puratasi Saturdays and Vaikunta Ekadasi.',
    ta: 'திருப்பதி ஏழுமலையான் வெங்கடேச சுப்ரபாதம், கோவிந்தா நாமாவளி மற்றும் புரட்டாசி சனிக்கிழமை விஷ்ணுவின் திவ்ய தரிசனப் பாடல்கள்.'
  },
  'god-shiva-rudram': {
    en: 'Lord Mahadeva in cosmic dance at Chidambaram, Kedarnath, and Kashi, honored with Sri Rudram, Chamakam, and Panchakshara Stotram.',
    ta: 'தில்லை நடராஜர், காசி விஸ்வநாதர், ருத்ரம், சமகம் மற்றும் நமச்சிவாய பஞ்சாட்சர ஸ்தோத்திரங்களின் கம்பீரமான சிவ பக்திப் பாடல்கள்.'
  },
  'god-krishna': {
    en: 'The divine flute player, embodiment of love and wisdom, friend of devotees, central deity of Srimad Bhagavad Gita and Gokula celebrations.',
    ta: 'புல்லாங்குழல் கீதங்கள், ராதே கிருஷ்ணா பஜனைகள், அச்சுதம் கேசவம் மற்றும் மதுராஷ்டகம் ஆகிய கிருஷ்ண பரமாத்மாவின் திவ்ய கானங்கள்.'
  },
  'god-hanuman': {
    en: 'The embodiment of strength, courage, and selfless devotion to Sri Rama, protector against negative forces celebrated through Hanuman Chalisa.',
    ta: 'அனுமன் சாலீசா, சுந்தர காண்டம் மற்றும் ராம பக்த ஆஞ்சநேயரின் பலம், தைரியம், வெற்றி தரும் பக்திப் பாடல்கள்.'
  },
  'god-lakshmi': {
    en: 'Goddess of wealth, prosperity, and auspiciousness, celebrated during Varalakshmi Vratham, Diwali, and Friday Deeparadhana.',
    ta: 'மகாலட்சுமி அஷ்டகம், கனகதாரா ஸ்தோத்திரம் மற்றும் வரலட்சுமி விரத சிறப்பு செல்வம் பெருகும் லட்சுமி தாயாரின் திருப்பாடல்கள்.'
  },
  'god-saraswathi': {
    en: 'Goddess of wisdom, arts, music, and learning, worshipped during Navarathri, Vijayadasami, and Saraswathi Pooja.',
    ta: 'கல்வி, ஞானம், கலை மற்றும் வாக்கின் அதிபதியான சரஸ்வதி தேவியின் சரஸ்வதி அந்தாதி மற்றும் பூஜை பக்திப் பாடல்கள்.'
  },
  'god-dakshinamurthy': {
    en: 'The primordial Guru seated beneath the banyan tree imparting supreme self-knowledge through divine silence and Chin Mudra.',
    ta: 'ஆலமரத்தடியில் மவுன உபதேசம் செய்யும் குரு பகவான் தட்சிணாமூர்த்தியின் வியாழக்கிழமை குரு வழிபாட்டுப் பாடல்கள்.'
  },
  'god-ayyanar': {
    en: 'The guardian deity of villages, riding the white steed, protector of borders, families, and righteous living with Urumee Melam and Pambai.',
    ta: 'கிராமத்து காவல் தெய்வம் ஐயனார், வெள்ளை குதிரை வீரன், எல்லை காக்கும் தெய்வங்களின் உடுக்கை, பம்பை, உறுமி மேள நாட்டுப்புற பக்திப் பாடல்கள்.'
  },
  'god-karuppasamy': {
    en: 'The fierce protector and deity of justice at 18 steps Azhagarmalai and village boundary shrines, worshipped with vibrant folk urumee rhythms.',
    ta: 'பதினெட்டாம் படி கருப்பண்ணசாமி, மதுரை வீரன், முனீஸ்வரர் ஆகிய காவல் தெய்வங்களின் கம்பீரமான உறுமி மேள ஆவேச பக்திப் பாடல்கள்.'
  },
  'god-raghavendra': {
    en: 'The compassionate saint of Mantralayam, Brindavana avatar, fulfilling prayers of devotees across centuries through selfless tapas.',
    ta: 'மந்திராலய குரு ராகவேந்திரர், பிருந்தாவன மகிமை மற்றும் பக்தர்களின் துயர் தீர்க்கும் குரு ஸ்தோத்திர பக்திப் பாடல்கள்.'
  },
  'god-shirdi-saibaba': {
    en: 'The compassionate Sadguru of Shirdi, universal teacher preaching Sabka Malik Ek, love, tolerance, and divine protection.',
    ta: 'ஷீரடி சாயி பாபா ஆரத்தி, காகட ஆரத்தி மற்றும் எல்லோருக்கும் எல்லாம் தரும் சாயி நாதரின் திவ்ய பக்தி பஜனைகள்.'
  },
  'god-ramana-maharshi': {
    en: 'The sage of Arunachala, embodiment of Advaita self-inquiry (Who Am I?), who radiated silent grace at the holy feet of Tiruvannamalai.',
    ta: 'திருவண்ணாமலை ரமண மகரிஷி, நான் யார்? ஆத்ம விசாரம் மற்றும் அருணாசல அக்ஷரமணமாலை தியானப் பாடல்கள்.'
  },
  'god-navagraha': {
    en: 'The nine celestial planetary deities presiding over human destiny, worshipped for planetary peace, health, longevity, and dosha nivarthi.',
    ta: 'சூரியன், சந்திரன் உள்ளிட்ட நவகிரக பீட தோஷ நிவாரண காயத்ரி மந்திரங்கள் மற்றும் சிறப்பு நவகிரக ஸ்தோத்திரப் பாடல்கள்.'
  }
};
