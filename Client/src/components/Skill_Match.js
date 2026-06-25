import React from 'react';
import './Skill_Match.css';

const SkillMatch = () => {
  return (
    <div className="match-container">
      <h1>Skill Matches</h1>
      <div className="match-card">
        <h3>Jane Smith</h3>
        <p>Wants to learn: Web Development</p>
        <p>Can teach: Photography</p>
        <button>Connect</button>
      </div>
      <div className="match-card">
        <h3>Michael Johnson</h3>
        <p>Wants to learn: Cooking</p>
        <p>Can teach: React.js</p>
        <button>Connect</button>
      </div>
    </div>
  );
};

export default SkillMatch;
