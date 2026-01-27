// Auth middleware converts a raw request into an authenticated request by attaching a verified user object to it.

import mongoose from "mongoose";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";

export const auth = async (req, res, next) => {
  try {
    const userId = req.header("x-user-id");

    // Header exists ? or Is it a valid MongoDB ObjectId format ?
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(401, "Unauthorized");
    }

    // if the header exists
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    // Attaches the user object to the request, Makes it available everywhere later
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
