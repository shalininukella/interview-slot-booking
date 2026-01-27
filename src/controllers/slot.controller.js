import { createSlotSchema, updateSlotSchema } from '../validations/slot.validation.js';
import { checkOverlap } from '../services/slot.service.js'
import ApiError from "../utils/ApiError.js";
import Slot from '../models/Slot.model.js';
import Booking from '../models/Booking.model.js';
import mongoose from 'mongoose';

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

/**
 * ADMIN + CANDIDATE: List slots
 */
export const listSlots = async (req, res, next) => {
  try {
    const {
      from,
      to,
      tags,
      availableOnly,
      page = 1,
      limit = 10
    } = req.query;

    const filters = {};

    if (from || to) {
      filters.startTime = {};
      if (from) filters.startTime.$gte = new Date(from);
      if (to) filters.startTime.$lte = new Date(to);
    }

    if (tags) {
      filters.tags = { $in: tags.split(',') };
    }

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.min(parseInt(limit), 50);
    const skip = (pageNum - 1) * limitNum;

    const slots = await Slot.find(filters)
      .sort({ startTime: 1 })
      .skip(skip)
      .limit(limitNum);

    const slotIds = slots.map(s => s._id);

    const bookings = await Booking.aggregate([
      {
        $match: {
          slotId: { $in: slotIds },
          status: 'BOOKED'
        }
      },
      {
        $group: {
          _id: '$slotId',
          count: { $sum: 1 }
        }
      }
    ]);

    const bookingMap = {};
    bookings.forEach(b => {
      bookingMap[b._id.toString()] = b.count;
    });

    let result = slots.map(slot => {
      const booked = bookingMap[slot._id.toString()] || 0;
      return {
        ...slot.toObject(),
        availableSeats: slot.capacity - booked
      };
    });

    if (availableOnly === 'true') {
      result = result.filter(s => s.availableSeats > 0);
    }

    res.json({
      success: true,
      data: result,
      pagination: {
        page: pageNum,
        limit: limitNum
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ADMIN + CANDIDATE: Get slot by ID
 */
export const getSlotById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid slot id');
    }

    const slot = await Slot.findById(id);
    if (!slot) {
      throw new ApiError(404, 'Slot not found');
    }

    const booked = await Booking.countDocuments({
      slotId: slot._id,
      status: 'BOOKED'
    });

    res.json({
      success: true,
      data: {
        ...slot.toObject(),
        availableSeats: slot.capacity - booked
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ADMIN: Update slot
 */
export const updateSlot = async (req, res, next) => {
  try {
    const { error, value } = updateSlotSchema.validate(req.body, {
      abortEarly: false
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(d => d.message)
      });
    }

    const slot = await Slot.findById(req.params.id);
    if (!slot) throw new ApiError(404, 'Slot not found');

    if (slot.createdBy.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Forbidden');
    }

    const startTime = value.startTime
      ? new Date(value.startTime)
      : slot.startTime;
    const endTime = value.endTime
      ? new Date(value.endTime)
      : slot.endTime;

    if (startTime >= endTime) {
      throw new ApiError(400, 'startTime must be before endTime');
    }

    await checkOverlap(req.user._id, startTime, endTime, slot._id);

    if (value.capacity !== undefined) {
      const booked = await Booking.countDocuments({
        slotId: slot._id,
        status: 'BOOKED'
      });

      if (value.capacity < booked) {
        throw new ApiError(
          409,
          'Capacity cannot be less than existing bookings'
        );
      }

      slot.capacity = value.capacity;
    }

    if (value.tags) slot.tags = value.tags;
    slot.startTime = startTime;
    slot.endTime = endTime;

    await slot.save();

    res.json({ success: true, data: slot });
  } catch (err) {
    next(err);
  }
};

/**
 * ADMIN: Delete slot (hard reject if bookings exist)
 */
export const deleteSlot = async (req, res, next) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) throw new ApiError(404, 'Slot not found');

    if (slot.createdBy.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Forbidden');
    }

    const booked = await Booking.countDocuments({
      slotId: slot._id,
      status: 'BOOKED'
    });

    if (booked > 0) {
      throw new ApiError(409, 'Cannot delete slot with active bookings');
    }

    await slot.deleteOne();
    res.json({ success: true, message: 'Slot deleted successfully' });
  } catch (err) {
    next(err);
  }
};