import client from "prom-client";
import appLogger from "../logger/appLogger.js";
import errorLogger from "../logger/errorLogger.js";

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

export const prometheusMiddleware = (req, res, next) => {
  res.on("finish", () => {
    try {
      httpRequestCounter
        .labels(req.method, req.path, res.statusCode)
        .inc();
    } catch (err) {
      console.error("PROMETHEUS METRIC ERROR", err.message);

      errorLogger.error({
        event: "PROMETHEUS_METRIC_ERROR",
        requestId: req.requestId,
        error: err.message,
      });
    }
  });

  next();
};

export const prometheusMetricsEndpoint = async (req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());

    appLogger.info({
      event: "PROMETHEUS_METRICS_SERVED",
    });

    // console.log("PROMETHEUS METRICS SERVED ");
  } catch (err) {
    console.error("PROMETHEUS METRICS ENDPOINT ERROR", err.message);

    errorLogger.error({
      event: "PROMETHEUS_METRICS_ENDPOINT_ERROR",
      error: err.message,
    });

    res.status(500).end();
  }
};
