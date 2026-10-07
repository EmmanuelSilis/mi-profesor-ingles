import React, { useState, useCallback, useEffect } from 'react';
import { Check, X, ArrowRight, RotateCcw, Star, HelpCircle } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Tipos                                                              */
/* ------------------------------------------------------------------ */

interface Option {
  id: string;
  text: string;
  correct: boolean;
}

interface Question {
  id: string;
  prompt: string;
  options: Option[];
}

type QuizState = 'idle' | 'playing' | 'finished';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function speak(text: string): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.85;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/* ------------------------------------------------------------------ */
/*  Banco de preguntas — SOLO opción múltiple                         */
/*  Todas tipo "What do you do with…?" / "Do you…?"                   */
/* ------------------------------------------------------------------ */

const QUESTIONS: Question[] = [
  {
    id: 'q01',
    prompt: 'What do you do with your ears?',
    options: [
      { id: 'a', text: 'I hear music with my ears.', correct: true },
      { id: 'b', text: 'I smell flowers with my ears.', correct: false },
      { id: 'c', text: 'I see colors with my ears.', correct: false },
      { id: 'd', text: 'I eat food with my ears.', correct: false },
    ],
  },
  {
    id: 'q02',
    prompt: 'What do you do with your nose?',
    options: [
      { id: 'a', text: 'I smell with my nose.', correct: true },
      { id: 'b', text: 'I hear with my nose.', correct: false },
      { id: 'c', text: 'I walk with my nose.', correct: false },
      { id: 'd', text: 'I clap with my nose.', correct: false },
    ],
  },
  {
    id: 'q03',
    prompt: 'Do you see with your eyes?',
    options: [
      { id: 'a', text: 'Yes, I do. I see with my eyes.', correct: true },
      { id: 'b', text: "No, I don't. I see with my mouth.", correct: false },
      { id: 'c', text: 'Yes, I do. I see with my hands.', correct: false },
      { id: 'd', text: "No, I don't. I see with my ears.", correct: false },
    ],
  },
  {
    id: 'q04',
    prompt: 'Do you smell with your ears?',
    options: [
      { id: 'a', text: "No, I don't. I smell with my nose.", correct: true },
      { id: 'b', text: 'Yes, I do. I smell with my ears.', correct: false },
      { id: 'c', text: "No, I don't. I smell with my eyes.", correct: false },
      { id: 'd', text: 'Yes, I do. I smell with my mouth.', correct: false },
    ],
  },
  {
    id: 'q05',
    prompt: 'What do you do with your mouth?',
    options: [
      { id: 'a', text: 'I eat and speak with my mouth.', correct: true },
      { id: 'b', text: 'I walk and run with my mouth.', correct: false },
      { id: 'c', text: 'I hear music with my mouth.', correct: false },
      { id: 'd', text: 'I clap my hands with my mouth.', correct: false },
    ],
  },
  {
    id: 'q06',
    prompt: 'What do you do with your hands?',
    options: [
      { id: 'a', text: 'I clap and hold things with my hands.', correct: true },
      { id: 'b', text: 'I see colors with my hands.', correct: false },
      { id: 'c', text: 'I smell flowers with my hands.', correct: false },
      { id: 'd', text: 'I hear music with my hands.', correct: false },
    ],
  },
  {
    id: 'q07',
    prompt: 'Do you walk with your hands?',
    options: [
      { id: 'a', text: "No, I don't. I walk with my legs and feet.", correct: true },
      { id: 'b', text: 'Yes, I do. I walk with my hands.', correct: false },
      { id: 'c', text: "No, I don't. I walk with my ears.", correct: false },
      { id: 'd', text: 'Yes, I do. I walk with my nose.', correct: false },
    ],
  },
  {
    id: 'q08',
    prompt: 'Do you hear with your ears?',
    options: [
      { id: 'a', text: 'Yes, I do. I hear with my ears.', correct: true },
      { id: 'b', text: "No, I don't. I hear with my nose.", correct: false },
      { id: 'c', text: 'Yes, I do. I hear with my eyes.', correct: false },
      { id: 'd', text: "No, I don't. I hear with my mouth.", correct: false },
    ],
  },
  {
    id: 'q09',
    prompt: 'What do you do with your legs?',
    options: [
      { id: 'a', text: 'I walk and run with my legs.', correct: true },
      { id: 'b', text: 'I clap my hands with my legs.', correct: false },
      { id: 'c', text: 'I see colors with my legs.', correct: false },
      { id: 'd', text: 'I smell flowers with my legs.', correct: false },
    ],
  },
  {
    id: 'q10',
    prompt: 'Do you eat with your eyes?',
    options: [
      { id: 'a', text: "No, I don't. I eat with my mouth.", correct: true },
      { id: 'b', text: 'Yes, I do. I eat with my eyes.', correct: false },
      { id: 'c', text: "No, I don't. I eat with my ears.", correct: false },
      { id: 'd', text: 'Yes, I do. I eat with my nose.', correct: false },
    ],
  },
  {
    id: 'q11',
    prompt: 'What do you do with your arms?',
    options: [
      { id: 'a', text: 'I hug and carry things with my arms.', correct: true },
      { id: 'b', text: 'I kick a ball with my arms.', correct: false },
      { id: 'c', text: 'I smell flowers with my arms.', correct: false },
      { id: 'd', text: 'I see colors with my arms.', correct: false },
    ],
  },
  {
    id: 'q12',
    prompt: 'Do you clap with your feet?',
    options: [
      { id: 'a', text: "No, I don't. I clap with my hands.", correct: true },
      { id: 'b', text: 'Yes, I do. I clap with my feet.', correct: false },
      { id: 'c', text: "No, I don't. I clap with my ears.", correct: false },
      { id: 'd', text: 'Yes, I do. I clap with my nose.', correct: false },
    ],
  },
  {
    id: 'q13',
    prompt: 'What do you do with your fingers?',
    options: [
      { id: 'a', text: 'I write and point with my fingers.', correct: true },
      { id: 'b', text: 'I walk and run with my fingers.', correct: false },
      { id: 'c', text: 'I smell flowers with my fingers.', correct: false },
      { id: 'd', text: 'I hear music with my fingers.', correct: false },
    ],
  },
  {
    id: 'q14',
    prompt: 'Do you kick with your hands?',
    options: [
      { id: 'a', text: "No, I don't. I kick with my feet.", correct: true },
      { id: 'b', text: 'Yes, I do. I kick with my hands.', correct: false },
      { id: 'c', text: "No, I don't. I kick with my nose.", correct: false },
      { id: 'd', text: 'Yes, I do. I kick with my ears.', correct: false },
    ],
  },
  {
    id: 'q15',
    prompt: 'What do you do with your teeth?',
    options: [
      { id: 'a', text: 'I chew food with my teeth.', correct: true },
      { id: 'b', text: 'I see colors with my teeth.', correct: false },
      { id: 'c', text: 'I smell flowers with my teeth.', correct: false },
      { id: 'd', text: 'I clap my hands with my teeth.', correct: false },
    ],
  },
  {
    id: 'q16',
    prompt: 'Do you nod with your hands?',
    options: [
      { id: 'a', text: "No, I don't. I nod with my head.", correct: true },
      { id: 'b', text: 'Yes, I do. I nod with my hands.', correct: false },
      { id: 'c', text: "No, I don't. I nod with my feet.", correct: false },
      { id: 'd', text: 'Yes, I do. I nod with my ears.', correct: false },
    ],
  },
  {
    id: 'q17',
    prompt: 'What do you do with your shoulders?',
    options: [
      { id: 'a', text: 'I shrug with my shoulders.', correct: true },
      { id: 'b', text: 'I taste food with my shoulders.', correct: false },
      { id: 'c', text: 'I hear music with my shoulders.', correct: false },
      { id: 'd', text: 'I see colors with my shoulders.', correct: false },
    ],
  },
  {
    id: 'q18',
    prompt: 'Do you blink with your mouth?',
    options: [
      { id: 'a', text: "No, I don't. I blink with my eyes.", correct: true },
      { id: 'b', text: 'Yes, I do. I blink with my mouth.', correct: false },
      { id: 'c', text: "No, I don't. I blink with my ears.", correct: false },
      { id: 'd', text: 'Yes, I do. I blink with my nose.', correct: false },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Componente principal: Quiz                                         */
/* ------------------------------------------------------------------ */

export default function Quiz() {
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [questions, setQuestions] = useState<Question[]>(() =>
    shuffleArray(QUESTIONS),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<boolean | null>(null);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  /* Reiniciar estado interno al cambiar de pregunta */
  useEffect(() => {
    setSelectedOption(null);
    setAnswered(false);
    setCorrectAnswer(null);
  }, [currentIndex]);

  const handleStart = useCallback(() => {
    setQuestions(shuffleArray(QUESTIONS));
    setCurrentIndex(0);
    setScore(0);
    setQuizState('playing');
  }, []);

  const handleOptionClick = useCallback(
    (optionId: string, correct: boolean, englishText: string) => {
      if (answered) return;
      setSelectedOption(optionId);
      setAnswered(true);
      setCorrectAnswer(correct);
      if (correct) {
        setScore((prev) => prev + 1);
      }
      /* Reproduce la respuesta correcta en inglés al hacer clic */
      speak(currentQuestion.options.find(option => option.correct)?.text || englishText);
    },
    [answered, currentQuestion],
  );

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      setQuizState('finished');
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [isLastQuestion]);

  const handleRestart = useCallback(() => {
    setQuizState('idle');
    setQuestions(shuffleArray(QUESTIONS));
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setAnswered(false);
    setCorrectAnswer(null);
  }, []);

  /* ---------- Pantalla de inicio ---------- */
  if (quizState === 'idle') {
    return (
      <div
        className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-2xl bg-[#F5F7FA] p-8 text-center font-['Inter',sans-serif] shadow-sm"
        style={{ borderRadius: 16 }}
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#339900]/10">
          <HelpCircle className="h-10 w-10 text-[#339900]" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-[#1A1A2E]">
          Examen: ¿Qué haces con tu cuerpo?
        </h2>
        <p className="mb-6 max-w-sm text-base text-[#4B5563]">
          Practica preguntas y respuestas en inglés sobre las partes del cuerpo.
          Todas las preguntas son de opción múltiple. ¡Selecciona la respuesta
          correcta!
        </p>
        <ul className="mb-6 space-y-2 text-left text-sm text-[#6B7280]">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[#339900]" />
            {totalQuestions} preguntas
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[#339900]" />
            Opción múltiple — solo haz clic
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[#339900]" />
            Audio automático de la respuesta correcta en inglés
          </li>
        </ul>
        <button
          onClick={handleStart}
          className="flex items-center gap-2 rounded-xl bg-[#339900] px-8 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-[#2B7A00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#339900] focus-visible:ring-offset-2 active:scale-[0.97]"
          style={{ borderRadius: 16 }}
        >
          <Star className="h-5 w-5" />
          Comenzar examen
        </button>
      </div>
    );
  }

  /* ---------- Pantalla de resultados ---------- */
  if (quizState === 'finished') {
    const percentage = Math.round((score / totalQuestions) * 100);
    const emoji = percentage >= 80 ? '🎉' : percentage >= 50 ? '👍' : '💪';

    return (
      <div
        className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-2xl bg-[#F5F7FA] p-8 text-center font-['Inter',sans-serif] shadow-sm"
        style={{ borderRadius: 16 }}
      >
        <div className="mb-4 text-5xl">{emoji}</div>
        <h2 className="mb-2 text-2xl font-bold text-[#1A1A2E]">
          ¡Examen completado!
        </h2>
        <p className="mb-2 text-base text-[#4B5563]">
          Obtuviste{' '}
          <span className="font-bold text-[#339900]">
            {score}/{totalQuestions}
          </span>{' '}
          respuestas correctas.
        </p>
        <div className="mb-6 h-3 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
          <div
            className="h-full rounded-full bg-[#339900] transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="mb-6 text-sm text-[#6B7280]">
          {percentage >= 80
            ? '¡Excelente! Sabes bien qué hace cada parte del cuerpo en inglés.'
            : percentage >= 50
              ? 'Buen trabajo, sigue practicando las preguntas y respuestas.'
              : 'Sigue practicando, ¡la práctica hace al maestro!'}
        </p>
        <button
          onClick={handleRestart}
          className="flex items-center gap-2 rounded-xl bg-[#339900] px-8 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-[#2B7A00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#339900] focus-visible:ring-offset-2 active:scale-[0.97]"
          style={{ borderRadius: 16 }}
        >
          <RotateCcw className="h-5 w-5" />
          Volver a intentar
        </button>
      </div>
    );
  }

  /* ---------- Pantalla de juego ---------- */
  if (!currentQuestion) return null;

  return (
    <div
      className="mx-auto max-w-2xl font-['Inter',sans-serif]"
      style={{ borderRadius: 16 }}
    >
      {/* Barra de progreso */}
      <div className="mb-4 flex items-center justify-between text-sm text-[#6B7280]">
        <span>
          Pregunta {currentIndex + 1} de {totalQuestions}
        </span>
        <span className="flex items-center gap-1 font-medium text-[#339900]">
          <Star className="h-4 w-4" />
          {score}
        </span>
      </div>
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
        <div
          className="h-full rounded-full bg-[#339900] transition-all duration-500"
          style={{
            width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
          }}
        />
      </div>

      {/* Tarjeta de pregunta */}
      <div
        className="rounded-2xl bg-white p-6 shadow-sm"
        style={{ borderRadius: 16 }}
      >
        {/* Indicador de tipo */}
        <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-[#339900]/10 px-3 py-1 text-xs font-semibold text-[#339900]">
          <HelpCircle className="h-3 w-3" /> Opción múltiple
        </span>

        <h3 className="mb-6 text-lg font-semibold text-[#1A1A2E]">
          {currentQuestion.prompt}
        </h3>

        {/* Opciones */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            let borderColor = 'border-[#D1D5DB]';
            let bgColor = 'bg-white';
            let textColor = 'text-[#1A1A2E]';
            let icon = null;

            if (answered && isSelected) {
              if (opt.correct) {
                borderColor = 'border-[#339900]';
                bgColor = 'bg-[#339900]/10';
                textColor = 'text-[#339900]';
                icon = <Check className="h-5 w-5 text-[#339900]" />;
              } else {
                borderColor = 'border-[#DC2626]';
                bgColor = 'bg-[#DC2626]/10';
                textColor = 'text-[#DC2626]';
                icon = <X className="h-5 w-5 text-[#DC2626]" />;
              }
            } else if (answered && opt.correct) {
              borderColor = 'border-[#339900]';
              bgColor = 'bg-[#339900]/10';
              textColor = 'text-[#339900]';
              icon = <Check className="h-5 w-5 text-[#339900]" />;
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleOptionClick(opt.id, opt.correct, opt.text)}
                disabled={answered}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-base font-medium transition-all',
                  borderColor,
                  bgColor,
                  textColor,
                  !answered && 'hover:border-[#339900]/60 hover:bg-[#339900]/5 cursor-pointer',
                  answered && 'cursor-default',
                )}
                style={{ borderRadius: 16 }}
                aria-label={opt.text}
              >
                <span className="flex-1">{opt.text}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Feedback + botón de audio */}
        {answered && (
          <div className="mt-6 space-y-3">
            <div
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium',
                correctAnswer
                  ? 'bg-[#339900]/10 text-[#339900]'
                  : 'bg-[#DC2626]/10 text-[#DC2626]',
              )}
              role="alert"
            >
              {correctAnswer ? (
                <>
                  <Check className="h-5 w-5" />
                  <span>¡Correcto! Escucha la pronunciación en inglés.</span>
                </>
              ) : (
                <>
                  <X className="h-5 w-5" />
                  <span>
                    Incorrecto. La respuesta correcta está marcada en verde.
                  </span>
                </>
              )}
            </div>

            {/* Botón de siguiente */}
            <button
              onClick={handleNext}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#339900] px-6 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-[#2B7A00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#339900] focus-visible:ring-offset-2 active:scale-[0.97]"
              style={{ borderRadius: 16 }}
            >
              {isLastQuestion ? 'Ver resultados' : 'Siguiente pregunta'}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}