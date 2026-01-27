import mongoose from "mongoose";
import Booking from "../models/Booking.model.js";
import Slot from "../models/Slot.model.js";
import ApiError from "../utils/ApiError.js";

/**
 * Book a slot for a candidate
 * Uses MongoDB transaction to handle race conditions
 * Prevents duplicate booking and capacity overflow
 */
export const bookSlot = async (slotId, candidateId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check slot exists
    const slot = await Slot.findById(slotId).session(session);
    if (!slot) {
      throw new ApiError(404, "Slot not found");
    }

    // Check duplicate booking (UX-level protection)
    const existingBooking = await Booking.findOne({
      slotId,
      candidateId,
    }).session(session);

    if (existingBooking) {
      throw new ApiError(409, "You have already booked this slot");
    }

    // Check capacity
    const activeBookings = await Booking.countDocuments({
      slotId,
      status: "BOOKED",
    }).session(session);

    if (activeBookings >= slot.capacity) {
      throw new ApiError(409, "Slot capacity exceeded");
    }

    // Create booking
    const [booking] = await Booking.create(
      [
        {
          slotId,
          candidateId,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    return booking;
  } catch (err) {
    await session.abortTransaction();

    // Handle duplicate booking race condition
    if (err?.code === 11000) {
      throw new ApiError(409, "You have already booked this slot");
    }

    throw err;
  } finally {
    session.endSession();
  }
};
