import crypto from "crypto"

export function requestIdMiddleware(req, res, next) {
  const incomingId = req.headers["x-request-id"]

  const requestId = incomingId || crypto.randomUUID()

  req.requestId = requestId

  
  req.headers["x-request-id"] = requestId

 
  res.setHeader("x-request-id", requestId)

  next()
}
