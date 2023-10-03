import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Profile from './pages/Profile';
import SearchResults from './pages/SearchResults';
import TrackSearcher from './pages/TrackSearcher';
import TopCharts from './pages/TopCharts';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} /> 
        <Route path="/profile" element={<Profile />} /> 
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/track" element={<TrackSearcher />} /> 
        <Route path="/topCharts" element={<TopCharts />} /> 
      </Routes>
    </Router>
  );
}

export default App;
