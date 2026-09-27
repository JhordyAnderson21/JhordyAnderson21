// Punto único de acceso a sugerencias por puesto (Fase 3).
// En Fase 1 (MVP gratuito) esta función no se usa todavía, pero se deja
// lista para que Standard/Premium la consuman sin romper nada si el
// puesto no existe en /puestos.

export type SugerenciasPuesto = {
  perfil?: string[];
  experiencia?: string[];
  habilidades?: string[];
};

// Mapa de puestos disponibles. Se completará en Fase 3 con imports reales,
// ej: vendedor: () => import("./puestos/vendedor").
const registroPuestos: Record<string, () => Promise<{ default: SugerenciasPuesto }>> = {};

export async function getSuggestionsForPuesto(
  puesto: string
): Promise<SugerenciasPuesto | null> {
  const key = puesto.trim().toLowerCase();
  const loader = registroPuestos[key];
  if (!loader) return null;

  try {
    const mod = await loader();
    return mod.default ?? null;
  } catch {
    // Si el archivo no existe o falla, la app sigue funcionando sin sugerencias.
    return null;
  }
}
