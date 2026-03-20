module.exports = (
  success,
  message = "Successfull Response",
  data = null,
  extras = {},
) => {
  return {
    success,
    message,
    ...(data && { data }), // Only include data if it exists
    ...extras, // Spread extras (like token) at the root level
  };
};
