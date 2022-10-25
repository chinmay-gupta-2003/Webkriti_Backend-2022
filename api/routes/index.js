const express = require("express");

const router = express.Router();

router.use("/users", require("./users"));
router.use("/events", require("./events"));

module.exports = router;
