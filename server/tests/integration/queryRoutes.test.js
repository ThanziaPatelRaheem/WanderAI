import { describe, test, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// Mock the query service to avoid real OpenAI calls
vi.mock("../../src/services/queryService.js", () => ({
  processQuery: vi.fn(),
}));

vi.mock("../../src/services/itineraryService.js", () => ({
  generateItineraryService: vi.fn(),
}));

vi.mock("../../src/services/embeddingServices.js", () => ({
  createItineraryEmbeddings: vi.fn(),
}));

import app from "../../src/app.js";
import { processQuery } from "../../src/services/queryService.js";

describe("Query Routes - Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("POST /api/query/ask returns an AI answer", async () => {
    // 1. Mock the service response
    processQuery.mockResolvedValue(
      "You can visit Fushimi Inari Shrine in Kyoto.",
    );

    // 2. Send a real HTTP-style request to Express
    const response = await request(app).post("/api/query/ask").send({
      question: "What should I visit in Kyoto?",
      itineraryId: "test-itinerary-123",
      messages: [],
    });

    // 3. Verify the HTTP response
    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      answer: "You can visit Fushimi Inari Shrine in Kyoto.",
    });

    // 4. Verify that the controller passed data to the service
    expect(processQuery).toHaveBeenCalledWith(
      "What should I visit in Kyoto?",
      "test-itinerary-123",
      [],
    );
  });

  test("POST /api/query/ask returns 500 when service fails", async () => {
    // 1. Simulate a service failure
    processQuery.mockRejectedValue(new Error("OpenAI service unavailable"));

    // Suppress the expected error log
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      // 2. Send the HTTP request
      const response = await request(app).post("/api/query/ask").send({
        question: "What should I visit in Kyoto?",
        itineraryId: "test-itinerary-123",
        messages: [],
      });

      // 3. Verify the HTTP error response
      expect(response.status).toBe(500);

      expect(response.body).toEqual({
        success: false,
        message: "Failed to process question",
      });

      expect(processQuery).toHaveBeenCalledOnce();
    } finally {
      consoleSpy.mockRestore();
    }
  });
});
