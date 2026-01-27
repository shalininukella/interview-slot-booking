import mongoose from "mongoose";
import Booking from "../models/Booking.model.js";
import Slot from "../models/Slot.model.js";

/**
 * Book a slot for a candidate
 * Uses MongoDB transaction to handle race conditions
 * Prevents duplicate booking and capacity overflow
 */
export const bookSlot = async (slotId, candidateId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Check slot exists
    const slot = await Slot.findById(slotId).session(session);
    if (!slot) {
      throw { status: 404, message: "Slot not found", errors: [] };
    }

    // 2. Check duplicate booking
    const existingBooking = await Booking.findOne({
      slotId,
      candidateId,
    }).session(session);
    if (existingBooking) {
      throw {
        status: 409,
        message: "You have already booked this slot",
        errors: [],
      };
    }

    // 3. Check capacity
    const activeBookings = await Booking.countDocuments({
      slotId,
      status: "BOOKED",
    }).session(session);

    if (activeBookings >= slot.capacity) {
      throw { status: 409, message: "Slot capacity exceeded", errors: [] };
    }

    // 4. Create booking
    const booking = await Booking.create(
      [
        {
          slotId,
          candidateId,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    return booking[0]; // return the created booking
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};
