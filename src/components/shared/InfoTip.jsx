import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

export function InfoTip({ text }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", handleClick);
    return () => document.removeEventListener("pointerdown", handleClick);
  }, [open]);

  return (
    <span className="relative inline-flex" ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="p-0.5 text-zinc-400 hover:text-zinc-600 transition-colors"
        aria-label="More info"
      >
        <Info size={14} />
      </button>
      {open && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 text-xs text-zinc-700 bg-white border border-zinc-200 rounded-xl shadow-lg block">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-white border-r border-b border-zinc-200 rotate-45 block" />
        </span>
      )}
    </span>
  );
}
