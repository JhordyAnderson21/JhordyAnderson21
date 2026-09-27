import { NextRequest, NextResponse } from "next/server";
import { limpiarComprobantesExpirados } from "@/lib/storage/supabase-receipts";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = req.headers.get("authorization");
  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const result = await limpiarComprobantesExpirados();
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json({ error: "No se pudo limpiar los comprobantes expirados." }, { status: 500 });
  }
}
