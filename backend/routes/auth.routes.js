import express from "express";
import { getMe, Login, Logout, Signup } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/me", protectRoute, getMe)
router.post("/signup", Signup)
router.post("/login", Login)
router.post("/logout", Logout)


export default router