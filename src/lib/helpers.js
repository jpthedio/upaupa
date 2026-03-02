export const uid = () => crypto.randomUUID();

export const peso = (n) =>
  `₱${Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—";

export const monthLabel = (m) =>
  new Date(m.slice(0, 7) + "-15").toLocaleDateString("en-PH", { month: "long", year: "numeric" });

export const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};
