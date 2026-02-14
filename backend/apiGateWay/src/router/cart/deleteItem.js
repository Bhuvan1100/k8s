import axios from "axios"

import appLogger from "../../logger/appLogger.js"
import errorLogger from "../../logger/errorLogger.js"

export const deleteCartItem = async (req, res) => {
  console.log("DELETE_CART request received", {
    requestId: req.requestId
  })

  try {
    const response = await axios.delete(
      "http://buyerservice:4002/buyer/cart/delete",
      {
        data: req.body,
        headers: {
          "x-request-id": req.requestId
        }
      }
    )

    appLogger.info({
      requestId: req.requestId,
      event: "DELETE_CART_SUCCESS",
      status: response.status
    })

    console.log("DELETE_CART response sent", {
      requestId: req.requestId,
      status: response.status
    })

    return res.status(response.status).json(response.data)
  } catch (error) {
    console.error("DELETE_CART error", {
      requestId: req.requestId,
      message: error.message
    })

    errorLogger.error({
      requestId: req.requestId,
      event: "DELETE_CART_FAILED",
      error: error.message,
      status: error.response?.status
    })

    if (error.response) {
      return res.status(error.response.status).json(error.response.data)
    }

    return res.status(500).json({
      message: "Buyer service unavailable"
    })
  }
}