require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const logger = require("morgan");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");

const app = express();

const paymentRoute = require("./routes/paymentRoute");
const routes = require("./routes/router");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("DB Connection Successful !!!"))
  .catch((error) => console.error("!! Error connecting to MongoDB:", error));

const allowedOrigins = ["http://localhost:5000", "http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || origin === "null" || origin.startsWith("file://")) {
        return callback(null, true);
      }
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error("CORS error: origin not allowed"), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(logger("dev"));

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

app.use("/api", routes);
app.use("/api/payment", paymentRoute);

app.get("/", (req, res) => {
  res.status(200).json({
    message: `Jai Shri Ram! Server is running on port ${PORT}`,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
