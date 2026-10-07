import React, { useState, useCallback, useRef } from 'react';
import { Volume2, CheckCircle, Circle } from 'lucide-react';

/* ──────────────── data ──────────────── */

interface BodyPart {
  id: string;
  spanish: string;
  english: string;
}

const BODY_PARTS: BodyPart[] = [
  { id: 'cabeza', spanish: 'Cabeza', english: 'Head' },
  { id: 'ojos', spanish: 'Ojos', english: 'Eyes' },
  { id: 'orejas', spanish: 'Orejas', english: 'Ears' },
  { id: 'nariz', spanish: 'Nariz', english: 'Nose' },
  { id: 'boca', spanish: 'Boca', english: 'Mouth' },
  { id: 'hombros', spanish: 'Hombros', english: 'Shoulders' },
  { id: 'brazos', spanish: 'Brazos', english: 'Arms' },
  { id: 'manos', spanish: 'Manos', english: 'Hands' },
  { id: 'dedos', spanish: 'Dedos', english: 'Fingers' },
  { id: 'pecho', spanish: 'Pecho', english: 'Chest' },
  { id: 'estomago', spanish: 'Estómago', english: 'Stomach' },
  { id: 'piernas', spanish: 'Piernas', english: 'Legs' },
  { id: 'rodillas', spanish: 'Rodillas', english: 'Knees' },
  { id: 'pies', spanish: 'Pies', english: 'Feet' },
  { id: 'lengua', spanish: 'Lengua', english: 'Tongue' },
  { id: 'dientes', spanish: 'Dientes', english: 'Teeth' },
];

/* ──────────────── helpers ──────────────── */

function speak(text: string): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.85;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/* ──────────────── component ──────────────── */

interface WordListProps {
  /** Optional list override; defaults to BODY_PARTS */
  parts?: BodyPart[];
}

export default function WordList({ parts = BODY_PARTS }: WordListProps) {
  const [learned, setLearned] = useState<Set<string>>(new Set());
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleLearned = useCallback((id: string) => {
    setLearned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSpeak = useCallback(
    (id: string, text: string) => {
      speak(text);
      setSpeakingId(id);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setSpeakingId(null), 600);
    },
    [],
  );

  return (
    <section
      className="mx-auto w-full max-w-3xl px-4 py-6"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <h2
        className="mb-6 text-center text-xl font-semibold"
        style={{ color: '#1A1A2E' }}
      >
        Lista completa de las partes del cuerpo
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {parts.map((part) => {
          const isLearned = learned.has(part.id);
          const isSpeaking = speakingId === part.id;

          return (
            <article
              key={part.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 transition-shadow duration-200',
                isLearned ? 'border-[#339900] bg-[#F0F9F0]' : 'border-gray-200 bg-white',
              )}
              style={{ borderRadius: '8px' }}
            >
              {/* Mark as learned toggle */}
              <button
                type="button"
                onClick={() => toggleLearned(part.id)}
                className="flex shrink-0 items-center justify-center"
                style={{ width: 28, height: 28, minWidth: 28 }}
                aria-label={
                  isLearned
                    ? `Marcar "${part.spanish}" como no aprendida`
                    : `Marcar "${part.spanish}" como aprendida`
                }
              >
                {isLearned ? (
                  <CheckCircle size={24} color="#339900" aria-hidden />
                ) : (
                  <Circle size={24} color="#9CA3AF" aria-hidden />
                )}
              </button>

              {/* Text block */}
              <div className="flex min-w-0 flex-1 flex-col">
                <span
                  className="truncate text-base font-semibold"
                  style={{ color: '#1A1A2E', fontSize: '16px' }}
                >
                  {part.spanish}
                </span>
                <span
                  className="truncate text-sm"
                  style={{ color: '#6B7280', fontSize: '14px' }}
                >
                  {part.english}
                </span>
              </div>

              {/* Audio button */}
              <button
                type="button"
                onClick={() => handleSpeak(part.id, part.english)}
                className={cn(
                  'flex shrink-0 items-center justify-center rounded-full transition-colors duration-150',
                  isSpeaking ? 'bg-[#339900] text-white' : 'bg-[#F5F7FA] text-[#1A1A2E] hover:bg-[#E5E7EB]',
                )}
                style={{ width: 44, height: 44, minWidth: 44 }}
                aria-label={`Escuchar pronunciación de ${part.english}`}
              >
                <Volume2 size={20} aria-hidden />
              </button>
            </article>
          );
        })}
      </div>

      {/* Progress summary */}
      <p
        className="mt-6 text-center text-sm"
        style={{ color: '#6B7280', fontSize: '14px' }}
      >
        {learned.size} de {parts.length} partes aprendidas
        {learned.size === parts.length && parts.length > 0
          ? ' — ¡Felicidades! 🎉'
          : ''}
      </p>
    </section>
  );
}