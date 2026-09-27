import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { planes } from "@/config/payment";
import { crearCompra } from "@/lib/payments/store";

export async function POST(req: NextRequest) {
  let body: { plan?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de la solicitud inválido." }, { status: 400 });
  }

  // El plan y el precio se validan SIEMPRE contra la configuración del
  // servidor, nunca contra lo que envía el cliente (sección 22).
  const planConfig = planes.find((p) => p.id === body.plan && p.id !== "free");
  if (!planConfig) {
    return NextResponse.json({ error: "Plan no válido." }, { status: 400 });
  }

  const compra = crearCompra({
    id: randomUUID(),
    plan: planConfig.id as "standard" | "premium",
    precio: planConfig.precio,
  });

  return NextResponse.json({ purchaseId: compra.id, expiresAt: compra.expiraEn });
}
