import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  BookOpen,
  CheckCircle,
  XCircle,
  ChevronRight,
  RotateCcw,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  Sparkles,
  GraduationCap,
  FileText,
  Pencil,
  Languages,
  Type,
} from 'lucide-react';

// ─── Helpers ───────────────────────────────────────────────────────────────

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// ─── Types ─────────────────────────────────────────────────────────────────

type QuestionType = 'multiple-choice' | 'written' | 'translation-en-es' | 'translation-es-en' | 'fill-blank';

interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correctAnswer: string;
  hint?: string;
}

interface ExamState {
  currentIndex: number;
  answers: Record<string, string>;
  showResults: boolean;
  started: boolean;
  finished: boolean;
}

// ─── Demo Questions ────────────────────────────────────────────────────────

const DEMO_QUESTIONS: Question[] = [
  {
    id: 'mc-1',
    type: 'multiple-choice',
    prompt: '¿Cuál es la capital de Francia?',
    options: ['Londres', 'París', 'Berlín', 'Madrid'],
    correctAnswer: 'París',
    hint: 'Es conocida como la Ciudad de la Luz.',
  },
  {
    id: 'mc-2',
    type: 'multiple-choice',
    prompt: '¿Qué planeta es conocido como el planeta rojo?',
    options: ['Venus', 'Júpiter', 'Marte', 'Saturno'],
    correctAnswer: 'Marte',
    hint: 'Su nombre viene del dios romano de la guerra.',
  },
  {
    id: 'written-1',
    type: 'written',
    prompt: 'Explica brevemente qué es la fotosíntesis.',
    correctAnswer: 'Proceso por el cual las plantas convierten luz solar en energía química.',
    hint: 'Ocurre en las hojas y requiere clorofila.',
  },
  {
    id: 'trans-en-es-1',
    type: 'translation-en-es',
    prompt: 'Traduce al español: "The quick brown fox jumps over the lazy dog."',
    correctAnswer: 'El rápido zorro marrón salta sobre el perro perezoso.',
    hint: 'Presta atención al orden de los adjetivos.',
  },
  {
    id: 'trans-es-en-1',
    type: 'translation-es-en',
    prompt: 'Traduce al inglés: "Me gusta mucho aprender idiomas nuevos."',
    correctAnswer: 'I really like learning new languages.',
    hint: 'El verbo "gustar" se traduce como "like" en inglés.',
  },
  {
    id: 'fill-1',
    type: 'fill-blank',
    prompt: 'Completa la frase: "El agua ______ a 100 grados Celsius."',
    correctAnswer: 'hierve',
    hint: 'Es un cambio de estado líquido a gaseoso.',
  },
  {
    id: 'mc-3',
    type: 'multiple-choice',
    prompt: '¿Quién escribió "Cien años de soledad"?',
    options: ['Mario Vargas Llosa', 'Gabriel García Márquez', 'Julio Cortázar', 'Pablo Neruda'],
    correctAnswer: 'Gabriel García Márquez',
    hint: 'Es un autor colombiano, premio Nobel de Literatura.',
  },
  {
    id: 'fill-2',
    type: 'fill-blank',
    prompt: 'Completa: "La ______ es la ciencia que estudia los seres vivos."',
    correctAnswer: 'biología',
    hint: 'Viene del griego "bios" (vida) y "logos" (estudio).',
  },
];

// ─── Question Type Icons ───────────────────────────────────────────────────

const TYPE_ICONS: Record<QuestionType, React.ReactNode> = {
  'multiple-choice': <HelpCircle className="w-5 h-5" />,
  written: <Pencil className="w-5 h-5" />,
  'translation-en-es': <Languages className="w-5 h-5" />,
  'translation-es-en': <Languages className="w-5 h-5" />,
  'fill-blank': <Type className="w-5 h-5" />,
};

const TYPE_LABELS: Record<QuestionType, string> = {
  'multiple-choice': 'Opción múltiple',
  written: 'Respuesta escrita',
  'translation-en-es': 'Traducción EN → ES',
  'translation-es-en': 'Traducción ES → EN',
  'fill-blank': 'Completar espacio',
};

// ─── Sub-components ────────────────────────────────────────────────────────

function QuestionTypeBadge({ type }: { type: QuestionType }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
      {TYPE_ICONS[type]}
      {TYPE_LABELS[type]}
    </span>
  );
}

function MultipleChoiceQuestion({
  question,
  selected,
  onSelect,
  showResult,
}: {
  question: Question;
  selected: string;
  onSelect: (value: string) => void;
  showResult: boolean;
}) {
  const isCorrect = selected === question.correctAnswer;

  return (
    <div className="space-y-3">
      {question.options?.map((option) => {
        const isSelected = selected === option;
        const isOptionCorrect = option === question.correctAnswer;

        let optionClasses =
          'w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-3';

        if (showResult) {
          if (isOptionCorrect) {
            optionClasses += ' border-green-500 bg-green-50 text-green-800';
          } else if (isSelected && !isOptionCorrect) {
            optionClasses += ' border-red-500 bg-red-50 text-red-800';
          } else {
            optionClasses += ' border-slate-200 bg-white text-slate-500';
          }
        } else if (isSelected) {
          optionClasses += ' border-blue-500 bg-blue-50 text-blue-800';
        } else {
          optionClasses +=
            ' border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 text-slate-700';
        }

        return (
          <button
            key={option}
            type="button"
            onClick={() => !showResult && onSelect(option)}
            disabled={showResult}
            className={optionClasses}
          >
            <span
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                showResult && isOptionCorrect
                  ? 'border-green-500 bg-green-500 text-white'
                  : showResult && isSelected && !isOptionCorrect
                  ? 'border-red-500 bg-red-500 text-white'
                  : isSelected
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-slate-300'
              )}
            >
              {showResult && isOptionCorrect && (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
              {showResult && isSelected && !isOptionCorrect && (
                <XCircle className="w-3.5 h-3.5" />
              )}
              {!showResult && isSelected && (
                <span className="w-2 h-2 rounded-full bg-white" />
              )}
            </span>
            <span className="font-medium">{option}</span>
          </button>
        );
      })}
    </div>
  );
}

function WrittenQuestion({
  question,
  value,
  onChange,
  showResult,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  showResult: boolean;
}) {
  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={showResult}
        placeholder="Escribe tu respuesta aquí..."
        rows={4}
        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-y disabled:bg-slate-50 disabled:text-slate-500"
      />
      {showResult && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200">
          <p className="text-sm font-medium text-green-800 mb-1">
            Respuesta de referencia:
          </p>
          <p className="text-sm text-green-700">{question.correctAnswer}</p>
        </div>
      )}
    </div>
  );
}

function TranslationQuestion({
  question,
  value,
  onChange,
  showResult,
  direction,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  showResult: boolean;
  direction: 'en-es' | 'es-en';
}) {
  const fromLabel = direction === 'en-es' ? 'Inglés' : 'Español';
  const toLabel = direction === 'en-es' ? 'Español' : 'Inglés';

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600">
        <span className="font-semibold text-slate-700">{fromLabel}:</span>{' '}
        {question.prompt.replace(/^Traduce al (español|inglés):\s*/i, '')}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={showResult}
        placeholder={`Escribe la traducción al ${toLabel}...`}
        rows={3}
        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-y disabled:bg-slate-50 disabled:text-slate-500"
      />
      {showResult && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200">
          <p className="text-sm font-medium text-green-800 mb-1">
            Traducción de referencia:
          </p>
          <p className="text-sm text-green-700">{question.correctAnswer}</p>
        </div>
      )}
    </div>
  );
}

function FillBlankQuestion({
  question,
  value,
  onChange,
  showResult,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  showResult: boolean;
}) {
  const parts = question.prompt.split(/_{3,}|\[\s*\]|\(\s*\)|__+|\?\?/);
  const blankIndex = question.prompt.search(/_{3,}|\[\s*\]|\(\s*\)|__+|\?\?/);

  const before = blankIndex >= 0 ? question.prompt.slice(0, blankIndex) : question.prompt;
  const after =
    blankIndex >= 0
      ? question.prompt.slice(
          blankIndex +
            (question.prompt.slice(blankIndex).match(/_{3,}|\[\s*\]|\(\s*\)|__+|\?\?/)?.[0]
              ?.length || 3)
        )
      : '';

  return (
    <div className="space-y-3">
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
        {before}
        <span className="inline-block mx-1">
          {showResult ? (
            <span
              className={cn(
                'px-2 py-0.5 rounded font-semibold',
                value.trim().toLowerCase() === question.correctAnswer.toLowerCase()
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              )}
            >
              {value || '______'}
            </span>
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="______"
              className="inline-block w-32 px-2 py-0.5 border-b-2 border-blue-400 bg-transparent text-blue-700 font-semibold outline-none focus:border-blue-600 placeholder:text-slate-400"
              autoComplete="off"
            />
          )}
        </span>
        {after}
      </div>
      {showResult && value.trim().toLowerCase() !== question.correctAnswer.toLowerCase() && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200">
          <p className="text-sm font-medium text-green-800 mb-1">
            Respuesta correcta:
          </p>
          <p className="text-sm text-green-700 font-semibold">
            {question.correctAnswer}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Exam Component ───────────────────────────────────────────────────

function Exam() {
  const [state, setState] = useState<ExamState>({
    currentIndex: 0,
    answers: {},
    showResults: false,
    started: false,
    finished: false,
  });

  const [showHint, setShowHint] = useState<string | null>(null);

  const questions = DEMO_QUESTIONS;
  const currentQuestion = questions[state.currentIndex];
  const totalQuestions = questions.length;
  const progress = ((state.currentIndex + 1) / totalQuestions) * 100;

  const handleStart = useCallback(() => {
    setState((prev) => ({ ...prev, started: true, currentIndex: 0, answers: {}, showResults: false, finished: false }));
    setShowHint(null);
  }, []);

  // We need currentQuestion id inside handleAnswer, so we use a different approach
  const handleSelectAnswer = useCallback((questionId: string, value: string) => {
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: value },
    }));
  }, []);

  const handleNext = useCallback(() => {
    if (state.currentIndex < totalQuestions - 1) {
      setState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        showResults: false,
      }));
      setShowHint(null);
    }
  }, [state.currentIndex, totalQuestions]);

  const handlePrevious = useCallback(() => {
    if (state.currentIndex > 0) {
      setState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex - 1,
        showResults: false,
      }));
      setShowHint(null);
    }
  }, [state.currentIndex]);

  const handleCheckAnswer = useCallback(() => {
    setState((prev) => ({ ...prev, showResults: true }));
  }, []);

  const handleFinish = useCallback(() => {
    setState((prev) => ({ ...prev, finished: true, showResults: true }));
  }, []);

  const handleRestart = useCallback(() => {
    setState({
      currentIndex: 0,
      answers: {},
      showResults: false,
      started: false,
      finished: false,
    });
    setShowHint(null);
  }, []);

  const toggleHint = useCallback((questionId: string) => {
    setShowHint((prev) => (prev === questionId ? null : questionId));
  }, []);

  // Calculate score
  const calculateScore = useCallback(() => {
    let correct = 0;
    questions.forEach((q) => {
      const userAnswer = state.answers[q.id];
      if (userAnswer && q.type === 'multiple-choice') {
        if (userAnswer === q.correctAnswer) correct++;
      } else if (userAnswer && q.type === 'fill-blank') {
        if (userAnswer.trim().toLowerCase() === q.correctAnswer.toLowerCase()) correct++;
      } else if (userAnswer && (q.type === 'written' || q.type === 'translation-en-es' || q.type === 'translation-es-en')) {
        // For written/translation, we consider it correct if the user wrote something
        // In a real app this would use AI or teacher review
        if (userAnswer.trim().length > 0) correct++;
      }
    });
    return correct;
  }, [questions, state.answers]);

  const score = calculateScore();
  const percentage = Math.round((score / totalQuestions) * 100);

  // ─── Render Question ───────────────────────────────────────────────────

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const currentAnswer = state.answers[currentQuestion.id] || '';

    return (
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        {/* Question header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <QuestionTypeBadge type={currentQuestion.type} />
            <h3 className="text-lg font-semibold text-slate-800 leading-relaxed">
              {currentQuestion.prompt}
            </h3>
          </div>
          {currentQuestion.hint && (
            <button
              type="button"
              onClick={() => toggleHint(currentQuestion.id)}
              className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
              title="Mostrar pista"
              aria-label="Mostrar pista"
            >
              <Lightbulb className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Hint */}
        <AnimatePresence>
          {showHint === currentQuestion.id && currentQuestion.hint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">{currentQuestion.hint}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question body */}
        {currentQuestion.type === 'multiple-choice' && (
          <MultipleChoiceQuestion
            question={currentQuestion}
            selected={currentAnswer}
            onSelect={(value) => handleSelectAnswer(currentQuestion.id, value)}
            showResult={state.showResults}
          />
        )}

        {currentQuestion.type === 'written' && (
          <WrittenQuestion
            question={currentQuestion}
            value={currentAnswer}
            onChange={(value) => handleSelectAnswer(currentQuestion.id, value)}
            showResult={state.showResults}
          />
        )}

        {currentQuestion.type === 'translation-en-es' && (
          <TranslationQuestion
            question={currentQuestion}
            value={currentAnswer}
            onChange={(value) => handleSelectAnswer(currentQuestion.id, value)}
            showResult={state.showResults}
            direction="en-es"
          />
        )}

        {currentQuestion.type === 'translation-es-en' && (
          <TranslationQuestion
            question={currentQuestion}
            value={currentAnswer}
            onChange={(value) => handleSelectAnswer(currentQuestion.id, value)}
            showResult={state.showResults}
            direction="es-en"
          />
        )}

        {currentQuestion.type === 'fill-blank' && (
          <FillBlankQuestion
            question={currentQuestion}
            value={currentAnswer}
            onChange={(value) => handleSelectAnswer(currentQuestion.id, value)}
            showResult={state.showResults}
          />
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={state.currentIndex === 0}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              state.currentIndex === 0
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </button>

          <div className="flex items-center gap-3">
            {!state.showResults && (
              <button
                type="button"
                onClick={handleCheckAnswer}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-blue-600 hover:bg-blue-50 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                Verificar
              </button>
            )}

            {state.currentIndex < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-all shadow-sm"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              !state.finished && (
                <button
                  type="button"
                  onClick={handleFinish}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-500 hover:bg-green-600 transition-all shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Finalizar examen
                </button>
              )
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // ─── Results Screen ─────────────────────────────────────────────────────

  const renderResults = () => {
    const gradeColor =
      percentage >= 80
        ? 'text-green-600'
        : percentage >= 50
        ? 'text-amber-600'
        : 'text-red-600';

    const gradeMessage =
      percentage >= 80
        ? '¡Excelente trabajo!'
        : percentage >= 50
        ? 'Buen esfuerzo, sigue practicando.'
        : 'Revisa el material y vuelve a intentarlo.';

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        {/* Score card */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-2">
            <GraduationCap className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            ¡Examen completado!
          </h2>
          <div className="space-y-1">
            <p className={cn('text-5xl font-bold', gradeColor)}>
              {percentage}%
            </p>
            <p className="text-lg text-slate-600">
              {score} de {totalQuestions} respuestas correctas
            </p>
          </div>
          <p className="text-slate-500">{gradeMessage}</p>
        </div>

        {/* Question review */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Revisión de preguntas
          </h3>
          {questions.map((q, idx) => {
            const userAnswer = state.answers[q.id] || '';
            let isCorrect = false;

            if (q.type === 'multiple-choice') {
              isCorrect = userAnswer === q.correctAnswer;
            } else if (q.type === 'fill-blank') {
              isCorrect =
                userAnswer.trim().toLowerCase() === q.correctAnswer.toLowerCase();
            } else {
              isCorrect = userAnswer.trim().length > 0;
            }

            return (
              <div
                key={q.id}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all',
                  isCorrect
                    ? 'border-green-200 bg-green-50/50'
                    : 'border-red-200 bg-red-50/50'
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 mt-0.5">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-slate-400">
                        {idx + 1}.
                      </span>
                      <QuestionTypeBadge type={q.type} />
                    </div>
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      {q.prompt}
                    </p>
                    <div className="text-xs space-y-1">
                      <p>
                        <span className="font-medium text-slate-500">
                          Tu respuesta:
                        </span>{' '}
                        <span
                          className={cn(
                            isCorrect ? 'text-green-700' : 'text-red-700'
                          )}
                        >
                          {userAnswer || '(sin respuesta)'}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p>
                          <span className="font-medium text-slate-500">
                            Respuesta correcta:
                          </span>{' '}
                          <span className="text-green-700">
                            {q.correctAnswer}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Restart */}
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-all shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            Intentar de nuevo
          </button>
        </div>
      </motion.div>
    );
  };

  // ─── Welcome Screen ─────────────────────────────────────────────────────

  const renderWelcome = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-6 py-8"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50">
          <BookOpen className="w-10 h-10 text-blue-500" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">
            Examen
          </h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Pon a prueba tus conocimientos con este examen automático.
            Incluye preguntas de opción múltiple, respuesta escrita,
            traducción y completar espacios.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
          {[
            { icon: <HelpCircle className="w-5 h-5" />, label: 'Opción múltiple' },
            { icon: <Pencil className="w-5 h-5" />, label: 'Respuesta escrita' },
            { icon: <Languages className="w-5 h-5" />, label: 'Traducción' },
            { icon: <Type className="w-5 h-5" />, label: 'Completar espacios' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 border border-slate-100"
            >
              <span className="text-blue-500">{item.icon}</span>
              <span className="text-xs font-medium text-slate-600 text-center">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <button
            type="button"
            onClick={handleStart}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-base font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-all shadow-md"
          >
            <Sparkles className="w-5 h-5" />
            Comenzar examen
          </button>
          <p className="text-xs text-slate-400 mt-3">
            {totalQuestions} preguntas · Sin límite de tiempo
          </p>
        </div>
      </motion.div>
    );
  };

  // ─── Main Render ─────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
          className="flex-shrink-0"
        >
          <BookOpen className="w-6 h-6 text-blue-500" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-slate-800 truncate">
            Examen
          </h1>
          {state.started && !state.finished && (
            <p className="text-xs text-slate-400">
              Pregunta {state.currentIndex + 1} de {totalQuestions}
            </p>
          )}
        </div>
        {state.started && !state.finished && (
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            {Math.round(progress)}%
          </span>
        )}
      </div>

      {/* Progress bar */}
      {state.started && !state.finished && (
        <div className="h-1 bg-slate-100">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Content */}
      <div className="px-6 py-6">
        {!state.started && !state.finished && renderWelcome()}
        {state.started && !state.finished && renderQuestion()}
        {state.finished && renderResults()}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <FileText className="w-3.5 h-3.5" />
          <span>Examen automático</span>
        </div>
        {state.started && !state.finished && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            {Object.keys(state.answers).length} respondidas
          </div>
        )}
      </div>
    </div>
  );
}

export default Exam;
