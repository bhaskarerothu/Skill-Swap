import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ForgotPassword from './components/Forgot-pass';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import SkillMatch from './components/Skill_Match';
import SkillsForm from './components/Skillsform';
import ChatBox from './components/ChatBox';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/Register" element={<Register/>} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/SkillMatch" element={<SkillMatch />} />
        <Route path="/Skillsform" element={<SkillsForm />} />
        <Route path="/ChatBox" element={<ChatBox />} />
        <Route path="/Forgot-pass" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
}

export default App;