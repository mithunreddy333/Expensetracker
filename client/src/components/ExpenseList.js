import React from 'react';

const ExpenseList = ({ expenses, onDeleteExpense }) => {
  return (
    <div className="expenses-list">
      <h2>Expenses</h2>
      {expenses.length === 0 ? (
        <p>No expenses found</p>
      ) : (
        expenses.map((expense) => (
          <div key={expense._id} className="expense-item">
            <div className="expense-details">
              <h3>{expense.title}</h3>
              <p>{expense.category}</p>
              <p>{new Date(expense.date).toLocaleDateString()}</p>
            </div>
            <div>
              <span style={{ marginRight: '1rem', fontSize: '1.2rem' }}>
                ${expense.amount.toFixed(2)}
              </span>
              <button
                className="delete-btn"
                onClick={() => onDeleteExpense(expense._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ExpenseList;
