import "dotenv/config";
import express from "express";
import cors from "cors";
import itineraryRoutes from "./routes/itineraryRoutes.js";
import queryRoutes from "./routes/queryRoutes.js";

// dotenv.config();

const app = express();

const PORT = process.env.PORT || 8080;

app.use(
  cors({
    exposedHeaders: ["X-Itinerary-Id"],
  }),
);
app.use(express.json());
app.use("/api/itineraries", itineraryRoutes);
app.use("/api/query", queryRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
