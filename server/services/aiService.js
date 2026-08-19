const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateWithRetry = async (model, prompt, retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (error) {
      if ((error.message.includes('503') || error.message.includes('404')) && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
};

const analyzeDocument = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    const extractedText = result.text;

    if (!extractedText || extractedText.length < 5) {
      throw new Error("No text found inside this PDF.");
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
    
    const prompt = `
      You are an advanced financial document analyzer. Analyze this document text:
      "${extractedText.substring(0, 4000)}"
      
      Extract:
      1. "totalAssets": The total monetary amount found (e.g., total income, taxable amount, TDS amount, or account balance). If none, put 0.
      2. "summary": A detailed, professional 2-3 sentence financial insight summary explaining what this document is, who it is for, and key amounts.

      Return ONLY a JSON object: {"totalAssets": 0.00, "summary": "..."}
    `;

    const aiResult = await generateWithRetry(model, prompt);
    const text = aiResult.response.text().replace(/```json|```/g, '').trim();
    
    return JSON.parse(text);
    
  } catch (error) {
    console.error("❌ AI Error:", error.message);
    return { totalAssets: 0, summary: "Could not parse text." };
  }
};

module.exports = { analyzeDocument };