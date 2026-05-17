import { useEffect, useState } from "react"
import { fetchProposals, approveProposal, rejectProposal } from "../api/proposals"
import ProposalCard from "../components/ProposalCard"

const STATUSES = ["PENDING", "APPROVED", "REJECTED"]

export default function Dashboard() {
  const [proposals, setProposals] = useState([])
  const [filter, setFilter] = useState("PENDING")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadProposals()
  }, [filter])

  async function loadProposals() {
    setLoading(true)
    setError("")

    try {
      const data = await fetchProposals(filter)
      setProposals(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
      setProposals([])
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(id) {
    try {
      await approveProposal(id)
      setProposals(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleReject(id) {
    try {
      await rejectProposal(id)
      setProposals(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">CartCraft</p>
            <h1 className="mt-2 text-3xl font-bold">Pricing Admin</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Review AI pricing proposals and send approval decisions back through the API Gateway.
            </p>
          </div>

          <button
            onClick={loadProposals}
            disabled={loading}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
          {STATUSES.map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                filter === status
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
            {error}
          </div>
        )}

        {loading && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-600 shadow-sm">
            Loading proposals...
          </div>
        )}

        {!loading && proposals.length === 0 && !error && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">No {filter.toLowerCase()} proposals</h2>
            <p className="mt-2 text-sm text-slate-600">There is nothing in this queue right now.</p>
          </div>
        )}

        {!loading && proposals.length > 0 && (
          <div className="grid gap-4">
            {proposals.map(proposal => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
