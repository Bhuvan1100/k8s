import { useState } from "react"
import StatusBadge from "./StatusBadge"

export default function ProposalCard({ proposal, onApprove, onReject }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Variant: {proposal.variant_id}</h2>
        <StatusBadge status={proposal.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>Old Price: ₹{proposal.old_price}</div>
        <div>New Price: ₹{proposal.proposed_price}</div>
        <div>Strategy: {proposal.strategy}</div>
        <div>Aggressiveness: {proposal.aggressiveness}</div>
        <div>Confidence: {proposal.confidence}</div>
        <div>Created: {new Date(proposal.created_at).toLocaleString()}</div>
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="text-blue-600 text-sm mb-3"
      >
        {open ? "Hide Details" : "View Details"}
      </button>

      {open && (
        <div className="bg-gray-50 p-4 rounded-lg text-sm mb-4 space-y-2">
          <div><strong>Market State:</strong> {proposal.market_state}</div>
          <div><strong>Snapshot:</strong> {JSON.stringify(proposal.snapshot)}</div>
          <div><strong>Memory:</strong> {JSON.stringify(proposal.memory_snapshot)}</div>
          <div><strong>Stage1 AI:</strong> {proposal.stage1_raw}</div>
          <div><strong>Stage2 AI:</strong> {proposal.stage2_raw}</div>
        </div>
      )}

      {proposal.status === "PENDING" && (
        <div className="flex gap-4">
          <button
            onClick={() => onApprove(proposal.id)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Approve
          </button>
          <button
            onClick={() => onReject(proposal.id)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  )
}
