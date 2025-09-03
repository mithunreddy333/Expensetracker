const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
