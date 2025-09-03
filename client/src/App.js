import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseSummary from './components/ExpenseSummary';
import ExpenseChart from './components/ExpenseChart';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import './App.css';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token from localStorage
    setUser(null);
    setExpenses([]); // Clear the expenses when logging out
  };

  const handleRegister = (userData) => {
    setUser(userData);
  };

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setExpenses([]);
        return;
      }

      try {
        const response = await fetch('http://localhost:5001/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
          
        if (!response.ok) {
          throw new Error('Token verification failed');
        }
          
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        console.error('Token verification failed:', err);
        localStorage.removeItem('token');
        setUser(null);
        setExpenses([]);
      }
    };

    verifyToken();
  }, []);

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/expenses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      setError('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedExpenses = () => {
    let result = [...expenses];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(expense => expense.category === categoryFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    return result;
  };

  const addExpense = async (expense) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5001/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(expense),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add expense');
      }

      const data = await response.json();
      setExpenses([data, ...expenses]);
      setError(''); // Clear any existing errors
    } catch (err) {
      console.error('Error adding expense:', err);
      setError(err.message || 'Failed to add expense');
    }
  };

  const deleteExpense = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete expense');
      }
      setExpenses(expenses.filter(expense => expense._id !== id));
      setError(''); // Clear any existing errors
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError(err.message || 'Failed to delete expense');
    }
  };

  return (
    <Router>
      <div className="app-wrapper">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register onRegister={handleRegister} /> : <Navigate to="/" />} />
          <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/" />} />
          <Route path="/reset-password/:token" element={!user ? <ResetPassword /> : <Navigate to="/" />} />
          <Route path="/" element={
            user ? (
              <div className="container">
                {error && <div className="error">{error}</div>}
                <ExpenseSummary expenses={filteredAndSortedExpenses()} />
                <ExpenseChart expenses={expenses} />
                <ExpenseForm onAddExpense={addExpense} />
                
                <div className={`controls ${isMenuOpen ? 'show-menu' : ''}`}>
                  <div className="control-group">
                    <label>Filter by Category:</label>
                    <select 
                      value={categoryFilter} 
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="select-control"
                    >
                      <option value="all">All Categories</option>
                      <option value="Food">Food</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="control-group">
                    <label>Sort by Date:</label>
                    <select 
                      value={sortOrder} 
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="select-control"
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="loading">Loading expenses...</div>
                ) : (
                  <ExpenseList 
                    expenses={filteredAndSortedExpenses()} 
                    onDeleteExpense={deleteExpense} 
                  />
                )}
              </div>
            ) : (
              <Navigate to="/login" />
            )
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
