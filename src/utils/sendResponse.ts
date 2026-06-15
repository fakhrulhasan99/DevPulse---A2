import type { Response } from "express";

interface ISuccessResponse<T> {
    success: true;
    message: string;
    data: T;
}

interface IErrorResponse {
    success: false;
    message: string;
    errors?: unknown;
}

// SUCCESS RESPONSE
export const sendResponse = <T>(
    res: Response,
    statusCode: number,
    message: string,
    data: T
) => {
    res.status(statusCode).json({
        success: true,
        message,
        data
    } as ISuccessResponse<T>);
};

// ERROR RESPONSE
export const sendError = (
    res: Response,
    statusCode: number,
    message: string,
    errors?: unknown
) => {
    res.status(statusCode).json({
        success: false,
        message,
        errors
    } as IErrorResponse);
};