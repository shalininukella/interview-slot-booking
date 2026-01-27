import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, //special type used to reference other documents by their _id
      ref: "User",
      required: true,
    },
    tags: [String],
  },
  { timestamps: true },
);

slotSchema.index({ createdBy: 1, startTime: 1, endTime: 1 });

export default mongoose.model("Slot", slotSchema);
