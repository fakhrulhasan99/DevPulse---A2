import type { IAuthUser } from "../types";

declare global {
    namespace Express {
        interface Request {
            user: IAuthUser;
        }
    }
}

export {};