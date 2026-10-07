import React, { useState, useCallback, useRef, useEffect } from 'react';

/* ─────────────── Types ─────────────── */

interface BodyPart {
  id: string;
  english: string;
  spanish: string;
  /** Percentage‑based position relative to the image (0‑100) */
  x: number;
  y: number;
  /** Side of the label: 'left' | 'right' */
  side: 'left' | 'right';
}

/* ─────────────── Data ─────────────── */

const DEFAULT_BODY_PARTS: BodyPart[] = [
  { id: 'head',       english: 'Head',       spanish: 'Cabeza',       x: 77, y: 29, side: 'left'  },
  { id: 'hair',       english: 'Hair',       spanish: 'Cabello',      x: 25, y: 29, side: 'right' },
  { id: 'eye',        english: 'Eye',        spanish: 'Ojo',          x: 29, y: 41.5, side: 'left'  },
  { id: 'ear',        english: 'Ear',        spanish: 'Oreja',        x: 75, y: 49.5, side: 'left'  },
  { id: 'nose',       english: 'Nose',       spanish: 'Nariz',        x: 27, y: 45.5, side: 'right' },
  { id: 'mouth',      english: 'Mouth',      spanish: 'Boca',         x: 76, y: 52, side: 'right' },
  { id: 'neck',       english: 'Neck',       spanish: 'Cuello',       x: 75, y: 57.5, side: 'left'  },
  { id: 'shoulder',   english: 'Shoulder',   spanish: 'Hombro',       x: 78, y: 59.5, side: 'left'  },
  { id: 'arm',        english: 'Arm',        spanish: 'Brazo',        x: 74, y: 65.3, side: 'left'  },
  { id: 'elbow',      english: 'Elbow',      spanish: 'Codo',         x: 76, y: 63.5, side: 'left'  },
  { id: 'hand',       english: 'Hand',       spanish: 'Mano',         x: 75, y: 69.5, side: 'left'  },
  { id: 'chest',      english: 'Chest',      spanish: 'Pecho',        x: 25, y: 63.3, side: 'right' },
  { id: 'stomach',    english: 'Stomach',    spanish: 'Estómago',     x: 25, y: 67, side: 'right' },
  { id: 'hip',        english: 'Hip',        spanish: 'Cadera',       x: 29, y: 72, side: 'right' },
  { id: 'leg',        english: 'Leg',        spanish: 'Pierna',       x: 27, y: 85, side: 'left'  },
  { id: 'knee',       english: 'Knee',       spanish: 'Rodilla',      x: 76, y: 84.5, side: 'left'  },
  { id: 'foot',       english: 'Foot',       spanish: 'Pie',          x: 18, y: 98.3, side: 'left'  },
];

const STORAGE_KEY = 'body-map-positions-v1';

/* ─────────────── Speech helper ─────────────── */

function speak(text: string): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

/* ─────────────── Component ─────────────── */

const BodyMap: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ id: string; x: number; y: number } | null>(null);
  const [parts, setParts] = useState<BodyPart[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as BodyPart[];
        if (Array.isArray(parsed) && parsed.length === DEFAULT_BODY_PARTS.length) {
          return parsed;
        }
      }
    } catch {
      /* ignore */
    }
    return DEFAULT_BODY_PARTS;
  });
  const [editMode, setEditMode] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  /* Persist positions whenever they change */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parts));
    } catch {
      /* ignore */
    }
  }, [parts]);

  const handlePartClick = useCallback((part: BodyPart) => {
    setSelectedId(part.id);
    speak(part.english);
  }, []);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent, part: BodyPart) => {
      const rect = imageRef.current?.getBoundingClientRect();
      if (!rect) return;
      setTooltip({
        id: part.id,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  /* ── Drag-to-reposition handlers (edit mode) ── */
  const handleDragStart = useCallback(
    (e: React.PointerEvent, part: BodyPart) => {
      if (!editMode) return;
      e.preventDefault();
      setDraggingId(part.id);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [editMode],
  );

  const handleDragMove = useCallback(
    (e: React.PointerEvent) => {
      if (!editMode || !draggingId) return;
      const rect = imageRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setParts((prev) =>
        prev.map((p) =>
          p.id === draggingId
            ? { ...p, x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) }
            : p,
        ),
      );
    },
    [editMode, draggingId],
  );

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
  }, []);

  const resetPositions = useCallback(() => {
    setParts(DEFAULT_BODY_PARTS);
  }, []);

  const selectedPart = selectedId ? parts.find((p) => p.id === selectedId) : null;

  return (
    <div
      className="relative mx-auto w-full max-w-[600px] select-none"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Title ── */}
      <div className="mb-3 text-center">
        <span
          className="inline-block rounded-full px-4 py-1 text-sm font-semibold tracking-wide"
          style={{ backgroundColor: '#339900', color: '#FFFFFF' }}
        >
          Lección 11
        </span>
        <h2
          className="mt-2 text-2xl font-bold"
          style={{ color: '#1A1A2E' }}
        >
          El Cuerpo Humano
        </h2>
        <p className="text-sm" style={{ color: '#555' }}>
          {editMode
            ? 'Arrastra cada punto para colocarlo sobre su etiqueta impresa'
            : 'Toca cada punto verde sobre la etiqueta para escuchar su pronunciación en inglés'}
        </p>
      </div>

      {/* ── Edit mode toggle ── */}
      <div className="mb-3 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setEditMode((v) => !v)}
          className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            backgroundColor: editMode ? '#339900' : '#F5F7FA',
            color: editMode ? '#FFFFFF' : '#1A1A2E',
            border: '1px solid #339900',
          }}
        >
          {editMode ? '✓ Listo' : '✎ Ajustar puntos'}
        </button>
        {editMode && (
          <button
            type="button"
            onClick={resetPositions}
            className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#DC2626',
              border: '1px solid #DC2626',
            }}
          >
            Restablecer
          </button>
        )}
      </div>

      {/* ── Image container ── */}
      <div className="relative">
        <img
          ref={imageRef}
          src="/body-reference.png"
          alt="Ilustración del cuerpo humano con partes etiquetadas"
          className="block h-auto w-full"
          style={{ borderRadius: '12px', aspectRatio: '685 / 865' }}
          draggable={false}
        />

        {/* ── Interactive dots & labels ── */}
        {parts.map((part) => {
          const isSelected = selectedId === part.id;
          const isDragging = draggingId === part.id;
          const dotSize = isSelected || isDragging ? 24 : 18;

          return (
            <React.Fragment key={part.id}>
              {/* Clickable / draggable dot */}
              <button
                type="button"
                aria-label={`${part.english} — ${part.spanish}`}
                title={`${part.english} — ${part.spanish}`}
                onClick={() => handlePartClick(part)}
                onMouseEnter={(e) => handleMouseEnter(e, part)}
                onMouseLeave={handleMouseLeave}
                onPointerDown={(e) => handleDragStart(e, part)}
                onPointerMove={handleDragMove}
                onPointerUp={handleDragEnd}
                onPointerCancel={handleDragEnd}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2 border-white shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 z-10"
                style={{
                  left: `${part.x}%`,
                  top: `${part.y}%`,
                  width: `${dotSize}px`,
                  height: `${dotSize}px`,
                  backgroundColor: isSelected ? '#339900' : 'rgba(255,255,255,0.75)',
                  borderColor: '#339900',
                  cursor: editMode ? 'grab' : 'pointer',
                  boxShadow: isSelected
                    ? '0 0 0 6px rgba(51,153,0,0.35)'
                    : '0 2px 6px rgba(0,0,0,0.25)',
                }}
              />

              {/* English label next to the dot */}
              <div
                className="pointer-events-none absolute z-10"
                style={{
                  left: `${part.x}%`,
                  top: `${part.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <span
                  className="pointer-events-auto cursor-pointer whitespace-nowrap rounded-md px-1 py-0 text-xs font-semibold transition-all duration-200 hover:opacity-90"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    left: '50%',
                    backgroundColor: isSelected ? '#339900' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#1A1A2E',
                    border: '1.5px solid #339900',
                    borderRadius: '8px',
                    fontSize: 'clamp(7px, 1.8vw, 11px)',
                    lineHeight: 1,
                    boxShadow: isSelected
                      ? '0 2px 8px rgba(51,153,0,0.3)'
                      : '0 1px 4px rgba(0,0,0,0.1)',
                  }}
                  onClick={() => handlePartClick(part)}
                >
                  {part.english}
                </span>
              </div>
            </React.Fragment>
          );
        })}

        {/* ── Hover tooltip ── */}
        {tooltip && !editMode && (
          <div
            className="pointer-events-none absolute z-20 rounded-md px-2.5 py-1 text-xs font-medium shadow-lg"
            style={{
              left: tooltip.x,
              top: tooltip.y - 32,
              transform: 'translateX(-50%)',
              backgroundColor: '#1A1A2E',
              color: '#FFFFFF',
              borderRadius: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            {parts.find((p) => p.id === tooltip.id)?.spanish}
          </div>
        )}
      </div>

      {/* ── Selected part info ── */}
      {selectedPart && (
        <div
          className="mx-auto mt-5 flex max-w-xs items-center justify-center gap-3 rounded-xl px-5 py-3 text-center shadow-md"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #339900',
            borderRadius: '12px',
          }}
        >
          <div>
            <p className="text-lg font-bold" style={{ color: '#1A1A2E' }}>
              {selectedPart.english}
            </p>
            <p className="text-sm" style={{ color: '#555' }}>
              {selectedPart.spanish}
            </p>
          </div>
          <button
            type="button"
            aria-label="Reproducir pronunciación"
            title="Reproducir pronunciación"
            onClick={() => speak(selectedPart.english)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              backgroundColor: '#339900',
              color: '#FFFFFF',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Empty state (no selection) ── */}
      {!selectedPart && (
        <p
          className="mx-auto mt-5 max-w-xs text-center text-sm"
          style={{ color: '#888' }}
        >
          Toca cualquier punto verde sobre una etiqueta para empezar
        </p>
      )}

      {/* ── Instructions ── */}
      <p
        className="mx-auto mt-4 max-w-md text-center text-xs"
        style={{ color: '#AAA' }}
      >
        Pasa el cursor sobre un punto para ver la traducción al español. Haz clic
        para escuchar la pronunciación en inglés. Usa «Ajustar puntos» para mover
        cada punto sobre su etiqueta impresa.
      </p>
    </div>
  );
};

export default BodyMap;