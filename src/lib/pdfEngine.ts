import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { createWorker, PSM } from 'tesseract.js';
import { cleanText, type SourcePage } from './course';
import { needsOcr, chooseExtraction, preferSecondOcr } from './extractionQuality';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
async function recognizePage(worker:Awaited<ReturnType<typeof createWorker>>, image:File|HTMLCanvasElement) {
 await worker.setParameters({tessedit_pageseg_mode:PSM.AUTO});
 const first=await worker.recognize(image,{}, {text:true,blocks:true});
 if(first.data.confidence>=85 && first.data.text.length>=200)return first;
 // Illustrated worksheets often have scattered text that automatic layout misses.
 try {
  await worker.setParameters({tessedit_pageseg_mode:PSM.SPARSE_TEXT});
  const second=await worker.recognize(image,{}, {text:true,blocks:true});
  return preferSecondOcr(first.data,second.data)?second:first;
 } finally { await worker.setParameters({tessedit_pageseg_mode:PSM.AUTO}); }
}
export interface ExtractionProgress { page: number; total: number; stage: string }
export async function extractPdfContent(file: File, progress: (p: ExtractionProgress) => void = () => {}, forceOcr = false) {
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
        const operators = await page.getOperatorList();
        const hasImages = operators.fnArray.some(op => [pdfjs.OPS.paintImageXObject, pdfjs.OPS.paintInlineImageXObject, pdfjs.OPS.paintImageMaskXObject].includes(op));
        if (needsOcr(text, hasImages, forceOcr)) {
          progress({ page: i, total: pdf.numPages, stage: 'Reconociendo escaneo (OCR)' });
          worker ??= await createWorker('eng+spa');
          const initial = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: Math.min(3, 3200 / Math.max(initial.width, initial.height)) });
          const canvas = document.createElement('canvas');
          canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
          try {
            await page.render({ canvas, viewport }).promise;
            const result = await recognizePage(worker, canvas);
            uncertainLines = (result.data.blocks || []).flatMap(b => b.paragraphs.flatMap(p => p.lines)).filter(line => line.confidence < 80 || line.words.some(w => /[A-Za-z]{2}/.test(w.text) && w.confidence < 65)).map(line => line.text);
            const selected = chooseExtraction(text, result.data.text, result.data.confidence, forceOcr);
            if (selected === 'ocr') { text = cleanText(result.data.text); confidence = result.data.confidence; method = 'ocr'; }
            else { uncertainLines = undefined; }
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

export async function extractImageContent(file: File) {
  if (file.size > 40 * 1024 * 1024) throw new Error('El límite es 40 MB por imagen.');
  const worker = await createWorker('eng+spa');
  try {
    const result = await recognizePage(worker, file);
    const text = cleanText(result.data.text);
    if (!text) throw new Error('No se encontró texto legible en la foto.');
    const uncertainLines = (result.data.blocks || []).flatMap(b=>b.paragraphs.flatMap(p=>p.lines)).filter(l=>l.confidence<80||l.words.some(w=>/[A-Za-z]{2}/.test(w.text)&&w.confidence<65)).map(l=>l.text);
    return { sourcePages: [{page:1,text,method:'ocr' as const,confidence:result.data.confidence,uncertainLines}] };
  } finally { await worker.terminate(); }
}
