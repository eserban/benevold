const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const app = express();
// app use
app.use(express.json());
app.use(cookieParser());

app.get("/", function (req, res) {
  res.status(200).send(`Welcome to login , sign-up api`);
});

// listening port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`app is live at ${PORT}`);
});
