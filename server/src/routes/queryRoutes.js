import express from "express";
import { askQuestion } from "../controllers/queryController.js";
import { aiRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/ask", aiRateLimiter, askQuestion);

export default router;
