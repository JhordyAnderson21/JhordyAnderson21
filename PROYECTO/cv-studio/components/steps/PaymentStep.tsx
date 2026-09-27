"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useCV } from "@/context/CVContext";
import { CVDocument } from "@/lib/pdf/CVDocument";
import { obtenerPlan, yapeConfig, MINUTOS_PARA_PAGAR, SEGUNDOS_VERIFICACION } from "@/config/payment";
import { analyzeReceiptImage, ReceiptAnalysis } from "@/lib/payments/receipt-analysis";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <span className="rounded-2xl bg-slate-200 px-6 py-3.5 text-sm font-black text-slate-500">Preparando PDF...</span> }
);

type Estado = "pendiente" | "analizando" | "subiendo" | "verificando" | "confirmado" | "expirado";
function formatoTiempo(total: number) { const m = Math.floor(total / 60); const s = total % 60; return `${m}:${s.toString().padStart(2, "0")}`; }

export function PaymentStep({ onBack }: { onBack: () => void }) {
  const { cv, setPaymentUnlocked, setPaymentPurchaseId, resetCV } = useCV();
  const plan = cv.planSeleccionado && cv.planSeleccionado !== "free" ? obtenerPlan(cv.planSeleccionado) : null;
  const nombreArchivo = `CV_${cv.personalData.nombres}_${cv.personalData.apellidos}`.trim().replace(/\s+/g, "_") || "CV";
  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [segundos, setSegundos] = useState(MINUTOS_PARA_PAGAR * 60);
  const [estado, setEstado] = useState<Estado>(cv.paymentUnlocked ? "confirmado" : "pendiente");
  const [sesionBorrada, setSesionBorrada] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [analisis, setAnalisis] = useState<ReceiptAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const verifyRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const iniciarCompra = useCallback(() => {
    if (!cv.planSeleccionado || cv.planSeleccionado === "free") return;
    setError(null); setArchivo(null); setAnalisis(null); setEstado("pendiente");
    setSegundos(MINUTOS_PARA_PAGAR * 60); setPurchaseId(null); setPaymentPurchaseId(null); setExpiresAt(null); setSesionBorrada(false);
    fetch("/api/purchases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: cv.planSeleccionado }) })
      .then((r) => r.json())
      .then((data) => { if (data.purchaseId) { setPurchaseId(data.purchaseId); setPaymentPurchaseId(data.purchaseId); setExpiresAt(new Date(data.expiresAt).getTime()); } else setError("No se pudo iniciar el proceso de pago. Inténtalo de nuevo."); })
      .catch(() => setError("No se pudo iniciar el proceso de pago. Revisa tu conexión."));
  }, [cv.planSeleccionado]);

  useEffect(() => {
    if (!cv.planSeleccionado || cv.planSeleccionado === "free" || cv.paymentUnlocked) return;
    iniciarCompra();
    return () => { if (verifyRef.current) clearTimeout(verifyRef.current); };
  }, [cv.planSeleccionado, cv.paymentUnlocked, iniciarCompra]);

  useEffect(() => {
    if (!expiresAt || estado === "confirmado" || estado === "expirado") return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSegundos(left);
      if (left <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (verifyRef.current) clearTimeout(verifyRef.current);
        setEstado("expirado"); setPurchaseId(null); setPaymentPurchaseId(null); setArchivo(null); setAnalisis(null); setSesionBorrada(true);
        resetCV();
      }
    };
    tick(); intervalRef.current = setInterval(tick, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [estado, expiresAt, resetCV]);

  async function seleccionarComprobante(file: File | null) {
    if (!file || !plan || segundos <= 0) return;
    setError(null); setArchivo(null); setAnalisis(null); setEstado("analizando");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError("Formato no permitido. Usa JPG, PNG o WEBP."); setEstado("pendiente"); return; }
    if (file.size > 8 * 1024 * 1024) { setError("El comprobante supera los 8 MB permitidos."); setEstado("pendiente"); return; }
    try {
      const resultado = await analyzeReceiptImage(file, plan.precio ?? 0);
      if (!resultado.compatible) {
        setAnalisis(resultado); setError("La imagen no presenta una estructura de comprobante compatible. Revisa que hayas seleccionado la captura correcta."); setEstado("pendiente"); return;
      }
      setArchivo(file); setAnalisis(resultado); setEstado("pendiente");
    } catch {
      setError("No se pudo analizar la imagen. Intenta con una captura JPG o PNG más clara."); setEstado("pendiente");
    }
  }

  async function subirComprobante() {
    if (!archivo || !purchaseId || segundos <= 0) return;
    setEstado("subiendo"); setError(null);
    try {
      const formData = new FormData(); formData.append("comprobante", archivo);
      const res = await fetch(`/api/purchases/${purchaseId}/comprobante`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "No se pudo procesar tu comprobante."); setEstado(res.status === 410 ? "expirado" : "pendiente"); return; }
      setEstado("verificando");
      verifyRef.current = setTimeout(() => { setEstado("confirmado"); setPaymentUnlocked(true); }, SEGUNDOS_VERIFICACION * 1000);
    } catch { setError("No se pudo enviar el comprobante. Revisa tu conexión."); setEstado("pendiente"); }
  }

  if (!cv.planSeleccionado || cv.planSeleccionado === "free" || !plan) return null;
  if (sesionBorrada) return <div className="rounded-[2rem] border border-red-100 bg-white p-8 text-center shadow-panel"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-600">!</div><p className="mt-5 text-xs font-black uppercase tracking-widest text-red-600">Tiempo agotado</p><h2 className="mt-2 text-3xl font-black text-primary">Tu sesión fue cerrada</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted">El contador llegó a 0:00 y el borrador de este proceso fue eliminado. Si deseas continuar, tendrás que iniciar un nuevo CV.</p><button type="button" onClick={() => window.location.assign("/crear-cv")} className="mt-6 rounded-2xl bg-primary px-6 py-3.5 text-sm font-black text-white">Crear un nuevo CV</button></div>;

  return <div>
    <div className="premium-hero rounded-[2rem] p-7 text-white shadow-panel sm:p-9"><div className="relative z-10"><p className="eyebrow text-blue-100">Último paso · entrega protegida</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Activa la descarga de tu CV.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100/80">Tu plan ya está definido. Realiza el pago indicado, sube el comprobante y completa el proceso dentro de los 5 minutos disponibles.</p></div></div>
    <div className="mt-6 grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
      <section className="rounded-3xl border border-border bg-white p-5 shadow-sm"><p className="eyebrow text-accent">Plan seleccionado</p><div className="mt-2 flex items-end justify-between gap-3"><div><h3 className="text-2xl font-black text-primary">{plan.nombre}</h3><p className="mt-1 text-xs text-muted">El importe se determina por tu selección inicial.</p></div><p className="text-3xl font-black text-primary">S/ {plan.precio?.toFixed(2)}</p></div><div className="mt-5 rounded-3xl border border-[#e0c98d]/50 bg-[#fbf8f0] p-4 text-center"><p className="text-[10px] font-black uppercase tracking-widest text-[#7a5a24]">Realiza el pago</p><div className="mx-auto mt-3 flex aspect-square w-full max-w-[280px] items-center justify-center overflow-hidden rounded-2xl border border-[#e5dcc6] bg-white p-3 shadow-sm"><img src={yapeConfig.qrImageUrl} alt="Código QR para realizar el pago" className="h-full w-full object-contain"/></div><a href={yapeConfig.qrImageUrl} download="QR-pago-CV-Studio.png" className="mt-4 inline-flex rounded-xl border border-[#d7c18b] bg-white px-4 py-2.5 text-xs font-black text-primary transition hover:-translate-y-0.5">Descargar QR</a><p className="mt-3 text-xs leading-5 text-muted">Escanea el código o guarda el QR para realizar el pago.</p></div></section>
      <section className="rounded-3xl border border-border bg-white p-5 shadow-sm">
        {estado === "expirado" ? <div className="flex min-h-[460px] flex-col items-center justify-center text-center"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-600">!</div><h3 className="mt-4 text-2xl font-black text-primary">Tu tiempo terminó</h3><p className="mt-2 max-w-sm text-sm leading-6 text-muted">La sesión temporal de pago fue cerrada y el proceso actual ya no puede continuar.</p><button type="button" onClick={iniciarCompra} className="mt-6 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white">Iniciar nuevamente</button></div>
        : estado === "confirmado" ? <div className="flex min-h-[460px] flex-col items-center justify-center text-center"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-600">✓</div><p className="mt-5 text-xs font-black uppercase tracking-widest text-emerald-600">Comprobante aprobado</p><h3 className="mt-2 text-2xl font-black text-primary">Ya puedes descargar tu CV</h3><p className="mt-2 max-w-md text-sm leading-6 text-muted">¡Mucha suerte en tu búsqueda laboral! Esperamos que este CV te ayude a acercarte a la oportunidad que estás buscando.</p><PDFDownloadLink document={<CVDocument cv={cv}/>} fileName={`${nombreArchivo}.pdf`} className="mt-6 inline-flex rounded-2xl bg-primary px-6 py-3.5 text-center text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5">{({loading}) => loading ? "Preparando PDF..." : "Descargar mi CV →"}</PDFDownloadLink></div>
        : estado === "verificando" ? <div className="flex min-h-[460px] flex-col items-center justify-center text-center"><div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-blue-100"><div className="absolute inset-1 animate-spin rounded-full border-4 border-transparent border-t-accent"/><span className="text-lg">✓</span></div><p className="mt-6 text-xs font-black uppercase tracking-widest text-accent">Comprobando su comprobante de pago</p><h3 className="mt-2 text-2xl font-black text-primary">Procesando comprobante...</h3><p className="mt-2 max-w-sm text-sm leading-6 text-muted">Estamos comprobando la imagen enviada. El proceso tardará aproximadamente {SEGUNDOS_VERIFICACION} segundos.</p><div className="mt-5 h-1.5 w-52 overflow-hidden rounded-full bg-blue-50"><div className="h-full w-1/3 animate-[slideCheck_2s_ease-in-out_infinite] rounded-full bg-accent"/></div></div>
        : <div><div className="flex items-center justify-between gap-4 rounded-2xl border border-[#e0c98d]/50 bg-[#fbf8f0] p-4"><div><p className="text-[10px] font-black uppercase tracking-widest text-[#7a5a24]">Tiempo para completar</p><p className="mt-1 text-3xl font-black text-primary tabular-nums">{formatoTiempo(segundos)}</p></div><span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-black text-primary shadow-sm">5 minutos</span></div><div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl text-white">↑</div><h3 className="mt-4 text-lg font-black text-primary">Sube tu comprobante</h3><p className="mt-2 text-sm leading-6 text-muted">Selecciona la captura correspondiente al pago de <b>S/ {plan.precio?.toFixed(2)}</b>.</p><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => seleccionarComprobante(e.target.files?.[0] ?? null)} className="mt-5 block w-full text-left text-xs text-muted file:mr-3 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:font-bold file:text-white"/>{estado === "analizando" && <p className="mt-3 text-xs font-bold text-accent">Analizando estructura visual del comprobante...</p>}{analisis && <div className={`mt-4 rounded-2xl border p-4 text-left ${analisis.compatible ? "border-emerald-100 bg-emerald-50" : "border-red-100 bg-red-50"}`}><p className={`text-xs font-black ${analisis.compatible ? "text-emerald-700" : "text-red-700"}`}>{analisis.compatible ? "✓ Comprobante compatible" : "Revisión necesaria"}</p><p className="mt-1 text-xs leading-5 text-muted">{analisis.note}</p></div>}{archivo && <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white bg-white p-3 text-left shadow-sm"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">✓</div><div className="min-w-0"><p className="truncate text-xs font-black text-primary">{archivo.name}</p><p className="text-[11px] text-muted">Imagen analizada y lista para enviar</p></div></div>}{error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-left text-xs font-bold leading-5 text-red-700">{error}</p>}<button type="button" onClick={subirComprobante} disabled={!archivo || !purchaseId || segundos <= 0 || estado !== "pendiente"} className="mt-5 w-full rounded-2xl bg-primary px-5 py-3.5 text-sm font-black text-white shadow-lg disabled:cursor-not-allowed disabled:bg-slate-300">Enviar comprobante y continuar →</button><p className="mt-3 text-[11px] leading-5 text-muted">La imagen se procesa antes de iniciar la comprobación final de {SEGUNDOS_VERIFICACION} segundos.</p></div></div>}
      </section>
    </div>
  </div>;
}
