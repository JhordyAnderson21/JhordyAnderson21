"use client";

import { useState } from "react";
import { TextInput } from "@/components/Field";

function normalizarManual(valor: string) {
  const limpio = valor.replace(/[^0-9]/g, "").slice(0, 6);
  if (limpio.length <= 2) return limpio;
  return `${limpio.slice(0, 2)}/${limpio.slice(2)}`;
}

export function MonthField({ value, onChange, disabled = false, label = "Fecha" }: { value: string; onChange: (value: string) => void; disabled?: boolean; label?: string }) {
  const [manual, setManual] = useState(false);
  const manualValue = value && /^\d{4}-\d{2}$/.test(value) ? `${value.slice(5, 7)}/${value.slice(0, 4)}` : value;
  return <div>
    <div className="mb-1.5 flex items-center justify-between gap-2"><span className="text-sm font-medium text-ink">{label}</span><button type="button" disabled={disabled} onClick={() => setManual(v => !v)} className="text-xs font-bold text-accent disabled:opacity-40">{manual ? "Usar selector" : "Escribir manualmente"}</button></div>
    {manual ? <TextInput disabled={disabled} value={manualValue} placeholder="MM/AAAA" inputMode="numeric" maxLength={7} onChange={e => { const v=normalizarManual(e.target.value); if(v.length===7){ const [mm,yyyy]=v.split('/'); const mes=Math.min(12, Math.max(1, Number(mm)||1)).toString().padStart(2,'0'); onChange(`${yyyy}-${mes}`); } else { onChange(v); } }} /> : <TextInput disabled={disabled} type="month" value={/^\d{4}-\d{2}$/.test(value) ? value : ""} onChange={e => onChange(e.target.value)} />}
    <p className="mt-1 text-xs text-muted">Puedes elegir el mes o escribirlo como <b>MM/AAAA</b>.</p>
  </div>;
}
