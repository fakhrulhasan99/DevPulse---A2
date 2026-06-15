import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { sendError, sendResponse } from "../../utils/sendResponse";

const userSignup = async (req: Request, res: Response) => {
  // console.log(req.body.name)
  // const { name, email, password, role } = req.body;

  try {
    const result = await authService.userSignupInDB(req.body)

    sendResponse(res, 201, "User created successfully", result);

  } catch (error: unknown) {
    if (error instanceof Error) {
      sendError(res, 400, error.message, error);
    } else {
      sendError(res, 500, "Something went wrong");
    }
  }
};

const getAllUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.getAllUserFromDB();

    sendResponse(res, 200, "Users retrieved successfully", result);

  } catch (error: unknown) {
    if (error instanceof Error) {
      sendError(res, 400, error.message, error);
    } else {
      sendError(res, 500, "Something went wrong");
    }
  }
};

const userLogin = async (req: Request, res: Response) => {

  try {
    const result = await authService.loginUserInDB(req.body);

    sendResponse(res, 200, "User loggedin successfully", result);
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