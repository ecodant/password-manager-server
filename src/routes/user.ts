import express from "express";
import * as UserController from "../controllers/userController";
import { requiresAuth } from "../middleware/auth";

const router = express.Router();
router.get("/", requiresAuth, UserController.getAuthenticatedUser);

router.post("/signup", UserController.signUp);

router.post("/login", UserController.login);

router.patch("/", UserController.updateUser);
router.patch("/update-password", UserController.updatePassword);

router.get("/profile-image", requiresAuth, UserController.getProfileImg);

router.post("/logout", UserController.logout);

export default router;