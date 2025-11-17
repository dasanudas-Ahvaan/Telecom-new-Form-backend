function validateSuperUser(req, res) {
  const idFromToken = req.user.id;
  const idFromParam = req.params.id;
  const role = req.user.role;
  if (idFromToken !== idFromParam) {
    return res.status(403).json({
      success: false,
      message:
        "Access denied. You are not authorized to modify this user's team.",
    });
  }

  if (role !== "super_user") {
    return res.status(403).json({
      success: false,
      message:
        "Access denied. Unauthorized.",
    });
  }

  return null;
}

module.exports = { validateSuperUser };
