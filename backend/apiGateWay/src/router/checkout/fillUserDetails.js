import axios from "axios"

import appLogger from "../../logger/appLogger.js"
import errorLogger from "../../logger/errorLogger.js"

export const fillCheckoutDetails = async (req, res) => {
  console.log("FILL_CHECKOUT_DETAILS request received", {
    requestId: req.requestId
  })

  try {
    const response = await axios.post(
      "http://orderservice:4004/checkout/session/details",
      req.body,
      {
        headers: {
          "x-request-id": req.requestId
        }
      }
    )

    appLogger.info({
      requestId: req.requestId,
      event: "FILL_CHECKOUT_DETAILS_SUCCESS",
      status: response.status
    })

    console.log("FILL_CHECKOUT_DETAILS response sent", {
      requestId: req.requestId,
      status: response.status
    })

    return res.status(response.status).json(response.data)
  } catch (error) {
    console.error("FILL_CHECKOUT_DETAILS error", {
      requestId: req.requestId,
      message: error.message
    })

    errorLogger.error({
      requestId: req.requestId,
      event: "FILL_CHECKOUT_DETAILS_FAILED",
      error: error.message,
      status: error.response?.status
    })

    if (error.response) {
      return res.status(error.response.status).json(error.response.data)
    }

    return res.status(500).json({
      message: "Failed to forward checkout details request"
    })
  }
}
