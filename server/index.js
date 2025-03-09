require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
// app.use(cors({ origin: "*", credentials: true }));
app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin || "*"); 
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// MONGO DB CONNECTION 
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

const User = mongoose.model("User", UserSchema);


// Mock Test Schema 
const MockTestSchema = new mongoose.Schema({
    mockId: { type: String, required: true, unique: true }, // Unique Mock Test ID
    totalCTC: { type: Number, required: true }, // User's salary input
    totalExperience: { type: Number, required: true }, // Years of experience
    targetCompany:{type: String, required: true},
    totalTimeCommitment: { type: Number, required: true }, // Daily time commitment
    aiResponse: { type: mongoose.Schema.Types.Mixed, default: {} }, // JSON response from AI
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who created it
    createdAt: { type: Date, default: Date.now }, // Timestamp when created
  });
  
  const MockTest = mongoose.model("MockTest", MockTestSchema);


// Progress Tracker Schema 
const trackProgressSchema = new mongoose.Schema({
  mockId: { type: String, required: true, unique: true },
  question: { type: String, required: true },
  questionStatus: { type: String, enum: ["pending", "done"], default: "pending" },
  userAnswer: { type: String, default: "" },
  aiFeedback: { type: String, default: "" },
  level: { type: String, required: true }
});

const TrackProgress = mongoose.model("TrackProgress", trackProgressSchema);

// Register Route
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ name, email, password: hashedPassword });
    res.json({ message: "User created successfully" });
  } catch (error) {
    res.status(400).json({ error: "Email already exists" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user._id , email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.cookie("token", token, { httpOnly: true, sameSite: "strict" })
     .json({ message: "Login successful", userId: user._id, email: user.email, name: user.name });
});

// Logout Route
app.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out" });
});

// Authentication Check Route
app.get("/auth", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    res.json({ message: "Authenticated", userId: decoded.id });
  });
});


//  Mock Test Entry
app.post("/create-mock", async (req, res) => {
    console.log("Received Headers:", req.headers); // Check headers
    console.log("Received Body:", req.body); // Debug body
    console.log("Method:", req.method); // Debug HTTP method

    const {  totalExperience, totalCTC,targetCompany, totalTimeCommitment, aiResponse, userId } = req.body;
    const aiData = JSON.parse(aiResponse);
    const questions = aiData.sql_queries; // Extract the 25 SQL questions
    console.log("Questions ", questions)

    if (!userId) return res.status(400).json({ error: "User ID is required" });

    try {
      const newMock = await MockTest.create({
        mockId: `mock-${Date.now()}`,
        totalCTC,
        totalExperience,
        targetCompany,
        totalTimeCommitment,
        aiResponse,
        createdBy: userId,
      });

      const trackProgressEntries = questions.map((q) => ({
        mockId: newMock.mockId,
        question: q.question,
        questionStatus: "pending",
        userAnswer: "",
        aiFeedback: "",
        level: q.difficulty
      }));

      await TrackProgress.insertMany(trackProgressEntries);

      res.json({ message: "Mock test created", mockTest: newMock });
    } catch (error) {
      res.status(500).json({ error: "Error creating mock test" });
    }
});


app.get("/:mockId", async (req, res) => {
    const { mockId } = req.params;
  
    try {
        const mockTest = await MockTest.findOne({ mockId });
        if (!mockTest) {
            return res.status(404).json({ error: "Mock test not found" });
        }

        res.json({ aiResponse: mockTest.aiResponse });
    } catch (error) {
        res.status(500).json({ error: "Error fetching AI response" });
    }
});

// Fetch all mock tests for a user
app.get("/mocks/:userId", async (req, res) => {
  try {
      const { userId } = req.params;
      const mockTests = await MockTest.find({ createdBy: userId });
      res.json(mockTests);
  } catch (err) {
      res.status(500).json({ error: "Error fetching mock tests" });
  }
});


// Fetch progress for a given Mock Test ID
app.get("/trackProgress/:mockId", async (req, res) => {
  try {
    const progress = await TrackProgress.find({ mockId: req.params.mockId });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: "Error fetching progress" });
  }
});

// Update Question Status
app.patch("/update-status/:id", async (req, res) => {
  try {
      const { id } = req.params;
      await TrackProgress.findByIdAndUpdate(id, { questionStatus: "done" });
      res.json({ message: "Status updated" });
  } catch (error) {
      res.status(500).json({ error: "Failed to update status" });
  }
});

app.patch("/update-feedback/:id", async (req, res) => {
  try {
      const { id } = req.params;
      const { aiFeedback , userAnswer} = req.body;
      await TrackProgress.findByIdAndUpdate(id, { aiFeedback, userAnswer });
      res.json({ message: "Feedback updated" });
  } catch (error) {
      res.status(500).json({ error: "Failed to update feedback" });
  }
});







const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
