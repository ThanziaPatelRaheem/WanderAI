export const systemPrompt = `
You are an expert travel planner.

Your goal is to create realistic, practical, and well-organized travel itineraries.

Always:
- Recommend activities that fit the user's budget.
- Match the itinerary to the selected travel style.
- Organize each day into Morning, Afternoon, and Evening.
- Include an estimated daily cost.
- Include one useful travel tip each day.
- Avoid repeating the same attractions.
- Recommend authentic local experiences where possible.
- Return the response in clean Markdown format.
`;

export const buildItineraryPrompt = ({
  destination,
  days,
  budget,
  travelStyle,
}) => {
  return `
Generate a personalized ${days}-day travel itinerary for ${destination}.

Trip Details:
- Destination: ${destination}
- Duration: ${days} ${Number(days) === 1 ? "day" : "days"}
- Budget: ${budget}
- Travel Style: ${travelStyle}

Return the response using valid Markdown only.

Follow this exact structure:

# ${days}-Day ${destination} Itinerary

## Trip Overview

Write a short introduction (2-3 sentences) describing the destination and what the traveler can expect.

Repeat the following structure for every day until Day ${days}.

## Day 1 - Main Attractions for the Day

### Morning

- Mention the exact attraction or place name.
- Include a suggested arrival time if appropriate.
- Mention approximately how long to spend there.

### Afternoon

- Mention the exact attraction or place name.
- Include nearby lunch recommendations if relevant.
- Mention approximately how long to spend there.

### Evening

- Mention the exact attraction or place name.
- Suggest dinner, sunset viewpoints or nightlife if applicable.

### Estimated Daily Cost

- Accommodation
- Food
- Transport
- Activities
- **Estimated Total**

> **Travel Tip:** Give one practical tip specific to that day's activities.

After all days, include the following sections.

## Estimated Trip Budget

- Accommodation
- Food
- Transport
- Activities
- **Estimated Trip Total**

## Packing Checklist

- Include 5-8 relevant packing suggestions based on the destination, weather and travel style.

## General Travel Tips

- Include 3-5 useful travel tips specific to the destination.

Important Rules:

- Return valid Markdown only.
- Never use HTML.
- Never wrap the response inside a code block.
- Always use Markdown headings.
- Every day must begin with a level-2 heading using:
  ## Day X - Main Attractions
- Morning, Afternoon, Evening and Estimated Daily Cost must always be level-3 headings.
- Use bullet points for activities.
- Mention actual attraction names, landmarks, museums, parks, restaurants, markets and neighbourhoods whenever possible.
- Avoid vague phrases such as "visit a local market", "explore a nearby temple" or "see a famous attraction".
- Every day's heading should mention the main places being visited.
- Keep all recommendations relevant to ${destination}.
- Do not invent places if you are unsure. Use only well-known or widely recognised locations.
- Bold all estimated totals.
- Do not add any text after the General Travel Tips section.
`;
};
