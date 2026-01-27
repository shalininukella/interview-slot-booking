import User from "../models/User.model.js";
import { createUserSchema } from "../validations/user.validation.js";

// POST /users
export const createUser = async (req, res, next) => {
  try {
    const { error, value } = createUserSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((d) => d.message),
      });
    }

    const existing = await User.findOne({ email: value.email });
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });

    const user = await User.create(value);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};


// GET /users
export const listUsers = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.role) {
      const allowedRoles = ["ADMIN", "CANDIDATE"];
      if (!allowedRoles.includes(req.query.role)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid role filter" });
      }
      filter.role = req.query.role;
    }

    if (req.query.email) filter.email = new RegExp(req.query.email, "i");

    const users = await User.find(filter);
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};
