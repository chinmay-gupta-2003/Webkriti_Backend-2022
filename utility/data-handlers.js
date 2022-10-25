const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { CustomError } = require("./error-handler");

const sanitize = (data) => data.toString().trim();

const extractBearerAuthorizationToken = (req) => {
  try {
    const token =
      req.headers.authorization.split(" ")[0].toLowerCase() == "bearer"
        ? req.headers.authorization.split(" ")[1]
        : null;
    if (token) {
      return token;
    } else {
      throw new Error("No token");
    }
  } catch {
    return null;
  }
};

const signJWT = async (payload) => {
  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    return token;
  } catch (err) {
    console.log("Error while signing jwt", err);
    return null;
  }
};

const verifyJWT = async (token) => jwt.verify(token, process.env.JWT_SECRET);

const hashPassword = async (password) => {
  try {
    const hash = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));
    return hash;
  } catch (err) {
    console.log("There was an error in hashing the string", err);
    return null;
  }
};

const verifyPassword = async (password, hash) => {
  try {
    const isSame = await bcrypt.compare(password, hash);
    if (!isSame) {
      throw new CustomError("Incorrect password");
    }
    return true;
  } catch (err) {
    console.log("there was an error in comparing the password", err);
    return null;
  }
};
const verifyPasswordRetAuthToken = async (email, password, hash) => {
  try {
    const isSame = await bcrypt.compare(password, hash);
    if (!isSame) {
      throw new CustomError("Incorrect password");
    }
    const token = await signJWT({ email, userType: "BASIC_USER" });
    if (!token) {
      throw new CustomError("Failed to sign JWT");
    }
    return token;
  } catch (err) {
    console.log("Error while generating auth token", err);
    return null;
  }
};

module.exports = {
  sanitize,
  hashPassword,
  verifyPassword,
  verifyPasswordRetAuthToken,
  verifyJWT,
  extractBearerAuthorizationToken,
};
