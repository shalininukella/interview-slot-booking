export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }
    //else
    next(); // proceed to the controller
  };
};


// ...roles = for multiple roles
// 403 = forbindden