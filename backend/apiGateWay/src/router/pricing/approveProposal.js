import axios from "axios"

import appLogger from "../../logger/appLogger.js"
import errorLogger from "../../logger/errorLogger.js"
import accessLogger from "../../logger/accesslogger.js"

export const approveProposal = async (req, res) => {
  const { proposal_id } = req.params

  console.log("APPROVE_PROPOSAL request received", {
    requestId: req.requestId,
    proposal_id
  })

  try {

    const response = await axios.post(
      `http://pricingservice:4007/proposals/${proposal_id}/approve`,
      {},
      {
        headers: {
          "x-request-id": req.requestId
        }
      }
    )

    appLogger.info({
      requestId: req.requestId,
      event: "APPROVE_PROPOSAL_SUCCESS",
      proposalId: proposal_id,
      status: response.status
    })

    accessLogger.info({
      requestId: req.requestId,
      action: "APPROVE_PROPOSAL",
      status: response.status
    })

    console.log("APPROVE_PROPOSAL response sent", {
      requestId: req.requestId,
      status: response.status
    })

    res.status(response.status).json(response.data)

  } catch (err) {

    console.error("GATEWAY APPROVE_PROPOSAL ERROR", {
      requestId: req.requestId,
      proposal_id,
      message: err.message
    })

    errorLogger.error({
      requestId: req.requestId,
      event: "APPROVE_PROPOSAL_FAILED",
      proposalId: proposal_id,
      error: err.message,
      status: err.response?.status
    })

    res.status(err.response?.status || 500).json({
      message: "Pricing service approve proposal failed"
    })
  }
}
