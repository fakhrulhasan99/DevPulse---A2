import type { Request, Response } from "express";
import { pool } from "../../database";
import { authService } from "./auth.service";

const createUser = async (req: Request, res: Response) => {
    // console.log(req.body.name)
    // const { name, email, password, role } = req.body;

    try {
        const result = await authService.createUserInDB(req.body)
        // const safeUser = await authService.createUserInDB(req.body)

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result.rows[0]
            // data: safeUser.rows[0]
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

export const authController = {
    createUser,
    getAllUser,
}