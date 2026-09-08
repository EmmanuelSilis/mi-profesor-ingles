import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Volume2, Check, X, ArrowRight, RefreshCw, Headphones, BookOpen, Pencil, List } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type ExerciseType = 'meaning' | 'translation' | 'identification';

interface Exercise {
  id: string;
  type: ExerciseType;
  text: string;
  options?: string[];
  correctAnswer: string;
  translationHint?: string;
}

// ─── Demo data ───────────────────────────────────────────────────────────────

const DEMO_EXERCISES: Exercise[] = [
  {
    id: '1',
    type: 'meaning',
    text: 'The weather is beautiful today.',
    options: [
      'El clima está hermoso hoy.',
      'La comida es deliciosa.',
      'El libro es interesante.',
      'La casa es grande.',
    ],
    correctAnswer: 'El clima está hermoso hoy.',
  },
  {
    id: '2',
    type: 'translation',
    text: 'I would like to order a coffee, please.',
    correctAnswer: 'Me gustaría pedir un café, por favor.',
    translationHint: 'pedir un café',
  },
  {
    id: '3',
    type: 'identification',
    text: 'adventure',
    options: ['aventura', 'ventaja', 'advertencia', 'avenida'],
    correctAnswer: 'aventura',
  },
  {
    id: '4',
    type: 'meaning',
    text: 'Could you help me find the nearest hospital?',
    options: [
      '¿Podrías ayudarme a encontrar el hospital más cercano?',
      '¿Puedes decirme la hora?',
      '¿Dónde está la estación de tren?',
      'Necesito un médico urgente.',
    ],
    correctAnswer: '¿Podrías ayudarme a encontrar el hospital más cercano?',
  },
  {
    id: '5',
    type: 'translation',
    text: 'She has been studying English for three years.',
    correctAnswer: 'Ella ha estado estudiando inglés durante tres años.',
    translationHint: 'ha estado estudiando',
  },
  {
    id: '6',
    type: 'identification',
    text: 'knowledge',
    options: ['conocimiento', 'novedad', 'knockout', 'nudo'],
    correctAnswer: 'conocimiento',
  },
];

// ─── TTS Hook ────────────────────────────────────────────────────────────────

function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      console.warn('SpeechSynthesis no está disponible en este navegador.');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return { speak, stop, speaking };
}

// ─── Exercise Type Icon ──────────────────────────────────────────────────────

const exerciseTypeMeta: Record<ExerciseType, { icon: React.ReactNode; label: string }> = {
  meaning: { icon: <BookOpen size={18} />, label: 'Elegir significado' },
  translation: { icon: <Pencil size={18} />, label: 'Escribir traducción' },
  identification: { icon: <List size={18} />, label: 'Identificar palabra' },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function MeaningExercise({
  exercise,
  onAnswer,
  disabled,
}: {
  exercise: Exercise;
  onAnswer: (answer: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-500">¿Cuál es el significado de lo que escuchaste?</p>
      <div className="grid gap-2">
        {exercise.options?.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onAnswer(option)}
            disabled={disabled}
            className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function TranslationExercise({
  exercise,
  onAnswer,
  disabled,
}: {
  exercise: Exercise;
  onAnswer: (answer: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onAnswer(value.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm font-medium text-slate-500">Escribe la traducción al español de lo que escuchaste:</p>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        placeholder="Escribe tu traducción aquí..."
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="w-full px-4 py-3 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        Comprobar traducción
      </button>
    </form>
  );
}

function IdentificationExercise({
  exercise,
  onAnswer,
  disabled,
}: {
  exercise: Exercise;
  onAnswer: (answer: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-500">¿Qué palabra escuchaste?</p>
      <div className="grid gap-2">
        {exercise.options?.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onAnswer(option)}
            disabled={disabled}
            className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Feedback Display ────────────────────────────────────────────────────────

function Feedback({
  isCorrect,
  correctAnswer,
  userAnswer,
  onNext,
  isLast,
}: {
  isCorrect: boolean;
  correctAnswer: string;
  userAnswer: string;
  onNext: () => void;
  isLast: boolean;
}) {
  return (
    <div className="space-y-4">
      <div
        className={`flex items-center gap-3 p-4 rounded-xl ${
          isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}
      >
        {isCorrect ? (
          <Check size={24} className="shrink-0" />
        ) : (
          <X size={24} className="shrink-0" />
        )}
        <div>
          <p className="font-semibold text-base">
            {isCorrect ? '¡Correcto!' : 'Incorrecto'}
          </p>
          {!isCorrect && (
            <p className="text-sm mt-1">
              Respuesta correcta: <span className="font-medium">{correctAnswer}</span>
            </p>
          )}
          {isCorrect && userAnswer && (
            <p className="text-sm mt-1 text-green-600">
              Tu respuesta: {userAnswer}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {isLast ? 'Ver resultados' : 'Siguiente ejercicio'}
        <ArrowRight size={18} />
      </button>
    </div>
  );
}

// ─── Results Screen ──────────────────────────────────────────────────────────

function ResultsScreen({
  results,
  onRestart,
}: {
  results: { exercise: Exercise; correct: boolean; userAnswer: string }[];
  onRestart: () => void;
}) {
  const correctCount = results.filter((r) => r.correct).length;
  const total = results.length;
  const percentage = Math.round((correctCount / total) * 100);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-4">
          <Headphones size={36} className="text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 font-['Lexend']">¡Ejercicio completado!</h2>
        <p className="text-slate-500 mt-2 text-base">
          Has completado los {total} ejercicios de escucha.
        </p>
      </div>

      <div className="bg-slate-50 rounded-xl p-6 text-center">
        <p className="text-4xl font-bold text-blue-500 font-['Lexend']">{percentage}%</p>
        <p className="text-sm text-slate-500 mt-1">
          {correctCount} de {total} respuestas correctas
        </p>
      </div>

      <div className="space-y-2">
        {results.map((result, idx) => (
          <div
            key={result.exercise.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-100"
          >
            {result.correct ? (
              <Check size={18} className="text-green-500 shrink-0 mt-0.5" />
            ) : (
              <X size={18} className="text-red-500 shrink-0 mt-0.5" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800 truncate" title={result.exercise.text}>
                {idx + 1}. {result.exercise.text}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {result.correct
                  ? 'Respuesta correcta'
                  : `Tu respuesta: ${result.userAnswer} — Correcta: ${result.exercise.correctAnswer}`}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onRestart}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <RefreshCw size={18} />
        Volver a empezar
      </button>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Headphones size={32} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 font-['Lexend']">No hay ejercicios disponibles</h3>
      <p className="text-sm text-slate-500 mt-2 max-w-xs">
        Parece que no hay ejercicios de escucha configurados. Vuelve a intentarlo o contacta al administrador.
      </p>
      <button
        onClick={onRestart}
        className="mt-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <RefreshCw size={18} />
        Reintentar
      </button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Listening() {
  const [exercises] = useState<Exercise[]>(DEMO_EXERCISES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'listening' | 'answering' | 'feedback' | 'results'>('listening');
  const [results, setResults] = useState<{ exercise: Exercise; correct: boolean; userAnswer: string }[]>([]);
  const [lastAnswer, setLastAnswer] = useState('');
  const [lastCorrect, setLastCorrect] = useState(false);

  const { speak, stop, speaking } = useSpeechSynthesis();

  const currentExercise = exercises[currentIndex];
  const isLast = currentIndex === exercises.length - 1;

  // Play the audio when entering listening phase
  useEffect(() => {
    if (phase === 'listening' && currentExercise) {
      speak(currentExercise.text);
    }
  }, [phase, currentExercise, speak]);

  const handlePlayAgain = () => {
    if (currentExercise) {
      speak(currentExercise.text);
    }
  };

  const handleStartAnswering = () => {
    stop();
    setPhase('answering');
  };

  const handleAnswer = (answer: string) => {
    if (!currentExercise) return;

    const isCorrect =
      answer.toLowerCase().trim() === currentExercise.correctAnswer.toLowerCase().trim();

    setLastAnswer(answer);
    setLastCorrect(isCorrect);
    setPhase('feedback');
  };

  const handleNext = () => {
    if (!currentExercise) return;

    setResults((prev) => [
      ...prev,
      { exercise: currentExercise, correct: lastCorrect, userAnswer: lastAnswer },
    ]);

    if (isLast) {
      setPhase('results');
    } else {
      setCurrentIndex((prev) => prev + 1);
      setPhase('listening');
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setPhase('listening');
    setResults([]);
    setLastAnswer('');
    setLastCorrect(false);
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  if (!exercises.length) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 sm:p-8">
        <EmptyState onRestart={handleRestart} />
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 sm:p-8">
        <ResultsScreen results={results} onRestart={handleRestart} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
          <Headphones size={20} className="text-blue-500" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-slate-800 font-['Lexend'] truncate">
            Escuchar inglés
          </h2>
          <p className="text-xs text-slate-500">
            Ejercicio {currentIndex + 1} de {exercises.length}
          </p>
        </div>
        {currentExercise && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full">
            {exerciseTypeMeta[currentExercise.type].icon}
            {exerciseTypeMeta[currentExercise.type].label}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full mb-6">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + (phase === 'feedback' ? 1 : 0)) / exercises.length) * 100}%` }}
        />
      </div>

      {/* Exercise content */}
      {currentExercise && (
        <div className="space-y-6">
          {/* Audio player area */}
          <div className="bg-slate-50 rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-4">
              <Volume2 size={28} className="text-blue-500" />
            </div>
            <p className="text-sm text-slate-500 mb-4">
              {phase === 'listening'
                ? 'Escucha atentamente el audio...'
                : 'Vuelve a escuchar si lo necesitas'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handlePlayAgain}
                disabled={speaking}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Volume2 size={18} />
                {speaking ? 'Reproduciendo...' : 'Reproducir audio'}
              </button>
              {phase === 'listening' && (
                <button
                  onClick={handleStartAnswering}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Ya escuché
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Answer area */}
          {phase === 'answering' && (
            <>
              {currentExercise.type === 'meaning' && (
                <MeaningExercise
                  exercise={currentExercise}
                  onAnswer={handleAnswer}
                  disabled={false}
                />
              )}
              {currentExercise.type === 'translation' && (
                <TranslationExercise
                  exercise={currentExercise}
                  onAnswer={handleAnswer}
                  disabled={false}
                />
              )}
              {currentExercise.type === 'identification' && (
                <IdentificationExercise
                  exercise={currentExercise}
                  onAnswer={handleAnswer}
                  disabled={false}
                />
              )}
            </>
          )}

          {/* Feedback area */}
          {phase === 'feedback' && (
            <Feedback
              isCorrect={lastCorrect}
              correctAnswer={currentExercise.correctAnswer}
              userAnswer={lastAnswer}
              onNext={handleNext}
              isLast={isLast}
            />
          )}
        </div>
      )}
    </div>
  );
}