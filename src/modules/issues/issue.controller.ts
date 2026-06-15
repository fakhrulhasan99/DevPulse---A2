import type { Request, Response } from "express"
import { issueService } from "./issue.service"
import { sendError, sendResponse } from "../../utils/sendResponse";

const createIssue = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const result = await issueService.createIssueInDB(userId, req.body);

        sendResponse(res,201,"Issue created successfully", result)

    } catch (error: unknown) {
    if (error instanceof Error) {
      sendError(res, 500, error.message, error);
    } else {
      sendError(res, 500, "Something went wrong");
    }
  }
};

const getAllIssues = async (req: Request, res: Response) => {
    
    try {
        const result = await issueService.getAllIssuesFromDB(req.query);
        
        sendResponse(res,200,"Issues retrived successfully",result)
        
    } catch (error: unknown) {
    if (error instanceof Error) {
      sendError(res, 500, error.message, error);
    } else {
      sendError(res, 500, "Something went wrong");
    }
  }
};

const getSingleIssue = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    try {
        const result = await issueService.getSingleIssueFromDB(id);

        sendResponse(res, 200, "Issue retrieved successfully", result);
        
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, 400, error.message, error);
        } else {
            sendError(res, 500, "Something went wrong");
        }
    }
};

const updateIssue = async (req: Request, res: Response) => {
    try {
        const issueId = Number(req.params.id);

        const result = await issueService.updateIssueInDB(
            issueId,
            req.user,
            req.body
        );

        sendResponse(res, 200, "Issue updated successfully", result);
        
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, 400, error.message, error);
        } else {
            sendError(res, 500, "Something went wrong");
        }
    }
};

const deleteIssue = async (req: Request, res: Response) => {
    try {
        const issueId = Number(req.params.id);

        await issueService.deleteIssueFromDB(issueId, req.user);

        sendResponse(res, 200, "Issue deleted successfully", null);

    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, 400, error.message, error);
        } else {
            sendError(res, 500, "Something went wrong");
        }
    }
};

export const issueController = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue
}