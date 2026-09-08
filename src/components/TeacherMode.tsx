import React, { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TeacherFeedback {
  /** Lo que el estudiante respondió */
  studentAnswer: string;
  /** La respuesta correcta */
  correctAnswer: string;
  /** Explicación de por qué la respuesta correcta es correcta */
  explanation: string;
  /** Regla sencilla o mnemotécnica */
  rule: string;
  /** 1-2 ejemplos ilustrativos */
  examples: string[];
  /** Nueva pregunta para verificar entendimiento */
  followUpQuestion: string;
  /** Opciones para la nueva pregunta (opcional) */
  followUpOptions?: string[];
  /** Índice de la opción correcta en followUpOptions */
  followUpCorrectIndex?: number;
}

interface TeacherModeProps {
  /** El feedback estructurado del "modo profesor" */
  feedback: TeacherFeedback;
  /** Callback cuando el usuario responde la pregunta de seguimiento */
  onFollowUpAnswer?: (selectedIndex: number) => void;
  /** Callback para reintentar la pregunta original */
  onRetry?: () => void;
  /** Callback para continuar con la siguiente pregunta */
  onContinue?: () => void;
  /** Si está en estado de carga */
  isLoading?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

// ---------------------------------------------------------------------------
// Subcomponentes
// ---------------------------------------------------------------------------

function SectionCard({
  icon: Icon,
  title,
  children,
  defaultOpen = true,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-xl"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {title}
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-4 pb-4 pt-3 dark:border-slate-700">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExampleBlock({ text }: { text: string }) {
  return (
    <div className="relative rounded-lg border-l-4 border-emerald-400 bg-emerald-50/60 px-3 py-2 text-sm text-slate-700 dark:border-emerald-500 dark:bg-emerald-900/20 dark:text-slate-300">
      <span className="absolute -left-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-white dark:bg-emerald-500">
        &amp;
      </span>
      {text}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function TeacherMode({
  feedback,
  onFollowUpAnswer,
  onRetry,
  onContinue,
  isLoading = false,
  className,
}: TeacherModeProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleOptionClick = useCallback(
    (index: number) => {
      if (showResult) return;
      setSelectedOption(index);
      setShowResult(true);
      onFollowUpAnswer?.(index);
    },
    [showResult, onFollowUpAnswer],
  );

  const handleReset = useCallback(() => {
    setSelectedOption(null);
    setShowResult(false);
  }, []);

  const isCorrect =
    showResult &&
    selectedOption !== null &&
    selectedOption === feedback.followUpCorrectIndex;

  // -----------------------------------------------------------------------
  // Loading skeleton
  // -----------------------------------------------------------------------
  if (isLoading) {
    return (
      <div
        className={cn(
          'mx-auto w-full max-w-2xl space-y-4 animate-pulse',
          className,
        )}
        role="status"
        aria-label="Cargando explicación del profesor"
      >
        <div className="h-8 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="h-24 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="h-20 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="h-20 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="h-20 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="h-32 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <span className="sr-only">Preparando explicación...</span>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Empty / fallback
  // -----------------------------------------------------------------------
  if (!feedback) {
    return (
      <div
        className={cn(
          'mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-600',
          className,
        )}
      >
        <BookOpen className="h-10 w-10 text-slate-400" aria-hidden="true" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Aún no hay retroalimentación del modo profesor.
        </p>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn('mx-auto w-full max-w-2xl space-y-5', className)}
    >
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Modo Profesor
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Entiende tu error y aprende la regla
          </p>
        </div>
      </div>

      {/* Respuesta del estudiante vs correcta */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Lo que respondiste */}
        <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 dark:border-red-800/50 dark:bg-red-900/20">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
            <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
            Tu respuesta
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {feedback.studentAnswer}
          </p>
        </div>

        {/* Respuesta correcta */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-800/50 dark:bg-emerald-900/20">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Respuesta correcta
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {feedback.correctAnswer}
          </p>
        </div>
      </div>

      {/* Explicación */}
      <SectionCard icon={Lightbulb} title="¿Por qué?">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {feedback.explanation}
        </p>
      </SectionCard>

      {/* Regla sencilla */}
      <SectionCard icon={BookOpen} title="Regla sencilla">
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm italic text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          “{feedback.rule}”
        </div>
      </SectionCard>

      {/* Ejemplos */}
      <SectionCard icon={Sparkles} title="Ejemplos" defaultOpen={true}>
        <div className="space-y-2">
          {feedback.examples.map((ex, i) => (
            <ExampleBlock key={i} text={ex} />
          ))}
        </div>
      </SectionCard>

      {/* Pregunta de seguimiento */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Verifica tu entendimiento
          </h3>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {feedback.followUpQuestion}
        </p>

        {feedback.followUpOptions && feedback.followUpOptions.length > 0 ? (
          <div className="space-y-2">
            {feedback.followUpOptions.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let optionStyle =
                'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:border-slate-500 dark:hover:bg-slate-700/50';

              if (showResult) {
                if (idx === feedback.followUpCorrectIndex) {
                  optionStyle =
                    'border-emerald-400 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-900/20';
                } else if (isSelected) {
                  optionStyle =
                    'border-red-300 bg-red-50 dark:border-red-500 dark:bg-red-900/20';
                } else {
                  optionStyle =
                    'border-slate-200 opacity-60 dark:border-slate-700';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleOptionClick(idx)}
                  disabled={showResult}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
                    optionStyle,
                  )}
                  aria-pressed={isSelected}
                >
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                      showResult && idx === feedback.followUpCorrectIndex
                        ? 'border-emerald-400 bg-emerald-400 text-white'
                        : showResult && isSelected
                          ? 'border-red-400 bg-red-400 text-white'
                          : 'border-slate-300 text-slate-500 dark:border-slate-500 dark:text-slate-400',
                    )}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-slate-800 dark:text-slate-200">
                    {opt}
                  </span>
                  {showResult && idx === feedback.followUpCorrectIndex && (
                    <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-emerald-500" />
                  )}
                  {showResult && isSelected && idx !== feedback.followUpCorrectIndex && (
                    <XCircle className="ml-auto h-4 w-4 shrink-0 text-red-500" />
                  )}
                </button>
              );
            })}

            {/* Resultado */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div
                    className={cn(
                      'mt-3 rounded-lg px-3.5 py-2.5 text-sm font-medium',
                      isCorrect
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
                    )}
                  >
                    {isCorrect
                      ? '¡Correcto! Has entendido la regla.'
                      : 'No es correcto. Revisa la explicación y la regla de nuevo.'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            (Pregunta abierta — reflexiona y luego continúa.)
          </p>
        )}

        {/* Botones de acción */}
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-700">
          {onRetry && (
            <button
              type="button"
              onClick={() => {
                handleReset();
                onRetry();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Reintentar
            </button>
          )}

          {onContinue && (
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              Continuar
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}