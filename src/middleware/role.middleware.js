// // ...roles = for multiple roles
// // 403 = forbindden

import ApiError from "../utils/ApiError.js";

export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, "Forbidden");
    }
    next(); // proceed to the controller
  };
};
