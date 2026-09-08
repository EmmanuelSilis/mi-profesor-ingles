import React, { useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Lightbulb, BookOpen, ArrowRight, RotateCcw, BrainCircuit } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ─── Helpers ───────────────────────────────────────────────────────────────

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type CorrectionStatus = 'correct' | 'incorrect';

interface CorrectionData {
  status: CorrectionStatus;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  isRecurring: boolean;
  topic: string;
}

interface Exercise {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface ProgressStats {
  totalAnswered: number;
  correct: number;
  errors: number;
  percentage: number;
  masteredTopics: string[];
  weakTopics: string[];
  difficultWords: string[];
  recurringErrors: string[];
}

// ─── Demo data ─────────────────────────────────────────────────────────────

const DEMO_CORRECTION: CorrectionData = {
  status: 'incorrect',
  userAnswer: 'Yo voy a la biblioteca ayer.',
  correctAnswer: 'Yo fui a la biblioteca ayer.',
  explanation:
    'El verbo "ir" en pretérito perfecto simple (fui) es necesario porque la acción ocurrió en el pasado ("ayer"). "Voy" es presente.',
  isRecurring: true,
  topic: 'Pretérito perfecto simple — verbos irregulares',
};

const DEMO_EXERCISES: Exercise[] = [
  {
    id: 'ex-1',
    question: 'Completa con la forma correcta del pretérito perfecto simple: "Ayer yo ___ (ir) al mercado."',
    options: ['voy', 'fui', 'iba', 'he ido'],
    correctIndex: 1,
    explanation: '"Ayer" indica pasado puntual → pretérito perfecto simple: "fui".',
  },
  {
    id: 'ex-2',
    question: '¿Cuál es la forma correcta? "Ellos ___ (ir) a la playa el verano pasado."',
    options: ['van', 'iban', 'fueron', 'han ido'],
    correctIndex: 2,
    explanation: '"El verano pasado" es un tiempo pasado terminado → "fueron" (pretérito perfecto simple).',
  },
  {
    id: 'ex-3',
    question: 'Selecciona la oración correcta:',
    options: [
      'Yo voy a la fiesta anoche.',
      'Yo fui a la fiesta anoche.',
      'Yo iba a la fiesta anoche.',
      'Yo he ido a la fiesta anoche.',
    ],
    correctIndex: 1,
    explanation: '"Anoche" exige pretérito perfecto simple: "fui".',
  },
];

const DEMO_PROGRESS: ProgressStats = {
  totalAnswered: 47,
  correct: 32,
  errors: 15,
  percentage: 68,
  masteredTopics: ['Presente de indicativo', 'Artículos definidos', 'Ser y estar (usos básicos)'],
  weakTopics: ['Pretérito perfecto simple', 'Subjuntivo presente', 'Pronombres de objeto indirecto'],
  difficultWords: ['ayer', 'fui', 'hubo', 'estuvieron'],
  recurringErrors: ['Confundir presente con pretérito', 'Olvidar la tilde en palabras agudas'],
};

// ─── Sub-components ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CorrectionStatus }) {
  const isCorrect = status === 'correct';
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-base font-semibold shadow-md',
        isCorrect
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
          : 'bg-red-50 text-red-700 ring-1 ring-red-200'
      )}
    >
      {isCorrect ? (
        <CheckCircle className="h-5 w-5 text-emerald-500" aria-hidden="true" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
      )}
      <span>{isCorrect ? 'CORRECTO' : 'INCORRECTO'}</span>
    </div>
  );
}

function RecurringTag() {
  return (
    <div className="mt-3 flex items-center gap-2 text-sm font-medium text-amber-600">
      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
      <span>Error recurrente — presta especial atención a este tema.</span>
    </div>
  );
}

function CorrectionCard({ data }: { data: CorrectionData }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md ring-1 ring-slate-100">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <BrainCircuit className="h-6 w-6 text-blue-500" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>
          Corrección inteligente
        </h2>
      </div>

      {/* Status */}
      <div className="mb-5">
        <StatusBadge status={data.status} />
      </div>

      {/* Answers */}
      <div className="mb-4 space-y-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Tu respuesta:</p>
          <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-base text-slate-700 ring-1 ring-slate-200">
            {data.userAnswer}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Respuesta correcta:</p>
          <p className="mt-1 rounded-lg bg-blue-50 px-3 py-2 text-base font-medium text-blue-700 ring-1 ring-blue-200">
            {data.correctAnswer}
          </p>
        </div>
      </div>

      {/* Explanation */}
      <div className="mb-4 rounded-xl bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-slate-700">Explicación</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{data.explanation}</p>
          </div>
        </div>
      </div>

      {/* Recurring error */}
      {data.isRecurring && <RecurringTag />}

      {/* Topic tag */}
      <div className="mt-4">
        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          {data.topic}
        </span>
      </div>
    </div>
  );
}

function ExerciseCard({
  exercise,
  index,
  onAnswer,
  revealed,
  selectedIndex,
}: {
  exercise: Exercise;
  index: number;
  onAnswer: (exerciseId: string, optionIndex: number) => void;
  revealed: boolean;
  selectedIndex: number | null;
}) {
  const isCorrect = selectedIndex === exercise.correctIndex;
  const isWrong = selectedIndex !== null && selectedIndex !== exercise.correctIndex;

  return (
    <div className="rounded-xl bg-white p-5 shadow-md ring-1 ring-slate-100">
      <p className="mb-3 text-sm font-medium text-slate-500">Ejercicio {index + 1}</p>
      <p className="mb-4 text-base font-medium text-slate-800">{exercise.question}</p>

      <div className="space-y-2">
        {exercise.options.map((option, optIndex) => {
          const isSelected = selectedIndex === optIndex;
          const showCorrect = revealed && optIndex === exercise.correctIndex;
          const showWrong = revealed && isSelected && optIndex !== exercise.correctIndex;

          return (
            <button
              key={optIndex}
              type="button"
              onClick={() => !revealed && onAnswer(exercise.id, optIndex)}
              disabled={revealed}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-base transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                isSelected && !revealed && 'border-blue-500 bg-blue-50 text-blue-700',
                !isSelected && !revealed && 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50',
                showCorrect && 'border-emerald-500 bg-emerald-50 text-emerald-700',
                showWrong && 'border-red-500 bg-red-50 text-red-700',
                revealed && !showCorrect && !showWrong && 'border-slate-200 bg-white text-slate-400'
              )}
            >
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                  showCorrect && 'bg-emerald-500 text-white',
                  showWrong && 'bg-red-500 text-white',
                  isSelected && !revealed && 'bg-blue-500 text-white',
                  !isSelected && !revealed && 'bg-slate-100 text-slate-500'
                )}
              >
                {String.fromCharCode(65 + optIndex)}
              </span>
              <span className="flex-1">{option}</span>
              {showCorrect && <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />}
              {showWrong && <XCircle className="h-5 w-5 shrink-0 text-red-500" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{exercise.explanation}</p>
        </div>
      )}
    </div>
  );
}

function ProgressPanel({ stats }: { stats: ProgressStats }) {
  const percentageColor =
    stats.percentage >= 80 ? 'text-emerald-600' : stats.percentage >= 50 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="rounded-xl bg-white p-6 shadow-md ring-1 ring-slate-100">
      <div className="mb-4 flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-blue-500" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>
          Sistema de progreso
        </h2>
      </div>

      {/* Stats grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <p className="text-2xl font-bold text-slate-800">{stats.totalAnswered}</p>
          <p className="text-xs text-slate-500">Preguntas</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{stats.correct}</p>
          <p className="text-xs text-emerald-600">Aciertos</p>
        </div>
        <div className="rounded-xl bg-red-50 p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
          <p className="text-xs text-red-600">Errores</p>
        </div>
        <div className="rounded-xl bg-blue-50 p-3 text-center">
          <p className={cn('text-2xl font-bold', percentageColor)}>{stats.percentage}%</p>
          <p className="text-xs text-blue-600">Porcentaje</p>
        </div>
      </div>

      {/* Topics */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold text-emerald-700">Temas dominados</p>
          {stats.masteredTopics.length > 0 ? (
            <ul className="space-y-1">
              {stats.masteredTopics.map((topic) => (
                <li key={topic} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                  {topic}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Aún no hay temas dominados.</p>
          )}
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-red-700">Temas débiles</p>
          {stats.weakTopics.length > 0 ? (
            <ul className="space-y-1">
              {stats.weakTopics.map((topic) => (
                <li key={topic} className="flex items-center gap-2 text-sm text-slate-600">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
                  {topic}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No hay temas débiles registrados.</p>
          )}
        </div>
      </div>

      {/* Difficult words & recurring errors */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">Palabras difíciles</p>
          {stats.difficultWords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {stats.difficultWords.map((word) => (
                <span
                  key={word}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  {word}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Ninguna aún.</p>
          )}
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">Errores recurrentes</p>
          {stats.recurringErrors.length > 0 ? (
            <ul className="space-y-1">
              {stats.recurringErrors.map((err) => (
                <li key={err} className="flex items-center gap-2 text-sm text-slate-600">
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-blue-500" aria-hidden="true" />
                  {err}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Ninguno aún.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function SmartCorrection() {
  const [exercises, setExercises] = useState<Exercise[]>(DEMO_EXERCISES);
  const [revealedExercises, setRevealedExercises] = useState<Record<string, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | null>>({});
  const [showProgress, setShowProgress] = useState(false);

  const handleAnswer = useCallback((exerciseId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [exerciseId]: optionIndex }));
    setRevealedExercises((prev) => ({ ...prev, [exerciseId]: true }));
  }, []);

  const handleReset = useCallback(() => {
    setExercises(DEMO_EXERCISES);
    setRevealedExercises({});
    setSelectedAnswers({});
    setShowProgress(false);
  }, []);

  const allRevealed = exercises.length > 0 && exercises.every((ex) => revealedExercises[ex.id]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <BrainCircuit className="h-8 w-8 text-blue-500" aria-hidden="true" />
        <h1
          className="text-2xl font-bold text-slate-800"
          style={{ fontFamily: 'Lexend, sans-serif', fontWeight: 700 }}
        >
          Corrección inteligente
        </h1>
      </div>

      <p className="text-base leading-relaxed text-slate-600">
        Después de cada respuesta:
      </p>

      <ul className="ml-5 list-disc space-y-1 text-sm text-slate-600">
        <li>Indicar CORRECTO o INCORRECTO.</li>
        <li>Mostrar la respuesta correcta.</li>
        <li>Explicar brevemente por qué.</li>
        <li>Si es un error recurrente, indicarlo.</li>
        <li>Crear posteriormente ejercicios adicionales sobre ese punto.</li>
      </ul>

      <p className="text-sm font-medium text-slate-500">
        No limitarse a decir &ldquo;incorrecto&rdquo;.
      </p>

      {/* Correction card */}
      <CorrectionCard data={DEMO_CORRECTION} />

      {/* Additional exercises */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-blue-500" aria-hidden="true" />
          <h2
            className="text-lg font-semibold text-slate-800"
            style={{ fontFamily: 'Lexend, sans-serif', fontWeight: 600 }}
          >
            Ejercicios adicionales sobre este punto
          </h2>
        </div>

        <div className="grid gap-4">
          {exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index}
              onAnswer={handleAnswer}
              revealed={!!revealedExercises[exercise.id]}
              selectedIndex={selectedAnswers[exercise.id] ?? null}
            />
          ))}
        </div>

        {allRevealed && (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
              Reintentar ejercicios
            </button>
            <button
              type="button"
              onClick={() => setShowProgress((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-blue-200 bg-white px-5 py-3 text-base font-semibold text-blue-600 shadow-md transition-all duration-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              {showProgress ? 'Ocultar progreso' : 'Ver progreso'}
            </button>
          </div>
        )}
      </div>

      {/* Progress panel */}
      {showProgress && (
        <div className="animate-fadeIn">
          <ProgressPanel stats={DEMO_PROGRESS} />
        </div>
      )}

      {/* Footer note */}
      <p className="text-center text-xs text-slate-400">
        Datos de demostración — conecta tu proyecto de Supabase para guardar tu progreso real.
      </p>
    </div>
  );
}