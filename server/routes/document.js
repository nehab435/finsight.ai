const express = require('express');
const router = express.Router();
const multer = require('multer');
const Document = require('../models/Document');
const jwt = require('jsonwebtoken');
const { analyzeDocument } = require('../services/aiService');

// 1. Authentication Middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// 2. File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });


// ==========================================
// CRUD & AI ROUTES
// ==========================================

// CREATE (Upload & Trigger AI Analysis)
// CREATE (Upload & Trigger AI Analysis)
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  console.log("🚀 File upload request received!"); // NEW LOG
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    const extractedId = req.user.id || req.user._id || req.user.userId || (req.user.user && req.user.user.id);
    
    const newDoc = new Document({
      user: extractedId,
      fileName: req.file.originalname,
      fileUrl: req.file.path,
      status: 'Pending'
    });
    const savedDoc = await newDoc.save();
    console.log("✅ File saved to DB, starting AI analysis..."); // NEW LOG

    // Trigger AI
    setTimeout(async () => {
      try {
        console.log("🤖 AI analysis starting..."); // NEW LOG
        const analysisResult = await analyzeDocument(req.file.path);
        
        savedDoc.status = 'Analyzed';
        savedDoc.totalAssets = analysisResult.totalAssets || 0;
        savedDoc.summary = analysisResult.summary || '';
        await savedDoc.save();
        
        console.log("✨ AI Successfully Analyzed Document:", analysisResult);
      } catch (aiErr) {
        console.error("❌ AI background processing failed:", aiErr);
      }
    }, 2000); // Increased to 2 seconds

    res.status(201).json(savedDoc);
  } catch (err) {
    console.error("❌ Upload Error:", err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// READ (Get all user documents)
router.get('/', auth, async (req, res) => {
  try {
    const extractedId = req.user.id || req.user._id || req.user.userId || (req.user.user && req.user.user.id);
    const documents = await Document.find({ user: extractedId }).sort({ uploadedAt: -1 });
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// UPDATE (Rename a document)
router.put('/:id', auth, async (req, res) => {
  try {
    const extractedId = req.user.id || req.user._id || req.user.userId || (req.user.user && req.user.user.id);
    
    const updatedDoc = await Document.findOneAndUpdate(
      { _id: req.params.id, user: extractedId },
      { fileName: req.body.fileName },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(updatedDoc);
  } catch (err) {
    console.error("❌ PUT Error:", err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE (Remove a document)
router.delete('/:id', auth, async (req, res) => {
  try {
    const extractedId = req.user.id || req.user._id || req.user.userId || (req.user.user && req.user.user.id);
    
    const document = await Document.findOne({ _id: req.params.id, user: extractedId });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    await document.deleteOne();
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error("❌ DELETE Error:", err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;