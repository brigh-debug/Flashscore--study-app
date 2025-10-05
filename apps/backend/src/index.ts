import express from "express";
import mongoose from "mongoose";
import newsRoutes from "./routes/news";

const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/sportscentral");

// Routes
app.use("/news", newsRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend 💯 http://localhost:${PORT}`);
});