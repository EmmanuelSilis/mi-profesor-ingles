import type { Course } from './course';
export interface BasicQuestion { id:string; page:number; topic:string; prompt:string; answers:string[]; explanation:string; example:string }
export interface BasicLesson { id:string; title:string; summary:string; notes:string[]; examples:string[]; questions:BasicQuestion[] }
type QuestionInput=[string,string[],string,string];
const lesson=(id:string,title:string,summary:string,notes:string[],examples:string[],questions:QuestionInput[]):BasicLesson=>({id,title,summary,notes,examples,questions:questions.map(([prompt,answers,explanation,example],i)=>({id:`basic-${id}-${i}`,page:1,topic:title,prompt,answers,explanation,example}))});
export const BASIC_LESSONS:BasicLesson[]=[
 lesson('to-be','Verbo to be: am, is, are','Ser o estar: afirmaciones, negaciones y preguntas.',[
 'I am; he/she/it is; you/we/they are. You usa are tanto para una persona como para varias.',
 'Negación: coloca not después del verbo. I am not tired. She is not tired. They are not tired.',
 'Pregunta: invierte verbo y sujeto. Are you ready? Is she a teacher?',
 "Contracciones: I am → I'm; he is → he's; she is → she's; it is → it's; you are → you're; we are → we're; they are → they're."
 ],['I am a student. — Soy estudiante.','She is happy. — Ella está feliz.','They are at home. — Están en casa.','Are you ready? — ¿Estás listo/a?'],[
 ['Completa solo el verbo: I ___ a student.',['am'],'Con I se usa am.','I am a student.'],
 ['Completa solo el verbo: She ___ happy.',['is'],'Con she se usa is.','She is happy.'],
 ['Completa solo el verbo: You ___ ready.',['are'],'You siempre usa are en presente.','You are ready.'],
 ['Escribe en negativo: He is tired.',['He is not tired.',"He isn't tired.","He's not tired."],'Not va después de is.','He is not tired.'],
 ['Convierte en pregunta: They are students.',['Are they students?'],'En preguntas, are va antes de they.','Are they students?'],
 ['Completa: We ___ friends.',['are'],'Con we se usa are.','We are friends.']
 ]),
 lesson('present','Presente simple','Hábitos y hechos: verbo, tercera persona y do/does.',[
 'I/you/we/they usan el verbo base: I work. He/she/it suelen añadir -s: She works.',
 'Algunos verbos añaden -es: watch → watches, go → goes. Consonante + y cambia a -ies: study → studies. Have cambia a has.',
 "Negación: do not / don't + verbo base; con he/she/it, does not / doesn't + verbo base. She doesn't work.",
 'Pregunta: Do you work? Does he work? Después de does, el verbo no lleva -s.',
 'El presente continuo describe una acción en curso: I am studying now. No es la misma estructura que el presente simple I study every day.',
 'To be forma sus preguntas sin do/does: Are you a student?'
 ],['I study every day. — Estudio todos los días.','She works in a school. — Ella trabaja en una escuela.','Does he like coffee? — ¿Le gusta el café?'],[
 ['Completa con work o works: She ___ in a school.',['works'],'She lleva la forma de tercera persona: works.','She works in a school.'],
 ['Completa usando study: He ___ every day.',['studies'],'Study cambia y por ies con he/she/it.','He studies every day.'],
 ['Completa con Do o Does: ___ you like tea?',['Do'],'Con you se usa do.','Do you like tea?'],
 ['Completa usando like: Does she ___ coffee?',['like'],'Después de does se usa el verbo base, sin -s.','Does she like coffee?'],
 ['Escribe en negativo: He works here.',['He does not work here.',"He doesn't work here."],'Usa does not + work, no works.','He does not work here.'],
 ['Completa con am, is o are: I ___ studying now.',['am'],'La acción en curso usa am/is/are + verbo en -ing. Con I corresponde am.','I am studying now.']
 ]),
 lesson('greetings','Greetings: saludos','Saludar, despedirse y responder con cortesía.',[
 'Hello y hi son saludos; hi es más informal. Good morning: por la mañana; good afternoon: por la tarde; good evening: al saludar por la noche.',
 'Good night se usa al despedirse por la noche o antes de dormir; no es el saludo habitual al llegar.',
 'How are you? pregunta cómo estás. Una respuesta posible es I am fine, thank you. And you?',
 'Nice to meet you se usa al conocer a alguien. Goodbye y bye son despedidas.'
 ],['Good morning! — ¡Buenos días!','How are you? — ¿Cómo estás?','Nice to meet you. — Mucho gusto.'],[
 ['Escribe «Buenos días» en inglés.',['Good morning'],'Por la mañana se saluda con good morning.','Good morning!'],
 ['Al llegar a una reunión por la noche, completa: Good ___.',['evening'],'Al llegar por la noche se usa good evening.','Good evening!'],
 ['Antes de dormir, completa: Good ___.',['night'],'Good night se usa al despedirse o irse a dormir.','Good night!'],
 ['Completa la pregunta: How ___ you?',['are'],'Con you se usa are.','How are you?'],
 ['Completa: Nice to ___ you.',['meet'],'Nice to meet you se dice al conocer a alguien.','Nice to meet you.'],
 ['Escribe la despedida informal «adiós» de una palabra.',['Bye'],'Bye es una despedida informal.','Bye!']
 ]),
 lesson('introductions','Introduce yourself: presentarte','Nombre, edad, origen y ocupación.',[
 'Para tu nombre: My name is Ana o I am Ana. Puedes sustituir Ana por tu nombre.',
 'Para la edad: I am twenty years old. En inglés se usa to be, no have, para decir la edad.',
 'Para el origen: I am from Mexico. Para la ocupación: I am a student.',
 'A/an acompañan ocupaciones singulares: a teacher, an engineer. Se elige por el sonido que sigue, no solo por la letra.'
 ],['My name is Ana. — Me llamo Ana.','I am twenty years old. — Tengo veinte años.','I am from Mexico. — Soy de México.','I am an engineer. — Soy ingeniero/a.'],[
 ['Completa: My name ___ Ana.',['is'],'El sujeto my name es singular: is.','My name is Ana.'],
 ['Completa con am o have: I ___ twenty years old.',['am'],'La edad se expresa con to be.','I am twenty years old.'],
 ['Completa la preposición: I am ___ Mexico.',['from'],'From indica origen.','I am from Mexico.'],
 ['Completa con a o an: I am ___ engineer.',['an'],'Engineer comienza con sonido vocálico: an.','I am an engineer.'],
 ['Completa con a o an: I am ___ student.',['a'],'Student comienza con sonido consonántico: a.','I am a student.'],
 ['Escribe en pregunta: Your name is Ana.',['Is your name Ana?'],'Is pasa delante del sujeto your name.','Is your name Ana?']
 ]),
 lesson('demonstratives','This, these, that, those','Distinguir singular/plural y cerca/lejos.',[
 'This: una cosa cercana. These: varias cosas cercanas.',
 'That: una cosa lejana. Those: varias cosas lejanas.',
 'Singular: this/that is. Plural: these/those are.',
 'Antes de un sustantivo: this book, these books. El sustantivo también cambia de número.'
 ],['This is a book. — Este es un libro (cerca).','These are books. — Estos son libros (cerca).','That is a car. — Ese/aquel es un automóvil (lejos).','Those are cars. — Esos/aquellos son automóviles (lejos).'],[
 ['Un libro cerca: ___ is a book.',['This'],'This es singular y cercano.','This is a book.'],
 ['Varios libros cerca: ___ are books.',['These'],'These es plural y cercano.','These are books.'],
 ['Un automóvil lejos: ___ is a car.',['That'],'That es singular y lejano.','That is a car.'],
 ['Varios automóviles lejos: ___ are cars.',['Those'],'Those es plural y lejano.','Those are cars.'],
 ['Completa: These ___ my shoes.',['are'],'These es plural: are.','These are my shoes.'],
 ['Convierte al plural: This is a book.',['These are books.'],'Cambian this → these, is → are y book → books. Se quita a.','These are books.']
 ]),
 lesson('numbers','Numbers: números','Números del 0 al 100 y algunos ordinales.',[
 '0–10: zero, one, two, three, four, five, six, seven, eight, nine, ten.',
 '11–19: eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen.',
 'Decenas: twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety. 100: one hundred.',
 'Compuestos: twenty-one, thirty-two. Observa la diferencia entre thirteen (13) y thirty (30), y entre fifteen (15) y fifty (50).',
 'Ordinales indican posición: first (1st), second (2nd), third (3rd), fourth (4th), fifth (5th), tenth (10th).'
 ],['I am twenty-one years old. — Tengo veintiún años.','There are thirty students. — Hay treinta estudiantes.','This is my first lesson. — Esta es mi primera lección.'],[
 ['Escribe 13 con letras en inglés.',['thirteen'],'13 termina en -teen: thirteen.','The number is thirteen.'],
 ['Escribe 30 con letras en inglés.',['thirty'],'30 es thirty, no thirteen.','The number is thirty.'],
 ['Escribe 40 con letras en inglés.',['forty'],'Forty se escribe sin u.','The number is forty.'],
 ['Escribe 21 con letras en inglés.',['twenty-one','twenty one'],'La escritura estándar une twenty y one con guion.','The number is twenty-one.'],
 ['Escribe 100 con letras en inglés.',['one hundred','a hundred'],'100 es one hundred; también se dice a hundred.','The number is one hundred.'],
 ['Escribe el ordinal de 3 (tercero).',['third'],'El ordinal de three es third.','This is the third lesson.']
 ]),
 lesson('opposites','Adjectives and opposites','Adjetivos, posición y opuestos comunes.',[
 'El adjetivo suele ir antes del sustantivo: a big house. También puede ir después de to be: The house is big.',
 'Los adjetivos no se pluralizan: two big houses, no two bigs houses.',
 'Opuestos: big/small (grande/pequeño), hot/cold (caliente/frío), happy/sad (feliz/triste), old/new (viejo/nuevo para cosas), young/old (joven/mayor para personas).',
 'Otros pares: fast/slow, tall/short (altura), long/short (longitud), easy/difficult, clean/dirty. El contexto determina el significado.'
 ],['The water is cold. — El agua está fría.','She has two small books. — Ella tiene dos libros pequeños.','This exercise is easy. — Este ejercicio es fácil.'],[
 ['Escribe el opuesto de hot.',['cold'],'Hot y cold significan caliente y frío.','The water is cold.'],
 ['Escribe el opuesto de big.',['small','little'],'Small es el opuesto habitual de big al hablar de tamaño.','This is a small house.'],
 ['Completa usando big: They have two ___ houses.',['big'],'El adjetivo big no lleva -s aunque houses sea plural.','They have two big houses.'],
 ['Ordena: house / a / small',['a small house'],'El adjetivo small va antes de house.','This is a small house.'],
 ['Escribe el opuesto de happy.',['sad','unhappy'],'Sad o unhappy expresan un estado opuesto a happy.','He is sad.'],
 ['Para la altura de una persona, escribe el opuesto de tall.',['short'],'Para altura se contrastan tall y short.','She is short.']
 ]),
 lesson('questions','Who, what y which','Elegir la palabra interrogativa según lo que preguntas.',[
 'Who pregunta por personas o identidad: Who is your teacher? Who puede preguntar tanto por el sujeto como por otra persona de la oración.',
 'What suele pedir información o una categoría sin limitar opciones: What is your name? What do you do?',
 'Which pide elegir entre opciones conocidas o limitadas: Which color do you prefer, blue or green? También sirve para personas: Which student is your brother?',
 'Con to be: palabra interrogativa + am/is/are + sujeto. Con otros verbos, muchas preguntas usan do/does: What do you like?',
 'Cuando who es el sujeto no se añade do/does en la pregunta afirmativa habitual: Who lives here? La diferencia entre what y which depende del contexto.'
 ],['Who is your teacher? — ¿Quién es tu profesor/a?','What is your name? — ¿Cómo te llamas?','Which bag is yours, the red one or the blue one? — ¿Cuál bolsa es tuya, la roja o la azul?'],[
 ['Elige who, what o which: ___ is your name?',['What'],'What is your name? pide el nombre.','What is your name?'],
 ['Elige who, what o which: ___ is that woman?',['Who'],'Who pregunta por la identidad de una persona.','Who is that woman?'],
 ['Elige la opción que destaca una selección limitada: ___ color do you prefer, blue or green?',['Which'],'Which destaca la elección entre las dos opciones indicadas. What puede usarse en otros contextos; aquí se practica la selección limitada.','Which color do you prefer, blue or green?'],
 ['Entre tres alumnos conocidos: ___ student is your brother? Usa la palabra para elegir.',['Which'],'Which también se usa para escoger entre personas.','Which student is your brother?'],
 ['Completa con do o does: What ___ she do?',['does'],'Con she se usa does; el segundo do es el verbo principal.','What does she do?'],
 ['Ordena: your teacher / who / is',['Who is your teacher?'],'Con to be se usa Who + is + your teacher.','Who is your teacher?']
 ])
];
export function basicCourse(lesson:BasicLesson):Course{
 return {id:`builtin-${lesson.id}`,builtin:lesson.id,fileName:`Básico · ${lesson.title}`,createdAt:'2026-09-08T00:00:00.000Z',pages:[{page:1,method:'text',sourceName:`Biblioteca básica · ${lesson.title}`,text:[...lesson.notes,...lesson.examples].join('\n')}],units:[{page:1,title:lesson.title,topics:[lesson.summary],vocabulary:[],grammar:lesson.notes}],basicQuestions:lesson.questions,cards:lesson.questions.map(q=>({id:q.id,type:'completar_oracion',page:1,front:q.prompt,back:q.answers[0],source:q.example,hint:`Biblioteca básica · ${lesson.title}`}))};
}
