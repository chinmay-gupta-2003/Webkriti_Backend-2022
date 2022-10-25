const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

// cors configuration
app.use(cors());

// cofiguration settings
require("dotenv").config();
require("./api/config/psql");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: "2mb" }));

// apis

app.use("/api", require("./api/routes"));

app.use("/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not Found",
  });
});

//ff code will changes in prod
app.use((err, req, res, next) => {
  if (err) {
    console.error(err, "catched in main");
    res.status(500).json({
      success: "false",
      message: err.code || "BAD REQUEST",
    });
  } else {
    next();
  }
});

app.listen(process.env.PORT, function (err) {
  if (err) {
    console.log(`error in listening: ${err}`);
  }
  console.log(
    "Server Up and Running at:",
    `http://localhost:${process.env.PORT}`
  );
});
