import errorLogger from "../logger/errorLogger.js"

const errorHandlerMiddleware = (err, req, res, next) => {
  console.error("UNHANDLED ERROR", err.message)

  errorLogger.error({
    event: "UNHANDLED_ERROR",
    requestId: req.requestId,
    error: err.message,
    stack: err.stack
  })

  res.status(500).json({ message: "Internal Server Error" })
}

export default errorHandlerMiddleware
