import axios from "axios"

import appLogger from "../../logger/appLogger.js"
import errorLogger from "../../logger/errorLogger.js"

export const getProductsByCategory = async (req, res) => {
  const { category, subCategory } = req.params

  console.log("SEARCH_CATEGORY request received", {
    requestId: req.requestId,
    category,
    subCategory
  })

  try {
    const response = await axios.post(
      `http://searchingservice:4006/products/${category}/${subCategory}`,
      req.body,
      {
        headers: {
          "x-request-id": req.requestId
        },
        params: req.query
      }
    )

    appLogger.info({
      requestId: req.requestId,
      event: "SEARCH_CATEGORY_SUCCESS",
      category,
      subCategory,
      status: response.status
    })

    console.log("SEARCH_CATEGORY response sent", {
      requestId: req.requestId,
      status: response.status
    })

    res.status(response.status).json(response.data)
  } catch (err) {
    console.error("SEARCH_CATEGORY error", {
      requestId: req.requestId,
      category,
      subCategory,
      message: err.message
    })

    errorLogger.error({
      requestId: req.requestId,
      event: "SEARCH_CATEGORY_FAILED",
      category,
      subCategory,
      error: err.message,
      status: err.response?.status
    })

    res.status(err.response?.status || 500).json({
      message: "Search service category search failed",
      requestId: req.requestId
    })
  }
}
