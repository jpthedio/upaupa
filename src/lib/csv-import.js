import { uid } from "./helpers";

/**
 * Parse CSV text into an array of row objects.
 * Handles quoted fields containing commas.
 */
export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseLine(lines[i]);
    if (vals.length === 0 || vals.every((v) => !v.trim())) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h.trim()] = (vals[idx] || "").trim(); });
    rows.push(row);
  }
  return rows;
}

function parseLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/**
 * Import parsed CSV rows into existing data.
 * Finds-or-creates buildings by name, units by label, tenants by name.
 * Creates payment records for the given month.
 * Returns a new data object (does not mutate input).
 */
export function importCSV(data, rows, month) {
  const d = {
    buildings: [...data.buildings],
    units: [...data.units],
    tenants: [...data.tenants],
    payments: [...data.payments],
    settings: { ...data.settings },
  };

  let imported = 0;

  for (const row of rows) {
    const buildingName = row["Building"] || "";
    const unitLabel = row["Unit"] || "";
    const tenantName = row["Tenant"] || "";
    const due = Number(row["Due"]) || 0;
    const paid = Number(row["Paid"]) || 0;
    const status = row["Status"] || (paid >= due && due > 0 ? "paid" : paid > 0 ? "partial" : "unpaid");
    const method = row["Method"] || "cash";
    const datePaid = row["Date Paid"] || "";
    const notes = row["Notes"] || "";

    if (!buildingName && !unitLabel) continue;

    // Find or create building
    let building = d.buildings.find((b) => b.name.toLowerCase() === buildingName.toLowerCase());
    if (!building && buildingName) {
      building = { id: uid(), name: buildingName, address: "", totalUnits: 0 };
      d.buildings.push(building);
    }

    // Find or create unit
    let unit = building
      ? d.units.find((u) => u.buildingId === building.id && u.label.toLowerCase() === unitLabel.toLowerCase())
      : null;
    if (!unit && unitLabel && building) {
      unit = { id: uid(), buildingId: building.id, label: unitLabel, floor: 1, monthlyRent: due || 0, status: "vacant" };
      d.units.push(unit);
      building.totalUnits++;
    }
    if (!unit) continue;

    // Update rent if provided
    if (due > 0 && unit.monthlyRent === 0) unit.monthlyRent = due;

    // Find or create tenant
    const nameParts = tenantName.split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    let tenant = null;
    if (firstName) {
      tenant = d.tenants.find((t) =>
        t.unitId === unit.id &&
        t.firstName.toLowerCase() === firstName.toLowerCase() &&
        t.lastName.toLowerCase() === lastName.toLowerCase() &&
        t.status === "active"
      );
      if (!tenant) {
        tenant = {
          id: uid(), unitId: unit.id, firstName, lastName,
          phone: "", email: "", moveInDate: "", leaseEndDate: "",
          emergencyContact: "", status: "active",
        };
        d.tenants.push(tenant);
        unit.status = "occupied";
      }
    }

    // Create or update payment
    const existing = d.payments.find((p) => p.unitId === unit.id && p.month === month);
    if (existing) {
      Object.assign(existing, { amountDue: due, amountPaid: paid, status, method: normalizeMethod(method), datePaid, notes });
    } else {
      d.payments.push({
        id: uid(), unitId: unit.id, tenantId: tenant?.id || "", month,
        amountDue: due, amountPaid: paid, status, method: normalizeMethod(method),
        datePaid, receiptUrl: "", notes,
      });
    }
    imported++;
  }

  return { data: d, imported };
}

const METHOD_MAP = {
  gcash: "gcash", "g-cash": "gcash", "bank transfer": "bank_transfer",
  bank: "bank_transfer", cash: "cash", check: "check", cheque: "check",
};

function normalizeMethod(raw) {
  return METHOD_MAP[raw.toLowerCase().trim()] || "cash";
}
