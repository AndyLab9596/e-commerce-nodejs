"use strict";

const express = require("express");
const { apiKey, permission } = require("../auth/checkAuth");
const router = express.Router();

// Testing route
router.use("/v1/api", require("./testing"));

// check apiKey
router.use(apiKey);
// check permission
router.use(permission('0000'))

router.use("/v1/api", require("./access"));


module.exports = router;
