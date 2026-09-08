import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, RefreshCw, CheckCircle, XCircle, AlertCircle, Volume2, BookOpen } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-záéíóúñü0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordDiff(expected: string, spoken: string) {
  const expWords = normalize(expected).split(/\s+/).filter(Boolean);
  const spoWords = normalize(spoken).split(/\s+/).filter(Boolean);

  const omitted: string[] = [];
  const incorrect: string[] = [];
  const correct: string[] = [];

  const maxLen = Math.max(expWords.length, spoWords.length);
  for (let i = 0; i < maxLen; i++) {
    const e = expWords[i] ?? null;
    const s = spoWords[i] ?? null;
    if (e === null && s !== null) {
      incorrect.push(s);
    } else if (s === null && e !== null) {
      omitted.push(e);
    } else if (e !== s) {
      incorrect.push(s ?? '???');
      omitted.push(e!);
    } else {
      correct.push(e!);
    }
  }

  const matchRatio =
    expWords.length > 0
      ? Math.round((correct.length / expWords.length) * 100)
      : 0;

  return { matchRatio, correct, omitted, incorrect, expectedWords: expWords };
}

function buildExplanation(
  expected: string,
  spoken: string,
  diff: ReturnType<typeof wordDiff>,
): string {
  if (diff.matchRatio === 100) {
    return '¡Perfecto! Has pronunciado la frase exactamente como se esperaba. Sigue así.';
  }

  const parts: string[] = [];

  if (diff.omitted.length > 0) {
    parts.push(
      `Palabras omitidas: "${diff.omitted.join('", "')}". Intenta decirlas todas.`,
    );
  }

  if (diff.incorrect.length > 0) {
    parts.push(
      `Palabras incorrectas o adicionales: "${diff.incorrect.join('", "')}". Revisa su pronunciación.`,
    );
  }

  if (diff.matchRatio >= 60) {
    parts.push(
      'Vas por buen camino, solo ajusta algunos detalles y lo conseguirás.',
    );
  } else if (diff.matchRatio >= 30) {
    parts.push(
      'Sigue practicando, enfócate en cada palabra y en el ritmo de la frase.',
    );
  } else {
    parts.push(
      'Te sugerimos escuchar la frase modelo y repetirla varias veces, prestando atención a cada sonido.',
    );
  }

  return parts.join(' ');
}

/* ------------------------------------------------------------------ */
/*  Demo phrases                                                       */
/* ------------------------------------------------------------------ */

const DEMO_PHRASES = [
  'The weather is nice today',
  'I would like a cup of coffee',
  'She works at the hospital',
  'They are going to the park',
  'Can you help me with this',
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Pronunciation() {
  const [phrase, setPhrase] = useState(() => {
    const idx = Math.floor(Math.random() * DEMO_PHRASES.length);
    return DEMO_PHRASES[idx];
  });
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<{
    matchRatio: number;
    correct: string[];
    omitted: string[];
    incorrect: string[];
    expectedWords: string[];
  } | null>(null);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showTip, setShowTip] = useState(false);

  const recognitionRef = useRef<{ stop(): void; abort(): void } | null>(null);
  const synthRef = useRef(window.speechSynthesis);

  /* ---- Speech recognition ---------------------------------------- */
  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');
    setResult(null);
    setExplanation('');

    const SpeechRecognition =
      (window as any).SpeechRecognition ??
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        'Tu navegador no soporta reconocimiento de voz. Prueba con Chrome, Edge o Safari.',
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onerror = (event: { error: string }) => {
      setIsListening(false);
      if (event.error === 'no-speech') {
        setError('No se detectó ningún audio. Intenta de nuevo.');
      } else if (event.error === 'audio-capture') {
        setError('No se encontró un micrófono. Verifica tu dispositivo.');
      } else if (event.error === 'not-allowed') {
        setError(
          'Permiso de micrófono denegado. Concede acceso en la configuración de tu navegador.',
        );
      } else {
        setError(`Error: ${event.error}.`);
      }
    };

    recognition.onresult = (event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => {
      const spoken = event.results[0][0].transcript;
      setTranscript(spoken);

      const diff = wordDiff(phrase, spoken);
      setResult(diff);
      setExplanation(buildExplanation(phrase, spoken, diff));
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [phrase]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  /* ---- Speak phrase aloud ---------------------------------------- */
  const speakPhrase = useCallback(() => {
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    synthRef.current.speak(utterance);
  }, [phrase]);

  /* ---- New random phrase ----------------------------------------- */
  const newPhrase = useCallback(() => {
    stopListening();
    setTranscript('');
    setResult(null);
    setExplanation('');
    setError(null);
    let next = phrase;
    while (next === phrase && DEMO_PHRASES.length > 1) {
      const idx = Math.floor(Math.random() * DEMO_PHRASES.length);
      next = DEMO_PHRASES[idx];
    }
    setPhrase(next);
  }, [phrase, stopListening]);

  /* ---- Cleanup on unmount ---------------------------------------- */
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      synthRef.current.cancel();
    };
  }, []);

  /* ---- Score color ----------------------------------------------- */
  const scoreColor =
    result === null
      ? 'text-slate-400'
      : result.matchRatio >= 80
        ? 'text-green-600'
        : result.matchRatio >= 50
          ? 'text-amber-500'
          : 'text-red-500';

  /* ---- Render ---------------------------------------------------- */
  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-md sm:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <motion.div
          initial={{ rotate: -10, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        >
          <BookOpen className="h-7 w-7 text-blue-500" aria-hidden="true" />
        </motion.div>
        <h1 className="text-2xl font-semibold text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>
          Pronunciación
        </h1>
      </div>

      {/* Phrase card */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="mb-1 text-sm font-medium text-slate-500">Frase a pronunciar:</p>
        <p
          className="text-xl font-semibold text-slate-800"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {phrase}
        </p>
        <button
          type="button"
          onClick={speakPhrase}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Escuchar la frase"
        >
          <Volume2 className="h-4 w-4" aria-hidden="true" />
          Escuchar
        </button>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {!isListening ? (
          <button
            type="button"
            onClick={startListening}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <Mic className="h-5 w-5" aria-hidden="true" />
            Iniciar grabación
          </button>
        ) : (
          <button
            type="button"
            onClick={stopListening}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            <MicOff className="h-5 w-5" aria-hidden="true" />
            Detener grabación
          </button>
        )}

        <button
          type="button"
          onClick={newPhrase}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Nueva frase
        </button>

        <button
          type="button"
          onClick={() => setShowTip((v) => !v)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {showTip ? 'Ocultar consejo' : 'Consejo'}
        </button>
      </div>

      {/* Tip */}
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4 overflow-hidden"
          >
            <div className="rounded-lg bg-blue-50 p-3 text-sm text-slate-700">
              Busca un lugar tranquilo, habla cerca del micrófono y pronuncia cada palabra de forma clara.
              No te preocupes si no sale perfecto a la primera, ¡la práctica hace al maestro!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listening indicator */}
      {isListening && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="h-3 w-3 rounded-full bg-amber-500"
            aria-hidden="true"
          />
          Escuchando... di la frase en inglés.
        </motion.div>
      )}

      {/* Transcript */}
      {transcript && (
        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-3">
          <p className="mb-1 text-xs font-medium text-slate-400 uppercase tracking-wide">
            Lo que dijiste
          </p>
          <p className="text-base text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>
            {transcript}
          </p>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Score */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-500">Coincidencia:</span>
              <span
                className={`text-2xl font-bold ${scoreColor}`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {result.matchRatio}%
              </span>
              {result.matchRatio >= 80 ? (
                <CheckCircle className="h-6 w-6 text-green-500" aria-hidden="true" />
              ) : result.matchRatio >= 50 ? (
                <AlertCircle className="h-6 w-6 text-amber-500" aria-hidden="true" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" aria-hidden="true" />
              )}
            </div>

            {/* Word-level detail */}
            <div className="flex flex-wrap gap-2">
              {result.expectedWords.map((w, i) => {
                const isCorrect = result.correct.includes(w);
                const isOmitted = result.omitted.includes(w);
                let cls =
                  'rounded-md px-2 py-0.5 text-sm font-medium border ';
                if (isCorrect) {
                  cls += 'border-green-300 bg-green-50 text-green-700';
                } else if (isOmitted) {
                  cls += 'border-red-300 bg-red-50 text-red-700 line-through';
                } else {
                  cls += 'border-amber-300 bg-amber-50 text-amber-700';
                }
                return (
                  <span key={`${w}-${i}`} className={cls}>
                    {w}
                  </span>
                );
              })}
            </div>

            {/* Explanation */}
            <div className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              <p className="mb-1 text-xs font-medium text-slate-400 uppercase tracking-wide">
                Explicación
              </p>
              <p>{explanation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!result && !isListening && !error && (
        <div className="flex flex-col items-center py-8 text-center">
          <Mic className="mb-3 h-10 w-10 text-slate-300" aria-hidden="true" />
          <p className="text-sm text-slate-500">
            Presiona <span className="font-semibold text-slate-700">Iniciar grabación</span> y lee la frase en voz alta.
          </p>
        </div>
      )}
    </div>
  );
}
