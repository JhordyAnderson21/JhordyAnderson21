"use client";
import { useMemo } from "react";
import { CV } from "@/types/cv";
import { analyzeCV } from "@/lib/intelligence";

export function PremiumAssistant({ cv, compact = false }: { cv: CV; compact?: boolean }) {
  const tips = useMemo(() => {
    const analysis = analyzeCV(cv);
    const result = [
      analysis.suggestions[0],
      analysis.suggestions[1],
      cv.experiences.length ? "Añade resultados concretos cuando puedas: cifras, volumen, tiempos o mejoras reales." : "Si aún no tienes experiencia, convierte proyectos, prácticas o trabajos propios en evidencia profesional.",
      cv.skills.length < 6 ? "Completa al menos 6 habilidades reales y evita repetir herramientas tecnológicas." : "Revisa que cada habilidad sea demostrable y relevante para el puesto objetivo.",
    ].filter(Boolean) as string[];
    return Array.from(new Set(result)).slice(0, compact ? 2 : 4);
  }, [cv, compact]);

  if (cv.planSeleccionado !== "premium") return null;
  return <aside className={`premium-assist rounded-3xl p-5 ${compact ? "" : "p-6"}`}>
    <div className="flex items-start gap-3">
      <div className="assist-pulse flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-[#e0c98d]">✦</div>
      <div><p className="text-sm font-black text-primary">Asistente Premium</p><p className="mt-1 text-xs leading-5 text-muted">Más ayuda para convertir tu información real en un CV claro, convincente y bien presentado.</p></div>
    </div>
    <div className="mt-4 space-y-2">{tips.map((tip, i) => <div key={tip} className="rounded-2xl border border-white bg-white/80 p-3"><p className="text-[9px] font-black uppercase tracking-widest text-[#8b6a32]">Recomendación {i + 1}</p><p className="mt-1 text-xs leading-5 text-primary">{tip}</p></div>)}</div>
    {!compact && <p className="mt-4 text-[10px] font-bold text-[#80642f]">Premium te acompaña más durante la redacción, revisión y organización. No inventa experiencia ni logros.</p>}
  </aside>;
}
