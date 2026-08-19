const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access denied' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

router.post('/', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id || req.user._id || req.user.userId;

    const userDocs = await Document.find({ user: userId });
    
    // Provide a richer context package to the chat model
    const docContext = userDocs.map(d => `
      File Name: ${d.fileName}
      Status: ${d.status}
      Extracted Value/Total: ${d.totalAssets}
      AI Summary: ${d.summary}
    `).join('\n---\n');

    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
    const prompt = `
      You are FinSight AI, an expert personal financial advisor and tax/document analyst. 
      You have access to the following documents uploaded by the user:
      ${docContext}

      User Question: "${message}"
      
      Provide a smart, professional, accurate, and detailed answer. If referencing specific amounts, cite them clearly from the context.
    `;

    const result = await model.generateContent(prompt);
    res.json({ reply: result.response.text() });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ message: 'Chat failed' });
  }
});

module.exports = router;