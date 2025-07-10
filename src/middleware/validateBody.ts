import { Request, Response, NextFunction } from 'express';
export class ValidateBodyMiddleware {

    constructor() {

    }
    validatePostBody = (req: Request, res: Response, next: NextFunction, schema: any): void => {
        const { body } = req;
        const { error } = schema.validate(body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }
        next();
    }
    validatePutBody = (req: Request, res: Response, next: NextFunction, schema: any): void => {
        const { body } = req;
        const { error } = schema.validate(body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }
        next();
    }
}