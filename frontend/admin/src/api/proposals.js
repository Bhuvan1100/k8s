const API_URL = import.meta.env.VITE_PRICING_ADMIN_API_URL

function getApiUrl() {
  if (!API_URL) {
    throw new Error("Missing VITE_PRICING_ADMIN_API_URL in your frontend env file.")
  }

  return API_URL.replace(/\/$/, "")
}

async function request(path, options = {}) {
  const response = await fetch(`${getApiUrl()}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.message || payload?.detail || "Pricing request failed.")
  }

  return payload
}

export async function fetchProposals(status) {
  const query = new URLSearchParams({ status })
  return request(`/proposals?${query.toString()}`)
}

export async function approveProposal(id) {
  return request(`/proposals/${id}/approve`, {
    method: "POST"
  })
}

export async function rejectProposal(id) {
  return request(`/proposals/${id}/reject`, {
    method: "POST"
  })
}
// thhis is the main fetching page