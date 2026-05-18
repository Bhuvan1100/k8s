import { useState } from "react"
import StatusBadge from "./StatusBadge"

export default function ProposalCard({ proposal, onApprove, onReject }) {
  const [open, setOpen] = useState(false)
  const [action, setAction] = useState(null)

  const oldPrice = formatCurrency(proposal.old_price)
  const proposedPrice = formatCurrency(proposal.proposed_price)
  const change = Number(proposal.proposed_price) - Number(proposal.old_price)
  const changePercent = Number(proposal.old_price)
    ? (change / Number(proposal.old_price)) * 100
    : 0

  async function runAction(type) {
    setAction(type)
    try {
      if (type === "approve") {
        await onApprove(proposal.id)
      } else {
        await onReject(proposal.id)
      }
    } finally {
      setAction(null)
    }
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Variant</p>
          <h2 className="mt-1 break-all text-lg font-semibold text-slate-950">{proposal.variant_id}</h2>
        </div>
        <StatusBadge status={proposal.status} />
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <Metric label="Current price" value={oldPrice} />
        <Metric label="Proposed price" value={proposedPrice} />
        <Metric
          label="Change"
          value={`${change >= 0 ? "+" : ""}${formatCurrency(change)} (${changePercent.toFixed(1)}%)`}
          tone={change >= 0 ? "text-emerald-700" : "text-rose-700"}
        />
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="mt-4 text-sm font-medium text-indigo-700 hover:text-indigo-900"
      >
        {open ? "Hide details" : "View details"}
      </button>

      {open && (
        <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2">
          <Detail label="Proposal ID" value={proposal.id} />
          <Detail label="Created" value={formatDate(proposal.created_at)} />
          <Detail label="Approved" value={formatDate(proposal.approved_at)} />
          <Detail label="Rejected" value={formatDate(proposal.rejected_at)} />
        </div>
      )}

      {proposal.status === "PENDING" && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            disabled={Boolean(action)}
            onClick={() => runAction("approve")}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {action === "approve" ? "Approving..." : "Approve"}
          </button>
          <button
            disabled={Boolean(action)}
            onClick={() => runAction("reject")}
            className="rounded-md border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {action === "reject" ? "Rejecting..." : "Reject"}
          </button>
        </div>
      )}
    </article>
  )
}

function Metric({ label, value, tone = "text-slate-950" }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-base font-semibold ${tone}`}>{value}</p>
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 break-all text-slate-900">{value || "Not available"}</p>
    </div>
  )
}

function formatCurrency(value) {
  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return "Not available"
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(amount)
}

function formatDate(value) {
  if (!value) {
    return null
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}
