import fs from "fs";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// CONFIG
const CHAT_FILE = "./WhatsApp Chat.txt";
const OUTPUT_FILE = "./embeddings.json";
const YOUR_NAME = "You"; // Change if export uses your real name
const CHUNK_SIZE = 500;  // characters per chunk

// 1️ Read chat file
const rawChat = fs.readFileSync(CHAT_FILE, "utf-8");

// 2️ Extract only YOUR messages
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

// 3️ Chunk messages
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

// 4️ Create embeddings
async function generateEmbeddings() {
  const messages = extractYourMessages(rawChat);
  const chunks = chunkMessages(messages);

  console.log(`Found ${chunks.length} chunks. Generating embeddings...`);

  const embeddings = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`Embedding chunk ${i + 1}/${chunks.length}`);

    const response = await groq.embeddings.create({
      model: "text-embedding-3-small",
      input: chunks[i],
    });

    embeddings.push({
      text: chunks[i],
      embedding: response.data[0].embedding,
    });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(embeddings, null, 2));

  console.log("Embeddings saved to embeddings.json");
}

generateEmbeddings();