require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const helmet = require("helmet");
const cors = require("cors");
const mediaRoutes = require("./routes/media.routes.js");
const errorHandler = require("./middleware/errorHandler.js");
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq.js");
const {
  handlePostDeleted,
} = require("./eventHandlers/media-event-handlers.js");

const app = express();
const PORT = process.env.PORT || 3003;

// connect to mongodb
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info("Connected to mongodb");
  })
  .catch((e) => logger.error("Mongodb connection error", e));

// middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} to ${req.url}`);
  logger.info(`Request body, ${req.body}`);

  next();
});

app.use("/api/media", mediaRoutes);

app.use(errorHandler);

async function startServer() {
  try {
    await connectToRabbitMQ();

    // consume all event
    await consumeEvent("post.deleted", handlePostDeleted);

    app.listen(PORT, () => {
      logger.info(`Media service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("failed to connect to server", error);
    process.exit(1);
  }
}

startServer();

// unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason: ", reason);
});
