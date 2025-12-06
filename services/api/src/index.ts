import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import healthRouter from "./routes/health.js";
import plansRouter from "./routes/plans.js";
import badgesRouter from "./routes/badges.js";


const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check endpoint
app.use("/health", healthRouter);

// Mounting the plans router
app.use("/plans", plansRouter);

// Mounting the badges router
app.use("/badges", badgesRouter);


const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`API listening on :${port}`));
