const {
  sanitize,
  hashPassword,
  verifyPasswordRetAuthToken,
} = require("../../utility/data-handlers");
const { CustomError } = require("../../utility/error-handler");
const dbCursor = require("../config/psql");

const getUserInfo = async (req, res) => {
  try {
    const user = await dbCursor.query(
      "select email,name from users where email = $1 limit 1",
      [req.user.email]
    );
    if (!user) {
      throw new CustomError("User not found, invalid auth", 404, true);
    }
    res.status(200).json({ success: true, user: user.rows[0] });
  } catch (err) {
    console.log(err.type, err);
    res.status(err.status || 402).json({
      success: false,
      message:
        err.type === "customError" ? err.message : "Failed to get user info.",
    });
  }
};

const signUp = async (req, res) => {
  try {
    const name = sanitize(req.body.name);
    const email = sanitize(req.body.email);
    const password = sanitize(req.body.password);
    console.log(name, email, password);
    const isUser = await dbCursor.query(
      "select email from users where email = $1 limit 1",
      [email]
    );
    if (isUser.rowCount > 0) {
      throw new CustomError("User Already exists, please login.", 403);
    }
    const hash = await hashPassword(password);
    if (!hash) {
      throw new CustomError("Failed to hash password");
    }
    await dbCursor.query(
      "INSERT INTO users (name,email,password) VALUES ($1,$2,$3)",
      [name, email, hash]
    );
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err.type, err);
    res.status(err.status || 304).json({
      success: false,
      message:
        err.type === "customError" ? err.message : "Failed to create an user.",
    });
  }
};

const signIn = async (req, res) => {
  try {
    const email = sanitize(req.body.email);
    const password = sanitize(req.body.password);

    const user = await dbCursor.query(
      "select email,password from users where email = $1 limit 1",
      [email]
    );
    if (user.rowCount < 1) {
      throw new CustomError("No user found with such credentials", 404, true);
    }
    const { password: hash } = user.rows[0];
    const token = await verifyPasswordRetAuthToken(email, password, hash);
    if (!token) {
      throw new CustomError("Bad Credentials", 400);
    }
    res.status(200).json({ success: true, token });
  } catch (err) {
    console.log(err.type, err);
    res.status(err.status || 402).json({
      success: false,
      message: err.type === "customError" ? err.message : "Failed to signIn.",
    });
  }
};

module.exports = { signUp, signIn, getUserInfo };
