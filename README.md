# Mi Profesor de Inglés 1.2

Aplicación React para estudiar el contenido de PDF propios. No necesita claves de API para esta versión.

## Iniciar

Necesitas Node.js 22.18 o posterior.

```powershell
npm ci
npm run dev
```

Abre la dirección local indicada por Vite. Para comprobar el proyecto:

```powershell
npm test
npm run typecheck
npm run build
```

## Uso

1. Importa un PDF (hasta 40 MB y 100 páginas).
2. Revisa el texto por página; el enlace «Ver página original» permite compararlo con el PDF. Corrige errores del OCR.
3. Crea el curso. Puedes conservar varias lecciones y elegir el curso activo.
4. Practica con Flashcards, Escuchar, Pronunciación, Escribir o Examen.
5. Consulta tus respuestas en Mi progreso y Mis errores.

El analizador conserva encabezados reconocibles, extrae palabras del texto y genera tarjetas para completar frases. Cada respuesta y frase de referencia proviene de una página del documento. No resuelve por su cuenta las preguntas abiertas del libro ni crea traducciones o explicaciones gramaticales nuevas.

## Procesamiento y límites

- PDF.js usa su worker empaquetado de la misma versión, sin mezclar versiones de CDN.
- La calidad de texto se evalúa página a página: una capa dañada o vacía activa OCR en inglés y español.
- El OCR se ejecuta en el navegador; puede descargar modelos y recursos de Tesseract la primera vez. No se suben los PDF a un servidor.
- El OCR no es perfecto, especialmente con ilustraciones, escritura decorativa, columnas y tablas. Las líneas con baja confianza quedan fuera de las tarjetas; revisa también las demás antes de estudiar. No se garantiza reconstruir tablas ni recuperar títulos incrustados en dibujos.
- Los cursos y hasta 5.000 respuestas por curso se guardan en localStorage del navegador. No hay cuenta, sincronización ni respaldo remoto. Borrar los datos del navegador borra ese progreso.
- Las voces disponibles dependen del sistema. El reconocimiento de voz compara palabras transcritas y no evalúa fonética ni acento. El navegador puede usar su proveedor externo para reconocer audio al activar el micrófono.
- El examen usa hasta diez frases del curso. Las respuestas escritas se comparan ignorando mayúsculas, espacios repetidos y puntuación básica; no se califican sinónimos.
- Los componentes de demostración originales no conectados se conservan en el código como referencia; no aparecen en el flujo de estudio.

## Arquitectura

- `src/lib/pdfEngine.ts`: extracción y OCR por página, progreso y liberación de recursos.
- `src/lib/course.ts`: limpieza conservadora, estructura, vocabulario y tarjetas con procedencia.
- `src/lib/courseStore.ts`: cursos y respuestas persistentes.
- `src/components/PdfImport.tsx`: carga, revisión y creación del curso.
- `src/components/Flashcards.tsx`: tarjetas del curso activo y repaso.
- `src/components/CoursePractice.tsx`: escucha, escritura, voz, examen, errores y progreso reales.
- `src/App.tsx`: navegación y conexión de pantallas.

## Publicación

El resultado de `npm run build` está en `dist`. Se puede servir como sitio estático. No requiere Supabase ni variables de entorno. La configuración de Vercel incluida usa ese directorio. Los PDF personales y resultados de OCR de las pruebas no forman parte del código que se publica.
