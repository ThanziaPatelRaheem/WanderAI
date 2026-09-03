import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { openai } from "../config/openaiClient.js";
import { supabase } from "../config/supabaseClient.js";
import crypto from "node:crypto";

export const createItineraryEmbeddings = async (itinerary, itineraryId) => {
  // creating text splitter
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  // split itinerary into chunks
  const output = await splitter.createDocuments([itinerary]);

  // mapping output and extarcting only pagecontent
  const texts = output.map((chunk) => chunk.pageContent);

  // Create embeddings for all chunks
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
    console.log("Supabase insert error:", error);
    throw error;
  }
  console.log("inserted rows", data);

  return data;
};

// Create user query embedding

export const createQueryEmbedding = async (question) => {
  const queryEmbeddingRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
  });

  return queryEmbeddingRes.data[0].embedding;
};

// search the relevance for user query with matching itineraryId
export const searchItinerary = async (queryEmbedding, itineraryId) => {
  const { data, error } = await supabase.rpc("match_itinerary_embeddings", {
    query_embedding: queryEmbedding,
    query_itinerary_id: itineraryId,
    match_count: 3,
  });

  console.log(data);

  if (error) {
    console.log(error);
    return null;
  }

  return data;
};
