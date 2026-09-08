import { useCourse } from '../lib/courseStore';
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RotateCcw, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

// ─── Helpers ───────────────────────────────────────────────────────────────

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// ─── Tipos ─────────────────────────────────────────────────────────────────

type FlashcardType =
  | 'ingles_espanol'
  | 'espanol_ingles'
  | 'palabra_significado'
  | 'frase_traduccion'
  | 'completar_oracion'
  | 'regla_ejemplo';

interface Flashcard {
  id: string;
  type: FlashcardType;
  front: string;
  back: string;
  hint?: string;
  source?: string;
}

interface FlashcardStats {
  correct: number;
  incorrect: number;
}

// ─── Datos de demostración ─────────────────────────────────────────────────

// ─── Etiquetas de tipo ─────────────────────────────────────────────────────

const TYPE_LABELS: Record<FlashcardType, string> = {
  ingles_espanol: 'Inglés → español',
  espanol_ingles: 'Español → inglés',
  palabra_significado: 'Palabra → significado',
  frase_traduccion: 'Frase → traducción',
  completar_oracion: 'Completar oración',
  regla_ejemplo: 'Regla gramatical → ejemplo',
};

// ─── Componente de tarjeta con animación de volteo ─────────────────────────

interface CardProps {
  card: Flashcard;
  flipped: boolean;
  onFlip: () => void;
  onKnow: () => void;
  onPractice: () => void;
}

function FlashcardCard({ card, flipped, onFlip, onKnow, onPractice }: CardProps) {
  return (
    <div className="relative w-full max-w-lg mx-auto" style={{ minHeight: '280px' }}>
      <div
        className="relative w-full h-full cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={!flipped ? onFlip : undefined}
      >
        <motion.div
          className="relative w-full"
          style={{
            minHeight: '280px',
            transformStyle: 'preserve-3d',
          }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Frente */}
          <div
            className={cn(
              'absolute inset-0 w-full h-full rounded-xl shadow-md bg-white border border-slate-200',
              'flex flex-col items-center justify-center p-8 text-center',
              'backface-hidden'
            )}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              {TYPE_LABELS[card.type]}
            </span>
            <p className="text-2xl font-semibold text-slate-800 leading-snug">
              {card.front}
            </p>
            {card.hint && !flipped && (
              <p className="mt-4 text-sm text-slate-400 italic">
                💡 {card.hint}
              </p>
            )}
            <p className="mt-6 text-sm text-slate-400">
              Toca para ver la respuesta
            </p>
          </div>

          {/* Reverso */}
          <div
            className={cn(
              'absolute inset-0 w-full h-full rounded-xl shadow-md bg-white border border-slate-200',
              'flex flex-col items-center justify-center p-8 text-center'
            )}
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              Respuesta
            </span>
            <p className="text-2xl font-semibold text-slate-800 leading-snug">
              {card.back}
            </p>
            {card.source && <p className="mt-3 text-sm text-slate-600">{card.source}</p>}
            {card.hint && (
              <p className="mt-4 text-sm text-slate-400 italic">
                💡 {card.hint}
              </p>
            )}

            {/* Botones de acción */}
            <div className="mt-8 flex gap-4 w-full max-w-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPractice();
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
                  'bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200',
                  'font-medium text-sm transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2'
                )}
              >
                <AlertCircle className="w-4 h-4" />
                Necesito practicar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onKnow();
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
                  'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 active:bg-emerald-200',
                  'font-medium text-sm transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2'
                )}
              >
                <CheckCircle className="w-4 h-4" />
                Lo sé
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Filtro por tipo ───────────────────────────────────────────────────────

const ALL_TYPES: FlashcardType[] = [
  'ingles_espanol',
  'espanol_ingles',
  'palabra_significado',
  'frase_traduccion',
  'completar_oracion',
  'regla_ejemplo',
];

// ─── Componente principal ──────────────────────────────────────────────────

export default function Flashcards({ cards }: { cards: Flashcard[] }) {
  const record = useCourse(s => s.record);
  const [stats, setStats] = useState<Record<string, FlashcardStats>>(() => {
    const state = useCourse.getState();
    const history = state.attempts[state.activeId || ''] || [];
    const result: Record<string, FlashcardStats> = {};
    for (const a of history.filter(a => a.mode === 'flashcards')) {
      const stat = result[a.cardId] ??= { correct: 0, incorrect: 0 };
      if (a.correct) stat.correct++; else stat.incorrect++;
    }
    return result;
  });
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [activeTypes, setActiveTypes] = useState<Set<FlashcardType>>(
    new Set(ALL_TYPES)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  // ── Filtrado y ordenación con repetición espaciada simple ──

  const filteredCards = useMemo(() => {
    return cards.filter((c) => activeTypes.has(c.type));
  }, [cards, activeTypes]);

  const sortedCards = useMemo(() => {
    // Las tarjetas falladas aparecen con mayor frecuencia:
    // duplicamos las que tienen más incorrectos que correctos
    const list: Flashcard[] = [];
    for (const card of filteredCards) {
      list.push(card);
      const s = stats[card.id];
      if (s && s.incorrect > s.correct) {
        // Aparece una vez extra por cada fallo adicional
        const extra = Math.min(s.incorrect - s.correct, 3);
        for (let i = 0; i < extra; i++) {
          list.push(card);
        }
      }
    }
    return list;
  }, [filteredCards, stats]);

  const currentCard = sortedCards[currentIndex] ?? null;

  const goNext = useCallback(() => {
    if (currentIndex < sortedCards.length - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
      setFlippedId(null);
    }
  }, [currentIndex, sortedCards.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
      setFlippedId(null);
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    if (currentCard) {
      setFlippedId((prev) => (prev === currentCard.id ? null : currentCard.id));
    }
  }, [currentCard]);

  const handleKnow = useCallback(() => {
    if (!currentCard) return;
    record({ cardId: currentCard.id, correct: true, answer: currentCard.back, mode: 'flashcards' });
    setStats((prev) => ({
      ...prev,
      [currentCard.id]: {
        correct: (prev[currentCard.id]?.correct ?? 0) + 1,
        incorrect: prev[currentCard.id]?.incorrect ?? 0,
      },
    }));
    goNext();
  }, [currentCard, goNext]);

  const handlePractice = useCallback(() => {
    if (!currentCard) return;
    record({ cardId: currentCard.id, correct: false, answer: 'Necesito practicar', mode: 'flashcards' });
    setStats((prev) => ({
      ...prev,
      [currentCard.id]: {
        correct: prev[currentCard.id]?.correct ?? 0,
        incorrect: (prev[currentCard.id]?.incorrect ?? 0) + 1,
      },
    }));
    goNext();
  }, [currentCard, goNext]);

  const toggleType = useCallback((type: FlashcardType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
    setCurrentIndex(0);
    setFlippedId(null);
  }, []);

  const resetProgress = useCallback(() => {
    setStats({});
    setCurrentIndex(0);
    setFlippedId(null);
  }, []);

  // ── Render ──

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <BookOpen className="w-8 h-8 text-blue-500" />
        </motion.div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800" style={{ fontFamily: 'Lexend, sans-serif' }}>
            Flashcards
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tarjetas interactivas basadas en el contenido del PDF.
          </p>
        </div>
      </div>

      {/* Filtros de tipo */}
      <div className="mb-6">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
          Tipos:
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_TYPES.filter(type => cards.some(card => card.type === type)).map((type) => {
            const active = activeTypes.has(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2',
                  active
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {TYPE_LABELS[type]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contador */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          {sortedCards.length > 0
            ? `Tarjeta ${currentIndex + 1} de ${sortedCards.length}`
            : 'Sin tarjetas'}
        </p>
        <button
          onClick={resetProgress}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
            'text-slate-500 hover:text-slate-700 hover:bg-slate-100',
            'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2'
          )}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reiniciar progreso
        </button>
      </div>

      {/* Tarjeta */}
      <AnimatePresence mode="wait">
        {currentCard ? (
          <motion.div
            key={currentCard.id + '-' + currentIndex}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <FlashcardCard
              card={currentCard}
              flipped={flippedId === currentCard.id}
              onFlip={handleFlip}
              onKnow={handleKnow}
              onPractice={handlePractice}
            />
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl shadow-md bg-white border border-slate-200 p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-lg font-semibold text-slate-600">
              No hay tarjetas disponibles
            </p>
            <p className="text-sm text-slate-400 mt-2 max-w-sm">
              Selecciona al menos un tipo de tarjeta para empezar a practicar.
            </p>
          </div>
        )}
      </AnimatePresence>

      {/* Navegación inferior */}
      {sortedCards.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium',
              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2',
              currentIndex === 0
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:bg-slate-100 active:bg-slate-200'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          {/* Indicador de progreso */}
          <div className="flex gap-1">
            {sortedCards.slice(0, Math.min(sortedCards.length, 20)).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  i === currentIndex
                    ? 'bg-blue-500'
                    : i < currentIndex
                    ? 'bg-emerald-300'
                    : 'bg-slate-200'
                )}
              />
            ))}
            {sortedCards.length > 20 && (
              <span className="text-xs text-slate-400 ml-1">+{sortedCards.length - 20}</span>
            )}
          </div>

          <button
            onClick={goNext}
            disabled={currentIndex === sortedCards.length - 1}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium',
              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2',
              currentIndex === sortedCards.length - 1
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:bg-slate-100 active:bg-slate-200'
            )}
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Estadísticas */}
      {Object.keys(stats).length > 0 && (
        <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            Progreso de esta sesión
          </p>
          <div className="flex gap-6 text-sm">
            <span className="text-emerald-600 font-medium">
              ✅ Lo sé: {Object.values(stats).reduce((sum, s) => sum + s.correct, 0)}
            </span>
            <span className="text-red-500 font-medium">
              🔄 Necesito practicar: {Object.values(stats).reduce((sum, s) => sum + s.incorrect, 0)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
