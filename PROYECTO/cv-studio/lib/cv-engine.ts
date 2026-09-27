import { CV, Experience, Education, Certification, Project, Recognition, Language } from "@/types/cv";
import { PlanId } from "@/config/payment";

export const PLAN_RANK: Record<PlanId, number> = { free: 0, standard: 1, premium: 2 };

const ACCENT_FIXES: Array<[RegExp, string]> = [
  [/\b(atencion)\b/gi,"atención"],[/\b(organizacion)\b/gi,"organización"],[/\b(comunicacion)\b/gi,"comunicación"],
  [/\b(administracion)\b/gi,"administración"],[/\b(tecnico)\b/gi,"técnico"],[/\b(tecnica)\b/gi,"técnica"],
  [/\b(tecnologia)\b/gi,"tecnología"],[/\b(tecnologias)\b/gi,"tecnologías"],[/\b(gestion)\b/gi,"gestión"],
  [/\b(planificacion)\b/gi,"planificación"],[/\b(resolucion)\b/gi,"resolución"],[/\b(diseno)\b/gi,"diseño"],
  [/\b(practica)\b/gi,"práctica"],[/\b(practicas)\b/gi,"prácticas"],[/\b(certificacion)\b/gi,"certificación"],
  [/\b(certificaciones)\b/gi,"certificaciones"],[/\b(numero)\b/gi,"número"],[/\b(tecnologicas)\b/gi,"tecnológicas"],
  [/\b(tambien)\b/gi,"también"],[/\b(ademas)\b/gi,"además"],
];

function sentenceCase(s:string){
  let t=(s||"").replace(/\s+/g," ").trim();
  for(const [r,v] of ACCENT_FIXES) t=t.replace(r,v);
  t=t.replace(/\s+([,.;:!?])/g,"$1");
  t=t.replace(/([.!?]\s+)([a-záéíóúñ])/g,(_,p,c)=>p+c.toUpperCase());
  if(t) t=t.charAt(0).toUpperCase()+t.slice(1);
  return t;
}

export function normalizeText(s:string){ return sentenceCase(s); }
export function keyOf(s:string){ return sentenceCase(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(); }
export function uniqueStrings(items:string[], max=999){
  const seen=new Set<string>(); const out:string[]=[];
  for(const item of items){ const clean=sentenceCase(item); const k=keyOf(clean); if(clean && !seen.has(k)){seen.add(k);out.push(clean);} if(out.length>=max)break; }
  return out;
}

function dedupeBy<T extends {id:string}>(items:T[], key:(x:T)=>string){
  const seen=new Set<string>();
  return items.filter(item=>{const k=key(item);if(!k||seen.has(k))return false;seen.add(k);return true;});
}

export function normalizeCV(cv:CV):CV{
  const skills=uniqueStrings(cv.skills);
  const skillKeys=new Set(skills.map(keyOf));
  const techSkills=uniqueStrings(cv.techSkills).filter(x=>!skillKeys.has(keyOf(x)));
  const experiences:Experience[]=cv.experiences.map(e=>({...e,empresa:sentenceCase(e.empresa),puesto:sentenceCase(e.puesto),descripcion:sentenceCase(e.descripcion),logros:uniqueStrings(e.logros)})).filter(e=>e.empresa||e.puesto||e.descripcion||e.logros.length);
  const education:Education[]=cv.education.map(e=>({...e,institucion:sentenceCase(e.institucion),programa:sentenceCase(e.programa),grado:sentenceCase(e.grado)})).filter(e=>e.institucion||e.programa||e.grado);
  const certifications:Certification[]=dedupeBy(cv.certifications.map(c=>({...c,nombre:sentenceCase(c.nombre),institucion:sentenceCase(c.institucion)})),c=>`${keyOf(c.nombre)}|${keyOf(c.institucion)}|${c.anio}`);
  const projects:Project[]=dedupeBy(cv.projects.map(p=>({...p,nombre:sentenceCase(p.nombre),descripcion:sentenceCase(p.descripcion),herramientas:sentenceCase(p.herramientas)})),p=>keyOf(p.nombre));
  const recognitions:Recognition[]=dedupeBy(cv.recognitions.map(r=>({...r,nombre:sentenceCase(r.nombre),institucion:sentenceCase(r.institucion),detalle:sentenceCase(r.detalle||"") })),r=>`${keyOf(r.nombre)}|${keyOf(r.institucion)}|${r.anio}`);
  const languages:Language[]=dedupeBy(cv.languages.map(l=>({...l,idioma:sentenceCase(l.idioma)})),l=>keyOf(l.idioma));
  return {...cv,perfil:sentenceCase(cv.perfil),skills,techSkills,experiences,education,certifications,projects,recognitions,languages,personalData:{...cv.personalData,nombres:sentenceCase(cv.personalData.nombres),apellidos:sentenceCase(cv.personalData.apellidos),puestoObjetivo:sentenceCase(cv.personalData.puestoObjetivo),ciudad:sentenceCase(cv.personalData.ciudad)}};
}

/** Removes only features that are no longer included after a downgrade. */
export function enforcePlanEntitlements(cv:CV,nextPlan:PlanId):CV{
  const rank=PLAN_RANK[nextPlan];
  let next={...cv,planSeleccionado:nextPlan};
  if(rank<2){
    next={...next,fotoDataUrl:null,recognitions:[],designId:"",template:"",autoDesign:true};
  }
  if(rank<1){
    next={...next,projects:[],techSkills:[],designId:"",template:"",autoDesign:true};
  }
  return next;
}

export function minimumGuidance(cv:CV){
  const tips:string[]=[];
  if(cv.perfil.trim().length<90)tips.push("Perfil: 80–120 palabras breves y específicas; explica especialidad, experiencia y valor que aportas.");
  if(cv.skills.length<6)tips.push(`Habilidades: agrega al menos ${6-cv.skills.length} más (ideal: 6–10). Evita repetir herramientas tecnológicas.`);
  if(cv.experiences.length===0 && cv.projects.length===0)tips.push("Si no tienes experiencia, agrega 1–3 proyectos, prácticas o logros propios relevantes.");
  if(cv.experiences.length>0 && cv.experiences.some(e=>!e.logros.some(Boolean)))tips.push("Experiencia: añade 1–3 logros o resultados por puesto cuando sea posible.");
  if(cv.techSkills.length===0)tips.push("Herramientas tecnológicas: opcional; 4–8 herramientas reales pueden reforzar perfiles técnicos.");
  if(cv.recognitions.length===0 && cv.planSeleccionado==="premium")tips.push("Reconocimientos: opcional; agrega 1–3 solo si son reales y relevantes.");
  if(cv.languages.length===0)tips.push("Idiomas: agrega los idiomas que realmente domines y su nivel.");
  return tips;
}
