import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} /> 
        <Route path="/profile" element={<Profile />} /> 
      </Routes>
    </Router>
  );
}

export default App;
