import { Button } from "@/components/ui/button";

const VARIANT_STYLES = {
  destructive: "bg-red-600 hover:bg-red-700 text-white",
  archive: "bg-purple-600 hover:bg-purple-700 text-white",
};

export function ConfirmDialog({ open, onClose, onConfirm, title, message, actionLabel = "Delete", variant = "destructive" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-zinc-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} className="rounded-full">Cancel</Button>
          <Button onClick={onConfirm} className={`rounded-full ${VARIANT_STYLES[variant] || VARIANT_STYLES.destructive}`}>{actionLabel}</Button>
        </div>
      </div>
    </div>
  );
}
