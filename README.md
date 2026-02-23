# GF AI Bot — Setup Guide

A WhatsApp bot that uses AI to reply to your girlfriend in your texting style.

---

## STEP 1 - Install Requirements

Make sure you have **Node.js** installed.  
Download it here: https://nodejs.org (get the LTS version)

Then open your terminal in this project folder and run:
```
npm install
```

---

## 🔑 STEP 2 - Get Your Free Groq API Key

1. Go to https://console.groq.com
2. Sign up for free (no credit card needed)
3. Go to "API Keys" and create a new key
4. Copy the key

---

## STEP 3 - Fill in Your .env File

Create the `.env` file and fill in:
- Your Groq API key
- Your girlfriend's phone number (with country code, no + sign)
- Your name and her name

Example for South Africa:
```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
GF_PHONE_NUMBER=27831234567
YOUR_NAME=Tlhogi
GF_NAME=Amara
```

---

## STEP 4 — Customize Your Persona (MOST IMPORTANT)

Open `persona.js` and fill in:
- How you text (your style, slang, emojis you use)
- Your personality
- Relationship context (inside jokes, shared interests, etc.)
- How to handle specific situations

**The more detail here = the more it sounds like you.**

---

## STEP 5 — Run the Bot

```
npm start
```

A QR code will appear in your terminal.

1. Open WhatsApp on your phone
2. Go to **Settings > Linked Devices > Link a Device**
3. Scan the QR code
4. The bot will say "Bot is live!"

From now on, when your girlfriend texts you, the AI will reply automatically.

---

## IMPORTANT NOTES

- **Keep your PC on** for the bot to keep running (or host it on Oracle Cloud Free Tier)
- The bot only replies to messages from the number you set in `.env`
- Your WhatsApp session is saved locally — you won't need to scan QR every time
- If something breaks, just restart with `npm start`

---

## Switching the AI Model

In `index.js`, you can change the model to any free Groq model:
- `llama-3.1-8b-instant` — fast and lightweight (default)
- `llama-3.3-70b-versatile` — smarter, slightly slower, still free
- `mixtral-8x7b-32768` — great at casual conversation

---

## To Stop the Bot

Press `Ctrl + C` in the terminal.

---

## Project Structure

```
gf-ai-bot/
├── index.js        ← Main bot logic
├── persona.js      ← Your personality & texting style (edit this!)
├── .env            ← Your API key and settings (never share this)
├── package.json    ← Project dependencies
└── README.md       ← This file
```
