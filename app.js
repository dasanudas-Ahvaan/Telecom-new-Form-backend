const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const mongoose = require("mongoose");
const app = express();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

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

app.get("/", (req, res) => {
  res.status(200).json({
    message: `Hello from Node backend running in ??Docker! ${PORT} in the docker container??`,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
