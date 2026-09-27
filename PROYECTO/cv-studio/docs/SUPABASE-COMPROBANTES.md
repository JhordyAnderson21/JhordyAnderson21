# Comprobantes temporales con Supabase Storage

Esta integración añade únicamente el almacenamiento privado temporal de comprobantes.

## Qué hace

- El flujo actual de pago y comprobación sigue igual.
- Si Supabase está configurado, la imagen del comprobante se guarda en un bucket privado llamado `comprobantes`.
- Los archivos se nombran con una marca de tiempo y un identificador aleatorio.
- La retención objetivo es de 48 horas.
- Vercel ejecuta `/api/maintenance/comprobantes` cada hora para eliminar archivos con más de 48 horas.
- Si Supabase todavía no está configurado, el proyecto conserva el almacenamiento local que ya tenía, para no romper el flujo durante la configuración.

## Configuración

1. Crear un proyecto en Supabase.
2. Copiar la URL del proyecto y la **service role key**.
3. En el despliegue (por ejemplo, Vercel), configurar:

```env
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET=comprobantes
CRON_SECRET=UN_SECRETO_LARGO_Y_ALEATORIO
```

4. El código crea automáticamente el bucket `comprobantes` como **privado** si todavía no existe.
5. Configurar las mismas variables en el entorno de producción.

La `SUPABASE_SERVICE_ROLE_KEY` nunca debe exponerse al navegador ni prefijarse con `NEXT_PUBLIC_`.

## Dónde se revisan

Los archivos quedan en Supabase → Storage → `comprobantes`. Al ser un bucket privado, no tienen una URL pública navegable.
