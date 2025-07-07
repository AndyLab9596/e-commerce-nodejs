"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const router = express.Router();

// sign-up
router.post("/shop/signup", asyncHandler(accessController.signUp));

router.post("/shop/signin", asyncHandler(accessController.login));

module.exports = router;
