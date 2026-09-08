import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { createWorker } from 'tesseract.js';
import { cleanText, usableText, type SourcePage } from './course';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
export interface ExtractionProgress { page: number; total: number; stage: string }
export async function extractPdfContent(file: File, progress: (p: ExtractionProgress) => void = () => {}) {
  if (file.size > 40 * 1024 * 1024) throw new Error('El límite es 40 MB. Divide el documento para continuar.');
  const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
  let worker: Awaited<ReturnType<typeof createWorker>> | undefined;
  const sourcePages: SourcePage[] = [];
  try {
    const pdf = await task.promise;
    if (pdf.numPages > 100) throw new Error('El límite es 100 páginas por documento.');
    for (let i = 1; i <= pdf.numPages; i++) {
      progress({ page: i, total: pdf.numPages, stage: 'Leyendo texto' });
      const page = await pdf.getPage(i);
      try {
        const content = await page.getTextContent();
        let raw = '', lastY: number | undefined;
        for (const item of content.items) {
          if (!('str' in item)) continue;
          const y = item.transform[5];
          if (lastY !== undefined && Math.abs(y - lastY) > 3) raw += '\n';
          raw += item.str + (item.hasEOL ? '\n' : ' ');
          lastY = y;
        }
        let text = cleanText(raw);
        let method: 'text' | 'ocr' = 'text';
        let confidence: number | undefined;
        let uncertainLines: string[] | undefined;
        if (!usableText(text)) {
          progress({ page: i, total: pdf.numPages, stage: 'Reconociendo escaneo (OCR)' });
          worker ??= await createWorker('eng+spa');
          const initial = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: Math.min(2.5, 2800 / Math.max(initial.width, initial.height)) });
          const canvas = document.createElement('canvas');
          canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
          try {
            await page.render({ canvas, viewport }).promise;
            const result = await worker.recognize(canvas, {}, { text: true, blocks: true });
            uncertainLines = (result.data.blocks || []).flatMap(b => b.paragraphs.flatMap(p => p.lines)).filter(line => line.confidence < 80 || line.words.some(w => /[A-Za-z]{2}/.test(w.text) && w.confidence < 65)).map(line => line.text);
            text = cleanText(result.data.text); confidence = result.data.confidence; method = 'ocr';
          } finally { canvas.width = 0; canvas.height = 0; }
        }
        sourcePages.push({ page: i, text, method, confidence, uncertainLines });
      } finally { page.cleanup(); }
    }
    if (!sourcePages.some(p => /\p{L}/u.test(p.text))) throw new Error('No se encontró texto legible. Prueba con un escaneo más nítido.');
    return { text: sourcePages.map(p => p.text).join('\n\n'), isScanned: sourcePages.some(p => p.method === 'ocr'), pages: pdf.numPages, sourcePages };
  } finally {
    try { await worker?.terminate(); } finally { await task.destroy(); }
  }
}
