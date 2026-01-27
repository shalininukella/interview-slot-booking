import express from "express";
import { createUser, listUsers } from "../controllers/user.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", createUser);
router.get("/", auth, listUsers);

export default router;
