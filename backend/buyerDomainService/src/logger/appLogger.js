import pino from "pino"
import fs from "fs"
import path from "path"
import baseLoggerConfig from "./base.js"

const logDir = path.join(process.cwd(), "logs")

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

const appLogger = pino(
  baseLoggerConfig,
  pino.destination({
    dest: path.join(logDir, "app.log"),
    sync: false
  })
)

export default appLogger
