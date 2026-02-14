import axios from "axios"

import appLogger from "../../logger/appLogger.js"
import errorLogger from "../../logger/errorLogger.js"

export const getProductsByQuery = async (req, res) => {
  const { query } = req.params

  console.log("SEARCH_QUERY request received", {
    requestId: req.requestId,
    query
  })

  try {
    const response = await axios.post(
      `http://searchingservice:4005/search/${query}`,
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
      event: "SEARCH_QUERY_SUCCESS",
      query,
      status: response.status
    })

    console.log("SEARCH_QUERY response sent", {
      requestId: req.requestId,
      status: response.status
    })

    res.status(response.status).json(response.data)
  } catch (err) {
    console.error("SEARCH_QUERY error", {
      requestId: req.requestId,
      query,
      message: err.message
    })

    errorLogger.error({
      requestId: req.requestId,
      event: "SEARCH_QUERY_FAILED",
      query,
      error: err.message,
      status: err.response?.status
    })

    res.status(err.response?.status || 500).json({
      message: "Search service query search failed",
      requestId: req.requestId
    })
  }
}