import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { google } from "googleapis";
import "regenerator-runtime";

dotenv.config();

const TELEGRAM_API_TOKEN = process.env.TELEGRAM_API_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_API_TOKEN}`;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const app = express();
app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
    console.log(req.body);
  const chatId = req.body.message.chat.id;
  const messageText = req.body.message.text;

  // Ignore commands
  if (messageText.startsWith("/")) {
    if (messageText === "/start") {
      await sendMessage(chatId, "Welcome to Visionary Fashion Bot! To get started, please send me your color blindness type and the occasion or context for which you need makeup and outfit suggestions.");
    }
    res.sendStatus(200);
    return;
  }

  // Call GPT-3 API and parse response
  const gptResponse = await generateChatGptResponse(messageText);
  const parsedResponse = parseGptResponse(gptResponse);
  console.log(parsedResponse);

  // Search images for makeup and outfit items
  const makeupImages = await searchImages(parsedResponse.makeup.map(item => item.item));
  const outfitImages = await searchImages(parsedResponse.outfit.map(item => item.item));

  console.log(makeupImages);
  console.log(outfitImages);

  // Send makeup and outfit images to the user along with their descriptions
  for (let i = 0; i < makeupImages.length; i++) {
    await sendPhoto(chatId, makeupImages[i].imageUrl, `${parsedResponse.makeup[i].item}: ${parsedResponse.makeup[i].description}`);
  }

  for (let i = 0; i < outfitImages.length; i++) {
    await sendPhoto(chatId, outfitImages[i].imageUrl, `${parsedResponse.outfit[i].item}: ${parsedResponse.outfit[i].description}`);
  }

  res.sendStatus(200);
});

async function generateChatGptResponse(userQuery) {
    
    const prompt = `You are a beauty expert chatbot specialized in providing advice on makeup and outfits for people with color blindness. Your suggestions consider their specific color vision deficiencies and recommend colors and combinations they can see.
    Please suggest makeup and an outfit for an ideal summer day. Provide the suggestions in the following format:

Makeup:
1. [Item 1]: [Description]
2. [Item 2]: [Description]
...

Outfit:
1. [Item 1]: [Description]
2. [Item 2]: [Description]

This is the user request: ${userQuery}
`;

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${OPENAI_API_KEY}`,
  };

  const data = {
    model: "gpt-3.5-turbo",
  messages: [{"role": "user", "content": prompt}],
    max_tokens: 200,
    n: 1,
    stop: null,
    temperature: 0.2,
  };

  try {
    const response = await axios.post(OPENAI_API_URL, data, { headers: headers });
    console.log(response.data.choices[0].message.content);
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    return "Sorry, I am unable to generate a response at the moment.";
  }
}

async function sendMessage(chatId, text) {
  const url = `${TELEGRAM_API_URL}/sendMessage`;
  const data = {
    chat_id: chatId,
    text: text,
  };

  try {
    await axios.post(url, data);
  } catch (error) {
    console.error("Error sending message to Telegram:", error);
  }
}

async function sendPhoto(chatId, imageUrl, caption = "") {
    const url = `${TELEGRAM_API_URL}/sendPhoto`;
    const data = {
      chat_id: chatId,
      photo: imageUrl,
      caption: caption,
    };
  
    try {
      await axios.post(url, data);
    } catch (error) {
      console.error("Error sending photo to Telegram:", error);
    }
  }


async function searchImages(items) {
    const results = [];

    
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_CUSTOM_SEARCH_CX;

  

  for (const item of items) {
    if (!item || item.trim() === "") {
      console.error("Empty query received. Skipping image search.");
      continue;
    }

    const customsearch = google.customsearch("v1");
    const imageResults = await customsearch.cse.list({
      auth: apiKey,
      cx: cx,
      q: item,
      searchType: "image",
      num: 1,
    });

    if (imageResults.data.items && imageResults.data.items.length > 0) {
      results.push({
        query: item,
        imageUrl: imageResults.data.items[0].link,
      });
    } else {
      console.error(`No images found for query: ${item}`);
    }
  }

  return results;
}

function parseGptResponse(gptResponse) {
    const makeupItems = [];
    const outfitItems = [];
  
    const makeupRegex = /Makeup:(.*)(?=\n\nOutfit:)/s;
    const outfitRegex = /Outfit:(.*)/s;
  
    const makeupMatches = gptResponse.match(makeupRegex);
    const outfitMatches = gptResponse.match(outfitRegex);
  
    if (makeupMatches) {
      const makeupList = makeupMatches[1].trim();
      const makeupLines = makeupList.split("\n");
  
      for (const line of makeupLines) {
        const itemMatch = line.match(/[\d]+\.\s(.*?):\s(.*?)$/);
        if (itemMatch) {
          makeupItems.push({ item: itemMatch[1], description: itemMatch[2] });
        }
      }
    }
  
    if (outfitMatches) {
      const outfitList = outfitMatches[1].trim();
      const outfitLines = outfitList.split("\n");
  
      for (const line of outfitLines) {
        const itemMatch = line.match(/[\d]+\.\s(.*?):\s(.*?)$/);
        if (itemMatch) {
          outfitItems.push({ item: itemMatch[1], description: itemMatch[2] });
        }
      }
    }
  
    return { makeup: makeupItems, outfit: outfitItems };
  }

  

export default app;
