import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(cors());
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ CRITICAL ERROR: GEMINI_API_KEY is not defined in your .env file!");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `
You are an expert legal tech engineering agent specializing in cross-border European Union digital commerce law and smart contracts.
Take raw freelance project criteria and output a strictly structured JSON response matching exactly this layout. 
Do not wrap it in markdown code blocks or add text outside the JSON structure:
{
  "summary": "A clean, plain-English summary of the agreement and party obligations.",
  "complianceChecklist": {
    "latePaymentDirectivePassed": true,
    "gdprAnonymized": true,
    "consumerWithdrawalNoted": true,
    "vatMechanismIdentified": true,
    "notes": "Text explaining compliance adjustments made."
  },
  "solidityParams": {
    "governingLaw": "String indicating EU jurisdiction",
    "clientVat": "String containing formatted VAT ID",
    "freelancerVat": "String containing formatted VAT ID",
    "privacyPolicyHash": "A valid 64-character hexadecimal string prefixed with 0x"
  }
}
`;

app.post('/api/generate-agreement', async (req, res) => {
  try {
    const { clientName, freelancerName, description, country, currency, milestones } = req.body;
    console.log(`🤖 Processing AI compliance request for Client: ${clientName}`);

    const userPrompt = `
      Generate a compliant legal framework for:
      Client: ${clientName}
      Freelancer: ${freelancerName}
      Project Scope: ${description}
      Jurisdiction: EU Member State - ${country}
      Settlement Asset: ${currency}
      Proposed Milestones: ${JSON.stringify(milestones)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      },
    });

    let jsonText = response.text.trim();
    // Safety check if the model wrapped output in markdown codeblocks
    if (jsonText.startsWith("```json")) jsonText = jsonText.replace(/^```json/, "").replace(/```$/, "").trim();
    if (jsonText.startsWith("```")) jsonText = jsonText.replace(/^```/, "").replace(/```$/, "").trim();

    const parsedData = JSON.parse(jsonText);
    res.json(parsedData);

  } catch (error) {
    console.error("AI Generation Error Details:", error);
    res.status(500).json({ error: "Failed to process legal specifications through AI pipeline." });
  }
});

const PORT = 5001;
// Add '0.0.0.0' to open up both IPv4 and IPv6 routing paths on your Mac
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🤖 AI Engine Server executing smoothly on port ${PORT}`);
});
