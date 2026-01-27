// Auth middleware converts a raw request into an authenticated request by attaching a verified user object to it.
import mongoose from "mongoose";
import User from '../models/User.model.js';

export const auth = async (req, res, next) => {
    try {
        const userId = req.header("x-user-id");

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
          // Header exists ? or Is it a valid MongoDB ObjectId format ?
          return res
            .status(401)
            .json({ success: false, message: "Unauthorised" });
        }

        // if the header exists
        const user = await User.findById(userId);
        if (!user) {
          return res
            .status(401)
            .json({ success: false, message: "Unauthorised" });
        }

        // Attaches the user object to the request, Makes it available everywhere later
        req.user = user;
        next();

    } catch(err) {
        console.error("Auth middleware error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Internal server error" });
    }
    
}
