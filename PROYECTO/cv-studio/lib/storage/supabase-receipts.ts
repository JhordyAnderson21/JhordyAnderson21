import { randomUUID } from "crypto";

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "comprobantes";
const RETENCION_MS = 48 * 60 * 60 * 1000;

export function supabaseReceiptsConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function headers(extra: Record<string, string> = {}) {
  if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY no está configurada.");
  return {
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    ...extra,
  };
}

function extensionForType(type: string) {
  const extensions: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  return extensions[type] || ".bin";
}

async function asegurarBucketPrivado() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase Storage no está configurado.");
  }

  const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ id: SUPABASE_STORAGE_BUCKET, name: SUPABASE_STORAGE_BUCKET, public: false }),
    cache: "no-store",
  });

  // 409 significa que el bucket ya existe; en ambos casos podemos continuar.
  if (!response.ok && response.status !== 409) {
    throw new Error(`No se pudo preparar el almacenamiento de comprobantes (${response.status}).`);
  }
}

export async function guardarComprobanteEnSupabase(file: File, purchaseId: string) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase Storage no está configurado.");
  }

  await asegurarBucketPrivado();
  const nombre = `${Date.now()}_${purchaseId}_${randomUUID()}${extensionForType(file.type)}`;
  const bytes = await file.arrayBuffer();
  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${SUPABASE_STORAGE_BUCKET}/${nombre}`,
    {
      method: "POST",
      headers: headers({
        "Content-Type": file.type,
        "x-upsert": "false",
      }),
      body: bytes,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`No se pudo guardar el comprobante en Supabase (${response.status}). ${detail}`.trim());
  }

  return nombre;
}

/** Elimina comprobantes con más de 48 horas. Pensado para ejecutarse desde una tarea programada. */
export async function limpiarComprobantesExpirados() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return { configured: false, deleted: 0 };
  }

  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${SUPABASE_STORAGE_BUCKET}`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ prefix: "", limit: 1000, offset: 0, sortBy: { column: "name", order: "asc" } }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`No se pudo listar comprobantes (${response.status}).`);

  const objects = (await response.json()) as Array<{ name?: string }>;
  const limite = Date.now() - RETENCION_MS;
  const expirados = objects.filter((object) => {
    const timestamp = Number(object.name?.split("_")[0]);
    return Number.isFinite(timestamp) && timestamp < limite;
  });

  let deleted = 0;
  for (const object of expirados) {
    if (!object.name) continue;
    const del = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${SUPABASE_STORAGE_BUCKET}/${encodeURIComponent(object.name)}`,
      { method: "DELETE", headers: headers(), cache: "no-store" }
    );
    if (del.ok) deleted += 1;
  }

  return { configured: true, deleted };
}
