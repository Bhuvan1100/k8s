import accessLogger from "../logger/accesslogger.js"

const accessLoggerMiddleware = (req, res, next) => {
  const startTime = Date.now()

 
  res.on("finish", () => {
    const durationMs = Date.now() - startTime

    accessLogger.info({
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs
    })
  })

  next() 
}

export default accessLoggerMiddleware
