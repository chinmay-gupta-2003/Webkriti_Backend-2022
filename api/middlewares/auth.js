const {
  extractBearerAuthorizationToken,
  verifyJWT,
} = require("../../utility/data-handlers");
const { CustomError } = require("../../utility/error-handler");
const { ADMIN_TOKEN } = require("../config/thirdPartyTokens");
const authMiddleware = async (req, res, next) => {
  try {
    const token = extractBearerAuthorizationToken(req);
    if (!token) {
      throw new CustomError("Unauthorized", 401);
    }
    const payload = await verifyJWT(token);
    req.user = payload;
    next();
  } catch (err) {
    console.log(err);
    res
      .status(401 || err.status)
      .json({ success: false, message: "Unauthorized" });
  }
};

const authMiddlewareAdmin = async (req, res, next) => {
  try {
    const token = extractBearerAuthorizationToken(req);
    console.log(token);
    if (!token) {
      throw new CustomError("Unauthorized", 401);
    }
    if (token !== ADMIN_TOKEN) {
      throw new CustomError("Not an admin", 401, true);
    }
    next();
  } catch (err) {
    console.log(err);
    res
      .status(401 || err.status)
      .json({ success: false, message: "Unauthorized" });
  }
};
module.exports = { authMiddleware, authMiddlewareAdmin };
