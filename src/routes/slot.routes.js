import express from "express";
import { auth } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import {
  createSlot,
  listSlots,
  getSlot,
  updateSlot,
  deleteSlot,
} from "../controllers/slot.controller.js";

const router = express.Router();

// POST /slots (ADMIN)
router.post("/", auth, allowRoles("ADMIN"), createSlot);

// GET /slots
router.get("/", auth, listSlots);

// GET /slots/:id
router.get('/:id', auth, getSlot);

// PATCH /slots/:id (ADMIN only)
router.patch('/:id',auth, allowRoles('ADMIN'), updateSlot);

// DELETE /slots/:id (ADMIN only)
router.delete('/:id', auth, allowRoles('ADMIN'), deleteSlot);

export default router;
