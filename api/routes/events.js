const express = require("express");
const router = express.Router();
const eventsController = require("../controllers/eventController");
const { authMiddleware, authMiddlewareAdmin } = require("../middlewares/auth");

router.post("/create", authMiddlewareAdmin, eventsController.createEvent);
router.post(
  "/registration/:type",
  authMiddleware,
  eventsController.manageRegistration
);
router.get("/allUserEvents", authMiddleware, eventsController.getAllUserEvents);

router.get("/all", eventsController.getAllEvents);

module.exports = router;
