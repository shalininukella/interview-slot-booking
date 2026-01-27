import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import { createUserSchema } from "../validations/user.validation.js";

// POST /users
export const createUser = async (req, res, next) => {
  try {
    const { error, value } = createUserSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      throw new ApiError(
        400,
        "Validation failed",
        error.details.map((d) => d.message),
      );
    }

    const existing = await User.findOne({ email: value.email });
    if (existing) {
      throw new ApiError(409, "Email already exists");
    }

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
    const { role, email } = req.query;

    if (role) {
      if (!["ADMIN", "CANDIDATE"].includes(role)) {
        throw new ApiError(400, "Invalid role filter");
      }
      filter.role = role;
    }

    if (email) {
      filter.email = new RegExp(email, "i");
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { page, limit, total },
    });
  } catch (err) {
    next(err);
  }
};
