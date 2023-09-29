import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Profile from './pages/Profile';
import SearchResults from './pages/SearchResults';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} /> 
        <Route path="/profile" element={<Profile />} /> 
        <Route path="/search-results" element={<SearchResults />} />
      </Routes>
    </Router>
  );
}

export default App;
