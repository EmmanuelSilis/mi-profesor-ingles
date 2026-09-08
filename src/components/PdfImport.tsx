import { useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, Loader2 } from 'lucide-react';
import { extractPdfContent } from '../lib/pdfEngine';
import { analyzeCourse, type SourcePage } from '../lib/course';
import { useCourse } from '../lib/courseStore';

export default function PdfImport() {
  const [pages, setPages] = useState<SourcePage[]>([]);
  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState('');
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const lock = useRef(false);
  const saveCourse = useCourse(s => s.saveCourse);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1, maxSize: 40 * 1024 * 1024, disabled: busy,
    onDropRejected: () => setError('Selecciona un solo PDF de hasta 40 MB.'),
    onDrop: async files => {
      if (!files[0] || lock.current) return;
      lock.current = true; setBusy(true); setError(''); setPages([]); setSaved(false); setFileName(files[0].name); setPreview(URL.createObjectURL(files[0]));
      try {
        const result = await extractPdfContent(files[0], p => setProgress(`${p.stage} · página ${p.page} de ${p.total}`));
        setPages(result.sourcePages);
      } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo leer el PDF.'); }
      finally { setBusy(false); lock.current = false; }
    },
  });
  const save = () => {
    try {
      const course = analyzeCourse(pages, fileName);
      if (!course.cards.length) { setError('No se encontraron frases utilizables para las tarjetas. Revisa el texto y corrige los errores del OCR.'); return; }
      saveCourse(course); setSaved(true); setError('');
    } catch { setError('No se pudo guardar el curso. Comprueba el espacio y los permisos de almacenamiento del navegador.'); }
  };
  return <section className="space-y-5">
    <h1 className="text-2xl font-bold flex items-center gap-2"><FileText /> Tu curso desde un PDF</h1>
    <p>Importa tu lección, revisa el texto y crea actividades con frases del documento.</p>
    <div {...getRootProps()} className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer bg-white ${isDragActive ? 'border-orange-500' : 'border-orange-200'}`}>
      <input {...getInputProps()} aria-label="Seleccionar archivo PDF" />
      {busy ? <Loader2 className="mx-auto animate-spin" /> : <Upload className="mx-auto mb-3" />}
      <p role="status">{busy ? progress : 'Arrastra un PDF o haz clic para seleccionar'}</p>
      <p className="text-sm text-slate-500 mt-2">Hasta 40 MB y 100 páginas. El PDF se procesa en este dispositivo.</p>
    </div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
    {pages.length > 0 && <div className="space-y-4">
      <h2 className="font-semibold">Revisar: {fileName} · {pages.length} páginas</h2>
      <p className="text-sm">El OCR puede confundir palabras, columnas o dibujos. Corrige el texto antes de crear las tarjetas; las líneas que el OCR marca como dudosas se excluyen de las tarjetas hasta que las corrijas. No se añaden traducciones.</p>
      {pages.map((p, index) => <details key={p.page} className="bg-white rounded-xl border p-4" open={pages.length === 1 || undefined}>
        <summary className="cursor-pointer font-medium">Página {p.page} · {p.method === 'ocr' ? `OCR (confianza ${Math.round(p.confidence || 0)}%)` : 'Texto del PDF'}{!p.text && ' · Sin texto'}</summary>
        <a className="block text-blue-700 underline mt-3" href={`${preview}#page=${p.page}`} target="_blank" rel="noreferrer">Ver página original del PDF</a>
        <label className="block mt-3">Texto de la página {p.page}
          <textarea disabled={saved} className="w-full min-h-64 border rounded-lg p-3 text-slate-800 mt-2" value={p.text} onChange={e => setPages(ps => ps.map((x, i) => i === index ? { ...x, text: e.target.value } : x))} />
        </label>
      </details>)}
      <button className="action" disabled={saved} onClick={save}>{saved ? 'Curso guardado' : 'Crear curso con este texto'}</button>
      {saved && <p role="status" className="text-green-800">Curso listo. Abre Flashcards, Escuchar o Escribir para practicar. Se conserva al recargar este navegador.</p>}
    </div>}
  </section>;
}
