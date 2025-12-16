import client from "prom-client";

// collect default Node.js metrics (CPU, memory, etc.)
// client.collectDefaultMetrics();


const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"]
});


export const prometheusMiddleware = (req, res, next) => {
  res.on("finish", () => {
    httpRequestCounter.labels(
      req.method,
      req.route?.path || req.path,
      res.statusCode
    ).inc();
  });
  next();
};


export const prometheusMetricsEndpoint = async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
};
