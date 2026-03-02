import { uid, currentMonth } from "./helpers";

export function emptyData() {
  return { buildings: [], units: [], tenants: [], payments: [], settings: { dueDay: 5 } };
}

export function buildSeed() {
  const b1 = uid(), b2 = uid();
  const units1 = Array.from({ length: 6 }, (_, i) => ({
    id: uid(), buildingId: b1, label: `Unit ${i + 1}`, floor: Math.ceil((i + 1) / 3),
    monthlyRent: i < 3 ? 5000 : 6500, status: i === 5 ? "vacant" : "occupied",
  }));
  const units2 = Array.from({ length: 4 }, (_, i) => ({
    id: uid(), buildingId: b2, label: `Room ${String.fromCharCode(65 + i)}`, floor: 1,
    monthlyRent: 4500, status: i === 3 ? "vacant" : "occupied",
  }));
  const allUnits = [...units1, ...units2];
  const occupiedUnits = allUnits.filter((u) => u.status === "occupied");
  const firstNames = ["Maria", "Jose", "Ana", "Pedro", "Rosa", "Carlo", "Liza", "Jun", "Beth"];
  const lastNames = ["Santos", "Reyes", "Cruz", "Garcia", "Lopez", "Ramos", "Torres", "Flores", "Rivera"];
  const tenants = occupiedUnits.map((u, i) => ({
    id: uid(), unitId: u.id, firstName: firstNames[i % firstNames.length],
    lastName: lastNames[i % lastNames.length], phone: `09${Math.floor(100000000 + Math.random() * 900000000)}`,
    email: "", moveInDate: "2024-06-01", leaseEndDate: "2025-12-31",
    emergencyContact: "", status: "active",
  }));
  const cm = currentMonth();
  const statuses = ["paid", "paid", "partial", "late", "paid", "unpaid", "paid", "paid"];
  const methods = ["gcash", "bank_transfer", "cash", "gcash", "gcash", "", "bank_transfer", "cash"];
  const payments = occupiedUnits.map((u, i) => {
    const s = statuses[i % statuses.length];
    const t = tenants.find((t) => t.unitId === u.id);
    return {
      id: uid(), unitId: u.id, tenantId: t?.id || "", month: cm,
      amountDue: u.monthlyRent, amountPaid: s === "paid" ? u.monthlyRent : s === "partial" ? Math.round(u.monthlyRent * 0.6) : 0,
      status: s, method: methods[i % methods.length] || "cash",
      datePaid: s !== "unpaid" ? `2026-03-0${Math.min(i + 3, 9)}` : "",
      receiptUrl: "", notes: s === "late" ? "Promised to pay by 15th" : "",
    };
  });
  return {
    buildings: [
      { id: b1, name: "Building A", address: "123 Main St, Las Piñas", totalUnits: 6 },
      { id: b2, name: "Building B", address: "45 Side St, Las Piñas", totalUnits: 4 },
    ],
    units: allUnits, tenants, payments, settings: { dueDay: 5 },
  };
}
