require("dotenv").config();
const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "API WORKING ✅" });
});

module.exports = app;