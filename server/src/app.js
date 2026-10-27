import express from "express";
import cors from "cors";
import itineraryRoutes from "./routes/itineraryRoutes.js";
import queryRoutes from "./routes/queryRoutes.js";

const app = express();

app.use(express.json({ limit: "20kb" }));

app.set("trust proxy", "loopback, linklocal, uniquelocal");

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    exposedHeaders: ["X-Itinerary-Id"],
  }),
);

app.use("/api/itineraries", itineraryRoutes);
app.use("/api/query", queryRoutes);

export default app;
