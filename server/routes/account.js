const express = require('express');
const router = express.Router();
const Account = require('../models/account');
const jwt = require('jsonwebtoken');

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

// GET user accounts
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    const accounts = await Account.find({ user: userId });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch accounts' });
  }
});

// POST add a new account
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    const { bankName, accountType, accountNumberMasked, balance } = req.body;

    const newAccount = await Account.create({
      user: userId,
      bankName,
      accountType,
      accountNumberMasked: accountNumberMasked || '•••• 4812',
      balance: balance || 0
    });

    res.status(201).json(newAccount);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add account' });
  }
});

// DELETE account
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    await Account.findOneAndDelete({ _id: req.params.id, user: userId });
    res.json({ message: 'Account removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

module.exports = router;
