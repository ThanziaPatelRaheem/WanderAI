import { processQuery } from "../services/queryService.js";

export const askQuestion = async (req, res) => {
  try {
    const { question, itineraryId, messages } = req.body;

    const answer = await processQuery(question, itineraryId, messages);

    console.log("AI answer:", answer);

    res.status(200).json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error("Query error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to process question",
    });
  }
};
