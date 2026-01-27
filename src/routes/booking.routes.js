import express from 'express';
import { allowRoles } from '../middleware/role.middleware';
import { auth } from '../middleware/auth.middleware.js';
import { createBooking, myBookings, cancelBooking } from "../controllers/booking.controller.js";
import router from './slot.routes.js';

router = express.Router();

// POST /bookings (CANDIDATE)
router.post("/", auth, allowRoles("CANDIDATE"), createBooking);

// GET /bookings/my (CANDIDATE)
router.get("/my", auth, allowRoles("CANDIDATE"), myBookings);

// POST /bookings/:id/cancel (CANDIDATE)
router.post("/:id/cancel", auth, allowRoles("CANDIDATE"), cancelBooking);

export default router;