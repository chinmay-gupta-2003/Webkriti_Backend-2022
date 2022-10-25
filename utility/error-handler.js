class CustomError {
  constructor(message, status, log) {
    this.type = "customError";
    this.message = message;
    this.status = status;
    if (log) {
      console.error(message);
    }
  }
}

module.exports = { CustomError };
