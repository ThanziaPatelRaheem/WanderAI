import { describe, test, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// Mock external services before importing Express app
vi.mock("../../src/services/itineraryService.js", () => ({
  generateItineraryService: vi.fn(),
}));

vi.mock("../../src/services/embeddingServices.js", () => ({
  createItineraryEmbeddings: vi.fn(),
}));

// Also mock the query service because app.js loads both routes
vi.mock("../../src/services/queryService.js", () => ({
  processQuery: vi.fn(),
}));

import app from "../../src/app.js";
import { generateItineraryService } from "../../src/services/itineraryService.js";
import { createItineraryEmbeddings } from "../../src/services/embeddingServices.js";

describe("Itinerary Routes - Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("POST /api/itineraries/generate streams an itinerary", async () => {
    // 1. Simulate OpenAI streaming events
    async function* mockStream() {
      yield {
        type: "response.output_text.delta",
        delta: "Day 1: Explore Kyoto.\n",
      };

      yield {
        type: "response.output_text.delta",
        delta: "Day 2: Visit temples.",
      };
    }

    generateItineraryService.mockResolvedValue(mockStream());
    createItineraryEmbeddings.mockResolvedValue(undefined);

    // 2. Send a request through Express
    const response = await request(app).post("/api/itineraries/generate").send({
      destination: "Kyoto, Japan",
      days: "5",
      budget: "moderate",
      travelStyle: "cultural",
    });

    // 3. Verify HTTP status
    expect(response.status).toBe(200);

    // 4. Verify the streamed text
    expect(response.text).toBe("Day 1: Explore Kyoto.\nDay 2: Visit temples.");

    // 5. Verify the itinerary ID response header
    const itineraryId = response.headers["x-itinerary-id"];

    expect(itineraryId).toEqual(expect.any(String));

    // 6. Verify service received the correct trip details
    expect(generateItineraryService).toHaveBeenCalledWith({
      destination: "Kyoto, Japan",
      days: "5",
      budget: "moderate",
      travelStyle: "cultural",
    });

    // 7. Verify embeddings receive the complete itinerary
    // and the same ID returned to the client
    expect(createItineraryEmbeddings).toHaveBeenCalledWith(
      "Day 1: Explore Kyoto.\nDay 2: Visit temples.",
      itineraryId,
    );
  });
});

test("POST /api/itineraries/generate returns 500 when generation fails", async () => {
  // 1. Simulate an OpenAI service failure
  generateItineraryService.mockRejectedValue(
    new Error("OpenAI service unavailable"),
  );

  // 2. Suppress the expected error log
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  try {
    // 3. Send a request through Express
    const response = await request(app).post("/api/itineraries/generate").send({
      destination: "Kyoto, Japan",
      days: "5",
      budget: "moderate",
      travelStyle: "cultural",
    });

    // 4. Verify HTTP error status
    expect(response.status).toBe(500);

    // 5. Verify the error response
    expect(response.body).toEqual({
      success: false,
      message: "Failed to generate itinerary",
    });

    // 6. Verify the generation service was called
    expect(generateItineraryService).toHaveBeenCalledOnce();

    // 7. Verify no embeddings were created
    expect(createItineraryEmbeddings).not.toHaveBeenCalled();
  } finally {
    consoleSpy.mockRestore();
  }
});
