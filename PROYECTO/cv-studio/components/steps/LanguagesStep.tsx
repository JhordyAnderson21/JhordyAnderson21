"use client";

import { useCV } from "@/context/CVContext";
import { Field, TextInput, Select, GuidanceNote } from "@/components/Field";
import { StepNav } from "@/components/StepNav";
import { guiaGratis } from "@/lib/suggestions/comun/guia-gratis";
import { NivelIdioma } from "@/types/cv";

const NIVELES: NivelIdioma[] = ["Básico", "Intermedio", "Avanzado", "Nativo"];

export function LanguagesStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { cv, addLanguage, updateLanguage, removeLanguage } = useCV();

  return (
    <div>
      <h2 className="font-serif text-2xl text-ink">Idiomas</h2>
      <p className="mt-1 text-sm text-muted">Opcional, pero valorado en muchos puestos.</p>

      <div className="mt-6">
        <GuidanceNote>{guiaGratis.idiomas}</GuidanceNote>
      </div>

      <div className="mt-5 space-y-3">
        {cv.languages.map((lang) => (
          <div key={lang.id} className="flex items-end gap-3 rounded-lg border border-border p-3">
            <div className="flex-1">
              <Field label="Idioma">
                <TextInput
                  value={lang.idioma}
                  onChange={(e) => updateLanguage(lang.id, { idioma: e.target.value })}
                  placeholder="Ej: Inglés"
                />
              </Field>
            </div>
            <div className="w-40">
              <Field label="Nivel">
                <Select
                  value={lang.nivel}
                  onChange={(e) =>
                    updateLanguage(lang.id, { nivel: e.target.value as NivelIdioma })
                  }
                >
                  {NIVELES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <button
              type="button"
              onClick={() => removeLanguage(lang.id)}
              className="pb-2.5 text-xs text-muted hover:text-accent"
            >
              Eliminar
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addLanguage}
          className="w-full rounded-lg border border-dashed border-border py-3 text-sm font-medium text-primary hover:border-primary hover:bg-primary/5"
        >
          + Agregar idioma
        </button>
      </div>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}
