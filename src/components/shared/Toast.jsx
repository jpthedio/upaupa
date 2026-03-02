import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function Toast({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) {
      setVisible(false);
      return;
    }
    const enterTimer = requestAnimationFrame(() => setVisible(true));
    const dismissTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(), 300);
    }, 5000);
    return () => {
      cancelAnimationFrame(enterTimer);
      clearTimeout(dismissTimer);
    };
  }, [toast?.id]);

  if (!toast) return null;

  function handleUndo() {
    toast.undoFn?.();
    setVisible(false);
    setTimeout(() => onDismiss(), 300);
  }

  function handleClose() {
    setVisible(false);
    setTimeout(() => onDismiss(), 300);
  }

  return (
    <div
      className={`fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-8 lg:w-auto z-50 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="bg-zinc-900 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-3">
        <span className="text-sm">{toast.message}</span>
        {toast.undoFn && (
          <button
            onClick={handleUndo}
            className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Undo
          </button>
        )}
        <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded-full transition-colors ml-1">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
