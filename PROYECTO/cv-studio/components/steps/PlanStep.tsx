"use client";
import {useState} from "react";
import {useCV} from "@/context/CVContext";
import {planes,PlanId} from "@/config/payment";

export function PlanStep({onNext}:{onNext:()=>void}){
 const {cv,setPlanSeleccionado}=useCV();
 const [pending,setPending]=useState<PlanId|null>(null);
 const seleccionado=cv.planSeleccionado;
 const tieneDatos=Boolean(
   cv.personalData.nombres||cv.personalData.apellidos||cv.personalData.correo||cv.personalData.puestoObjetivo||cv.perfil||
   cv.experiences.length||cv.education.length||cv.skills.length||cv.techSkills.length||cv.languages.length||
   cv.certifications.length||cv.projects.length||cv.recognitions.length||cv.fotoDataUrl
 );
 function choose(id:PlanId){
   if(!seleccionado){setPlanSeleccionado(id);return;}
   if(id===seleccionado)return;
   if(tieneDatos){setPending(id);return;}
   setPlanSeleccionado(id);
 }
 function confirmChange(){if(!pending)return;setPlanSeleccionado(pending);setPending(null);}
 return <div>
  <div className="premium-hero rounded-[2rem] p-7 text-white shadow-panel sm:p-9">
   <div className="relative z-10">
    <p className="eyebrow text-blue-100">Paso 1 · empieza aquí</p>
    <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">Primero elegimos el nivel de tu CV.</h2>
    <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100/80">El plan se fija desde el inicio y determina las herramientas, asistencia y diseños que tendrás disponibles.</p>
    <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-bold text-blue-100/75"><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Contenido guiado</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Diseño adaptativo</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">PDF profesional</span></div>
   </div>
  </div>
  <div className="mt-7 grid gap-5 md:grid-cols-3">
   {planes.map((p,i)=>{const active=seleccionado===p.id;const premium=p.id==="premium";return <button key={p.id} type="button" onClick={()=>choose(p.id)} className={`card-hover relative overflow-hidden rounded-[1.7rem] border-2 p-6 text-left ${premium?"plan-premium border-transparent":"border-border bg-white"} ${active?"border-accent ring-4 ring-blue-50":""}`}>
    {premium&&<><div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_0,rgba(198,166,107,.18),transparent_32%)]"/><div className="absolute right-4 top-4 h-16 w-16 rounded-full border border-[#c6a66b]/20 opacity-70"/></>}
    <div className="relative"><div className="flex items-center justify-between"><span className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black ${premium?"bg-white/10 text-white":"bg-blue-50 text-accent"}`}>0{i+1}</span>{premium&&<span className="premium-badge rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-wider">Experiencia avanzada</span>}</div>
    <h3 className="mt-5 text-xl font-black">{p.nombre}</h3><p className={`mt-1 text-3xl font-black ${premium?"text-white":"text-primary"}`}>{p.precio==null?"Gratis":`S/ ${p.precio.toFixed(2)}`}</p><p className={`mt-1 text-xs ${premium?"text-blue-100/60":"text-muted"}`}>{p.id==="free"?"Sin pago":"por CV generado"}</p>{premium&&<p className="mt-3 max-w-xs text-xs font-black leading-5 text-[#e0c98d]">✦ Asegura tu lugar laboral con una presentación más completa y mayor ayuda asistida.</p>}
    <ul className={`mt-5 space-y-2.5 text-sm leading-5 ${premium?"text-blue-50/85":"text-muted"}`}>{p.resumen.map(x=><li key={x} className="flex gap-2"><span className={premium?"text-[#e0c98d]":"text-accent"}>✓</span><span>{x}</span></li>)}</ul>
    <div className={`mt-5 border-t pt-4 ${premium?"border-white/10":"border-border"}`}><p className={`eyebrow ${premium?"text-[#e0c98d]":"text-accent"}`}>Diseño</p><p className={`mt-2 text-xs leading-5 ${premium?"text-white/65":"text-muted"}`}>{p.id==="premium"?"Colección editorial, ejecutiva, creativa, tecnológica y fotográfica con composiciones realmente diferentes.":p.id==="standard"?"13 estructuras profesionales sin espacio de foto, con jerarquías y composiciones diferenciadas.":"2 diseños esenciales para empezar con una presentación limpia."}</p></div>
    {active&&<div className={`mt-5 rounded-xl px-4 py-3 text-sm font-black ${premium?"bg-white text-primary":"bg-blue-50 text-accent"}`}>✓ Plan seleccionado</div>}
    </div></button>})}
  </div>
  <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-black text-primary">Tu plan queda definido antes de comenzar.</p><p className="mt-1 text-xs leading-5 text-muted">Si más adelante cambias de plan, te avisaremos que el borrador actual se eliminará antes de hacerlo.</p></div><button type="button" disabled={!seleccionado} onClick={onNext} className="btn-shine shrink-0 rounded-2xl bg-primary px-6 py-3.5 text-sm font-black text-white shadow-lg disabled:cursor-not-allowed disabled:bg-slate-300">{seleccionado?`Continuar con ${planes.find(p=>p.id===seleccionado)?.nombre} →`:"Selecciona un plan"}</button></div>
  {pending&&<div className="fixed inset-0 z-[90] flex items-center justify-center bg-primary/70 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-3xl border border-[#e0c98d]/30 bg-white p-7 shadow-2xl"><p className="eyebrow text-amber-700">Cambio de plan</p><h3 className="mt-2 text-2xl font-black text-primary">¿Quieres cambiar tu plan?</h3><p className="mt-3 text-sm leading-6 text-muted">Tu CV ya contiene información. Si cambias de plan, <b>se eliminará todo el borrador actual</b> y comenzarás nuevamente con el nuevo plan. Esta acción no se puede deshacer.</p><div className="mt-6 flex gap-3"><button onClick={()=>setPending(null)} className="flex-1 rounded-2xl border border-border px-4 py-3 text-sm font-bold text-primary">Cancelar</button><button onClick={confirmChange} className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-black text-white">Sí, borrar y cambiar</button></div></div></div>}
 </div>
}
