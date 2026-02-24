export default function StatusBadge({ status }) {
  const colors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800"
  }

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>
      {status}
    </span>
  )
}
