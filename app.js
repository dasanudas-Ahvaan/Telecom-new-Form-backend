const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const routes = require("./routes/router");

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("DB Connection Successfull !!!");
  })
  .catch((error) => {
    console.error("!! Error connecting to MongoDB:", error);
  });

const allowedOrigins = ["http://localhost:5000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `CORS error: origin not allowed`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(logger("dev"));

// ⭐ YE DO LINES ADD KARO - BAHUT IMPORTANT! ⭐
app.use(express.json());                    // JSON data parse karne ke liye
app.use(express.urlencoded({ extended: true }));  // Form data parse karne ke liye

app.use("/api", routes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: `Jai Shri Ram! Server is running on port ${PORT}`,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});