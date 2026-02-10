export function strictRequestIdMiddleware(req, res, next) {
  const requestId = req.headers["x-request-id"]

  if (!requestId) {
    return res.status(400).json({
      error: "REQUEST_ID_MISSING",
      message: "x-request-id header is required"
    })
  }

  req.requestId = requestId

  
  req.headers["x-request-id"] = requestId
  
  next()
}
