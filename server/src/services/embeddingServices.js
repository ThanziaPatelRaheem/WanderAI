import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { openai } from "../config/openaiClient.js";
import { supabase } from "../config/supabaseClient.js";

export const createItineraryEmbeddings = async (itinerary, itineraryId) => {
  // Create text splitter
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  // Split itinerary into chunks
  const output = await splitter.createDocuments([itinerary]);

  // Extract text content from chunks
  const texts = output.map((chunk) => chunk.pageContent);

  // Generate embeddings for all chunks
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });

  // Combine each chunk with its embedding and itinerary ID
  const documentEmbeddings = texts.map((text, index) => {
    return {
      itinerary_id: itineraryId,
      content: text,
      embedding: response.data[index].embedding,
    };
  });

  // Store embeddings in Supabase
  const { data, error } = await supabase
    .from("itinerary_embeddings")
    .insert(documentEmbeddings)
    .select();

  if (error) {
    console.error("Supabase insert error:", error);
    throw error;
  }

  return data;
};

// Create embedding for the user's question
export const createQueryEmbedding = async (question) => {
  const queryEmbeddingRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
  });

  return queryEmbeddingRes.data[0].embedding;
};

// Retrieve relevant itinerary chunks
export const searchItinerary = async (queryEmbedding, itineraryId) => {
  const { data, error } = await supabase.rpc("match_itinerary_embeddings", {
    query_embedding: queryEmbedding,
    query_itinerary_id: itineraryId,
    match_count: 8,
  });

  if (error) {
    console.error("Supabase search error:", error);
    return null;
  }

  return data;
};
