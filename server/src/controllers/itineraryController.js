import express from "express";
import { generateItineraryService } from "../services/itineraryService.js";

export const generateItinerary = async (req, res) => {
  try {
    const { destination, days, budget, travelStyle } = req.body;

    console.log("before service");

    const stream = await generateItineraryService({
      destination,
      days,
      budget,
      travelStyle,
    });

    console.log("After service");
    console.log(stream, "stream");

    res.status(200);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const event of stream) {
      if (event.type === "response.output_text.delta") {
        res.write(event.delta);
      }
    }
    res.end();
  } catch (error) {
    console.error("Streaming error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate itinerary",
      });
    }

    res.end();
  }
};
