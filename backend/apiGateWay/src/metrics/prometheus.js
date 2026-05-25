import client from "prom-client";
import appLogger from "../logger/appLogger.js";
import errorLogger from "../logger/errorLogger.js";

client.collectDefaultMetrics();

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

const requestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request latency",
  labelNames: ["method", "route", "status"],
  buckets: [0.1, 0.5, 1, 2, 5],
});

const httpErrorCounter = new client.Counter({
  name: "http_errors_total",
  help: "Total HTTP errors",
  labelNames: ["method", "route", "status"],
});

export const errorTrackingMiddleware = (req, res, next) => {
  res.on("finish", () => {
    try {
      if (res.statusCode >= 400) {
        httpErrorCounter
          .labels(
            req.method,
            req.path,
            res.statusCode.toString()
          )
          .inc();
      }
    } catch (err) {
      console.error("PROMETHEUS ERROR TRACKING FAILED", err.message);

      errorLogger.error({
        event: "PROMETHEUS_ERROR_TRACKING_FAILED",
        requestId: req.requestId,
        error: err.message,
      });
    }
  });

  next();
};

export const totalRequestCounter = (req, res, next) => {
  res.on("finish", () => {
    try {
      httpRequestCounter
        .labels(
          req.method,
          req.path,
          res.statusCode.toString()
        )
        .inc();
    } catch (err) {
      console.error("PROMETHEUS REQUEST COUNTER ERROR", err.message);

      errorLogger.error({
        event: "PROMETHEUS_REQUEST_COUNTER_ERROR",
        requestId: req.requestId,
        error: err.message,
      });
    }
  });

  next();
};

export const latencyChecker = (req, res, next) => {
  const end = requestDuration.startTimer();

  res.on("finish", () => {
    try {
      end({
        method: req.method,
        route: req.path,
        status: res.statusCode.toString(),
      });
    } catch (err) {
      console.error("PROMETHEUS LATENCY TRACKING ERROR", err.message);

      errorLogger.error({
        event: "PROMETHEUS_LATENCY_TRACKING_ERROR",
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

    console.log("PROMETHEUS METRICS SERVED");
  } catch (err) {
    console.error("PROMETHEUS METRICS ENDPOINT ERROR", err.message);

    errorLogger.error({
      event: "PROMETHEUS_METRICS_ENDPOINT_ERROR",
      error: err.message,
    });

    res.status(500).end();
  }
};