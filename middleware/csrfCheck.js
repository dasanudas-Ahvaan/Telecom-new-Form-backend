const verifyCSRF = (req, res, next) => {
  const csrfCookie = req.cookies["XSRF-TOKEN"];
  const csrfHeader = req.headers["x-xsrf-token"];

  // If it's a "safe" method (GET, HEAD, OPTIONS), skip check
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ message: "Invalid or missing CSRF token" });
  }

  next();
};

module.exports = verifyCSRF;