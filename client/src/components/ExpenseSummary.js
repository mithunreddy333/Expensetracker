import React from 'react';

const ExpenseSummary = ({ expenses }) => {
  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  return (
    <div className="summary">
      <h2>Total Expenses: ${totalExpenses.toFixed(2)}</h2>
      <div style={{ marginTop: '1rem' }}>
        {Object.entries(categoryTotals).map(([category, amount]) => (
          <div key={category} style={{ margin: '0.5rem 0' }}>
            <strong>{category}:</strong> ${amount.toFixed(2)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseSummary;
