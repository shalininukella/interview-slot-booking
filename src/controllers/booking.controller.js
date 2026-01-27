import Booking from "../models/Booking.model.js";
import { createBookingSchema } from "../validations/booking.validation.js";
import { bookSlot } from "../services/booking.service.js";

/**
 * POST /bookings
 * Candidate books a slot
 */
export const createBooking = async (req, res, next) => {
  try {
    const { error, value } = createBookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((d) => d.message),
      });
    }

    const booking = await bookSlot(value.slotId, req.user._id);

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err); // centralized error handler will format response
  }
};

/**
 * GET /bookings/my
 * List all bookings of the authenticated candidate
 */
export const myBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ candidateId: req.user._id }).populate(
      "slotId",
    ); // populate slot details

    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /bookings/:id/cancel
 * Candidate cancels their own booking
 * Idempotent: multiple cancels do not fail
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
        errors: [],
      });
    }

    if (!booking.candidateId.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: cannot cancel someone else's booking",
        errors: [],
      });
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
