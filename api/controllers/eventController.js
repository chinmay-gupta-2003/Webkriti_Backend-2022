const { sanitize } = require("../../utility/data-handlers");
const { CustomError } = require("../../utility/error-handler");
const dbCursor = require("../config/psql");
const { v4: uuidv4 } = require("uuid");
const { getyyyymmdd } = require("../../utility/date-handlers");

const createEvent = async (req, res) => {
  try {
    const name = sanitize(req.body.name);
    const startDate = sanitize(req.body.startDate);
    const endDate = sanitize(req.body.endDate);
    const shortDescription = sanitize(req.body.shortDescription);
    const longDescription = sanitize(req.body.longDescription);
    const mediaImage = req.body.mediaImage;
    const mediaVideo = req.body.mediaVideo;

    const event = await dbCursor.query(
      "insert into events (name,startdate,enddate,shortdescription,longdescription,mediaimage,mediavideo) values ($1,$2,$3,$4,$5,$6,$7)",
      [
        name,
        startDate,
        endDate,
        shortDescription,
        longDescription,
        mediaImage,
        mediaVideo,
      ]
    );
    if (event.rowCount < 1) {
      throw new CustomError(
        "Failed to create and event, contact admin",
        400,
        true
      );
    }
    res.status(201).json({ success: true });
  } catch (err) {
    console.log(err.type, err);
    res.status(err.status || 400).json({
      success: false,
      message:
        err.type === "customError" ? err.message : "Failed to create an event.",
    });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const events = await dbCursor.query("select * from events");
    res.status(200).json({ success: true, events: events.rows });
  } catch (err) {
    console.log(err.type, err);
    res.status(err.status || 400).json({
      success: false,
      message:
        err.type === "customError" ? err.message : "Failed to get all events",
    });
  }
};

const getAllUserEvents = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const events = await dbCursor.query(
      "select * from usereventregistration ur inner join events e on ur.eventid=e.id where useremail=$1",
      [userEmail]
    );
    res.status(200).json({ success: true, events: events.rows });
  } catch (err) {
    console.log(err.type, err);
    res.status(err.status || 400).json({
      success: false,
      message:
        err.type === "customError" ? err.message : "Failed to get all events",
    });
  }
};

const manageRegistration = async (req, res) => {
  try {
    const allowedOperation = ["register", "deregister"];
    const registrationType = sanitize(req.params.type);
    if (!allowedOperation.includes(registrationType)) {
      throw new CustomError(
        "This operation is not allowed under event management",
        404
      );
    }
    const eventId = parseInt(sanitize(req.body.eventId));
    const userEmail = req.user.email;
    let responsePayload = {};
    let query = {};

    const isRegistration = await dbCursor.query(
      "select id from usereventregistration where eventid=$1 and useremail=$2",
      [eventId, userEmail]
    );
    if (registrationType === "register" && isRegistration.rowCount > 0) {
      throw new CustomError("User already registered in the event", 400);
    }
    if (registrationType === "deregister" && isRegistration.rowCount < 1) {
      throw new CustomError("User not registered in the event", 400);
    }

    switch (registrationType) {
      case "register":
        query.sql =
          "insert into usereventregistration (id,eventid,regdate,useremail) values ($1,$2,$3,$4)";
        query.bindings = [uuidv4(), eventId, getyyyymmdd(), userEmail];
        responsePayload.message = "Successfully Registered in this event";
        break;
      case "deregister":
        query.sql = "delete from usereventregistration where id=$1";
        query.bindings = [isRegistration.rows[0].id];
        responsePayload.message = "Successfully De-Registered from this event";
        break;
    }

    const queryResponse = await dbCursor.query(query.sql, query.bindings);
    if (queryResponse.rowCount < 1) {
      throw new CustomError(`Failed to ${registrationType}, contact admin.`);
    }
    res.status(200).json({ ...responsePayload, success: true });
  } catch (err) {
    console.log(err.type, err);
    res.status(err.status || 400).json({
      success: false,
      message:
        err.type === "customError"
          ? err.message
          : "Failed to Register/Deregister, make sure your inputs are valid",
    });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  manageRegistration,
  getAllUserEvents,
};
