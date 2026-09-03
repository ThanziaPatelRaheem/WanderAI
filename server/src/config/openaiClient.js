import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error(`Expected API KEY`);
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
