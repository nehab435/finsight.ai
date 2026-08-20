const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const Chat = require('../models/Chat');
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

// GET chat history for user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    let chat = await Chat.findOne({ user: userId });
    
    if (!chat) {
      chat = await Chat.create({
        user: userId,
        messages: [{ sender: 'ai', text: '👋 Hello! Ask me anything about your uploaded financial documents.' }]
      });
    }
    
    res.json(chat.messages);
  } catch (err) {
    console.error("Fetch History Error:", err);
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
});

// POST new message & get AI response
router.post('/', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id || req.user._id || req.user.userId;

    let chat = await Chat.findOne({ user: userId });
    if (!chat) {
      chat = await Chat.create({ user: userId, messages: [] });
    }

    // Push user message
    chat.messages.push({ sender: 'user', text: message });

    // Fetch user documents for AI context
    const userDocs = await Document.find({ user: userId });
    const docContext = userDocs.map(d => `File: ${d.fileName}, Total: ${d.totalAssets}, Summary: ${d.summary}`).join('\n');

    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
    const prompt = `
      You are FinSight AI, a financial assistant. User documents context:
      ${docContext}

      User Question: "${message}"
      Provide a concise, professional answer.
    `;

    const result = await model.generateContent(prompt);
    const aiReply = result.response.text();

    // Push AI reply
    chat.messages.push({ sender: 'ai', text: aiReply });
    await chat.save();

    res.json({ reply: aiReply, messages: chat.messages });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ message: 'Chat failed' });
  }
});

module.exports = router;