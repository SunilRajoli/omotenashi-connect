import { createServer } from "http";
import app from "./app";
import { env } from "config/env.js";
import { logger } from "config/logger.js";

const server = createServer(app);
const port = env.PORT || 3000;

server.listen(port, () => {
    logger.info(`🚀 Omotenashi Connect listening on http://localhost:${port}`);
});