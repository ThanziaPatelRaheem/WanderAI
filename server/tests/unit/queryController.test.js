import { describe, test, expect, vi, beforeEach } from "vitest";
// Mock the query service so the real OpenAI client is never loaded.
vi.mock("../../src/services/queryService.js", () => ({
  processQuery: vi.fn(),
}));

import { askQuestion } from "../../src/controllers/queryController.js";
import { processQuery } from "../../src/services/queryService.js";

describe("queryController - Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Backend Unit Test 1: Successful chat response
  // Verifies that the controller passes the correct data
  // to the query service and returns the expected JSON response.
  test("returns the AI answer successfully", async () => {
    // 1. Mock the AI service response
    processQuery.mockResolvedValue(
      "You can visit Fushimi Inari Shrine in Kyoto.",
    );

    // 2. Create a fake Express request
    const req = {
      body: {
        question: "What should I visit in Kyoto?",
        itineraryId: "test-itinerary-123",
        messages: [],
      },
    };

    // 3. Create a fake Express response
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    // 4. Call the controller directly
    await askQuestion(req, res);

    // 5. Verify the service received the correct arguments
    expect(processQuery).toHaveBeenCalledWith(
      "What should I visit in Kyoto?",
      "test-itinerary-123",
      [],
    );

    // 6. Verify the HTTP status
    expect(res.status).toHaveBeenCalledWith(200);

    // 7. Verify the JSON response
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      answer: "You can visit Fushimi Inari Shrine in Kyoto.",
    });
  });
});

// Backend Unit Test 2: Query service error handling
// Verifies that the controller returns HTTP 500
// when the query service fails.

test("returns an error when the query service fails", async () => {
  // 1. Simulate a failure in the query service
  processQuery.mockRejectedValue(new Error("OpenAI service unavailable"));

  // 2. Create a fake Express request
  const req = {
    body: {
      question: "What should I visit in Kyoto?",
      itineraryId: "test-itinerary-123",
      messages: [],
    },
  };

  // 3. Create a fake Express response
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };

  // 4. Suppress the expected error log during this test
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  try {
    // 5. Call the controller
    await askQuestion(req, res);

    // 6. Verify that the controller returns HTTP 500
    expect(res.status).toHaveBeenCalledWith(500);

    // 7. Verify the error response
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Failed to process question",
    });

    // 8. Verify the query service was called
    expect(processQuery).toHaveBeenCalledOnce();
  } finally {
    consoleSpy.mockRestore();
  }
});

import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock external services before loading the controller
vi.mock("../../src/services/itineraryService.js", () => ({
  generateItineraryService: vi.fn(),
}));

vi.mock("../../src/services/embeddingServices.js", () => ({
  createItineraryEmbeddings: vi.fn(),
}));

import { generateItinerary } from "../../src/controllers/itineraryController.js";
import { generateItineraryService } from "../../src/services/itineraryService.js";
import { createItineraryEmbeddings } from "../../src/services/embeddingServices.js";

describe("itineraryController - Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Backend Unit Test 3: Successful itinerary streaming
  // Verifies that the controller streams AI text,
  // combines chunks, creates embeddings and ends the response.
  test("streams the itinerary and creates embeddings", async () => {
    // 1. Simulate the OpenAI streaming events
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

    // 2. Create a fake Express request
    const req = {
      body: {
        destination: "Kyoto, Japan",
        days: "5",
        budget: "moderate",
        travelStyle: "cultural",
      },
    };

    // 3. Create a fake Express response
    const res = {
      status: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
      write: vi.fn(),
      end: vi.fn(),
    };

    // 4. Call the controller
    await generateItinerary(req, res);

    // 5. Verify that the AI service receives trip details
    expect(generateItineraryService).toHaveBeenCalledWith({
      destination: "Kyoto, Japan",
      days: "5",
      budget: "moderate",
      travelStyle: "cultural",
    });

    // 6. Verify HTTP status
    expect(res.status).toHaveBeenCalledWith(200);

    // 7. Verify that both chunks are streamed to the client
    expect(res.write).toHaveBeenNthCalledWith(1, "Day 1: Explore Kyoto.\n");

    expect(res.write).toHaveBeenNthCalledWith(2, "Day 2: Visit temples.");

    // 8. Verify that embeddings receive the complete itinerary
    expect(createItineraryEmbeddings).toHaveBeenCalledWith(
      "Day 1: Explore Kyoto.\nDay 2: Visit temples.",
      expect.any(String),
    );

    // 9. Verify that the itinerary ID is sent in the header
    expect(res.setHeader).toHaveBeenCalledWith(
      "X-Itinerary-Id",
      expect.any(String),
    );

    // 10. Verify that the response ends
    expect(res.end).toHaveBeenCalledOnce();
  });
});
