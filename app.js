const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const routes = require("./routes/router");
const cookieParser = require("cookie-parser");
const { razorpayCallback } = require("./controller/razorpay.controller");
const subscriptionController = require("./controller/subscription.controller");

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("DB Connection Successfull !!!");
  })
  .catch((error) => {
    console.error("!! Error connecting to MongoDB:", error);
  });

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

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
    allowedHeaders: ["Content-Type", "Authorization", "X-XSRF-TOKEN"],
  }),
);
app.use(logger("dev"));

app.post(
  "/api/pay/webhook/razorpay",
  express.raw({ type: "application/json" }),
  razorpayCallback,
);
app.post(
  "/api/pay/webhook/razorpay/subscription",
  express.raw({ type: "application/json" }),
  subscriptionController.subscriptionCallback,
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", routes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: `Jai Shri Ram! Server is running on port ${PORT}`,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
