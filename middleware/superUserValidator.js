const validateSuperUser = (req, res, next) => {
  try {
    // 1. Ensure user exists (attached by verifyToken)
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 2. Check the role directly from the secure JWT payload
    if (req.user.role !== "super_user") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Super user privileges required." 
      });
    }

    // If valid, move on to the controller
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { validateSuperUser };
