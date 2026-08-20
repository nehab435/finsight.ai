const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access denied.' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

router.get('/health-score', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const documents = await Document.find({ user: userId });

    if (documents.length === 0) {
      return res.json({
        score: 0,
        status: 'Unrated',
        totalAssets: 0,
        documentCount: 0,
        advice: 'Upload your financial statements (like tax records or bank statements) to let AI analyze your income, taxes, and savings.'
      });
    }

    let totalIncome = 0;
    let totalTaxesPaid = 0;
    let totalAssets = 0;
    let liabilities = 0;

    // Analyze extracted data from all documents
    documents.forEach(doc => {
      const data = doc.extractedData || {};
      
      const amount = data.totalAssets || data.totalAmount || data.amount || 0;
      totalAssets += amount;

      // Extract income or TDS details if present in tax docs / statements
      if (data.grossIncome) totalIncome += data.grossIncome;
      if (data.taxDeducted || data.tds) totalTaxesPaid += (data.taxDeducted || data.tds);
      if (data.liabilities) liabilities += data.liabilities;
    });

    // Fallback estimation if explicit income fields aren't parsed yet
    if (totalIncome === 0 && totalAssets > 0) {
      totalIncome = totalAssets * 1.2; // Rough proxy based on turnover/assets
    }

    // AI Financial Health Calculation Logic
    let score = 50; // Base score

    // 1. Savings & Asset strength vs Liabilities ratio
    const netWorth = totalAssets - liabilities;
    if (netWorth > 1000000) score += 25;
    else if (netWorth > 200000) score += 15;
    else if (netWorth > 50000) score += 5;

    // 2. Tax compliance / burden factor (checking tax-to-income proportion)
    if (totalIncome > 0) {
      const taxRatio = totalTaxesPaid / totalIncome;
      if (taxRatio < 0.15 && taxRatio > 0.05) score += 15; // Healthy tax bracket ratio
      else if (taxRatio >= 0.30) score -= 10; // Heavy tax weight
    }

    // 3. Document diversification (having multiple document types like tax + bank records)
    if (documents.length >= 2) score += 10;

    score = Math.max(10, Math.min(score, 100)); // Bound between 10 and 100

    let status = 'Fair';
    let advice = 'Your financial metrics are stable. Consider optimizing your tax savings and tracking liabilities closely.';

    if (score >= 80) {
      status = 'Excellent';
      advice = 'Strong financial health! Your asset-to-liability ratio and tax management look solid.';
    } else if (score >= 65) {
      status = 'Good';
      advice = 'Healthy progress. Maintaining balanced savings will further improve your score.';
    } else if (score < 40) {
      status = 'Needs Attention';
      advice = 'High liability or heavy tax burden detected relative to recorded assets. Review your spending and savings.';
    }

    res.json({ 
      score, 
      status, 
      totalAssets, 
      totalIncome,
      totalTaxesPaid,
      liabilities,
      documentCount: documents.length, 
      advice 
    });
  } catch (err) {
    console.error("Health score error:", err);
    res.status(500).json({ message: 'Server error calculating health score' });
  }
});

module.exports = router;