import { openai } from "../config/openaiClient.js";
import {
  buildItineraryPrompt,
  systemPrompt,
} from "../prompts/itineraryPrompt.js";

export const generateItineraryService = async ({
  destination,
  days,
  budget,
  travelStyle,
}) => {
  const userPrompt = buildItineraryPrompt({
    destination,
    days,
    budget,
    travelStyle,
  });

  const stream = await openai.responses.create({
    model: process.env.OPENAI_MODEL,
    instructions: systemPrompt,
    input: userPrompt,
    stream: true,
  });

  return stream;
};
