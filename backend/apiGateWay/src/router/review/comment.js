import axios from "axios"

import appLogger from "../../logger/appLogger.js"
import errorLogger from "../../logger/errorLogger.js"

export const commentProduct = async (req, res) => {
  const { productId } = req.params

  console.log("COMMENT_PRODUCT request received", {
    requestId: req.requestId,
    productId
  })

  try {
    const response = await axios.post(
      `http://productservice:4003/product/comment/${productId}`,
      req.body,
      {
        headers: {
          "x-request-id": req.requestId
        }
      }
    )

    appLogger.info({
      requestId: req.requestId,
      event: "COMMENT_PRODUCT_SUCCESS",
      productId,
      status: response.status
    })

    console.log("COMMENT_PRODUCT response sent", {
      requestId: req.requestId,
      status: response.status
    })

    return res.status(response.status).json(response.data)
  } catch (error) {
    console.error("COMMENT_PRODUCT error", {
      requestId: req.requestId,
      productId,
      message: error.message
    })

    errorLogger.error({
      requestId: req.requestId,
      event: "COMMENT_PRODUCT_FAILED",
      productId,
      error: error.message,
      status: error.response?.status
    })

    if (error.response) {
      return res.status(error.response.status).json(error.response.data)
    }

    return res.status(500).json({
      message: "seller service unavailable"
    })
  }
}
