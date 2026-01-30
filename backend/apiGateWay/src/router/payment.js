import axios from "axios"

import appLogger from "../logger/appLogger.js"
import errorLogger from "../logger/errorLogger.js"

export const paymentCallback = async (req, res) => {
  const requestId = req.headers["x-request-id"]

  console.log("PAYMENT_CALLBACK request received", {
    requestId
  })

  try {
    const response = await axios.post(
      "http://orderservice:4005/orders/payment",
      req.body,
      {
        headers: {
          "x-request-id": requestId
        }
      }
    )

    appLogger.info({
      requestId,
      event: "PAYMENT_CALLBACK_SUCCESS",
      status: response.status
    })

    console.log("PAYMENT_CALLBACK response sent", {
      requestId,
      status: response.status
    })

    return res.status(response.status).json(response.data)
  } catch (error) {
    console.error("PAYMENT_CALLBACK error", {
      requestId,
      message: error.message
    })

    errorLogger.error({
      requestId,
      event: "PAYMENT_CALLBACK_FAILED",
      error: error.message,
      status: error.response?.status
    })

    if (error.response) {
      return res.status(error.response.status).json(error.response.data)
    }

    return res.status(500).json({
      message: "Payment processing failed"
    })
  }
}
