import { test, expect } from "@playwright/test";

test.describe("WanderAI - E2E Tests", () => {
  test("opens WanderAI and displays the travel form", async ({ page }) => {
    // Open WanderAI
    await page.goto("/");

    // Verify the page is visible
    await expect(page.locator("body")).toBeVisible();

    // Verify the destination input is visible
    await expect(page.locator('input[name="destination"]')).toBeVisible();
  });
});

test("generates and displays a travel itinerary", async ({ page }) => {
  // 1. Mock the backend itinerary generation endpoint
  await page.route("**/api/itineraries/generate", async (route) => {
    const request = route.request();

    // Verify the frontend sends the correct trip details
    expect(request.postDataJSON()).toEqual({
      destination: "Kyoto, Japan",
      days: "5",
      budget: "moderate",
      travelStyle: "cultural",
    });

    // Return a fake itinerary instead of calling OpenAI
    await route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      headers: {
        "X-Itinerary-Id": "test-itinerary-123",
        "Access-Control-Expose-Headers": "X-Itinerary-Id",
      },
      body: "Day 1: Explore Kyoto.\nDay 2: Visit Fushimi Inari Shrine.",
    });
  });

  // 2. Open WanderAI
  await page.goto("/");

  // 3. Fill in the travel form
  await page.getByLabel("Destination").fill("Kyoto, Japan");

  await page.getByLabel("Number of days").fill("5");

  await page.getByLabel("Budget").selectOption("moderate");

  await page.getByLabel("Travel style").selectOption("cultural");

  // 4. Submit the form
  await page.getByRole("button", { name: "Generate my itinerary" }).click();

  // 5. Verify the generated itinerary appears
  await expect(
    page.getByText("Day 1: Explore Kyoto.", { exact: false }),
  ).toBeVisible();

  await expect(
    page.getByText("Day 2: Visit Fushimi Inari Shrine.", {
      exact: false,
    }),
  ).toBeVisible();

  // 6. Verify the submit button returns to its normal state
  await expect(
    page.getByRole("button", { name: "Generate my itinerary" }),
  ).toBeEnabled();
});

test("opens the AI chat and answers a follow-up question", async ({ page }) => {
  // 1. Mock the itinerary generation API
  await page.route("**/api/itineraries/generate", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      headers: {
        "X-Itinerary-Id": "test-itinerary-123",
        "Access-Control-Expose-Headers": "X-Itinerary-Id",
      },
      body: "Day 1: Explore Kyoto.\nDay 2: Visit temples.",
    });
  });

  // 2. Mock the AI chat API
  await page.route("**/api/query/ask", async (route) => {
    // Verify the question and itinerary ID
    expect(route.request().postDataJSON()).toEqual({
      question: "What should I visit on Day 2?",
      itineraryId: "test-itinerary-123",
      messages: [],
    });

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        answer: "On Day 2, visit Fushimi Inari Shrine in Kyoto.",
      }),
    });
  });

  // 3. Open WanderAI
  await page.goto("/");

  // 4. Fill out the travel form
  await page.getByLabel("Destination").fill("Kyoto, Japan");
  await page.getByLabel("Number of days").fill("5");
  await page.getByLabel("Budget").selectOption("moderate");
  await page.getByLabel("Travel style").selectOption("cultural");

  // 5. Generate the itinerary
  await page.getByRole("button", { name: "Generate my itinerary" }).click();

  // 6. Wait for the itinerary to appear
  await expect(
    page.getByText("Day 1: Explore Kyoto.", { exact: false }),
  ).toBeVisible();

  // 7. Open the WanderAI chat
  await page
    .getByRole("button", {
      name: /Ask WanderAI about your trip/i,
    })
    .click();

  // 8. Verify the chat interface appears
  await expect(
    page.getByRole("heading", { name: "Ask about your trip" }),
  ).toBeVisible();

  // 9. Enter a follow-up question
  await page
    .getByPlaceholder("Ask something about your trip...")
    .fill("What should I visit on Day 2?");

  // 10. Send the question
  await page.getByRole("button", { name: "Ask", exact: true }).click();

  // 11. Verify the user's question appears in the chat
  await expect(page.locator(".chat-message-user")).toContainText(
    "What should I visit on Day 2?",
  );

  // 12. Verify WanderAI's response appears
  await expect(
    page.locator(".chat-message-assistant .assistant-content"),
  ).toContainText("On Day 2, visit Fushimi Inari Shrine in Kyoto.");

  // 13. Verify the input is cleared after submission
  await expect(
    page.getByPlaceholder("Ask something about your trip..."),
  ).toHaveValue("");
});

test("resets the itinerary and form when planning another trip", async ({
  page,
}) => {
  // 1. Mock itinerary generation
  await page.route("**/api/itineraries/generate", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      headers: {
        "X-Itinerary-Id": "test-itinerary-123",
        "Access-Control-Expose-Headers": "X-Itinerary-Id",
      },
      body: "Day 1: Explore Kyoto.\nDay 2: Visit temples.",
    });
  });

  // 2. Open WanderAI
  await page.goto("/");

  // 3. Fill out the travel form
  await page.getByLabel("Destination").fill("Kyoto, Japan");
  await page.getByLabel("Number of days").fill("5");
  await page.getByLabel("Budget").selectOption("moderate");
  await page.getByLabel("Travel style").selectOption("cultural");

  // 4. Generate the itinerary
  await page.getByRole("button", { name: "Generate my itinerary" }).click();

  // 5. Verify itinerary appears
  await expect(
    page.getByText("Day 1: Explore Kyoto.", { exact: false }),
  ).toBeVisible();

  // 6. Open the AI chat
  await page
    .getByRole("button", {
      name: /Ask WanderAI about your trip/i,
    })
    .click();

  await expect(
    page.getByRole("heading", { name: "Ask about your trip" }),
  ).toBeVisible();

  // 7. Click Plan Another Trip
  await page.getByRole("button", { name: /Plan Another Trip/i }).click();

  // 8. Verify all form fields are cleared
  await expect(page.getByLabel("Destination")).toHaveValue("");
  await expect(page.getByLabel("Number of days")).toHaveValue("");
  await expect(page.getByLabel("Budget")).toHaveValue("");
  await expect(page.getByLabel("Travel style")).toHaveValue("");

  // 9. Verify previous itinerary disappears
  await expect(
    page.getByText("Day 1: Explore Kyoto.", { exact: false }),
  ).not.toBeVisible();

  // 10. Verify AI chat closes
  await expect(
    page.getByRole("heading", { name: "Ask about your trip" }),
  ).not.toBeVisible();

  // 11. Verify the generate button is ready for a new trip
  await expect(
    page.getByRole("button", { name: "Generate my itinerary" }),
  ).toBeEnabled();
});
