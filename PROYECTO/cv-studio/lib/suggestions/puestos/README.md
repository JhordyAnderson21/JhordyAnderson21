# Sugerencias por puesto (Fase 3 — Standard/Premium)

Cada archivo aquí (ej. `vendedor.ts`, `electricista.ts`) exporta sugerencias
específicas para un puesto, usadas solo en planes pagos.

Reglas:
- Nunca incluir aquí la guía gratuita (`ejemploGratis`); esa vive en
  `/lib/suggestions/comun/guia-gratis.ts`.
- Si un usuario escribe una profesión que NO tiene archivo aquí, la
  aplicación debe seguir funcionando con normalidad: simplemente no se
  muestran sugerencias específicas. Esto ya está resuelto en
  `lib/suggestions/getSuggestions.ts`, que devuelve `null` de forma segura
  cuando no encuentra el puesto.

No implementado en Fase 1 (MVP gratuito). Esta carpeta queda preparada
para Fase 3.
