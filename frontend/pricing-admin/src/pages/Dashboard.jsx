import { useEffect, useState } from "react"
import { fetchProposals, approveProposal, rejectProposal } from "../api/proposals"
import ProposalCard from "../components/ProposalCard"

export default function Dashboard() {
  const [proposals, setProposals] = useState([])
  const [filter, setFilter] = useState("PENDING")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProposals()
  }, [filter])

  async function loadProposals() {
    setLoading(true)
    const data = await fetchProposals(filter)
    setProposals(data)
    setLoading(false)
  }

  async function handleApprove(id) {
    await approveProposal(id)
    setProposals(prev => prev.filter(p => p.id !== id))
  }

  async function handleReject(id) {
    await rejectProposal(id)
    setProposals(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="min-h-screen p-10 bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">Pricing Admin Panel</h1>

      <div className="flex gap-4 mb-6">
        {["PENDING", "APPROVED", "REJECTED"].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-white border"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading && <div>Loading...</div>}

      {!loading &&
        proposals.map(proposal => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))}
    </div>
  )
}
