import type { ReactNode } from 'react';
import { BookOpen, GraduationCap, Headphones, Mic, Pencil, Library, Sun, Layers, Accessibility, Upload, ClipboardCheck, CircleAlert, ChartNoAxesCombined } from 'lucide-react';

const practice = [
  {id:'estudiar',label:'Estudiar',icon:BookOpen},
  {id:'flashcards',label:'Flashcards',icon:GraduationCap},
  {id:'escuchar',label:'Escuchar',icon:Headphones},
  {id:'pronunciacion',label:'Pronunciación',icon:Mic},
  {id:'escribir',label:'Escribir',icon:Pencil},
];
const sections = [
  {id:'hoy',label:'Mi clase de hoy',icon:Sun},
  {id:'lecciones',label:'Mis lecciones',icon:Library},
  {id:'basicos',label:'Lecciones básicas',icon:Layers},
  {id:'cuerpo',label:'Partes del cuerpo',icon:Accessibility},
  {id:'estudiar',label:'Importar / contenido',icon:Upload},
  {id:'examen',label:'Examen',icon:ClipboardCheck},
  {id:'errores',label:'Mis errores',icon:CircleAlert},
  {id:'progreso',label:'Mi progreso',icon:ChartNoAxesCombined},
];
interface NavigationProps {activeTab:string; onTabChange:(id:string)=>void}
export function MainNavigation({activeTab,onTabChange}:NavigationProps) {
  return <nav className="section-nav" aria-label="Menú principal">{sections.map(({id,label,icon:Icon})=>
    <button key={id} type="button" className="section-link" aria-pressed={activeTab===id} onClick={()=>onTabChange(id)}><Icon size={21} aria-hidden="true"/><span>{label}</span></button>
  )}</nav>;
}
export function PracticeNavigation({activeTab,onTabChange}:NavigationProps) {
  return <section className="practice-panel"><h2 className="practice-title">¿Cómo quieres practicar?</h2><nav className="practice-nav" aria-label="Herramientas de práctica">{practice.map(({id,label,icon:Icon})=>
    <button key={id} type="button" className="practice-link" aria-pressed={activeTab===id} onClick={()=>onTabChange(id)}><span className="practice-icon"><Icon size={25} aria-hidden="true"/></span><span>{label}</span></button>
  )}</nav></section>;
}
export default function AppShell({children}:{children?:ReactNode;activeTab?:string;onTabChange?:(id:string)=>void}) {
  return <div className="app-shell"><header className="brand-header"><div className="brand-inner"><div className="brand-lockup"><span className="brand-icon"><BookOpen size={28} aria-hidden="true"/></span><div><p className="brand-title">Mi Profesor de Inglés</p><p className="brand-author">por Emmanuel Silis</p></div></div><img src="https://fzfncffjekempswnjilr.supabase.co/storage/v1/object/public/cosmos-code-sites/_assets/RiqbZ1da3yUDpcemQGlxfLkcCEo2/9eff8a36-a664-4c86-b3f2-cc80c2409b51/48f47440409837103a68a399.jpg" alt="Profesor Emmanuel Silis" className="brand-avatar"/></div></header><main className="app-main">{children}</main></div>;
}