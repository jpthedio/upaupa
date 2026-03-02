import { monthLabel } from "./helpers";
import { METHOD_LABELS } from "./constants";

export function exportCSV(data, month) {
  const label = monthLabel(month);
  const rows = [["Building", "Unit", "Tenant", "Due", "Paid", "Status", "Method", "Date Paid", "Notes"]];
  data.payments.filter((p) => p.month === month).forEach((p) => {
    const unit = data.units.find((u) => u.id === p.unitId);
    const building = data.buildings.find((b) => b.id === unit?.buildingId);
    const tenant = data.tenants.find((t) => t.id === p.tenantId);
    rows.push([
      building?.name || "", unit?.label || "", tenant ? `${tenant.firstName} ${tenant.lastName}` : "",
      p.amountDue, p.amountPaid, p.status, METHOD_LABELS[p.method] || p.method,
      p.datePaid || "", `"${(p.notes || "").replace(/"/g, '""')}"`,
    ]);
  });
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `UpaUpa-${label.replace(/\s/g, "-")}.csv`; a.click();
  URL.revokeObjectURL(url);
}
