import { CV } from "@/types/cv";

export type ValidationResult = {
  valido: boolean;
  errores: string[];
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarCV(cv: CV): ValidationResult {
  const errores: string[] = [];
  const { personalData } = cv;

  if (!personalData.nombres.trim()) errores.push("Falta tu nombre.");
  if (!personalData.apellidos.trim()) errores.push("Falta tu apellido.");
  if (!personalData.correo.trim()) {
    errores.push("Falta tu correo electrónico.");
  } else if (!EMAIL_RE.test(personalData.correo.trim())) {
    errores.push("El correo electrónico no parece válido.");
  }
  if (!personalData.puestoObjetivo.trim()) {
    errores.push("Indica el puesto o título profesional al que aspiras.");
  }

  if (cv.perfil.length > 400) {
    errores.push("El perfil profesional no puede superar los 400 caracteres.");
  }

  return { valido: errores.length === 0, errores };
}
