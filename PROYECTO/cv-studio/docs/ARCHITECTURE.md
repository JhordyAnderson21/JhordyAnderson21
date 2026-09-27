# Arquitectura de CV Studio

## 1. Modelo de datos

El CV es una estructura independiente del diseño. Esto permite cambiar plantilla sin reconstruir la información.

```text
CV
├── datos personales
├── perfil
├── experiencia
├── educación
├── habilidades
├── idiomas
├── certificaciones
├── proyectos
├── herramientas tecnológicas
├── reconocimientos
├── plan
├── diseño
└── estado de desbloqueo
```

## 2. Motor de contenido

`lib/cv-engine.ts` centraliza:

- corrección básica de escritura y acentuación;
- normalización de espacios y mayúsculas;
- deduplicación entre categorías;
- recomendaciones mínimas;
- reglas de downgrade.

El motor nunca inventa experiencia o logros.

## 3. Motor de inteligencia

`lib/intelligence.ts` calcula:

- preparación del CV;
- densidad estimada;
- 1 o 2 páginas;
- vacíos frecuentes;
- sugerencias;
- plantilla recomendada.

## 4. Motor visual

El catálogo separa:

```text
estructura + paleta + nivel + soporte de foto
```

Standard conserva exactamente 9 estructuras diseñadas.
Premium amplía la variedad combinando 8 arquitecturas premium con varias paletas, incluyendo tratamientos de foto distintos.

## 5. PDF

`@react-pdf/renderer` utiliza el mismo componente `CVDocument` para preview y descarga. Antes de renderizar, el contenido se normaliza. La tipografía y el espaciado se ajustan según densidad.

La fotografía Premium se guarda como Data URL optimizada y se inserta directamente en las plantillas que admiten foto. Free/Standard eliminan cualquier foto heredada antes de renderizar.

## 6. Protección de contenido pago

No se promete impedir screenshots: ningún navegador puede garantizarlo contra capturas del sistema operativo. La estrategia correcta es:

1. no entregar el PDF completo antes del pago;
2. no ofrecer descarga antes del comprobante;
3. mostrar una vista protegida en lugar del documento completo;
4. desbloquear el documento tras recibir el comprobante.

## 7. Downgrade

El downgrade es deliberadamente destructivo para las funciones exclusivas:

- Premium → Standard: elimina foto y reconocimientos Premium y cambia el diseño a una plantilla disponible.
- Standard → Free: elimina proyectos/herramientas y vuelve al diseño gratuito.

El usuario recibe confirmación antes del cambio.

## 8. Evolución recomendada

La plataforma queda preparada para integrar posteriormente analítica de producto, soporte o feedback con un proveedor externo, sin exponer credenciales en el frontend.
