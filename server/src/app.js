import express from "express";
import cors from "cors";
import itineraryRoutes from "./routes/itineraryRoutes.js";
import queryRoutes from "./routes/queryRoutes.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    exposedHeaders: ["X-Itinerary-Id"],
  }),
);

app.use(express.json());

app.use("/api/itineraries", itineraryRoutes);
app.use("/api/query", queryRoutes);

export default app;
