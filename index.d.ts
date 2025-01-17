import { Request } from "express";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
            uniqueId?: string;
            adminId ?: string;
            uniqueIotId ?: string;
        }
    }
}
