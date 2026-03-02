import { Label } from "@/components/ui/label";

export function Field({ label, children, className }) {
  return (
    <div className={className || ""}>
      <Label className="text-sm text-zinc-600 mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
