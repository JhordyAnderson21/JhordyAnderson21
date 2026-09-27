"use client";

import { useCV } from "@/context/CVContext";
import { Field, TextInput, GuidanceNote } from "@/components/Field";
import { StepNav } from "@/components/StepNav";
import { MonthField } from "@/components/MonthField";
import { guiaGratis } from "@/lib/suggestions/comun/guia-gratis";

export function EducationStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { cv, addEducation, updateEducation, removeEducation } = useCV();

  return (
    <div>
      <h2 className="font-serif text-2xl text-ink">Educación</h2>
      <p className="mt-1 text-sm text-muted">Agrega tus estudios, formales o técnicos.</p>

      <div className="mt-6">
        <GuidanceNote>{guiaGratis.educacion}</GuidanceNote>
      </div>

      <div className="mt-5 space-y-5">
        {cv.education.map((edu, idx) => (
          <div key={edu.id} className="rounded-lg border border-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-ink">Estudio {idx + 1}</span>
              <button
                type="button"
                onClick={() => removeEducation(edu.id)}
                className="text-xs text-muted hover:text-accent"
              >
                Eliminar
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Institución">
                <TextInput
                  value={edu.institucion}
                  onChange={(e) => updateEducation(edu.id, { institucion: e.target.value })}
                />
              </Field>
              <Field label="Carrera o programa">
                <TextInput
                  value={edu.programa}
                  onChange={(e) => updateEducation(edu.id, { programa: e.target.value })}
                />
              </Field>
              <Field label="Grado o nivel" optional>
                <TextInput
                  value={edu.grado}
                  onChange={(e) => updateEducation(edu.id, { grado: e.target.value })}
                  placeholder="Ej: Técnico, Bachiller, Licenciatura"
                />
              </Field>
              <MonthField label="Fecha de inicio" value={edu.fechaInicio} onChange={(value) => updateEducation(edu.id, { fechaInicio: value })} />
              <div>
                <MonthField label="Fecha de finalización" value={edu.fechaFin} disabled={edu.actual} onChange={(value) => updateEducation(edu.id, { fechaFin: value })} />
                <label className="mt-2 flex items-center gap-2 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={edu.actual}
                    onChange={(e) =>
                      updateEducation(edu.id, { actual: e.target.checked, fechaFin: "" })
                    }
                  />
                  Actualmente estudiando
                </label>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addEducation}
          className="w-full rounded-lg border border-dashed border-border py-3 text-sm font-medium text-primary hover:border-primary hover:bg-primary/5"
        >
          + Agregar estudio
        </button>
      </div>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}
