import pino from "pino";
import fs from "fs";
import path from "path";

const logDir = path.resolve(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logger = pino(pino.destination(path.join(logDir, "app.log")));

export default logger;
