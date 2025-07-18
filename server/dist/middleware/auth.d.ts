import { Request, Response, NextFunction } from 'express';
import { Database } from '../database';
export interface AuthRequest extends Request {
    user?: {
        id: number;
        username: string;
        email: string;
    };
}
export declare const authenticateToken: (db: Database) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const generateToken: (userId: number) => string;
//# sourceMappingURL=auth.d.ts.map