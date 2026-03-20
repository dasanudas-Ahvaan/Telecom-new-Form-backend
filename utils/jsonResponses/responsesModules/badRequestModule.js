module.exports = (message = "Bad request") => ({
  success: false,
  message,
  error: {
    type: "BadRequest",
    message,
  },
});
