const BASE_URL = "http://localhost:8000/admin"

export async function fetchProposals(status) {
  const res = await fetch(`${BASE_URL}/proposals?status=${status}`)
  return await res.json()
}

export async function approveProposal(id) {
  await fetch(`${BASE_URL}/proposals/${id}/approve`, {
    method: "POST"
  })
}

export async function rejectProposal(id) {
  await fetch(`${BASE_URL}/proposals/${id}/reject`, {
    method: "POST"
  })
}
