import express from "express";
import crypto from "node:crypto";
import { generateItineraryService } from "../services/itineraryService.js";
import { createItineraryEmbeddings } from "../services/embeddingServices.js";

export const generateItinerary = async (req, res) => {
  try {
    const { destination, days, budget, travelStyle } = req.body;
    const itineraryId = crypto.randomUUID();

    const stream = await generateItineraryService({
      destination,
      days,
      budget,
      travelStyle,
    });

    res.status(200);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Itinerary-Id", itineraryId);

    let fullItinerary = "";
    for await (const event of stream) {
      if (event.type === "response.output_text.delta") {
        fullItinerary += event.delta;
        res.write(event.delta);
      }
    }

    await createItineraryEmbeddings(fullItinerary, itineraryId);

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
