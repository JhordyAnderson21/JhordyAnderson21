import { CV } from "@/types/cv";
import { Plantilla,plantillasParaPlan,recommendedTemplate } from "@/lib/templates/catalog";
import { minimumGuidance,keyOf,normalizeCV } from "@/lib/cv-engine";

export type CVAnalysis={score:number;pageCount:1|2;density:"ligera"|"equilibrada"|"alta";strengths:string[];warnings:string[];suggestions:string[];recommendedDesign:Plantilla;contentQuality:"inicial"|"sólida"|"lista"};
function text(cv:CV){return [cv.perfil,...cv.skills,...cv.techSkills,...cv.experiences.flatMap(e=>[e.puesto,e.empresa,e.descripcion,...e.logros]),...cv.projects.map(p=>`${p.nombre} ${p.descripcion} ${p.herramientas}`),...cv.certifications.map(c=>`${c.nombre} ${c.institucion}`)].join(" ");}
export function analyzeCV(raw:CV):CVAnalysis{
 const cv=normalizeCV(raw);const d=cv.personalData;const chars=text(cv).length+cv.education.length*110+cv.certifications.length*90+cv.languages.length*50;
 const pageCount=(chars>3400||cv.experiences.length>=5||cv.projects.length>=4)?2:1;const density=chars<1000?"ligera":chars<2850?"equilibrada":"alta";
 const strengths:string[]=[];const warnings:string[]=[];const suggestions:string[]=[];
 if(d.nombres&&d.apellidos&&d.correo&&d.puestoObjetivo)strengths.push("Información esencial completa");else warnings.push("Faltan datos personales esenciales.");
 if(cv.perfil.length>=90&&cv.perfil.length<=850)strengths.push("Perfil profesional con longitud útil");else suggestions.push("Escribe un perfil de 80–120 palabras: especialidad, experiencia y propuesta de valor.");
 if(cv.experiences.length)strengths.push(`${cv.experiences.length} experiencia${cv.experiences.length>1?"s":""} registrada${cv.experiences.length>1?"s":""}`);else suggestions.push("Si aún no tienes experiencia, usa proyectos, prácticas, voluntariado o logros propios.");
 if(cv.skills.length>=6)strengths.push("Habilidades suficientes y diferenciadas");else suggestions.push(`Agrega al menos ${6-cv.skills.length} habilidad${6-cv.skills.length===1?"":"es"} más; idealmente 6–10.`);
 if(cv.experiences.some(e=>e.logros.some(x=>/\d/.test(x))))strengths.push("Incluye resultados cuantificables");else if(cv.experiences.length)suggestions.push("Cuando sea real, convierte tareas en logros con resultados, volumen, tiempo o mejoras.");
 if(cv.techSkills.length&&cv.skills.some(s=>cv.techSkills.some(t=>keyOf(s)===keyOf(t))))warnings.push("Hay habilidades repetidas entre Habilidades y Herramientas tecnológicas.");
 if(!d.linkedin&&!d.portafolio)suggestions.push("Considera LinkedIn o portafolio si tu profesión lo justifica.");
 suggestions.push(...minimumGuidance(cv).filter(x=>!suggestions.includes(x)));
 const plan=cv.planSeleccionado||"free";const recommended=recommendedTemplate(cv.targetRole||d.puestoObjetivo,cv.industry,plan);
 const rawScore=35+(d.nombres&&d.apellidos?8:0)+(d.correo?7:0)+(d.puestoObjetivo?7:0)+(cv.perfil.length>=90?10:0)+(cv.experiences.length?10:0)+(cv.education.length?6:0)+(cv.skills.length>=6?8:0)+(cv.languages.length?3:0)+(cv.projects.length?4:0)+(cv.certifications.length?2:0);
 const score=Math.min(100,rawScore);const contentQuality=score>=88?"lista":score>=65?"sólida":"inicial";
 return {score,pageCount,density,strengths,warnings,suggestions:Array.from(new Set(suggestions)).slice(0,8),recommendedDesign:recommended,contentQuality};
}
export function autoDesign(cv:CV){return analyzeCV(cv).recommendedDesign.id;}
export function smartSuggestions(cv:CV){const role=(cv.targetRole||cv.personalData.puestoObjetivo).toLowerCase();const common=["Comunicación efectiva","Trabajo en equipo","Organización","Resolución de problemas"];if(/program|software|web|data|ingenier|tecnolog/.test(role))return [...common,"Pensamiento analítico","Gestión de proyectos"];if(/ventas|comercial|marketing/.test(role))return [...common,"Orientación al cliente","Negociación"];if(/administr|contab|finan/.test(role))return [...common,"Análisis de información","Atención al detalle"];return common;}
