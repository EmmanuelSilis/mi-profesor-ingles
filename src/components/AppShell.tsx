import { useState, type ReactNode } from 'react';
import { BookOpen, GraduationCap, Headphones, Mic, Pencil } from 'lucide-react';

/* ─── Inline helpers ─────────────────────────────────────────────── */

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

/* ─── Navigation items ────────────────────────────────────────────── */

interface NavItem {
  label: string;
  icon: ReactNode;
  id: string;
}

const navItems: NavItem[] = [
  { label: 'Estudiar', icon: <BookOpen size={20} />, id: 'estudiar' },
  { label: 'Flashcards', icon: <GraduationCap size={20} />, id: 'flashcards' },
  { label: 'Escuchar', icon: <Headphones size={20} />, id: 'escuchar' },
  { label: 'Pronunciación', icon: <Mic size={20} />, id: 'pronunciacion' },
  { label: 'Escribir', icon: <Pencil size={20} />, id: 'escribir' },
];

/* ─── Props ────────────────────────────────────────────────────────── */

interface AppShellProps {
  /** Content rendered between header and bottom nav. */
  children?: ReactNode;
  /** Active navigation tab id. Defaults to 'estudiar'. */
  activeTab?: string;
  /** Called when a nav item is tapped. */
  onTabChange?: (tabId: string) => void;
}

/* ─── Component ────────────────────────────────────────────────────── */

export default function AppShell({
  children,
  activeTab = 'estudiar',
  onTabChange,
}: AppShellProps) {
  const [currentTab, setCurrentTab] = useState(activeTab);

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{ backgroundColor: '#FFF7ED', color: '#431407' }}
    >
      {/* ─── Header ──────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-4 py-3 shadow-sm"
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #FED7AA',
        }}
      >
        {/* App title */}
        <div className="flex items-center gap-2">
          <span
            className="text-lg font-semibold tracking-tight"
            style={{
              fontFamily: "'Lexend', sans-serif",
              color: '#431407',
            }}
          >
            🇺🇸 MI PROFESOR DE INGLÉS
          </span>
        </div>

        {/* Profesor avatar */}
        <img
          src="https://fzfncffjekempswnjilr.supabase.co/storage/v1/object/public/cosmos-code-sites/_assets/RiqbZ1da3yUDpcemQGlxfLkcCEo2/9eff8a36-a664-4c86-b3f2-cc80c2409b51/48f47440409837103a68a399.jpg"
          alt="Profesor Emmanuel Silis"
          title="Profesor Emmanuel Silis"
          className="h-9 w-9 rounded-full object-cover ring-2 ring-amber-400"
        />
      </header>

      {/* ─── Main content ────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {children}
      </main>

      {/* ─── Bottom navigation ───────────────────────────────────── */}
      <nav
        className="flex items-center justify-around border-t px-2 pb-2 pt-1"
        style={{
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #FED7AA',
        }}
      >
        {navItems.map((item) => {
          const isActive = (onTabChange ? activeTab : currentTab) === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabClick(item.id)}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
              )}
              style={{
                fontFamily: "'Inter', sans-serif",
                color: isActive ? '#EA580C' : '#9A3412',
                minHeight: 44,
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={cn(
                  'transition-transform duration-150',
                  isActive ? 'scale-110' : 'scale-100',
                )}
              >
                {item.icon}
              </span>
              <span className="leading-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}