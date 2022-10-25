const express = require("express");
const userController = require("../controllers/userController");
const { authMiddleware } = require("../middlewares/auth");
const router = express.Router();

router.get("/info", authMiddleware, userController.getUserInfo);
router.post("/sign-up", userController.signUp);
router.post("/sign-in", userController.signIn);

module.exports = router;
