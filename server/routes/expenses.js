const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// Get all expenses for logged in user
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new expense
router.post('/', async (req, res) => {
  const expense = new Expense({
    title: req.body.title,
    amount: req.body.amount,
    category: req.body.category,
    user: req.user._id
  });

  try {
    const newExpense = await expense.save();
    res.status(201).json(newExpense);
  } catch (err) {
    console.error('Error saving expense:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
