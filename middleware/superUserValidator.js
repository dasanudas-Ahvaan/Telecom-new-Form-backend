function validateSuperUser(req, res) {
  const idFromToken = req.user.id;
  const idFromParam = req.params.id;
  const role = req.user.role;
  if (idFromToken !== idFromParam) {
    throw new Error(
      "Access denied. You are not authorized to modify this user's team.",
    );
  }

  if (role !== "super_user") {
    throw new Error("Access denied. Unauthorized.");
  }

  return null;
}

module.exports = { validateSuperUser };
