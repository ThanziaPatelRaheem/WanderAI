import "dotenv/config";
import express from "express";
import cors from "cors";
import itineraryRoutes from "./routes/itineraryRoutes.js";

// dotenv.config();

const app = express();

const PORT = process.env.PORT || 8080;

console.log(process.env.OPENAI_API_KEY);

app.use(cors());
app.use(express.json());
app.use("/api/itineraries", itineraryRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
