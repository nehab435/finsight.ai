const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bankName: { type: String, required: true },
  accountType: { type: String, enum: ['Checking', 'Savings', 'Investment', 'Credit Card'], default: 'Savings' },
  accountNumberMasked: { type: String, required: true },
  balance: { type: Number, required: true, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);
