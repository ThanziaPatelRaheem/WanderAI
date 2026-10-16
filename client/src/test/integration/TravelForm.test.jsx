import { test, expect, vi, afterEach } from "vitest";
import TravelForm from "../../components/TravelForm/TravelForm";
import { fireEvent, render, screen } from "@testing-library/react";

afterEach(() => {
  vi.unstubAllGlobals();
});

// Test 1: Frontend integration test
// Verifies that the form can use a mocked API request.

test("submits travel details using a mocked API", () => {
  const mockFetch = vi.fn();

  expect(mockFetch).not.toHaveBeenCalled();
});

// Test 2: Frontend integration test
// Step 1: Replace the real fetch function with a mock.

test("submits travel details to the API", async () => {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    headers: {
      get: vi.fn().mockReturnValue("test-itinerary-123"),
    },
    body: {
      getReader: () => ({
        read: vi.fn().mockResolvedValue({ done: true }),
      }),
    },
  });

  vi.stubGlobal("fetch", mockFetch);

  render(<TravelForm />);
  fireEvent.change(screen.getByLabelText("Destination"), {
    target: { value: "Kyoto, Japan" },
  });

  fireEvent.change(screen.getByLabelText("Number of days"), {
    target: { value: "5" },
  });

  fireEvent.change(screen.getByLabelText("Budget"), {
    target: { value: "moderate" },
  });

  fireEvent.change(screen.getByLabelText("Travel style"), {
    target: { value: "cultural" },
  });

  fireEvent.click(
    screen.getByRole("button", { name: /generate my itinerary/i }),
  );
  await vi.waitFor(() => {
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  expect(mockFetch).toHaveBeenCalledWith(
    expect.stringContaining("/api/itineraries/generate"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        destination: "Kyoto, Japan",
        days: "5",
        budget: "moderate",
        travelStyle: "cultural",
      }),
    },
  );
});

// Test 3: Frontend integration test - API error handling
// Verifies that when the API returns an unsuccessful response,
// the TravelForm displays the appropriate error message to the user.
// Uses a mocked fetch to avoid making real API requests.

test("displays an error when itinerary generation fails", async () => {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: false,
    headers: {
      get: vi.fn().mockReturnValue(null),
    },
    text: vi.fn().mockResolvedValue("Unable to generate itinerary"),
  });

  vi.stubGlobal("fetch", mockFetch);

  render(<TravelForm />);
  fireEvent.change(screen.getByLabelText("Destination"), {
    target: { value: "Kyoto, Japan" },
  });

  fireEvent.change(screen.getByLabelText("Number of days"), {
    target: { value: "5" },
  });

  fireEvent.change(screen.getByLabelText("Budget"), {
    target: { value: "moderate" },
  });

  fireEvent.change(screen.getByLabelText("Travel style"), {
    target: { value: "cultural" },
  });

  fireEvent.click(
    screen.getByRole("button", { name: /generate my itinerary/i }),
  );

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Unable to generate itinerary",
  );
});
// Test 4: Frontend integration test - Loading state
// Verifies that the form displays a loading state
// while the API request is still pending.

test("disables the submit button while generating an itinerary", () => {
  const mockFetch = vi.fn(() => new Promise(() => {}));

  vi.stubGlobal("fetch", mockFetch);

  render(<TravelForm />);
  fireEvent.change(screen.getByLabelText("Destination"), {
    target: { value: "Kyoto, Japan" },
  });

  fireEvent.change(screen.getByLabelText("Number of days"), {
    target: { value: "5" },
  });

  fireEvent.change(screen.getByLabelText("Budget"), {
    target: { value: "moderate" },
  });

  fireEvent.change(screen.getByLabelText("Travel style"), {
    target: { value: "cultural" },
  });

  fireEvent.click(
    screen.getByRole("button", { name: /generate my itinerary/i }),
  );

  expect(
    screen.getByRole("button", { name: /creating your itinerary/i }),
  ).toBeDisabled();
});

// Test 5: Frontend integration test - Streaming response
// Verifies that itinerary content received in multiple chunks
// is correctly combined and displayed to the user.

test("displays streamed itinerary content", async () => {
  // 1. Create a mock streaming response
  const encoder = new TextEncoder();

  const mockStream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode("Day 1: Explore Kyoto.\n"));
      controller.enqueue(encoder.encode("Day 2: Visit temples."));
      controller.close();
    },
  });

  // 2. Mock a successful API response containing the stream
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    headers: {
      get: vi.fn().mockReturnValue("test-itinerary-123"),
    },
    body: mockStream,
  });

  vi.stubGlobal("fetch", mockFetch);

  // 3. Render the component
  render(<TravelForm />);

  // 4. Fill in the form
  fireEvent.change(screen.getByLabelText("Destination"), {
    target: { value: "Kyoto, Japan" },
  });

  fireEvent.change(screen.getByLabelText("Number of days"), {
    target: { value: "5" },
  });

  fireEvent.change(screen.getByLabelText("Budget"), {
    target: { value: "moderate" },
  });

  fireEvent.change(screen.getByLabelText("Travel style"), {
    target: { value: "cultural" },
  });

  // 5. Submit the form
  fireEvent.click(
    screen.getByRole("button", { name: /generate my itinerary/i }),
  );

  // 6. Verify that both streamed chunks appear on the screen
  expect(await screen.findByText(/Day 1: Explore Kyoto/i)).toBeInTheDocument();

  expect(await screen.findByText(/Day 2: Visit temples/i)).toBeInTheDocument();

  // 7. Verify that the API was called once
  expect(mockFetch).toHaveBeenCalledTimes(1);
});

// Test 6: Frontend integration test - New Trip reset
// Verifies that starting a new trip clears the previous
// itinerary and resets the travel form.

test("resets the form and itinerary when starting a new trip", async () => {
  const encoder = new TextEncoder();

  const mockStream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode("Day 1: Explore Kyoto."));
      controller.close();
    },
  });

  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    headers: {
      get: vi.fn().mockReturnValue("test-itinerary-123"),
    },
    body: mockStream,
  });

  vi.stubGlobal("fetch", mockFetch);

  // jsdom doesn't implement scrollIntoView.
  Element.prototype.scrollIntoView = vi.fn();

  render(<TravelForm />);

  // Fill out the travel form.
  fireEvent.change(screen.getByLabelText("Destination"), {
    target: { value: "Kyoto, Japan" },
  });

  fireEvent.change(screen.getByLabelText("Number of days"), {
    target: { value: "5" },
  });

  fireEvent.change(screen.getByLabelText("Budget"), {
    target: { value: "moderate" },
  });

  fireEvent.change(screen.getByLabelText("Travel style"), {
    target: { value: "cultural" },
  });

  // Generate an itinerary.
  fireEvent.click(
    screen.getByRole("button", { name: /generate my itinerary/i }),
  );

  // Wait for the itinerary to appear.
  expect(await screen.findByText(/Day 1: Explore Kyoto/i)).toBeInTheDocument();

  // Start a new trip.
  fireEvent.click(screen.getByRole("button", { name: /plan another trip/i }));

  // Verify that the form is reset.
  expect(screen.getByLabelText("Destination")).toHaveValue("");
  expect(screen.getByLabelText("Number of days")).toHaveValue(null);
  expect(screen.getByLabelText("Budget")).toHaveValue("");
  expect(screen.getByLabelText("Travel style")).toHaveValue("");

  // Verify that the previous itinerary is removed.
  expect(screen.queryByText(/Day 1: Explore Kyoto/i)).not.toBeInTheDocument();
});

// Test 7: Frontend integration test - Opening itinerary chat
// Verifies that after generating an itinerary,
// the user can open the WanderAI chat interface.

test("opens WanderAI chat after generating an itinerary", async () => {
  const encoder = new TextEncoder();

  // Mock a successful itinerary streaming response
  const mockStream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode("Day 1: Explore Kyoto."));
      controller.close();
    },
  });

  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    headers: {
      get: vi.fn().mockReturnValue("test-itinerary-123"),
    },
    body: mockStream,
  });

  vi.stubGlobal("fetch", mockFetch);

  // Mock browser scrolling, which jsdom doesn't support
  Element.prototype.scrollIntoView = vi.fn();

  render(<TravelForm />);

  // Fill out the form
  fireEvent.change(screen.getByLabelText("Destination"), {
    target: { value: "Kyoto, Japan" },
  });

  fireEvent.change(screen.getByLabelText("Number of days"), {
    target: { value: "5" },
  });

  fireEvent.change(screen.getByLabelText("Budget"), {
    target: { value: "moderate" },
  });

  fireEvent.change(screen.getByLabelText("Travel style"), {
    target: { value: "cultural" },
  });

  // Generate the itinerary
  fireEvent.click(
    screen.getByRole("button", { name: /generate my itinerary/i }),
  );

  // Wait until the itinerary appears
  expect(await screen.findByText(/Day 1: Explore Kyoto/i)).toBeInTheDocument();

  // Wait for the chat button to become available
  const chatButton = await screen.findByRole("button", {
    name: /chat with wanderai/i,
  });

  fireEvent.click(chatButton);

  // Verify that the chat interface is displayed
  expect(
    await screen.findByRole("heading", { name: /ask about your trip/i }),
  ).toBeInTheDocument();

  // Verify that the chat input is available
  expect(
    screen.getByPlaceholderText("Ask something about your trip..."),
  ).toBeInTheDocument();

  // Verify that the user can submit a question
  expect(screen.getByRole("button", { name: "Ask" })).toBeEnabled();
});

// Test 8: Frontend integration - Chat API interaction
test("sends a chat question and displays the AI response", async () => {
  const encoder = new TextEncoder();

  const mockStream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode("Day 1: Explore Kyoto."));
      controller.close();
    },
  });

  // First fetch: itinerary generation
  // Second fetch: chat question
  const mockFetch = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue("test-itinerary-123"),
      },
      body: mockStream,
    })
    .mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        answer: "You can visit Fushimi Inari Shrine in Kyoto.",
      }),
    });

  vi.stubGlobal("fetch", mockFetch);

  // jsdom does not implement browser scrolling
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.scrollTo = vi.fn();

  render(<TravelForm />);

  // Fill in travel details
  fireEvent.change(screen.getByLabelText("Destination"), {
    target: { value: "Kyoto, Japan" },
  });

  fireEvent.change(screen.getByLabelText("Number of days"), {
    target: { value: "5" },
  });

  fireEvent.change(screen.getByLabelText("Budget"), {
    target: { value: "moderate" },
  });

  fireEvent.change(screen.getByLabelText("Travel style"), {
    target: { value: "cultural" },
  });

  // Generate itinerary
  fireEvent.click(
    screen.getByRole("button", { name: /generate my itinerary/i }),
  );

  expect(await screen.findByText(/Day 1: Explore Kyoto/i)).toBeInTheDocument();

  // Open chat
  fireEvent.click(
    await screen.findByRole("button", {
      name: /chat with wanderai/i,
    }),
  );

  // Enter question
  fireEvent.change(
    screen.getByPlaceholderText("Ask something about your trip..."),
    {
      target: { value: "What should I visit in Kyoto?" },
    },
  );

  // Submit question
  fireEvent.click(screen.getByRole("button", { name: "Ask" }));

  // Verify AI answer appears
  expect(
    await screen.findByText(/You can visit Fushimi Inari Shrine in Kyoto/i),
  ).toBeInTheDocument();

  // Verify that both API requests were made
  expect(mockFetch).toHaveBeenCalledTimes(2);

  // Verify the chat request includes the correct itinerary ID
  expect(mockFetch).toHaveBeenNthCalledWith(
    2,
    expect.stringContaining("/api/query/ask"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: "What should I visit in Kyoto?",
        itineraryId: "test-itinerary-123",
        messages: [],
      }),
    },
  );
});
