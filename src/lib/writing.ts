import { grammarExercises, gradeGrammar } from './grammar.ts';
import { cleanText, type Course } from './course.ts';
export interface WritingExercise { id: string; prompt: string; hint: string; example: string; pronoun: 'he' | 'she'; kind: 'identity' | 'sentence' | 'grammar' | 'basic'; topic?: string; grammarPrefix?: string; alternatives: string[]; source: string; context: string }
export interface Grade { correct: boolean; explanation: string; example: string }
const normalize = (s: string) => s.normalize('NFKC').replace(/[‘’]/g, "'").replace(/\b(he|she)'s\b/gi, '$1 is').toLowerCase().replace(/[.!?,]/g, '').replace(/\s+/g, ' ').trim();
const roles: Record<string,string> = { father:'el padre', mother:'la madre', son:'el hijo', daughter:'la hija', brother:'el hermano', sister:'la hermana', husband:'el esposo', wife:'la esposa', uncle:'el tío', aunt:'la tía', grandfather:'el abuelo', grandmother:'la abuela' };
export function writingExercises(course: Course, variant = 0): WritingExercise[] {
  const basics: WritingExercise[] = (course.basicQuestions || []).map(q => ({id:`writing-${q.id}`,kind:'basic',pronoun:'he',topic:q.topic,prompt:q.prompt,hint:q.explanation,example:q.answers[0],alternatives:q.answers,source:q.example,context:`Biblioteca básica · ${q.topic}`}));
  if (course.builtin) return basics;
  const exercises: WritingExercise[] = [];
  // Build transformations from reliable lines in this course, never a global fallback.
  const seen = new Set<string>();
  for (const page of course.pages) {
    for (const raw of cleanText(page.text).split('\n')) {
      if (page.uncertainLines?.some(line => cleanText(line).includes(raw))) continue;
      const line = raw.replace(/^(?:[A-Z]|\d+)[.)]\s*/i, '').trim();
      const match = line.match(/^(This is|That is|These are|Those are) the ([A-Za-z]+(?: [A-Za-z]+)?) of (the students|the teachers|the boys|the girls|[A-Za-z]+(?: and [A-Za-z]+)?)\.$/i);
      if (!match || seen.has(line.toLowerCase())) continue;
      seen.add(line.toLowerCase());
      const [, start, object, owner] = match;
      const plural = /^the /i.test(owner);
      const possessive = plural ? `${owner}'` : `${owner}'s`;
      const example = `${start} ${possessive} ${object}.`;
      const alternatives = [example];
      if (!plural && /s$/i.test(owner)) alternatives.push(`${start} ${owner}' ${object}.`);
      exercises.push({id:`possessive-${course.id}-${page.page}-${exercises.length}`, kind:'basic', topic:'Posesivos', pronoun:'he',
        prompt:`Reescribe con posesivo ('s o '): ${line}`, hint:"Coloca primero al dueño y después el objeto. Singular: nombre + 's. Plural terminado en s: añade solo '. En nombres singulares terminados en s se aceptan ambas formas.",
        example, alternatives, source:line, context:`Transformación de ${page.sourceName || course.fileName} · página ${page.page}.`});
    }
  }
  for (const card of course.cards) {
    const match = card.source.match(/^(He|She) is (.+)\.$/i);
    if (!match) continue;
    const pronoun = match[1].toLowerCase() as 'he' | 'she';
    const role = match[2].match(/^(?:the )?(father|mother|son|daughter|brother|sister|husband|wife|uncle|aunt|grandfather|grandmother)$/i);
    const possession = match[2].match(/^([A-Za-z .'-]+)'s (husband|wife|father|mother|brother|sister|uncle|aunt|son|daughter)$/i);
    if (!role && !possession) continue;
    const translation = role ? roles[role[1].toLowerCase()] : `${roles[possession![2].toLowerCase()]} de ${possession![1]}`;
    const subject = pronoun === 'he' ? 'Él' : 'Ella';
    exercises.push({id:`writing-${card.id}`, kind:'sentence', pronoun, prompt:`Escribe en inglés: «${subject} es ${translation}». Usa un pronombre.`, hint:`${subject} → ${pronoun}. Con he/she, usa is.${possession ? " La posesión puede expresarse con nombre + 's + parentesco, o con the … of …." : ' Después escribe el parentesco con the.'}`, example:card.source, alternatives:[card.source, ...(possession ? [`${match[1]} is the ${possession[2]} of ${possession[1]}.`] : [])], source:card.source, context:`Adaptado de ${card.hint}`});
  }
  const hasSingers = course.pages.some(p => /\bsinger\b/i.test(p.text)) || course.cards.some(c => /\bsinger\b/i.test(c.source));
  for (const pronoun of hasSingers ? ['she','he'] as const : []) {
    const female=pronoun==='she';
    exercises.push({id:`writing-${course.id}-${pronoun}-identity`,kind:'identity',pronoun,prompt:`Who is an American ${female ? 'female' : 'male'} singer?`, hint:`${female ? 'Female indica una mujer: she' : 'Male indica un hombre: he'}. Responde con ${pronoun} + is + un nombre, o con un nombre + is an American singer. Puedes elegir cualquier nombre.`,example:`${female ? 'She is Taylor Swift.' : 'He is Bruno Mars.'}`,alternatives:[],source:'',context:'Práctica adicional solicitada: estructura de respuesta. No se verifica la identidad, profesión ni nacionalidad del nombre elegido.'});
  }
  return [...basics, ...grammarExercises(course, variant), ...exercises];
}
export function gradeWriting(exercise: WritingExercise, answer: string): Grade {
  if (exercise.kind === 'basic') {
    const correct=exercise.alternatives.some(a=>normalize(a)===normalize(answer));
    return {correct,explanation:`${correct?'Correcto.':'Revisa tu respuesta.'} ${exercise.hint}`,example:exercise.example};
  }
  if (exercise.kind === 'grammar') return gradeGrammar(exercise, answer);
  const value=normalize(answer), expected=exercise.pronoun;
  const fail=(explanation:string):Grade=>({correct:false,explanation,example:exercise.example});
  const opposite=expected==='he'?'she':'he';
  if (new RegExp(`^${opposite}\\b`).test(value)) return fail(`La consigna habla de ${expected==='he'?'un hombre':'una mujer'}. Usa ${expected}, no ${opposite}: ${expected} is…`);
  if (new RegExp(`^${expected} (?:are|am|be|were)\\b`).test(value)) return fail(`Con ${expected}, el presente del verbo to be es is: ${expected} is…`);
  if (exercise.kind==='sentence') {
    if (exercise.alternatives.some(a=>normalize(a)===value)) return {correct:true, explanation:'Correcto: el pronombre, el verbo y la relación coinciden con la consigna.', example:exercise.example};
    if (!value.startsWith(`${expected} is `)) return fail(`Empieza con ${expected} is. Se pide un pronombre y el verbo to be en presente.`);
    if (exercise.example.includes("'s")) return fail("Revisa la posesión y el parentesco. Usa nombre + 's + parentesco, o the + parentesco + of + nombre. Conserva la persona indicada en la consigna.");
    return fail('Revisa el artículo the y la palabra de parentesco. Esta actividad comprueba la frase indicada, no una traducción libre.');
  }
  // Names are deliberately unconstrained semantically: this checks only a taught template.
  const identity=value.match(new RegExp(`^${expected} is (.+)$`));
  const named=value.match(/^(.+) is an american (?:(?:female|male) )?singer$/);
  const candidate=identity?.[1] || named?.[1];
  const invalidName=/\b(?:he|she|it|they|we|you|i|am|is|are|was|were|not|a|an|the|singer|american|male|female)\b/i;
  if (candidate && /^[\p{L}][\p{L}'-]*(?: [\p{L}][\p{L}'-]*){0,5}$/u.test(candidate) && !invalidName.test(candidate)) {
    if (named && new RegExp(`\\b${expected==='she'?'male':'female'} singer$`).test(value)) return fail('El género escrito contradice la consigna. Revisa male/female.');
    return {correct:true,explanation:'La estructura es correcta dentro del patrón practicado. El nombre es libre; no se ha verificado quién es esa persona.',example:exercise.example};
  }
  if (/ is a american\b/.test(value)) return fail('Antes de American se usa an, no a: an American singer.');
  return fail(`Escribe una frase completa: ${expected} is + nombre, o nombre + is an American singer. Otras construcciones quedan fuera de esta comprobación guiada.`);
}
