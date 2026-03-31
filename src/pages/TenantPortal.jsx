import { TenantProvider } from "@/context/TenantContext";
import { TenantShell } from "@/components/layout/TenantShell";

export function TenantPortal({ tenantAccess, user }) {
  return (
    <TenantProvider user={user} tenantAccess={tenantAccess}>
      <TenantShell />
    </TenantProvider>
  );
}
