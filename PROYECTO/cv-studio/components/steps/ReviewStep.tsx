"use client";
import {useMemo,useState} from "react";
import {PremiumAssistant} from "@/components/PremiumAssistant";
import dynamic from "next/dynamic";
import {useCV} from "@/context/CVContext";
import {analyzeCV} from "@/lib/intelligence";
import {obtenerPlantilla} from "@/lib/templates/catalog";
import {CVDocument} from "@/lib/pdf/CVDocument";
import {StepId} from "@/types/cv";
import {minimumGuidance,normalizeCV} from "@/lib/cv-engine";
const PDFDownloadLink=dynamic(()=>import("@react-pdf/renderer").then(m=>m.PDFDownloadLink),{ssr:false});
export function ReviewStep({onNext,onBack,onEditStep}:{onNext:()=>void;onBack:()=>void;onEditStep:(id:StepId)=>void}){
 const {cv,setTemplate,setDesign}=useCV();
 const analysis=useMemo(()=>analyzeCV(cv),[cv]);
 const current=obtenerPlantilla(cv.template); const recommended=analysis.recommendedDesign;
 const [open,setOpen]=useState<string|null>(null);
 const fileName=`CV_${`${cv.personalData.nombres}_${cv.personalData.apellidos}`.trim().replace(/\s+/g,"_")||"Profesional"}.pdf`;
 const ready=analysis.score>=65&&Boolean(cv.personalData.nombres&&cv.personalData.apellidos&&cv.personalData.correo&&cv.personalData.puestoObjetivo);
 const guidance=minimumGuidance(cv);
 function useRecommended(){setTemplate(recommended.id);setDesign(recommended.id,true)}
 const items=[
  ...(analysis.warnings.map(x=>({tipo:"Atención",texto:x,detalle:x.includes("repetidas")?"Separamos habilidades de herramientas para evitar duplicar la misma tecnología.":"Puedes corregir este punto antes de continuar."}))),
  ...(analysis.suggestions.map(x=>({tipo:"Sugerencia",texto:x,detalle:"Este consejo busca mejorar la presentación sin inventar información."}))),
  ...(guidance.map(x=>({tipo:"Guía",texto:x,detalle:"Es una recomendación opcional basada en la cantidad y tipo de contenido."})))
 ].filter((x,i,a)=>a.findIndex(y=>y.texto===x.texto)===i).slice(0,9);
 return <div>
  <div className="mb-5">{cv.planSeleccionado==="premium"&&<PremiumAssistant cv={cv}/>}</div><div className="rounded-[2rem] border border-[#dce6f1] bg-gradient-to-br from-white via-white to-[#f6f9fc] p-6 shadow-sm sm:p-8">
   <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="eyebrow text-accent">Control final · asistencia</p><h2 className="mt-1 text-3xl font-black text-primary sm:text-4xl">Revisión inteligente</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Aquí no mostramos el PDF final. Te enseñamos únicamente los fragmentos y puntos que conviene revisar antes de pasar al proceso de pago.</p></div><div className="rounded-2xl border border-[#e0c98d]/50 bg-[#fbf8f0] px-5 py-4"><p className="text-[10px] font-black uppercase tracking-widest text-[#7a5a24]">Estado</p><p className="mt-1 text-lg font-black text-primary">{analysis.contentQuality==="lista"?"Listo para continuar":analysis.contentQuality==="sólida"?"Bien encaminado":"Necesita algunos ajustes"}</p></div></div>
   <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
    <section className="rounded-3xl border border-border bg-white p-5"><div className="flex items-center justify-between"><h3 className="font-black text-primary">Puntos a revisar</h3><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-accent">{items.length} sugerencias</span></div><div className="mt-4 space-y-2">{items.length?items.map((item,i)=><button key={i} type="button" onClick={()=>setOpen(open===`${i}`?null:`${i}`)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-200 hover:bg-white"><div className="flex items-start justify-between gap-4"><div><span className="text-[9px] font-black uppercase tracking-widest text-accent">{item.tipo}</span><p className="mt-1 text-sm font-bold text-primary">{item.texto}</p></div><span className="text-muted">{open===`${i}`?"−":"+"}</span></div>{open===`${i}`&&<div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-muted">{item.detalle}</div>}</button>):<div className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">✓ No encontramos observaciones importantes.</div>}</div></section>
    <section className="rounded-3xl border border-[#e0c98d]/50 bg-[#fbf8f0] p-5"><p className="eyebrow text-[#7a5a24]">Diseño recomendado</p><h3 className="mt-1 text-xl font-black text-primary">{recommended.nombre}</h3><p className="mt-2 text-sm leading-6 text-muted">{recommended.descripcion}</p><div className="mt-4 rounded-2xl bg-white p-4"><p className="text-[10px] font-black uppercase tracking-widest text-accent">Tu selección actual</p><p className="mt-1 text-sm font-black text-primary">{current.nombre}</p><p className="mt-1 text-xs text-muted">{cv.planSeleccionado?.toUpperCase()} · {current.categoria}</p></div>{recommended.id!==current.id&&<button onClick={useRecommended} className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-white">Aplicar recomendación</button>}</section>
   </div>
   <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4"><button onClick={()=>onEditStep("personal")} className="rounded-xl border border-border bg-white px-3 py-3 text-left text-sm font-bold text-primary">Editar información →</button><button onClick={()=>onEditStep("perfil")} className="rounded-xl border border-border bg-white px-3 py-3 text-left text-sm font-bold text-primary">Editar perfil →</button><button onClick={()=>onEditStep("experiencia")} className="rounded-xl border border-border bg-white px-3 py-3 text-left text-sm font-bold text-primary">Editar experiencia →</button><button onClick={()=>onEditStep("plantilla")} className="rounded-xl border border-border bg-white px-3 py-3 text-left text-sm font-bold text-primary">Cambiar diseño →</button></div>
  </div>
  <div className="mt-7 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between"><button onClick={onBack} className="rounded-xl px-4 py-3 text-sm font-bold text-muted">← Atrás</button>{cv.planSeleccionado==="free"?<PDFDownloadLink document={<CVDocument cv={normalizeCV(cv)}/>} fileName={fileName} className="rounded-xl bg-primary px-6 py-3.5 text-center text-sm font-black text-white shadow-lg">{({loading}:{loading:boolean})=>loading?"Preparando PDF…":"Descargar mi PDF →"}</PDFDownloadLink>:<button onClick={onNext} disabled={!ready} className="btn-shine rounded-xl bg-primary px-6 py-3.5 text-sm font-black text-white shadow-lg disabled:bg-slate-300">{ready?"Continuar al pago →":"Completa los datos básicos →"}</button>}</div>
 </div>
}
