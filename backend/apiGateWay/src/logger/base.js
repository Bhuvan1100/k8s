import pino from "pino"

const baseLoggerConfig = {
  level: process.env.LOG_LEVEL || "info",
  base: {
    service: "api-gateway",
    env: process.env.NODE_ENV || "development"
  },
  timestamp: pino.stdTimeFunctions.isoTime
}

export default baseLoggerConfig
