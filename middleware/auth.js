const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_TOKEN;

function generateToken(user) {
  const payload = { id: user._id, email: user.email };

  if (user.role === "super_user") {
    payload.role = "super_user";
  }
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment variables");
  }
  return jwt.sign(payload, JWT_SECRET, {
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
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in environment variables");
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

module.exports = { generateToken, verifyToken };
