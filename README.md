# Mi Profesor de Inglés 1.4

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

1. Importa hasta 10 PDF, JPG o PNG por lote (40 MB por archivo y hasta 100 páginas por PDF).
2. Revisa el texto por página; «Ver original» permite compararlo con el documento. Corrige errores del OCR.
3. Guarda cada lección revisada. Puedes conservar varias lecciones y elegir el curso activo.
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


## Escritura guiada (1.3)

En Escribir, «Respuestas con estructura» deriva ejercicios de parentesco de las tarjetas existentes y añade los dos ejemplos de cantantes solicitados. No hace falta reimportar los cursos.

- Las consignas indican si se evalúa una relación concreta del PDF o una estructura con nombre libre.
- Acepta he/she + is, las contracciones he's/she's y, para nombres libres, nombre + is an American singer.
- Explica errores de pronombre, concordancia, artículo y posesión. En parentescos admite el posesivo con 's o la construcción the ... of ... .
- «Necesito una pista» muestra la estructura antes de responder. Los intentos se guardan en Mi progreso y Mis errores.
- «Completar texto del PDF» conserva el modo de respuesta literal, ahora con pista de letra inicial, longitud y frase de referencia.

La evaluación es determinista y limitada a esos patrones. No comprueba hechos sobre las personas ni reconoce todas las formas gramaticales válidas, paráfrasis o traducciones. Los ejercicios de cantantes se identifican como práctica adicional, no como contenido extraído del PDF. Para una corrección lingüística general haría falta integrar un servicio de modelos mediante un backend que proteja su clave; esta versión no lo necesita ni envía respuestas a uno.


## Repaso combinado y nuevas estructuras (1.4)

- Estudiar permite cargar varios PDF/fotos a la vez. Se procesan secuencialmente; el error de un archivo no descarta los demás. Revisa y guarda cada lección.
- Abre «Combinar lecciones y elegir páginas», selecciona las páginas necesarias y guarda un repaso con nombre. Se conserva como una instantánea independiente de los cursos originales, con referencias al archivo y página de origen. Su progreso es independiente.
- En Escribir, «Tema para repasar» permite elegir Nacimiento (was/were), Origen (is/are from), Familia y posesivos o Identidad. Nacimiento y origen aparecen si sus estructuras se detectan en las páginas seleccionadas.
- «Cambiar nombres de los ejemplos» recorre tres conjuntos de nombres ficticios para los ejercicios de nacimiento y origen. No es generación ilimitada con IA.
- Los ejercicios nuevos no copian las respuestas manuscritas de las fotos. Se basan en reglas: the teacher es singular (was); dos personas usan were; Where were you born? se responde con I was born in… .
- Las consignas de pregunta conservan el sujeto indicado. Las respuestas de lugar libre aceptan otro país o ciudad dentro de la estructura solicitada; no verifican datos geográficos ni biográficos.
- Las fotos y los PDF originales se usan temporalmente para OCR y revisión. Se guarda su texto y el curso en el navegador; no se almacenan los archivos binarios como respaldo. Conserva tus originales.

Validación local: 15 pruebas automatizadas, TypeScript y build de producción. Probada carga múltiple con las dos fotos de ejemplo, creación de repaso con páginas de las lecciones 9/10, persistencia tras recarga, filtros por tema y corrección de was/were en el navegador.
