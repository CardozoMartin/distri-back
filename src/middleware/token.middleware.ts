import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export class TokenMiddleware {
    private jwtSecret = process.env.SECRET_KEY || 'default_secret';
    
    // Credenciales del admin para verificación
    private adminCredentials = {
        username: 'admin',
        password: 'admin123'
    };

    verifyToken = (req: Request, res: Response, next: NextFunction): void => {
        try {
            const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

            if (!token) {
                res.status(401).json({ message: 'Token no proporcionado' });
                return;
            }

            const decoded = jwt.verify(token, this.jwtSecret) as any;
            (req as any).user = decoded;
            next();

        } catch (error) {
            res.status(401).json({ message: 'Token inválido' });
        }
    };

    // Middleware específico para verificar que sea admin
    verifyAdminToken = (req: Request, res: Response, next: NextFunction): void => {
        try {
            const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

            if (!token) {
                res.status(401).json({ message: 'Debes iniciar sesión como administrador para realizar esta acción.' });
                return;
            }

            const decoded = jwt.verify(token, this.jwtSecret) as any;

            // Verificar que el rol sea admin
            if (decoded.role !== 'admin') {
                res.status(403).json({ message: 'Solo los administradores pueden realizar esta acción.' });
                return;
            }

            // Verificar que el username sea el correcto
            if (decoded.username !== this.adminCredentials.username) {
                res.status(403).json({ message: 'Usuario administrador no autorizado.' });
                return;
            }

            (req as any).user = decoded;
            next();

        } catch (error) {
            res.status(401).json({ message: 'Tu sesión ha expirado o el token es inválido. Por favor, vuelve a iniciar sesión.' });
        }
    };
}