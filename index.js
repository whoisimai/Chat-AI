import dotenv from "dotenv";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import QRCode from "qrcode-terminal";
import Groq from "groq-sdk";
import { buildSystemPrompt, persona } from "./persona.js";


// SETUP
dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Stores conversation history per contact (so AI remembers context)
const conversationHistory = {};

// Max messages to remember (keeps costs low and context relevant)
const MAX_HISTORY = 20;

// Her WhatsApp ID format: phonenumber@c.us
const GF_CHAT_ID = `${process.env.GF_PHONE_NUMBER}@c.us`;


// WHATSAPP CLIENT

const client = new Client({
  authStrategy: new LocalAuth(), // Saves your session so you don't scan QR every time
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});


// QR CODE — Scan this to log in
client.on("qr", (qr) => {
  console.log("\nScan this QR code with WhatsApp on your phone:");
  console.log("   (WhatsApp > Linked Devices > Link a Device)\n");
  QRCode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Bot is live and listening for messages from", persona.gfName);
  console.log("   Watching number:", process.env.GF_PHONE_NUMBER);
});

client.on("auth_failure", () => {
  console.error("Auth failed — delete the .wwebjs_auth folder and restart");
});


// INCOMING MESSAGE HANDLER
client.on("message", async (message) => {
  try {
    // For group messages, use participant; for individual chats, use from
    const senderId = message.from;
    const senderPhoneNumber = senderId.split("@")[0];
    const expectedPhoneNumber = process.env.GF_PHONE_NUMBER;

    // Only respond to messages from your girlfriend (compare just the phone number)
    if (senderPhoneNumber !== expectedPhoneNumber) {
      console.log(`[IGNORED] Message from unknown number: ${senderId}`);
      return;
    }

    // Ignore your own messages
    if (message.fromMe) return;

    const incomingText = message.body;
    console.log(`\n ${persona.gfName}: ${incomingText}`);

    // Show "typing..." indicator so it feels real
    const chat = await message.getChat();
    await chat.sendStateTyping();

    // Get AI response
    const reply = await getAIReply(senderId, incomingText);

    // Random delay between 2-6 seconds (feels more natural)
    const delay = Math.floor(Math.random() * 4000) + 2000;
    await sleep(delay);

    // Stop typing and send the reply
    await chat.clearState();
    await message.reply(reply);

    console.log(`You (AI): ${reply}`);

  } catch (error) {
    console.error("Error handling message:", error.message);
  }
});


// AI RESPONSE FUNCTION
async function getAIReply(userId, userMessage) {
  // Initialize conversation history for this user if first time
  if (!conversationHistory[userId]) {
    conversationHistory[userId] = [];
  }

  // Add her message to history
  conversationHistory[userId].push({
    role: "user",
    content: userMessage,
  });

  // Keep history trimmed to last MAX_HISTORY messages
  if (conversationHistory[userId].length > MAX_HISTORY) {
    conversationHistory[userId] = conversationHistory[userId].slice(-MAX_HISTORY);
  }

  // Call Groq API
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant", // Free, fast Llama model on Groq
    messages: [
      {
        role: "system",
        content: buildSystemPrompt(),
      },
      ...conversationHistory[userId],
    ],
    max_tokens: 150,       // Keep replies short (like real texts)
    temperature: 0.85,     // A bit of randomness so it doesn't sound repetitive
  });

  const reply = response.choices[0].message.content.trim();

  // Add AI reply to history so it remembers what "you" said
  conversationHistory[userId].push({
    role: "assistant",
    content: reply,
  });

  return reply;
}

// HELPER
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// START THE BOT
console.log("Starting WhatsApp AI bot...");
client.initialize();
