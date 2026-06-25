// ================= index.js (backend) =================
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const nodemailer = require("nodemailer");

// ================= App Setup =================
const app = express();
const PORT = 5000;
app.use(cors({ origin: "http://localhost:3000" }));
app.use(bodyParser.json());

// ================= PostgreSQL Connection =================
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "skillswap",
  password: "Uday_royal",
  port: 5432,
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ PostgreSQL connection error:", err));

// ================= OTP STORE =================
let otpStore = {};

// ================= Mailer =================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nagaudaybhaskarerothu@gmail.com",
    pass: "vqku upkt hkgu zksf", // Gmail App Password
  },
});

// ================= REGISTER WITH OTP =================
app.post("/register-request", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) return res.status(400).json({ message: "Email already registered" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000, verified: false, tempUser: { username, email, password } };

    await transporter.sendMail({
      from: "nagaudaybhaskarerothu@gmail.com",
      to: email,
      subject: "Verify your email - SkillSwap",
      text: `Hello ${username},\n\nYour OTP for registration is ${otp}. It will expire in 5 minutes.\n\nThanks!`,
    });

    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("Register request error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/register-verify", async (req, res) => {
  const { email, otp } = req.body;
  try {
    if (otpStore[email] && otpStore[email].otp == otp && otpStore[email].expires > Date.now()) {
      otpStore[email].verified = true;
      const { username, password } = otpStore[email].tempUser;
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
        [username, email, hashedPassword]
      );
      delete otpStore[email];
      return res.json({ success: true, message: "User registered successfully", user: result.rows[0] });
    } else {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
  } catch (err) {
    console.error("Register verify error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(401).json({ success: false, message: "Invalid email or password" });
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid email or password" });

    res.json({ success: true, user: { username: user.username, email: user.email, skills: user.skills, college: user.college, pin: user.pin } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ================= FORGOT PASSWORD =================
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (user.rows.length === 0) return res.status(404).json({ success: false, message: "Email not found" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000, verified: false };

    await transporter.sendMail({
      from: "nagaudaybhaskarerothu@gmail.com",
      to: email,
      subject: "SkillSwap - OTP for password reset",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    console.log(`OTP for ${email}: ${otp}`); // for debugging
    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] && otpStore[email].otp == otp && otpStore[email].expires > Date.now()) {
    otpStore[email].verified = true;
    return res.json({ success: true, message: "OTP verified" });
  } else {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }
});

app.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  if (!otpStore[email] || !otpStore[email].verified) return res.status(400).json({ success: false, message: "OTP not verified" });

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password=$1 WHERE email=$2", [hashedPassword, email]);
    delete otpStore[email];
    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ================= Skills & Profile =================
app.post("/save-skills", async (req, res) => {
  const { email, skills, college, pin } = req.body;
  try {
    await pool.query("UPDATE users SET skills=$1, college=$2, pin=$3 WHERE email=$4", [skills, college, pin, email]);
    res.json({ message: "Skills saved successfully" });
  } catch (err) {
    console.error("Save skills error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

app.get("/profile/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const result = await pool.query("SELECT username, email, skills, college, pin FROM users WHERE email=$1", [email]);
    if (result.rows.length > 0) res.json(result.rows[0]);
    else res.status(404).json({ message: "User not found" });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

app.put("/profile/:email", async (req, res) => {
  const { email } = req.params;
  const { username, skills, college, pin } = req.body;
  try {
    await pool.query("UPDATE users SET username=$1, skills=$2, college=$3, pin=$4 WHERE email=$5", [username, skills, college, pin, email]);
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// ================= Messaging =================
app.post("/messages/send", async (req, res) => {
  const { senderEmail, receiverEmail, message } = req.body;
  try {
    await pool.query("INSERT INTO messages (sender_email, receiver_email, message) VALUES ($1, $2, $3)", [senderEmail, receiverEmail, message]);
    res.json({ success: true, message: "Message sent!" });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
});

app.get("/messages/:userEmail/:friendEmail", async (req, res) => {
  const { userEmail, friendEmail } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE (sender_email=$1 AND receiver_email=$2)
          OR (sender_email=$2 AND receiver_email=$1)
       ORDER BY timestamp ASC`,
      [userEmail, friendEmail]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
});

// ================= Connections =================
app.post("/connections/request", async (req, res) => {
  const { userEmail, friendEmail } = req.body;
  try {
    const existing = await pool.query(
      "SELECT * FROM connections WHERE (user_email=$1 AND friend_email=$2) OR (user_email=$2 AND friend_email=$1)",
      [userEmail, friendEmail]
    );
    if (existing.rows.length > 0) return res.status(400).json({ message: "Connection already exists or pending" });
    await pool.query("INSERT INTO connections (user_email, friend_email, status) VALUES ($1, $2, $3)", [userEmail, friendEmail, "pending"]);
    res.json({ message: "Friend request sent" });
  } catch (err) {
    console.error("Friend request error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/connections/respond", async (req, res) => {
  const { userEmail, friendEmail, action } = req.body;
  try {
    if (action === "accept") {
      await pool.query("UPDATE connections SET status=$1 WHERE user_email=$2 AND friend_email=$3", ["accepted", friendEmail, userEmail]);
      res.json({ message: "Friend request accepted" });
    } else if (action === "reject") {
      await pool.query("DELETE FROM connections WHERE user_email=$1 AND friend_email=$2 AND status=$3", [friendEmail, userEmail, "pending"]);
      res.json({ message: "Friend request rejected" });
    } else {
      res.status(400).json({ message: "Invalid action" });
    }
  } catch (err) {
    console.error("Respond request error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/connections/friends/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const friends = await pool.query(
      `SELECT u.username, u.email
       FROM connections c
       JOIN users u ON u.email = CASE 
         WHEN c.user_email=$1 THEN c.friend_email
         ELSE c.user_email
       END
       WHERE (c.user_email=$1 OR c.friend_email=$1) AND c.status='accepted'`,
      [email]
    );
    res.json(friends.rows);
  } catch (err) {
    console.error("Get friends error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= Friend Suggestions =================
app.get("/friend-suggestions/:email/search", async (req, res) => {
  const { email } = req.params;
  const { skill } = req.query;
  try {
    const result = await pool.query(
      `SELECT u.username, u.email, u.skills
       FROM users u
       WHERE u.email != $1
         AND u.skills ILIKE $2
         AND NOT EXISTS (
           SELECT 1 FROM connections c
           WHERE (c.user_email=$1 AND c.friend_email=u.email)
              OR (c.user_email=u.email AND c.friend_email=$1)
         )
       LIMIT 20`,
      [email, `%${skill}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Search suggestions error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

app.get("/connections/requests/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const requests = await pool.query(
      `SELECT u.username, u.email
       FROM connections c
       JOIN users u ON u.email=c.user_email
       WHERE c.friend_email=$1 AND c.status='pending'`,
      [email]
    );
    res.json(requests.rows);
  } catch (err) {
    console.error("Get pending requests error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});