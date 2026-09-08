import React, { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle, ChevronDown, ChevronRight, BookOpen, Search, Filter, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface ErrorEntry {
  id: string;
  concepto: string;
  descripcion: string;
  fecha: Date;
  gravedad: 'baja' | 'media' | 'alta';
  resuelto: boolean;
  /** Enlace o identificador para repasar el concepto */
  recurso?: string;
}

interface ErrorListProps {
  errores?: ErrorEntry[];
  className?: string;
}

// ─── Datos de demostración ────────────────────────────────────────────────────
const DEMO_ERRORES: ErrorEntry[] = [
  {
    id: 'e1',
    concepto: 'Declaración de variables con let/const',
    descripcion:
      'Usaste var en lugar de let/const. var tiene scope de función y puede causar bugs inesperados.',
    fecha: new Date(2025, 5, 12),
    gravedad: 'alta',
    resuelto: false,
    recurso: 'variables',
  },
  {
    id: 'e2',
    concepto: 'Manejo de promesas sin catch',
    descripcion:
      'Olvidaste encadenar un .catch() a la promesa. Las promesas rechazadas sin manejo generan errores silenciosos.',
    fecha: new Date(2025, 5, 10),
    gravedad: 'alta',
    resuelto: true,
    recurso: 'promesas',
  },
  {
    id: 'e3',
    concepto: 'Comparación con == en lugar de ===',
    descripcion:
      'El operador == realiza coerción de tipos. Usa === para comparaciones estrictas.',
    fecha: new Date(2025, 5, 8),
    gravedad: 'media',
    resuelto: false,
    recurso: 'comparacion',
  },
  {
    id: 'e4',
    concepto: 'Falta de tipado en parámetros',
    descripcion:
      'Los parámetros de función sin tipo pueden recibir cualquier valor. Define tipos explícitos.',
    fecha: new Date(2025, 5, 5),
    gravedad: 'media',
    resuelto: false,
    recurso: 'tipado',
  },
  {
    id: 'e5',
    concepto: 'Uso de any en TypeScript',
    descripcion:
      'any desactiva el sistema de tipos. Prefiere unknown o tipos específicos.',
    fecha: new Date(2025, 5, 3),
    gravedad: 'baja',
    resuelto: true,
    recurso: 'any-vs-unknown',
  },
  {
    id: 'e6',
    concepto: 'Mutación directa del estado en React',
    descripcion:
      'Modificaste el estado directamente en lugar de usar el setter. React no detecta mutaciones.',
    fecha: new Date(2025, 4, 28),
    gravedad: 'alta',
    resuelto: false,
    recurso: 'estado-react',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const GRAVEDAD_CLASES: Record<ErrorEntry['gravedad'], string> = {
  baja: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300',
  media:
    'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300',
  alta: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300',
};

const GRAVEDAD_ICONOS: Record<ErrorEntry['gravedad'], typeof AlertTriangle> = {
  baja: CheckCircle,
  media: AlertTriangle,
  alta: AlertTriangle,
};

const GRAVEDAD_LABEL: Record<ErrorEntry['gravedad'], string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
};

function formatearFecha(fecha: Date): string {
  try {
    return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(fecha);
  } catch {
    return fecha.toLocaleDateString('es-ES');
  }
}

// ─── Componente ──────────────────────────────────────────────────────────────
export default function ErrorList({ errores: erroresProp, className }: ErrorListProps) {
  const errores = erroresProp ?? DEMO_ERRORES;

  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroGravedad, setFiltroGravedad] = useState<ErrorEntry['gravedad'] | 'todas'>('todas');
  const [filtroResuelto, setFiltroResuelto] = useState<'todos' | 'pendientes' | 'resueltos'>('todos');
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [mostrarDemo, setMostrarDemo] = useState(!erroresProp);

  // ── Filtrado ──────────────────────────────────────────────────────────────
  const filtrados = useMemo(() => {
    return errores.filter((e) => {
      if (filtroTexto) {
        const q = filtroTexto.toLowerCase();
        if (
          !e.concepto.toLowerCase().includes(q) &&
          !e.descripcion.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (filtroGravedad !== 'todas' && e.gravedad !== filtroGravedad) return false;
      if (filtroResuelto === 'pendientes' && e.resuelto) return false;
      if (filtroResuelto === 'resueltos' && !e.resuelto) return false;
      return true;
    });
  }, [errores, filtroTexto, filtroGravedad, filtroResuelto]);

  const toggleExpandido = (id: string) => {
    setExpandidos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const limpiarFiltros = () => {
    setFiltroTexto('');
    setFiltroGravedad('todas');
    setFiltroResuelto('todos');
  };

  const hayFiltrosActivos =
    filtroTexto !== '' || filtroGravedad !== 'todas' || filtroResuelto !== 'todos';

  // ── Estados vacíos ─────────────────────────────────────────────────────────
  if (errores.length === 0) {
    return (
      <div
        className={clsx(
          'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-900/50',
          className,
        )}
      >
        <CheckCircle className="mb-4 h-12 w-12 text-emerald-500" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          No hay errores registrados
        </h3>
        <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
          A medida que practiques y cometas errores, aparecerán aquí para que puedas
          repasarlos y aprender de ellos.
        </p>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-4', className)}>
      {/* ── Cabecera ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Lista de errores
          <span className="ml-2 text-sm font-normal text-slate-400 dark:text-slate-500">
            ({errores.length})
          </span>
        </h2>

        {mostrarDemo && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
            Datos de ejemplo
          </span>
        )}
      </div>

      {/* ── Filtros ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            placeholder="Buscar error…"
            aria-label="Buscar por concepto o descripción"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-800"
          />
        </div>

        {/* Filtro gravedad */}
        <div className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={filtroGravedad}
            onChange={(e) => setFiltroGravedad(e.target.value as ErrorEntry['gravedad'] | 'todas')}
            aria-label="Filtrar por gravedad"
            className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-8 text-sm text-slate-700 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-800"
          >
            <option value="todas">Todas las gravedades</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>

        {/* Filtro estado */}
        <div className="relative">
          <select
            value={filtroResuelto}
            onChange={(e) =>
              setFiltroResuelto(e.target.value as 'todos' | 'pendientes' | 'resueltos')
            }
            aria-label="Filtrar por estado"
            className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-800"
          >
            <option value="todos">Todos</option>
            <option value="pendientes">Pendientes</option>
            <option value="resueltos">Resueltos</option>
          </select>
        </div>

        {/* Limpiar filtros */}
        {hayFiltrosActivos && (
          <button
            type="button"
            onClick={limpiarFiltros}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* ── Lista ──────────────────────────────────────────────────────────── */}
      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <Search className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Ningún error coincide con los filtros actuales.
          </p>
          <button
            type="button"
            onClick={limpiarFiltros}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
          >
            <RotateCcw className="h-4 w-4" />
            Restablecer filtros
          </button>
        </div>
      ) : (
        <ul className="space-y-2" role="list">
          {filtrados.map((error) => {
            const IconoGravedad = GRAVEDAD_ICONOS[error.gravedad];
            const expandido = expandidos.has(error.id);

            return (
              <li
                key={error.id}
                className={clsx(
                  'rounded-xl border transition-shadow',
                  error.resuelto
                    ? 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50'
                    : 'border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800',
                )}
              >
                {/* ── Fila resumen ─────────────────────────────────────────── */}
                <button
                  type="button"
                  onClick={() => toggleExpandido(error.id)}
                  aria-expanded={expandido}
                  aria-controls={`error-detalle-${error.id}`}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  {/* Icono expandir */}
                  <span className="flex-shrink-0 text-slate-400">
                    {expandido ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </span>

                  {/* Indicador resuelto */}
                  <span
                    className={clsx(
                      'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full',
                      error.resuelto
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500',
                    )}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                  </span>

                  {/* Concepto */}
                  <span className="flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                    {error.concepto}
                  </span>

                  {/* Gravedad */}
                  <span
                    className={clsx(
                      'inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                      GRAVEDAD_CLASES[error.gravedad],
                    )}
                  >
                    <IconoGravedad className="h-3 w-3" />
                    {GRAVEDAD_LABEL[error.gravedad]}
                  </span>

                  {/* Fecha */}
                  <span className="hidden flex-shrink-0 text-xs text-slate-400 sm:block">
                    {formatearFecha(error.fecha)}
                  </span>
                </button>

                {/* ── Detalle expandido ────────────────────────────────────── */}
                {expandido && (
                  <div
                    id={`error-detalle-${error.id}`}
                    className="border-t border-slate-100 px-4 pb-4 pt-3 dark:border-slate-700"
                  >
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {error.descripcion}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {/* Botón repasar */}
                      <button
                        type="button"
                        onClick={() => {
                          // Acción de repaso: en una app real navegaría al recurso
                          // o abriría un modal de estudio.
                          console.info('Repasar concepto:', error.recurso ?? error.concepto);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3.5 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                      >
                        <BookOpen className="h-4 w-4" />
                        Repasar concepto
                      </button>

                      {/* Estado resuelto */}
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1 text-xs font-medium',
                          error.resuelto
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400 dark:text-slate-500',
                        )}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        {error.resuelto ? 'Resuelto' : 'Pendiente'}
                      </span>

                      {/* Fecha (mobile) */}
                      <span className="text-xs text-slate-400 sm:hidden">
                        {formatearFecha(error.fecha)}
                      </span>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* ── Footer informativo ─────────────────────────────────────────────── */}
      {mostrarDemo && (
        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          Estos son datos de demostración. Conecta tu proyecto de Supabase desde el panel
          de configuración para gestionar errores reales.
        </p>
      )}
    </div>
  );
}