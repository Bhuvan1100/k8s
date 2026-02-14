import axios from "axios"

import appLogger from "../../logger/appLogger.js"
import errorLogger from "../../logger/errorLogger.js"

export const proceedToCheckout = async (req, res) => {
  console.log("PROCEED_CHECKOUT request received", {
    requestId: req.requestId
  })

  try {
    const response = await axios.post(
      "http://orderservice:4005/checkout/preview",
      req.body,
      {
        headers: {
          "x-request-id": req.requestId
        }
      }
    )

    appLogger.info({
      requestId: req.requestId,
      event: "PROCEED_CHECKOUT_SUCCESS",
      status: response.status
    })

    console.log("PROCEED_CHECKOUT response sent", {
      requestId: req.requestId,
      status: response.status
    })

    return res.status(response.status).json(response.data)
  } catch (error) {
    console.error("PROCEED_CHECKOUT error", {
      requestId: req.requestId,
      message: error.message
    })

    errorLogger.error({
      requestId: req.requestId,
      event: "PROCEED_CHECKOUT_FAILED",
      error: error.message,
      status: error.response?.status
    })

    if (error.response) {
      return res.status(error.response.status).json(error.response.data)
    }

    return res.status(500).json({
      message: "Order service unavailable"
    })
  }
}