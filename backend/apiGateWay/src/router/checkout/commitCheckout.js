import axios from "axios"

import appLogger from "../../logger/appLogger.js"
import errorLogger from "../../logger/errorLogger.js"

export const commitCheckoutSession = async (req, res) => {
  console.log("COMMIT_CHECKOUT_SESSION request received", {
    requestId: req.requestId
  })

  try {
    const response = await axios.post(
      "http://orderservice:4005/checkout/session/commit",
      req.body,
      {
        headers: {
          "x-request-id": req.requestId
        }
      }
    )

    appLogger.info({
      requestId: req.requestId,
      event: "COMMIT_CHECKOUT_SESSION_SUCCESS",
      status: response.status
    })

    console.log("COMMIT_CHECKOUT_SESSION response sent", {
      requestId: req.requestId,
      status: response.status
    })

    return res.status(response.status).json(response.data)
  } catch (error) {
    console.error("COMMIT_CHECKOUT_SESSION error", {
      requestId: req.requestId,
      message: error.message
    })

    errorLogger.error({
      requestId: req.requestId,
      event: "COMMIT_CHECKOUT_SESSION_FAILED",
      error: error.message,
      status: error.response?.status
    })

    if (error.response) {
      return res.status(error.response.status).json(error.response.data)
    }

    return res.status(500).json({
      message: "Failed to commit checkout session"
    })
  }
}