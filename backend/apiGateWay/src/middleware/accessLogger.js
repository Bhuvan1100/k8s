import accessLogger from "../logger/accesslogger.js";

const accessLoggerMiddleware = (req, res, next) => {
  const startTime = process.hrtime.bigint();

  res.on("finish", () => {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;

    accessLogger.info({
      requestId: req.requestId,

      method: req.method,
      path: req.originalUrl,
      baseUrl: req.baseUrl,
      route: req.route?.path || null,

      statusCode: res.statusCode,
      durationMs: Math.round(durationMs),

      ip: req.ip,
      forwardedFor: req.headers["x-forwarded-for"] || null,

      userAgent: req.headers["user-agent"] || null,
      referer: req.headers["referer"] || null,

      contentLength: res.getHeader("content-length") || null,

      requestSize:
        req.headers["content-length"]
          ? Number(req.headers["content-length"])
          : null,

      responseSize:
        res.getHeader("content-length")
          ? Number(res.getHeader("content-length"))
          : null,

      query: Object.keys(req.query).length ? req.query : null,

      hasBody:
        req.method !== "GET" &&
        req.method !== "HEAD" &&
        req.headers["content-length"] > 0,

      timestamp: new Date().toISOString()
    });
  });

  next();
};

export default accessLoggerMiddleware;
