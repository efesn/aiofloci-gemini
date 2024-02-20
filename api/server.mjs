import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Converts local file information to a GoogleGenerativeAI.Part object.
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

app.post("/generate-loci", async (req, res) => {
  console.log("Received a request:", req.body);
  const { message, place } = req.body;

  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-pro", safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ] });

    // Construct the prompt using the provided message and place
    const prompt = `I want you to act as a method of loci generator. You help people to memorize things using the method of loci. User will provide the thing he/she wants to memorize. Once you have this information, start generation. Use your most efficient way to generate this. Don't keep it too short or too long. You decide the place etc. Don't add extra comments. Answer in numbered list. Go to the next line below at the end of each sentence. Here is your task: ${message} (Place: ${place})`;

    // Generate content stream based on the prompt
    const result = await model.generateContentStream(prompt, {maxOutputTokens: 1000});
    let text = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      console.log(chunkText);
      text += chunkText;
    }

    console.log("Generated text:", text);

    // Send the generated completion back to the client
    res.json({ completion: text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post("/generate-image", async (req, res) => {
  const { text } = req.body;

  try {
    // Get the generative model for image generation
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    // You can directly use the generated text to generate an image
    const result = await model.generateContent(text);
    const response = await result.response;
    const imageUrl = response.imageUrl;
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
