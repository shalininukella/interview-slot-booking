import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: { type: String, enum: ["BOOKED", "CANCELLED"], default: "BOOKED" },
  bookedAt: { type: Date, default: Date.now },
});

bookingSchema.index({ slotId: 1, candidateId: 1 }, { unique: true });

export default mongoose.model("Booking", bookingSchema);
