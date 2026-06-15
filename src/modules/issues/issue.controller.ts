import type { Request, Response } from "express"
import { issueService } from "./issue.service"

const createIssue = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        // console.log(userId)
        // console.log(req.body)
        const result = await issueService.createIssueInDB(userId, req.body);
        res.status(201).json({
            success: true,
            message: "Issue created successfully",
            data: result.rows[0]
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error
        })
    }
};

const getAllIssues = async (req: Request, res: Response) => {
    console.log("from controller", req.user);
    try {
        const result = await issueService.getAllIssuesFromDB(req.query);
        console.log(result)
        res.status(200).json({
            success: true,
            message: "Issues retrived successfully",
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

export const issueController = {
    createIssue,
    getAllIssues
}