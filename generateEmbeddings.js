import fs from "fs";
import { pipeline } from "@xenova/transformers";

// CONFIG
const CHAT_FILE = "./Chat.txt";
const OUTPUT_FILE = "./embeddings.json";
const YOUR_NAME = "Tlhogi💕"; // change if needed
const CHUNK_SIZE = 500;

// -----------------------------
// EXTRACT YOUR MESSAGES
// -----------------------------
function extractYourMessages(text) {
  const lines = text.split("\n");
  const messages = [];

  for (const line of lines) {
    const match = line.match(/-\s([^:]+):\s(.+)/);
    if (!match) continue;

    const sender = match[1].trim();
    const message = match[2].trim();

    if (sender === YOUR_NAME && message.length > 2) {
      messages.push(message);
    }
  }

  return messages;
}

// -----------------------------
// CHUNKING
// -----------------------------
function chunkMessages(messages) {
  const chunks = [];
  let currentChunk = "";

  for (const msg of messages) {
    if ((currentChunk + " " + msg).length > CHUNK_SIZE) {
      chunks.push(currentChunk.trim());
      currentChunk = msg;
    } else {
      currentChunk += " " + msg;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// -----------------------------
// GENERATE EMBEDDINGS
// -----------------------------
async function generateEmbeddings() {
  console.log("Loading embedding model (first run may take 30–60s)...");

  const embedder = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );

  const rawChat = fs.readFileSync(CHAT_FILE, "utf-8");
  const messages = extractYourMessages(rawChat);
  const chunks = chunkMessages(messages);

  console.log(`Found ${chunks.length} chunks.`);
  console.log("Generating embeddings...");

  const embeddings = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`Embedding ${i + 1}/${chunks.length}`);

    const output = await embedder(chunks[i], {
      pooling: "mean",
      normalize: true,
    });

    embeddings.push({
      text: chunks[i],
      embedding: Array.from(output.data),
    });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(embeddings, null, 2));
  console.log("✅ Embeddings saved to embeddings.json");
}

generateEmbeddings();