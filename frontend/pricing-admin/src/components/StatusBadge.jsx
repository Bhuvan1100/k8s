export default function StatusBadge({ status }) {
  const colors = {
    PENDING: "bg-amber-100 text-amber-800 ring-amber-200",
    APPROVED: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    REJECTED: "bg-rose-100 text-rose-800 ring-rose-200"
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${colors[status] || "bg-slate-100 text-slate-700 ring-slate-200"}`}>
      {status || "UNKNOWN"}
    </span>
  )
}
