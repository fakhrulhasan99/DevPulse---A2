import type { NextFunction, Request, Response } from "express"
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../database";
import type { IAuthUser } from "../types";

const auth = (...roles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // console.log(roles)
        try {
            // console.log("this route is protected");
            // console.log(req.headers.authorization);
            const token = req.headers.authorization;

            if (!token) {
                res.status(401).json({
                    success: false,
                    message: "Unauthorized success!!"
                })
            }
            const decoded = jwt.verify(token as string, config.secret as string) as IAuthUser;
            // console.log(decoded)

            const userData = await pool.query(`
            SELECT * FROM users WHERE email=$1`,
                [decoded.email]);

            const user = userData.rows[0];
            // console.log(user)
            if (userData.rows.length === 0) {
                res.status(404).json({
                    success: false,
                    message: "User not found!!"
                })
            };
            if (roles.length && !roles.includes(user.role)) {
                res.status(403).json({
                    success: false,
                    message: "Forbidden request. Access denied!!"
                })
            };
            req.user = decoded;

            next();
        } catch (error) {
            next(error);
        }
    };
};

export default auth;