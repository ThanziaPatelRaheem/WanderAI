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

// Backend Unit Test 4: Itinerary generation error handling
// Verifies that the controller returns HTTP 500
// when the itinerary generation service fails.

test("returns an error when itinerary generation fails", async () => {
  // 1. Simulate a failure in the itinerary service
  generateItineraryService.mockRejectedValue(
    new Error("OpenAI service unavailable"),
  );

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
    json: vi.fn().mockReturnThis(),
    end: vi.fn(),
    headersSent: false,
  };

  // 4. Suppress the expected error log
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  try {
    // 5. Call the controller
    await generateItinerary(req, res);

    // 6. Verify HTTP 500 status
    expect(res.status).toHaveBeenCalledWith(500);

    // 7. Verify the error response
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Failed to generate itinerary",
    });

    // 8. Verify that no itinerary content was streamed
    expect(res.write).not.toHaveBeenCalled();

    // 9. Verify that embeddings were not created
    expect(createItineraryEmbeddings).not.toHaveBeenCalled();
  } finally {
    consoleSpy.mockRestore();
  }
});

// Backend Unit Test 5: Streaming failure after headers are sent
// Verifies that the controller closes the response
// when an error occurs during an active stream.

test("ends the response when streaming fails", async () => {
  // 1. Simulate a stream that fails after its first chunk
  async function* mockStream() {
    yield {
      type: "response.output_text.delta",
      delta: "Day 1: Explore Kyoto.",
    };

    throw new Error("Streaming interrupted");
  }

  generateItineraryService.mockResolvedValue(mockStream());

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
    json: vi.fn().mockReturnThis(),
    end: vi.fn(),
    headersSent: true,
  };

  // 4. Suppress the expected error log
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  try {
    // 5. Call the controller
    await generateItinerary(req, res);

    // 6. Verify that the first chunk was streamed
    expect(res.write).toHaveBeenCalledWith("Day 1: Explore Kyoto.");

    // 7. Verify that the response was closed
    expect(res.end).toHaveBeenCalledOnce();

    // 8. Verify that no JSON error was sent
    expect(res.json).not.toHaveBeenCalled();

    // 9. Verify that incomplete content wasn't embedded
    expect(createItineraryEmbeddings).not.toHaveBeenCalled();
  } finally {
    consoleSpy.mockRestore();
  }
});
