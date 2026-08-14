module.exports = (req, res, next) => {
  if (req.user.role === "organization" && req.user.status !== "approved") {
    return res.status(403).json({
      success: false,
      message: "Your organization is not approved yet by Admin",
    });
  }
  next();
};