import { createSlotSchema, updateSlotSchema } from '../validations/slot.validation.js';
import { checkOverlap } from '../services/slot.service.js'
import ApiError from "../utils/ApiError.js";
import Slot from '../models/Slot.model.js';

// ADMIN: Create slot

// value = {
//   startTime: "2026-01-25T10:00:00Z", // string
//   endTime: "2026-01-25T11:00:00Z", // string
//   capacity: 3,
//   tags: ["frontend"],
// };

export const createSlot = async (req, res, next) => {
  try {
    const { error, value } = createSlotSchema.validate(req.body, {
      abortEarly: false
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(d => d.message)
      });
    }

    const startTime = new Date(value.startTime);
    const endTime = new Date(value.endTime);

    if (startTime >= endTime) {
      throw new ApiError(400, 'startTime must be before endTime');
    }

    await checkOverlap(req.user._id, startTime, endTime);

    const slot = await Slot.create({
      ...value,
      startTime,
      endTime,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: slot });
  } catch (err) {
    next(err);
  }
};

