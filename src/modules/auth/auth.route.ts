import { Router } from "express";
import { authController } from "./auth.controller";
import { USER_ROLE } from "../../types";
import auth from "../../middleware/auth";

const router = Router();

router.post("/signup", authController.userSignup);

router.get("/signup", auth(USER_ROLE.maintainer), authController.getAllUser);

router.post("/login", authController.userLogin)

export const userRoute = router;