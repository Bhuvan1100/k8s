import axios from "axios"

import errorLogger from "../../logger/errorLogger.js"
import accessLogger from "../../logger/accesslogger.js"
import appLogger from "../../logger/appLogger.js"

export const addProduct = async (req, res) => {
  console.log("ADD_PRODUCT request received", {
    requestId: req.requestId
  })

  try {
    const response = await axios.post(
      "http://productservice:4003/seller/product",
      req.body,
      {
        headers: {
          "x-request-id": req.requestId
        }
      }
    )

    console.log("ADD_PRODUCT response sent", {
      requestId: req.requestId,
      status: response.status
    })

    appLogger.info({
      requestId: req.requestId,
      event: "ADD_PRODUCT_SUCCESS"
    })

    accessLogger.info({
      requestId: req.requestId,
      action: "ADD_PRODUCT",
      status: response.status
    })

    res.status(response.status).json(response.data)
  } catch (err) {
    console.error("ADD_PRODUCT error", {
      requestId: req.requestId,
      message: err.message
    })

    errorLogger.error({
      requestId: req.requestId,
      event: "ADD_PRODUCT_FAILED",
      error: err.message,
      status: err.response?.status
    })

    res.status(err.response?.status || 500).json({
      message: "product service failed"
    })
  }
}
