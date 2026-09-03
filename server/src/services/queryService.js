import { openai } from "../config/openaiClient.js";
import { createQueryEmbedding, searchItinerary } from "./embeddingServices.js";

export const processQuery = async (question, itineraryId, messages) => {
  const embedding = await createQueryEmbedding(question);

  const matchedChunks = await searchItinerary(embedding, itineraryId);

  const context = matchedChunks.map((item) => item.content).join("\n");

  const input = [
    ...messages,
    {
      role: "user",
      content: `Itinerary context: ${context}
       
       Current question: ${question}
      `,
    },
  ];

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL,

    instructions: `
    You are a helpful travel assistant.

    Use the itinerary context below as supporting information about the user's trip:

    ${context}

    Use the previous conversation to understand follow-up questions such as
    "why?", "which one?", "what about that?", or similar references.

    Always answer the latest user question in the context of the conversation.

    If the itinerary does not contain enough information, you may still answer
    using general knowledge or web search when appropriate.

    Do not invent facts.
  `,

    input,

    tools: [{ type: "web_search" }],
  });

  return response.output_text;
};
