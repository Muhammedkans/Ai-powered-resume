import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { ResumeBuilder } from './pages/ResumeBuilder';
import { MockInterview } from './pages/MockInterview';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/builder" element={<ResumeBuilder />} />
        <Route path="/mock-interview" element={<MockInterview />} />
      </Routes>
    </Router>
  );
}

export default App;
