module.exports = (message = "Server error") => ({
  success: false,
  message,
  error: {
    type: "InternalServerError",
  },
});
