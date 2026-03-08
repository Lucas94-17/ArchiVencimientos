export function daysLeft(expiry: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [y, m, d] = expiry.split("-").map(Number);
  const exp = new Date(y, m - 1, d);
  exp.setHours(0, 0, 0, 0);

  const diff = exp.getTime() - today.getTime();
  return Math.floor(diff / 86400000);
}

export function urgencyColor(days: number): string {
  if (days <= 0) return "#fee2e2"; // rojo
  if (days <= 7) return "#ffedd5"; // naranja
  if (days <= 30) return "#fef9c3"; // amarillo
  return "#dcfce7"; // verde
}
export function formatDaysLabel(days: number) {
  if (days === 0) return "vence hoy";
  if (days === 1) return "vence mañana";
  if (days > 1) return `vence en ${days} días`;
  return `vencido hace ${Math.abs(days)} días`;
}

export function daysBetween(from: Date, to: Date) {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

export function humanDateLabel(dateStr: string) {
  const ymd = String(dateStr ?? "").slice(0, 10); // ✅ "YYYY-MM-DD"
  const today = new Date();
  const target = new Date(ymd + "T12:00:00"); // mediodía para evitar corrimientos

  const diff = daysBetween(today, target);

  if (diff === 0) return "HOY";
  if (diff === 1) return "MAÑANA";
  if (diff === -1) return "AYER";

  return ymd;
}

export function urgencyColorByExpiry(expiryDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate + "T00:00:00");
  const diffDays = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays < 0) {
    return "#fecaca"; // 🔴 vencido
  }

  if (diffDays <= 60) {
    return "#fde68a"; // 🟡 vence pronto
  }

  return "#dcfce7"; // 🟢 ok
}

export function formatTime(date: Date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function parseTimeToDate(time: string) {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}
export function formatDatePretty(date: string) {
  const d = new Date(date);

  return d.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
export function toSqlLocalDateTime(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${da} ${h}:${mi}:${s}`;
}

export function parseNotifyAt(input: string): Date {
  if (!input) return new Date(NaN);

  // si viene ISO (tiene T), lo parsea normal
  if (input.includes("T")) return new Date(input);

  // si viene "YYYY-MM-DD HH:mm:ss" lo parseamos a local SIN timezone
  const [datePart, timePart = "00:00:00"] = input.split(" ");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh = 0, mm = 0, ss = 0] = timePart.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, ss, 0);
}
export function toLocalIsoNoZ(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  // 👇 ISO pero SIN Z => se interpreta como "hora local"
  return `${y}-${m}-${da}T${h}:${mi}:${s}`;
}
export function parseLocalDateTime(s: string) {
  const str = String(s ?? "");
  const [datePart, timePartRaw] = str.includes("T") ? str.split("T") : str.split(" ");
  const timePart = timePartRaw ?? "00:00:00";

  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm, ss] = timePart.split(":").map(Number);

  return new Date(y, m - 1, d, hh || 0, mm || 0, ss || 0, 0);
}
