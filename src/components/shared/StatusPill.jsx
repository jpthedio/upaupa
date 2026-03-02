import { STATUS_COLORS } from "@/lib/constants";

export function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_COLORS[status] || "bg-zinc-100 text-zinc-500"}`}>
      {status?.replace("_", " ")}
    </span>
  );
}
