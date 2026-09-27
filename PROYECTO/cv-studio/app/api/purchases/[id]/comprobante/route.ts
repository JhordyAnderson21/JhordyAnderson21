import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { obtenerCompra, marcarComprobanteSubido } from "@/lib/payments/store";
import { guardarComprobanteEnSupabase, supabaseReceiptsConfigured } from "@/lib/storage/supabase-receipts";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const EXTENSION_POR_TIPO: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};
const TAMANO_MAXIMO_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const compra = obtenerCompra(params.id);
  if (!compra) {
    return NextResponse.json({ error: "Ese código de pago ya no es válido." }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "No se pudo leer el archivo enviado." }, { status: 400 });
  }

  const archivo = formData.get("comprobante");
  if (!(archivo instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }

  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    return NextResponse.json(
      { error: "Formato no permitido. Sube una imagen JPG, PNG o WEBP." },
      { status: 400 }
    );
  }
  if (archivo.size > TAMANO_MAXIMO_BYTES) {
    return NextResponse.json({ error: "El archivo supera los 8 MB permitidos." }, { status: 400 });
  }

  try {
    if (supabaseReceiptsConfigured()) {
      const remotePath = await guardarComprobanteEnSupabase(archivo, compra.id);
      const actualizado = marcarComprobanteSubido(compra.id, `supabase://${remotePath}`);
      if (!actualizado) {
        return NextResponse.json({ error: "La sesión de pago ya expiró." }, { status: 410 });
      }
      return NextResponse.json({ ok: true });
    }

    // Compatibilidad local: si Supabase todavía no está configurado, se conserva
    // exactamente el almacenamiento temporal local que ya tenía el proyecto.
    const extension = EXTENSION_POR_TIPO[archivo.type];
    const nombreArchivo = `${compra.id}_${randomUUID()}${extension}`;
    const dirComprobantes = path.join(process.cwd(), ".data", "comprobantes");
    fs.mkdirSync(dirComprobantes, { recursive: true });
    const destino = path.join(dirComprobantes, nombreArchivo);
    const bytes = Buffer.from(await archivo.arrayBuffer());
    fs.writeFileSync(destino, bytes);
    const actualizado = marcarComprobanteSubido(compra.id, destino);
    if (!actualizado) {
      try { fs.unlinkSync(destino); } catch {}
      return NextResponse.json({ error: "La sesión de pago ya expiró." }, { status: 410 });
    }
  } catch {
    return NextResponse.json({ error: "No se pudo guardar el comprobante." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
