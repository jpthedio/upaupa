import { Card, CardContent } from "@/components/ui/card";
import { InfoTip } from "@/components/shared/InfoTip";

export function StatCard({ icon: Icon, label, value, sub, accent, tip }) {
  return (
    <Card className="border border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-sm text-zinc-500 mb-1 flex items-center gap-1">{label}{tip && <InfoTip text={tip} />}</span>
            <p className={`text-2xl font-semibold tracking-tight ${accent || "text-zinc-900"}`}>{value}</p>
            {sub && <p className="text-xs text-zinc-400 mt-1">{sub}</p>}
          </div>
          <div className={`p-2.5 rounded-xl ${accent ? "bg-red-50" : "bg-zinc-100"}`}>
            <Icon size={20} className={accent || "text-zinc-500"} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
