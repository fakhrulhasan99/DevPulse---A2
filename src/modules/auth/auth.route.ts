import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post("/signup", authController.userSignup);
router.get("/signup", authController.getAllUser);

router.post("/login", authController.userLogin)

export const userRoute = router;