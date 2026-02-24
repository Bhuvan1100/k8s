import axios from "axios"

import appLogger from "../../logger/appLogger.js"
import errorLogger from "../../logger/errorLogger.js"
import accessLogger from "../../logger/accesslogger.js"

export const fetchProposals = async (req, res) => {

  const { status } = req.query

  console.log("FETCH_PROPOSALS request received", {
    requestId: req.requestId,
    status
  })

  try {

    if (!status) {
      return res.status(400).json({
        message: "status query parameter is required"
      })
    }

    const response = await axios.get(
      "http://pricingservice:4008/proposals",
      {
        params: { status },
        headers: {
          "x-request-id": req.requestId
        }
      }
    )

    appLogger.info({
      requestId: req.requestId,
      event: "FETCH_PROPOSALS_SUCCESS",
      statusFilter: status,
      responseStatus: response.status
    })

    accessLogger.info({
      requestId: req.requestId,
      action: "FETCH_PROPOSALS",
      status: response.status
    })

    res.status(response.status).json(response.data)

  } catch (err) {

    console.error("GATEWAY FETCH_PROPOSALS ERROR", {
      requestId: req.requestId,
      message: err.message
    })

    errorLogger.error({
      requestId: req.requestId,
      event: "FETCH_PROPOSALS_FAILED",
      error: err.message,
      status: err.response?.status
    })

    res.status(err.response?.status || 500).json({
      message: "Pricing service fetch proposals failed"
    })
  }
}
