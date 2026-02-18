import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import healthRouter from "./routes/health.js";
import routinesRouter from "./routes/routines.js";
import badgesRouter from "./routes/badges.js";


const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "5mb" }));

// Health check endpoint
app.use("/health", healthRouter);

// Mounting the routines router
app.use("/routines", routinesRouter);

// Mounting the badges router
app.use("/badges", badgesRouter);


const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`API listening on :${port}`));
