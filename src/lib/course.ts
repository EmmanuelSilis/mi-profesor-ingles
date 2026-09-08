export interface SourcePage { page: number; text: string; method: 'text' | 'ocr'; confidence?: number; uncertainLines?: string[] }
export interface Unit { title: string; topics: string[]; vocabulary: string[]; grammar: string[]; page: number }
export interface StudyCard { id: string; type: 'completar_oracion'; front: string; back: string; hint: string; page: number; source: string }
export interface Course { id: string; fileName: string; pages: SourcePage[]; units: Unit[]; cards: StudyCard[]; createdAt: string }

// Preserve line boundaries and accents. Do not guess damaged words.
export function cleanText(text: string): string {
  return text.normalize('NFKC').replace(/\r\n?/g, '\n').replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/([a-z])-\n([a-z])/g, '$1$2')
    .split('\n').map(line => line.replace(/[\t\u00a0 ]+/g, ' ').trim().replace(/^[•●®@]\s*/, ''))
    .filter(line => !/^\d{1,3}$/.test(line) && !/^[^\p{L}\p{N}]+$/u.test(line)).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
export function usableText(text: string): boolean {
  const letters = (text.match(/\p{L}/gu) || []).length;
  const bad = (text.match(/[^\p{L}\p{N}\s.,;:'"!?¿¡()\-–—_/]/gu) || []).length;
  return letters >= 30 && !text.includes('\uFFFD') && bad / Math.max(text.length, 1) < .025;
}
const stop = new Set('the a an is are was were am be been being this that these those he she it they we you i my his her its their our your and or but to of in on at for from with as by do does did not no yes me him them us there here have has had can will would could should very some any what where who how when why which than then so also all one two three listen read answer following questions sentences part lesson unit'.split(' '));
const heading = /^(?:(?:lesson|unit|unidad|lecci[oó]n|part|parte)\s+(?:\d+|[ivx]+|one|two|three|four|five|six|seven|eight|nine|ten)\b|(?:vocabulary|vocabulario|grammar|gramática|dialogue|conversation|tema|topic)\b)/i;
const directive = /^(?:[•●]?\s*)?(?:listen|read|answer|observe|complete|write|make questions|match|repeat|choose|fill|ask)\b/i;
export function analyzeCourse(pages: SourcePage[], fileName: string): Course {
  const units: Unit[] = [], cards: StudyCard[] = [];
  const seen = new Set<string>(), id = crypto.randomUUID();
  const cleanedPages = pages.map(p => ({ ...p, text: cleanText(p.text) }));
  for (const page of cleanedPages) {
    let unit: Unit = { title: `Página ${page.page}`, page: page.page, topics: [], vocabulary: [], grammar: [] };
    units.push(unit);
    for (const line of page.text.split('\n').flatMap(line => line.split(/(?<!\bMr\.)(?<!\bMrs\.)(?<!\bDr\.)(?<=[.!])\s+(?=[A-Z])/))) {
      if ((heading.test(line) || /\blesson\s+(?:nine|ten|\d+)\b/i.test(line)) && line.length < 100) {
        if (!unit.topics.length && !unit.vocabulary.length && unit.title.startsWith('Página ')) unit.title = line;
        else { unit = { title: line, page: page.page, topics: [], vocabulary: [], grammar: [] }; units.push(unit); }
        if (/grammar|gramática/i.test(line)) unit.grammar.push(line);
        continue;
      }
      if ((line === line.toUpperCase() || /^(?:topic|tema|vocabulary|vocabulario)/i.test(line)) && /[A-Z]{3}/.test(line) && line.length < 85 && !directive.test(line)) unit.topics.push(line);
      if (page.uncertainLines?.some(uncertain => cleanText(uncertain).includes(line)) || line.includes('\uFFFD') || /[~|{}<>]/.test(line) || directive.test(line) || /_{2,}|-{3,}/.test(line)) continue;
      const tokens = line.match(/\b[A-Za-z]+(?:'[a-z]+)?\b/g) || [];
      const terms = tokens.filter(t => t.length > 3 && !stop.has(t.toLowerCase()));
      for (const term of terms) if (!unit.vocabulary.some(w => w.toLowerCase() === term.toLowerCase())) unit.vocabulary.push(term);
      // Cloze answers and evidence are copied from the source, never inferred.
      if (tokens.length >= 4 && tokens.length <= 32 && terms.length && /[.!]$/.test(line) && !line.includes('?') && !/[^\p{L}\p{N}\s.,;:'"!?()\-–—]/u.test(line)) {
        const answer = [...terms].sort((a,b) => b.length - a.length)[0];
        if (!seen.has(line.toLowerCase())) {
          seen.add(line.toLowerCase());
          cards.push({ id: `${id}-${cards.length}`, type: 'completar_oracion', front: line.replace(new RegExp(`\\b${answer}\\b`), '_____'), back: answer, hint: `${fileName} · página ${page.page}`, page: page.page, source: line });
        }
      }
    }
  }
  return { id, fileName, pages: cleanedPages, units, cards, createdAt: new Date().toISOString() };
}
export function normalizeAnswer(value: string) {
  return value.normalize('NFKC').toLowerCase().replace(/[‘’]/g, "'").replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();
}
