import { motion } from 'framer-motion';
import {
  BookOpen,
  Layers,
  Headphones,
  Mic,
  ClipboardCheck,
  AlertTriangle,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

/* ─── Tipos ─────────────────────────────────────────── */
interface Modo {
  id: string;
  label: string;
  descripcion: string;
  icono: React.ReactNode;
  color: string; // clase Tailwind para el gradiente/icono
}

/* ─── Datos de los modos ────────────────────────────── */
const modos: Modo[] = [
  {
    id: 'estudiar',
    label: 'Estudiar',
    descripcion: 'Repasa contenido nuevo con tarjetas guiadas',
    icono: <BookOpen className="h-7 w-7" />,
    color: 'from-orange-500 to-amber-600',
  },
  {
    id: 'flashcards',
    label: 'Flashcards',
    descripcion: 'Memoriza con repetición espaciada',
    icono: <Layers className="h-7 w-7" />,
    color: 'from-amber-500 to-yellow-600',
  },
  {
    id: 'escuchar',
    label: 'Escuchar',
    descripcion: 'Audio nativo con transcripción',
    icono: <Headphones className="h-7 w-7" />,
    color: 'from-rose-500 to-red-600',
  },
  {
    id: 'pronunciacion',
    label: 'Pronunciación',
    descripcion: 'Graba y compara tu voz',
    icono: <Mic className="h-7 w-7" />,
    color: 'from-orange-600 to-red-500',
  },
  {
    id: 'examen',
    label: 'Examen',
    descripcion: 'Pon a prueba lo aprendido',
    icono: <ClipboardCheck className="h-7 w-7" />,
    color: 'from-amber-600 to-orange-700',
  },
  {
    id: 'mis-errores',
    label: 'Mis errores',
    descripcion: 'Repasa las preguntas que fallaste',
    icono: <AlertTriangle className="h-7 w-7" />,
    color: 'from-red-500 to-rose-600',
  },
  {
    id: 'mi-progreso',
    label: 'Mi progreso',
    descripcion: 'Estadísticas y rachas de estudio',
    icono: <BarChart3 className="h-7 w-7" />,
    color: 'from-yellow-500 to-amber-600',
  },
];

/* ─── Variante animación contenedor ─────────────────── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};

/* ─── Componente principal ──────────────────────────── */
export default function HomeScreen() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Encabezado */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8 text-center sm:mb-12"
      >
        {/* Tarjeta del profesor */}
        <div className="mx-auto mb-6 flex max-w-md items-center gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 text-left shadow-sm">
          <img
            src="https://fzfncffjekempswnjilr.supabase.co/storage/v1/object/public/cosmos-code-sites/_assets/RiqbZ1da3yUDpcemQGlxfLkcCEo2/9eff8a36-a664-4c86-b3f2-cc80c2409b51/48f47440409837103a68a399.jpg"
            alt="Profesor Emmanuel Silis"
            className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-amber-400"
          />
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
              Tu profesor
            </p>
            <p className="truncate font-[Lexend] text-lg font-bold text-[#431407]">
              Emmanuel Silis
            </p>
            <p className="truncate text-sm text-[#9A3412]">
              ¡Hola! ¿Listo para aprender inglés hoy?
            </p>
          </div>
        </div>

        <h1 className="font-[Lexend] text-3xl font-bold tracking-tight text-[#431407] sm:text-4xl">
          ¿Qué quieres practicar hoy?
        </h1>
        <p className="mt-2 text-base text-[#9A3412] sm:text-lg">
          Elige un modo y empieza a aprender
        </p>
      </motion.div>

      {/* Grid de modos */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:gap-6"
      >
        {modos.map((modo) => (
          <motion.button
            key={modo.id}
            variants={cardVariants}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="group flex w-full items-center gap-4 rounded-xl border border-amber-100 bg-white p-4 text-left shadow-md transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 sm:p-6"
          >
            {/* Icono con gradiente */}
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm sm:h-14 sm:w-14 ${modo.color}`}
            >
              {modo.icono}
            </div>

            {/* Texto */}
            <div className="min-w-0 flex-1">
              <span className="block font-[Inter] text-lg font-semibold text-[#431407] sm:text-xl">
                {modo.label}
              </span>
              <span className="mt-0.5 block truncate text-sm text-[#9A3412] sm:text-base">
                {modo.descripcion}
              </span>
            </div>

            {/* Flecha */}
            <ArrowRight className="h-5 w-5 shrink-0 text-[#9A3412] transition-transform group-hover:translate-x-1 group-focus-visible:translate-x-1" />
          </motion.button>
        ))}
      </motion.div>

      {/* Pie informativo */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="mt-10 text-center text-xs text-[#9A3412] sm:text-sm"
      >
        Tu progreso se guarda automáticamente ✨
      </motion.p>
    </div>
  );
}