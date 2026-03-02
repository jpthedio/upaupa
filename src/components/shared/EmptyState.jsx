import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function EmptyState({ icon: Icon, title, sub, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-2xl bg-zinc-100 mb-4"><Icon size={32} className="text-zinc-400" /></div>
      <p className="text-zinc-700 font-medium mb-1">{title}</p>
      <p className="text-sm text-zinc-400 mb-4 max-w-xs">{sub}</p>
      {action && <Button onClick={onAction} size="sm" className="rounded-full bg-zinc-900 hover:bg-zinc-800"><Plus size={14} className="mr-1" />{action}</Button>}
    </div>
  );
}
