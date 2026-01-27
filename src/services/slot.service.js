import Slot from "../models/Slot.model.js";
import ApiError from "../utils/ApiError.js";

export const checkOverlap = async (
  adminId,
  startTime,
  endTime,
  excludeId = null,
) => {
  const query = {
    createdBy: adminId,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const overlap = await Slot.findOne(query);
  if (overlap) {
    throw new ApiError(409, "Slot overlaps with existing slot");
  }

  if (new Date(startTime) >= new Date(endTime)) {
    throw new ApiError(400, "startTime must be before endTime");
  }
};
