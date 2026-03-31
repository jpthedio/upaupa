import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { rowsToCamel, toCamel } from "@/lib/db-mapping";

const TenantCtx = createContext(null);

export function TenantProvider({ children, user, tenantAccess }) {
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [units, setUnits] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState(null);

  useEffect(() => {
    if (!supabase || !tenantAccess?.length) {
      setLoading(false);
      return;
    }

    async function load() {
      const tenantIds = tenantAccess.map((a) => a.tenant_id);

      const [tRes, pRes] = await Promise.all([
        supabase.from("tenants").select("*").in("id", tenantIds),
        supabase.from("payments").select("*").in("tenant_id", tenantIds).order("month", { ascending: false }),
      ]);

      const tenantRows = rowsToCamel(tRes.data || []);
      const paymentRows = rowsToCamel(pRes.data || []);

      // Fetch units for these tenants
      const unitIds = [...new Set(tenantRows.map((t) => t.unitId).filter(Boolean))];
      let unitRows = [];
      let buildingRows = [];

      if (unitIds.length) {
        const uRes = await supabase.from("units").select("*").in("id", unitIds);
        unitRows = rowsToCamel(uRes.data || []);

        const buildingIds = [...new Set(unitRows.map((u) => u.buildingId).filter(Boolean))];
        if (buildingIds.length) {
          const bRes = await supabase.from("buildings").select("*").in("id", buildingIds);
          buildingRows = rowsToCamel(bRes.data || []);
        }
      }

      setTenants(tenantRows);
      setPayments(paymentRows);
      setUnits(unitRows);
      setBuildings(buildingRows);
      setSelectedTenantId(tenantRows[0]?.id || null);
      setLoading(false);
    }

    load().catch((err) => {
      console.error("Tenant portal load failed:", err);
      setLoading(false);
    });
  }, [tenantAccess]);

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId) || null;
  const selectedUnit = units.find((u) => u.id === selectedTenant?.unitId) || null;
  const selectedBuilding = buildings.find((b) => b.id === selectedUnit?.buildingId) || null;

  // Payments for the selected tenant
  const selectedPayments = useMemo(() => {
    if (!selectedTenantId) return [];
    return payments.filter((p) => p.tenantId === selectedTenantId);
  }, [payments, selectedTenantId]);

  // Outstanding balance per tenant
  const balances = useMemo(() => {
    const map = {};
    for (const t of tenants) {
      const tp = payments.filter((p) => p.tenantId === t.id);
      map[t.id] = tp.reduce((sum, p) => sum + ((p.amountDue || 0) - (p.amountPaid || 0)), 0);
    }
    return map;
  }, [tenants, payments]);

  const totalBalance = useMemo(() => {
    return Object.values(balances).reduce((s, b) => s + b, 0);
  }, [balances]);

  return (
    <TenantCtx.Provider value={{
      loading, user, tenantAccess,
      tenants, payments, units, buildings,
      selectedTenantId, setSelectedTenantId,
      selectedTenant, selectedUnit, selectedBuilding, selectedPayments,
      balances, totalBalance,
    }}>
      {children}
    </TenantCtx.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantCtx);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}
