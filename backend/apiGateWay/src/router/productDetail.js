import axios from "axios"

import appLogger from "../logger/appLogger.js"
import errorLogger from "../logger/errorLogger.js"

export const getProduct = async (req, res) => {
  const { productId } = req.params

  console.log("GET_PRODUCT request received", {
    requestId: req.requestId,
    productId
  })

  try {
    const response = await axios.get(
      `http://productservice:4006/product/productdetail/${productId}`,
      {
        headers: {
          "x-request-id": req.requestId
        }
      }
    )

    appLogger.info({
      requestId: req.requestId,
      event: "GET_PRODUCT_SUCCESS",
      productId,
      status: response.status
    })

    console.log("GET_PRODUCT response sent", {
      requestId: req.requestId,
      status: response.status
    })

    return res.status(response.status).json(response.data)
  } catch (error) {
    console.error("GET_PRODUCT error", {
      requestId: req.requestId,
      productId,
      message: error.message
    })

    errorLogger.error({
      requestId: req.requestId,
      event: "GET_PRODUCT_FAILED",
      productId,
      error: error.message,
      status: error.response?.status
    })

    if (error.response) {
      return res.status(error.response.status).json(error.response.data)
    }

    return res.status(500).json({
      message: "Seller service unavailable"
    })
  }
}
