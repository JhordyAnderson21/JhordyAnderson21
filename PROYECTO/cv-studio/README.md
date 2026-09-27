# CV Studio — Generador profesional de CV

Aplicación Next.js para crear currículums profesionales con asistencia de contenido, recomendaciones de estructura, colección Standard de 13 plantillas y una colección Premium ampliada.

## Principios del producto

- El contenido del usuario está separado del diseño.
- La selección de plan es obligatoria antes de continuar.
- Los cambios de plan aplican reglas de acceso: al bajar de nivel se eliminan los datos exclusivos del nivel superior.
- El PDF final normaliza escritura, elimina duplicados y adapta tipografía/espaciado según la cantidad de contenido.
- Premium admite fotografía y distintos tratamientos visuales; la fotografía se conserva en el documento cuando la plantilla seleccionada la admite.
- La vista previa de planes pagos queda protegida hasta subir el comprobante.
- No existe una forma fiable de impedir capturas de pantalla del dispositivo; la protección se basa en no entregar el PDF completo antes del pago y en no exponer el archivo descargable.

## Stack

- Next.js 14 + React 18 + TypeScript
- Tailwind CSS
- `@react-pdf/renderer`
- Yape mediante comprobante de pago
- Persistencia local del borrador

## Arranque

```bash
npm install
npm run dev
```

Producción:

```bash
npm run build
npm start
```

## Variables privadas

Copia `.env.example` a `.env.local` y define:

```env
```

No publiques `.env.local`.

## Pagos

El flujo usa Yape + captura de comprobante. El temporizador es de **5 minutos**. La verificación visual actual es una demostración de desbloqueo tras recibir el archivo; para producción comercial debe conectarse a una revisión manual o a un proveedor de pagos/validación real.

## Persistencia de producción

La demo utiliza `.data` para compras y comprobantes. En Vercel/serverless debe migrarse a base de datos y almacenamiento persistente (por ejemplo, PostgreSQL/S3/R2/Supabase/Neon u otro proveedor equivalente).

## Arquitectura principal

- `types/cv.ts` — modelo de datos.
- `context/CVContext.tsx` — estado y reglas de plan.
- `lib/cv-engine.ts` — normalización, deduplicación y permisos por plan.
- `lib/intelligence.ts` — diagnóstico y recomendación de diseño.
- `lib/templates/catalog.ts` — catálogo de estructuras, colores y niveles.
- `lib/pdf/CVDocument.tsx` — motor de PDF.
- `components/steps/` — flujo del constructor.
- `app/api/purchases/` — flujo de comprobantes.
