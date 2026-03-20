module.exports = (message = "Authenticate to access this resource") => ({
  success: false,
  message,
  error: {
    type: "Unauthorized",
    message,
  },
});
