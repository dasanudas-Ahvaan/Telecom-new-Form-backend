const jwt = require("jsonwebtoken");

const JWT_SECERT = process.env.JWT_SECRET;

function generateToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECERT, {
    expiresIn: "20m",
  });
}

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied, no token provided" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

module.exports = { generateToken, verifyToken };
