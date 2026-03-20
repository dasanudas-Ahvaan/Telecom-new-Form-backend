module.exports = (message = "Resource not found") => ({
  success: false,
  message,
  error: {
    type: "NotFound",
    message,
  },
});
