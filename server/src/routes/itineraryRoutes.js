import express from "express";
import { generateItinerary } from "../controllers/itineraryController.js";
import { aiRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/generate", aiRateLimiter, generateItinerary);

export default router;
