import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import healthRouter from "./routes/health.js";


const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use("/health", healthRouter);


const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`API listening on :${port}`));
