"use strict";

const express = require("express");
const router = express.Router();

const crypto = require("crypto");
const apiKeyModel = require("../../models/apiKey.model");

// sign-up
router.post("/test", async (req, res, next) => {
  try {
    const newKey = await apiKeyModel.create({
      key: crypto.randomBytes(64).toString("hex"),
      permissions: ["0000"],
    });
    return res.status(201).json(newKey).console.log(newKey);
  } catch (error) {
    console.log("error::", error);
  }
});

module.exports = router;
