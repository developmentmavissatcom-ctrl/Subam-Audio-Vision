import { Song, DevotionalSlot } from '../types';

/**
 * Normalizes text for fast, forgiving search:
 * - Lowercases
 * - Strips diacritics / accents
 * - Normalizes Tamil characters and alphanumerics
 */
export function normalizeSearchText(text?: string | null): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s\u0B80-\u0BFF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP_WORDS = new Set([
  'song', 'songs', 'padal', 'padalgal', 'audio', 'vision', 'subam', 
  'devotional', 'master', 'mp3', 'the', 'of', 'and', '&', 'in', 'on', 'a'
]);

export interface SearchMatchResult {
  matched: boolean;
  score: number;
}

/**
 * Calculates match and relevance score
 */
export function evaluateSearchMatch(
  item: Partial<Song> | Partial<DevotionalSlot>,
  query: string
): SearchMatchResult {
  const q = normalizeSearchText(query);
  if (!q) return { matched: true, score: 0 };

  const singer = ('credits' in item && item.credits?.singer) ? item.credits.singer : (item as DevotionalSlot).singer || '';
  const title = item.title || '';
  const tamilTitle = item.tamilTitle || '';
  const album = [item.albumTitle, item.albumCode, item.subtitle].filter(Boolean).join(' ');
  const deity = [item.deity, item.deityTamilName, item.categoryName].filter(Boolean).join(' ');
  const extra = [item.raga, item.tala, item.description, (item as any).customFileName].filter(Boolean).join(' ');

  const titleNorm = normalizeSearchText(title);
  const tamilNorm = normalizeSearchText(tamilTitle);
  const singerNorm = normalizeSearchText(singer);
  const albumNorm = normalizeSearchText(album);
  const deityNorm = normalizeSearchText(deity);
  const extraNorm = normalizeSearchText(extra);

  let score = 0;

  // Direct exact phrase match (highest confidence)
  if (titleNorm.includes(q)) score += 600;
  if (tamilNorm.includes(q)) score += 500;
  if (singerNorm.includes(q)) score += 400;
  if (albumNorm.includes(q)) score += 300;
  if (deityNorm.includes(q)) score += 200;
  if (extraNorm.includes(q)) score += 100;

  // Clean tokens from query
  const rawTokens = q.split(/\s+/).filter(t => t.length > 0);
  const tokens = rawTokens.filter(t => !STOP_WORDS.has(t));
  const activeTokens = tokens.length > 0 ? tokens : rawTokens;

  let matchedTokens = 0;

  for (const t of activeTokens) {
    let tokMatched = false;

    // Check direct field inclusion
    if (titleNorm.includes(t)) {
      score += 150;
      tokMatched = true;
    } else if (tamilNorm.includes(t)) {
      score += 130;
      tokMatched = true;
    } else if (singerNorm.includes(t)) {
      score += 100;
      tokMatched = true;
    } else if (albumNorm.includes(t)) {
      score += 80;
      tokMatched = true;
    } else if (deityNorm.includes(t)) {
      score += 70;
      tokMatched = true;
    } else if (extraNorm.includes(t)) {
      score += 40;
      tokMatched = true;
    }

    // Check intelligent alias / abbreviation / transliteration expansions
    if (!tokMatched) {
      // S.P.B. & Balasubrahmanyam
      if ((t === 'spb' || t === 's.p.b' || t === 'sp' || t === 'balasubrahmanyam' || t === 'balasubramaniam' || t === 'balu') && 
          singerNorm.includes('balasubrahmanyam')) {
        score += 200;
        tokMatched = true;
      } 
      // Mahanadhi Shobana
      else if ((t === 'shobana' || t === 'shobhana' || t === 'sobhana' || t === 'mahanadhi' || t === 'mahanadi') && 
               singerNorm.includes('shobana')) {
        score += 200;
        tokMatched = true;
      } 
      // Veeramanidasan
      else if ((t === 'veeramani' || t === 'veeramanidasan' || t === 'veeramanidaasan') && 
               singerNorm.includes('veeramani')) {
        score += 200;
        tokMatched = true;
      } 
      // P. Unnikrishnan
      else if ((t === 'unnikrishnan' || t === 'unni') && 
               singerNorm.includes('unnikrishnan')) {
        score += 200;
        tokMatched = true;
      } 
      // Vani Jairam
      else if ((t === 'vani' || t === 'jairam' || t === 'jeyaram') && 
               singerNorm.includes('vani')) {
        score += 200;
        tokMatched = true;
      }
      // Shiva / Annamalaiyar / Arunachala
      else if ((t === 'sivan' || t === 'siva' || t === 'shiva' || t === 'shivan' || t === 'annamalai' || t === 'annamalaiyar' || t === 'arunachala' || t === 'arunachalam' || t === 'arunachalanae' || t === 'eesan' || t === 'easana' || t === 'lingashtakam' || t === 'sivashtakam' || t === 'girivalam') &&
               (deityNorm.includes('sivan') || deityNorm.includes('arunachal') || albumNorm.includes('siva') || albumNorm.includes('sivasthuthi') || titleNorm.includes('siva') || titleNorm.includes('arunachala') || titleNorm.includes('lingashtakam') || titleNorm.includes('sivashtakam'))) {
        score += 120;
        tokMatched = true;
      } 
      // Amman / Shakthi / Mariamman / Bhavani / Kaali
      else if ((t === 'amman' || t === 'sakthi' || t === 'shakthi' || t === 'mariamman' || t === 'kaali' || t === 'kali' || t === 'durga' || t === 'angali' || t === 'angala' || t === 'melmaruvathur') &&
               (deityNorm.includes('amman') || deityNorm.includes('sakthi') || albumNorm.includes('sakthi') || titleNorm.includes('amman') || titleNorm.includes('sakthi') || titleNorm.includes('angali') || titleNorm.includes('kaali'))) {
        score += 120;
        tokMatched = true;
      } 
      // Murugan / Vel / Kavasam
      else if ((t === 'murugan' || t === 'muruga' || t === 'kandhan' || t === 'kanda' || t === 'vel' || t === 'velmuruga' || t === 'kavasam' || t === 'sashti') &&
               (deityNorm.includes('murugan') || albumNorm.includes('velmuruga') || titleNorm.includes('muruga') || titleNorm.includes('vel') || titleNorm.includes('kavasam'))) {
        score += 120;
        tokMatched = true;
      } 
      // Vinayagar / Ganesh / Pillaiyar / Vinai Theerkum
      else if ((t === 'vinayagar' || t === 'vinayaga' || t === 'vinayagane' || t === 'ganesh' || t === 'ganesha' || t === 'pillaiyar' || t === 'ganapathi' || t === 'ganapathy' || t === 'vinaitheerkum' || t === 'theerkum') &&
               (deityNorm.includes('vinayagar') || albumNorm.includes('ganapathy') || albumNorm.includes('ganesaya') || titleNorm.includes('ganapath') || titleNorm.includes('vinayag') || titleNorm.includes('theerkum') || extraNorm.includes('vinai'))) {
        score += 120;
        tokMatched = true;
      } 
      // Ayyappan / Sabarimala / Harivarasanam
      else if ((t === 'ayyappan' || t === 'ayyappa' || t === 'iyappan' || t === 'iyappa' || t === 'sabarimala' || t === 'harivarasanam' || t === 'pallikattu') &&
               (deityNorm.includes('ayyappan') || albumNorm.includes('ayyappa') || titleNorm.includes('saranam') || titleNorm.includes('ayyappa') || titleNorm.includes('harivarasanam') || titleNorm.includes('pallikattu'))) {
        score += 120;
        tokMatched = true;
      } 
      // Perumal / Venkateswara / Balaji / Govinda / Srinivasa
      else if ((t === 'perumal' || t === 'govinda' || t === 'govindha' || t === 'srinivasa' || t === 'venkateswara' || t === 'venkatesa' || t === 'balaji' || t === 'thirupathi' || t === 'tirupati') &&
               (deityNorm.includes('perumal') || albumNorm.includes('srinivasa') || albumNorm.includes('perumal') || titleNorm.includes('govind') || titleNorm.includes('venkates') || titleNorm.includes('thirumalai') || titleNorm.includes('srinivasa'))) {
        score += 120;
        tokMatched = true;
      } 
      // Sevvadaikari transliteration variations
      else if ((t === 'sevvadaikari' || t === 'sevvadaikaari' || t === 'sevvadaikkari' || t === 'sevadaikari' || t === 'sevvada' || t === 'செவ்வாடைக்காரி') &&
               (titleNorm.includes('sevvadaikari') || albumNorm.includes('sevvadaikari') || extraNorm.includes('sevvadaikari'))) {
        score += 350;
        tokMatched = true;
      } 
      // Vinai Theerkum Vinayagane
      else if ((t === 'vinai' || t === 'theerkum' || t === 'vinaitheerkum' || t === 'வினை') &&
               (titleNorm.includes('vinai') || titleNorm.includes('theerkum') || extraNorm.includes('vinai'))) {
        score += 350;
        tokMatched = true;
      }
      // Album code numbers: 102, 107, 111, 115, 118, 119, 120, 122, 123, 124, 126, 140
      else if (/^\d{3}$/.test(t) && albumNorm.includes(t)) {
        score += 250;
        tokMatched = true;
      }
    }

    if (tokMatched) matchedTokens++;
  }

  // Must match at least one token
  if (activeTokens.length > 0 && matchedTokens === 0 && score === 0) {
    return { matched: false, score: 0 };
  }

  // If user entered multi-word query (e.g. "spb sivan" or "shobana amman"), require all tokens to match
  if (activeTokens.length > 1 && matchedTokens < activeTokens.length && score < 500) {
    return { matched: false, score: 0 };
  }

  return { matched: score > 0, score };
}

/**
 * Search items (Song or DevotionalSlot) using the intelligent search engine
 */
export function searchItems<T extends Partial<Song> | Partial<DevotionalSlot>>(
  items: T[],
  query: string
): T[] {
  if (!query || !query.trim()) {
    return items;
  }

  const scored: Array<{ item: T; score: number }> = [];

  for (const item of items) {
    const res = evaluateSearchMatch(item, query);
    if (res.matched && res.score > 0) {
      scored.push({ item, score: res.score });
    }
  }

  // Sort descending by relevance score
  scored.sort((a, b) => b.score - a.score);

  return scored.map(s => s.item);
}

/**
 * Split text for keyword highlighting
 */
export function splitForHighlight(text: string, query: string): Array<{ text: string; isMatch: boolean }> {
  if (!text || !query || !query.trim()) {
    return [{ text: text || '', isMatch: false }];
  }

  const cleanQuery = normalizeSearchText(query);
  const rawTokens = cleanQuery.split(/\s+/).filter(t => t.length > 1 && !STOP_WORDS.has(t));
  if (rawTokens.length === 0) {
    return [{ text, isMatch: false }];
  }

  const escaped = rawTokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(${escaped})`, 'gi');

  const parts = text.split(regex);
  return parts.map(part => ({
    text: part,
    isMatch: rawTokens.some(tok => part.toLowerCase() === tok)
  }));
}
