import express from "express";
import { createUser, listUsers } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/", createUser);
router.get("/", listUsers);

export default router;
