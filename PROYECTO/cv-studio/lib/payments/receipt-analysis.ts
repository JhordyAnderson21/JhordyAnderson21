export type ReceiptAnalysis = {
  score: number;
  compatible: boolean;
  width: number;
  height: number;
  purpleRatio: number;
  cyanRatio: number;
  whiteRatio: number;
  amountDetected: boolean;
  amountMatches: boolean | null;
  note: string;
};

function clamp(n: number) { return Math.max(0, Math.min(1, n)); }

/**
 * Local, best-effort visual precheck. It is intentionally not presented as
 * verification with Yape or a payment network: the browser has no access to
 * the user's financial transaction. The check looks for the characteristic
 * purple/cyan/white palette and portrait receipt proportions. Amount OCR is
 * attempted only when the browser exposes TextDetector; otherwise it remains
 * unknown instead of being fabricated.
 */
export async function analyzeReceiptImage(file: File, expectedAmount: number): Promise<ReceiptAnalysis> {
  const fallback: ReceiptAnalysis = {
    score: 0, compatible: false, width: 0, height: 0,
    purpleRatio: 0, cyanRatio: 0, whiteRatio: 0,
    amountDetected: false, amountMatches: null,
    note: "No se pudo analizar la imagen."
  };

  if (!file.type.startsWith("image/")) return fallback;

  const bitmap = await createImageBitmap(file);
  const max = 240;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return fallback;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const pixels = ctx.getImageData(0, 0, width, height).data;
  let purple = 0, cyan = 0, white = 0, total = 0;
  for (let i = 0; i < pixels.length; i += 16) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    const maxC = Math.max(r, g, b), minC = Math.min(r, g, b);
    if (maxC - minC < 16 && r > 205 && g > 205 && b > 205) white++;
    if (b > r * 1.15 && r > g * 0.7 && b > 70) purple++;
    if (g > 145 && b > 125 && g > r * 1.35) cyan++;
    total++;
  }
  const purpleRatio = purple / Math.max(1, total);
  const cyanRatio = cyan / Math.max(1, total);
  const whiteRatio = white / Math.max(1, total);
  const portrait = height >= width * 1.12;
  const paletteScore = clamp((purpleRatio * 3.2) + (cyanRatio * 2.2) + (whiteRatio * 0.55));
  const shapeScore = portrait ? 1 : clamp(height / Math.max(width, 1));

  let amountDetected = false;
  let amountMatches: boolean | null = null;
  try {
    const Detector = (window as unknown as { TextDetector?: new () => { detect(source: CanvasImageSource): Promise<Array<{ rawValue?: string }>> } }).TextDetector;
    if (Detector) {
      const detector = new Detector();
      const blocks = await detector.detect(canvas);
      const text = blocks.map(x => x.rawValue || "").join(" ");
      const wanted = expectedAmount.toFixed(0);
      const matches = text.match(/(?:S\/|S\.|PEN|S)?\s*(\d{1,3}(?:[.,]\d{1,2})?)/gi) || [];
      amountDetected = matches.length > 0;
      amountMatches = amountDetected ? matches.some(x => new RegExp(`(?:^|\\D)${wanted}(?:[.,]0{2})?(?:\\D|$)`).test(x)) : null;
    }
  } catch {
    amountDetected = false;
    amountMatches = null;
  }

  let score = Math.round((paletteScore * 62) + (shapeScore * 18) + (amountMatches === true ? 20 : amountMatches === false ? -20 : 0));
  score = Math.max(0, Math.min(100, score));
  const compatible = score >= 45 && (amountMatches !== false);
  return {
    score, compatible, width, height, purpleRatio, cyanRatio, whiteRatio,
    amountDetected, amountMatches,
    note: amountMatches === true
      ? `La imagen presenta una estructura visual compatible y el importe visible coincide con S/ ${expectedAmount}.`
      : amountMatches === false
        ? `El importe detectado no coincide con S/ ${expectedAmount}.`
        : "La imagen presenta una estructura visual compatible; el importe no pudo leerse automáticamente en este navegador."
  };
}
