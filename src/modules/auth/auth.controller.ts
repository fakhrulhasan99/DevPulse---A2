import type { Request, Response } from "express";
import { pool } from "../../database";
import { authService } from "./auth.service";

const userSignup = async (req: Request, res: Response) => {
  // console.log(req.body.name)
  // const { name, email, password, role } = req.body;

  try {
    const result = await authService.userSignupInDB(req.body)
    // const safeUser = await authService.userSignupInDB(req.body)

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
      // data: safeUser
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error
    })
  }
}

const getAllUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.getAllUserFromDB();
    res.status(200).json({
      success: true,
      message: "Users retrived successfully",
      data: result.rows
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error
    })
  }
}

const userLogin = async (req: Request, res: Response) => {

  try {
    const result = await authService.loginUserInDB(req.body);

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error
    })
  }
}

export const authController = {
  userSignup,
  getAllUser,
  userLogin
}