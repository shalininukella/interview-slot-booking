import Booking from "../models/Booking.model.js";
import { createBookingSchema } from "../validations/booking.validation.js";
import { bookSlot } from "../services/booking.service.js";
import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";

/**
 * POST /bookings
 * Candidate books a slot
 */
export const createBooking = async (req, res, next) => {
  try {
    const { error, value } = createBookingSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      throw new ApiError(
        400,
        "Validation failed",
        error.details.map((d) => d.message),
      );
    }

    const booking = await bookSlot(value.slotId, req.user._id);

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /bookings/my
 * List all bookings of the authenticated candidate
 */
export const myBookings = async (req, res, next) => {
  try {
    const { status, from, to, page = 1, limit = 10 } = req.query;

    const filter = { candidateId: req.user._id };

    if (status) {
      if (!["BOOKED", "CANCELLED"].includes(status)) {
        throw new ApiError(400, "Invalid status filter");
      }
      filter.status = status;
    }

    if (from || to) {
      filter.bookedAt = {};
      if (from) filter.bookedAt.$gte = new Date(from);
      if (to) filter.bookedAt.$lte = new Date(to);
    }

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.min(parseInt(limit), 50);
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(filter).populate("slotId").skip(skip).limit(limitNum),
      Booking.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /bookings/:id/cancel
 * Candidate cancels their own booking
 * multiple cancels do not fail
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid booking id");
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (!booking.candidateId.equals(req.user._id)) {
      throw new ApiError(403, "Forbidden");
    }

    if (booking.status === "CANCELLED") {
      return res.json({
        success: true,
        message: "Booking already cancelled",
      });
    }

    booking.status = "CANCELLED";
    await booking.save();

    res.json({ success: true, message: "Booking cancelled" });
  } catch (err) {
    next(err);
  }
};
