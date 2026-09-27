"use client";

import { useCV } from "@/context/CVContext";
import { Field, TextInput, GuidanceNote } from "@/components/Field";
import { StepNav } from "@/components/StepNav";
import { guiaGratis } from "@/lib/suggestions/comun/guia-gratis";

export function CertificationsStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { cv, addCertification, updateCertification, removeCertification } = useCV();

  return (
    <div>
      <h2 className="font-serif text-2xl text-ink">Cursos y certificaciones</h2>
      <p className="mt-1 text-sm text-muted">Opcional. Solo agrega lo que puedas respaldar.</p>

      <div className="mt-6">
        <GuidanceNote>{guiaGratis.cursos}</GuidanceNote>
      </div>

      <div className="mt-5 space-y-3">
        {cv.certifications.map((cert) => (
          <div key={cert.id} className="rounded-lg border border-border p-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_2fr_1fr_auto] sm:items-end">
              <Field label="Nombre del curso">
                <TextInput
                  value={cert.nombre}
                  onChange={(e) => updateCertification(cert.id, { nombre: e.target.value })}
                />
              </Field>
              <Field label="Institución">
                <TextInput
                  value={cert.institucion}
                  onChange={(e) =>
                    updateCertification(cert.id, { institucion: e.target.value })
                  }
                />
              </Field>
              <Field label="Año">
                <TextInput
                  value={cert.anio}
                  onChange={(e) => updateCertification(cert.id, { anio: e.target.value })}
                  placeholder="2024"
                />
              </Field>
              <button
                type="button"
                onClick={() => removeCertification(cert.id)}
                className="pb-2.5 text-xs text-muted hover:text-accent sm:pb-2.5"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addCertification}
          className="w-full rounded-lg border border-dashed border-border py-3 text-sm font-medium text-primary hover:border-primary hover:bg-primary/5"
        >
          + Agregar curso o certificación
        </button>
      </div>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}
