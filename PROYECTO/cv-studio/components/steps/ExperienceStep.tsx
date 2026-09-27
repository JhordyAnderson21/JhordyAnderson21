"use client";

import { useCV } from "@/context/CVContext";
import { Field, TextInput, TextArea, GuidanceNote } from "@/components/Field";
import { StepNav } from "@/components/StepNav";
import { MonthField } from "@/components/MonthField";
import { guiaGratis } from "@/lib/suggestions/comun/guia-gratis";
import { Experience } from "@/types/cv";
import { corregirTextoUsuario, sugerirRedaccion } from "@/lib/writing-assist";
import { useState } from "react";

export function ExperienceStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const {
    cv,
    addExperience,
    updateExperience,
    removeExperience,
  } = useCV();
  const [suggestions,setSuggestions]=useState<Record<string,string>>({});

  function updateLogro(exp: Experience, index: number, valor: string) {
    const logros = [...exp.logros];
    logros[index] = valor;
    updateExperience(exp.id, { logros });
  }

  function addLogro(exp: Experience) {
    updateExperience(exp.id, { logros: [...exp.logros, ""] });
  }

  function removeLogro(exp: Experience, index: number) {
    const logros = exp.logros.filter((_, i) => i !== index);
    updateExperience(exp.id, { logros: logros.length ? logros : [""] });
  }

  return (
    <div>
      <h2 className="font-serif text-2xl text-ink">Experiencia laboral</h2>
      <p className="mt-1 text-sm text-muted">
        Agrega tantas experiencias como tengas. Si es tu primer empleo, puedes continuar sin ninguna.
      </p>

      <div className="mt-6">
        <GuidanceNote>{guiaGratis.experiencia}</GuidanceNote>
      </div>

      <div className="mt-5 space-y-5">
        {cv.experiences.map((exp, idx) => (
          <div key={exp.id} className="rounded-lg border border-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-ink">Experiencia {idx + 1}</span>
              <button
                type="button"
                onClick={() => removeExperience(exp.id)}
                className="text-xs text-muted hover:text-accent"
              >
                Eliminar
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Empresa">
                <TextInput
                  value={exp.empresa}
                  onChange={(e) => updateExperience(exp.id, { empresa: e.target.value })}
                />
              </Field>
              <Field label="Puesto">
                <TextInput
                  value={exp.puesto}
                  onChange={(e) => updateExperience(exp.id, { puesto: e.target.value })}
                />
              </Field>
              <MonthField label="Fecha de inicio" value={exp.fechaInicio} onChange={(value) => updateExperience(exp.id, { fechaInicio: value })} />
              <div>
                <MonthField label="Fecha de finalización" value={exp.fechaFin} disabled={exp.actual} onChange={(value) => updateExperience(exp.id, { fechaFin: value })} />
                <label className="mt-2 flex items-center gap-2 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={exp.actual}
                    onChange={(e) =>
                      updateExperience(exp.id, { actual: e.target.checked, fechaFin: "" })
                    }
                  />
                  Trabajo actual
                </label>
              </div>
            </div>

            <div className="mt-4">
              <Field label="Descripción" optional>
                <TextArea
                  rows={2}
                  value={exp.descripcion}
                  onChange={(e) => updateExperience(exp.id, { descripcion: e.target.value })}
                  placeholder="Breve descripción del rol"
                />
              </Field>
              {cv.planSeleccionado==="premium"&&<div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={()=>updateExperience(exp.id,{descripcion:corregirTextoUsuario(exp.descripcion)})} className="rounded-xl border border-[#d7c18b] bg-[#fbf8f0] px-3 py-2 text-[11px] font-black text-primary">Corregir texto</button><button type="button" onClick={()=>setSuggestions(x=>({...x,[exp.id]:sugerirRedaccion(exp.descripcion)}))} className="rounded-xl bg-primary px-3 py-2 text-[11px] font-black text-white">Sugerir mejora</button></div>}
              {cv.planSeleccionado==="premium"&&suggestions[exp.id]&&<div className="mt-3 rounded-2xl border border-[#e0c98d]/40 bg-[#fbf8f0] p-4"><p className="text-[10px] font-black uppercase tracking-widest text-accent">Sugerencia Premium</p><p className="mt-2 text-sm leading-6 text-primary">{suggestions[exp.id]}</p><button type="button" onClick={()=>{updateExperience(exp.id,{descripcion:suggestions[exp.id]});setSuggestions(x=>{const n={...x};delete n[exp.id];return n})}} className="mt-3 rounded-xl bg-primary px-3 py-2 text-xs font-black text-white">Usar sugerencia</button></div>}
            </div>

            <div className="mt-4">
              <span className="mb-1.5 block text-sm font-medium text-ink">
                Logros o responsabilidades
              </span>
              <div className="space-y-2">
                {exp.logros.map((logro, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <TextInput
                      value={logro}
                      onChange={(e) => updateLogro(exp, i, e.target.value)}
                      placeholder="Ej: Aumenté las ventas en un 15%"
                    />
                    <button
                      type="button"
                      onClick={() => removeLogro(exp, i)}
                      className="shrink-0 text-xs text-muted hover:text-accent"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addLogro(exp)}
                className="mt-2 text-xs font-medium text-primary hover:text-primary-light"
              >
                + Agregar logro
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addExperience}
          className="w-full rounded-lg border border-dashed border-border py-3 text-sm font-medium text-primary hover:border-primary hover:bg-primary/5"
        >
          + Agregar experiencia
        </button>
      </div>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}
