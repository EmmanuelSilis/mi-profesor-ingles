import React from 'react';
import {
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BookOpen,
  RefreshCw,
  Target,
  Brain,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TopicStat {
  label: string;
  correct: number;
  total: number;
}

interface DifficultWord {
  word: string;
  attempts: number;
  errors: number;
}

interface RecurrentError {
  pattern: string;
  count: number;
  example: string;
}

interface ProgressData {
  totalAnswered: number;
  correct: number;
  incorrect: number;
  topics: TopicStat[];
  dominantTopics: string[];
  weakTopics: string[];
  difficultWords: DifficultWord[];
  recurrentErrors: RecurrentError[];
}

// ---------------------------------------------------------------------------
// Demo data (no Supabase connection yet)
// ---------------------------------------------------------------------------

const DEMO_DATA: ProgressData = {
  totalAnswered: 342,
  correct: 267,
  incorrect: 75,
  topics: [
    { label: 'Gramática', correct: 82, total: 114 },
    { label: 'Vocabulario', correct: 101, total: 120 },
    { label: 'Was/Were', correct: 22, total: 40 },
    { label: 'Preguntas', correct: 62, total: 68 },
  ],
  dominantTopics: ['Vocabulario', 'Preguntas'],
  weakTopics: ['Was/Were', 'Gramática (verbos irregulares)'],
  difficultWords: [
    { word: 'though', attempts: 12, errors: 9 },
    { word: 'necessary', attempts: 8, errors: 6 },
    { word: 'receive', attempts: 10, errors: 5 },
    { word: 'embarrass', attempts: 6, errors: 5 },
  ],
  recurrentErrors: [
    {
      pattern: 'Confusión was/were en tercera persona plural',
      count: 14,
      example: 'They was going → They were going',
    },
    {
      pattern: 'Uso incorrecto de preposiciones (in/on/at)',
      count: 11,
      example: 'On the morning → In the morning',
    },
    {
      pattern: 'Orden de palabras en preguntas indirectas',
      count: 8,
      example: 'I don\'t know where is he → I don\'t know where he is',
    },
  ],
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  color: 'blue' | 'green' | 'amber' | 'rose' | 'purple';
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    green:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    amber:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    rose:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    purple:
      'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800',
  };

  const trendIcon =
    trend === 'up' ? (
      <TrendingUp className="h-4 w-4 text-emerald-500" />
    ) : trend === 'down' ? (
      <TrendingDown className="h-4 w-4 text-rose-500" />
    ) : null;

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4',
        colorMap[color],
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/60 dark:bg-black/20">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium opacity-80">{label}</p>
        <p className="mt-0.5 text-2xl font-bold tracking-tight">{value}</p>
        {sub && (
          <p className="mt-0.5 text-xs opacity-70 flex items-center gap-1">
            {trendIcon}
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function ProgressBar({
  label,
  percent,
  color,
}: {
  label: string;
  percent: number;
  color: 'blue' | 'green' | 'amber' | 'rose';
}) {
  const barColor = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300 truncate pr-2">
          {label}
        </span>
        <span className="tabular-nums font-semibold text-gray-900 dark:text-gray-100">
          {formatPercent(percent)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor[color])}
          style={{ width: `${Math.min(percent, 100)}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${formatPercent(percent)}`}
        />
      </div>
    </div>
  );
}

function TopicCard({ topic }: { topic: TopicStat }) {
  const percent = topic.total > 0 ? (topic.correct / topic.total) * 100 : 0;
  const color =
    percent >= 80 ? 'green' : percent >= 60 ? 'blue' : percent >= 40 ? 'amber' : 'rose';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <ProgressBar label={topic.label} percent={percent} color={color} />
      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
        {topic.correct} aciertos de {topic.total} preguntas
      </p>
    </div>
  );
}

function DifficultWordRow({ item }: { item: DifficultWord }) {
  const errorRate = item.attempts > 0 ? (item.errors / item.attempts) * 100 : 0;
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/50">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
          {item.word}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {item.attempts} intentos · {item.errors} errores ({formatPercent(errorRate)})
        </p>
      </div>
      <div className="ml-3 shrink-0">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
            errorRate >= 60
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
          )}
        >
          {errorRate >= 60 ? 'Crítica' : 'Difícil'}
        </span>
      </div>
    </div>
  );
}

function RecurrentErrorCard({ error }: { error: RecurrentError }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {error.pattern}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Ocurrió {error.count} veces
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
          {error.count}
        </span>
      </div>
      <div className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-gray-700/50 dark:text-gray-300">
        <span className="font-medium">Ejemplo: </span>
        {error.example}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function Progress() {
  const data = DEMO_DATA;

  const overallPercent = data.totalAnswered > 0
    ? (data.correct / data.totalAnswered) * 100
    : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-md">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
            Mi Progreso
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Estadísticas generales de tu aprendizaje
          </p>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={CheckCircle}
          label="Aciertos"
          value={String(data.correct)}
          sub={`${formatPercent(overallPercent)} del total`}
          trend="up"
          color="green"
        />
        <StatCard
          icon={XCircle}
          label="Errores"
          value={String(data.incorrect)}
          sub={`${formatPercent(100 - overallPercent)} del total`}
          trend="down"
          color="rose"
        />
        <StatCard
          icon={Target}
          label="Contestadas"
          value={String(data.totalAnswered)}
          sub="Preguntas totales"
          trend="neutral"
          color="blue"
        />
        <StatCard
          icon={Brain}
          label="Porcentaje"
          value={formatPercent(overallPercent)}
          sub={overallPercent >= 70 ? '¡Buen ritmo!' : 'Sigue practicando'}
          trend={overallPercent >= 70 ? 'up' : 'down'}
          color="purple"
        />
      </div>

      {/* Temas */}
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Rendimiento por tema
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.topics.map((topic) => (
            <TopicCard key={topic.label} topic={topic} />
          ))}
        </div>
      </section>

      {/* Temas dominantes y débiles */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">
              Temas dominados
            </h3>
          </div>
          {data.dominantTopics.length > 0 ? (
            <ul className="space-y-1.5">
              {data.dominantTopics.map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300"
                >
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Aún no hay temas dominados. ¡Sigue practicando!
            </p>
          )}
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
          <div className="mb-3 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-semibold text-amber-800 dark:text-amber-200">
              Temas débiles
            </h3>
          </div>
          {data.weakTopics.length > 0 ? (
            <ul className="space-y-1.5">
              {data.weakTopics.map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              No hay temas débiles identificados. ¡Vas muy bien!
            </p>
          )}
        </div>
      </div>

      {/* Palabras difíciles */}
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Palabras difíciles
          </h2>
        </div>
        {data.difficultWords.length > 0 ? (
          <div className="space-y-2">
            {data.difficultWords.map((item) => (
              <DifficultWordRow key={item.word} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No hay palabras difíciles registradas aún.
            </p>
          </div>
        )}
      </section>

      {/* Errores recurrentes */}
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Errores recurrentes
          </h2>
        </div>
        {data.recurrentErrors.length > 0 ? (
          <div className="space-y-3">
            {data.recurrentErrors.map((err, idx) => (
              <RecurrentErrorCard key={idx} error={err} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No se detectaron errores recurrentes. ¡Sigue así!
            </p>
          </div>
        )}
      </section>

      {/* Nota de demo */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
        <p className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 shrink-0" />
          <span>
            Estos son datos de demostración. Conecta tu proyecto de Supabase desde el panel
            Backend para ver tu progreso real.
          </span>
        </p>
      </div>
    </div>
  );
}