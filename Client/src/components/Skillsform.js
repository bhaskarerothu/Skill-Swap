import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SkillsForm = () => {
  const [skills, setSkills] = useState("");
  const [college, setCollege] = useState("");
  const [pin, setPin] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem("email");

    try {
      const response = await fetch("http://localhost:5000/save-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, skills, college, pin }),
      });

      if (response.ok) {
        alert("Skills saved!");
        navigate("/Profile");
      } else {
        console.error("Failed to save skills");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Skills" value={skills} onChange={(e) => setSkills(e.target.value)} />
      <input placeholder="College" value={college} onChange={(e) => setCollege(e.target.value)} />
      <input placeholder="Pin" value={pin} onChange={(e) => setPin(e.target.value)} />
      <button type="submit">Save</button>
    </form>
  );
};

export default SkillsForm;
