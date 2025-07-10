import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface AdminLogin {
    username: string;
    password: string;
}

export class LoginController {
    // Credenciales del administrador
    private adminCredentials: AdminLogin = {
        username: 'admin',
        password: "admin123"
    };

    private jwtSecret = process.env.SECRET_KEY || 'default_secret';

    // Método para manejar el inicio de sesión del administrador
    login = async (req: Request, res: Response): Promise<void> => {
        try {
            // Validar que se envíen los datos requeridos
            const { username, password } = req.body as AdminLogin;

            if (!username || !password) {
                res.status(400).json({
                    message: 'Username y password son requeridos'
                });
                return;
            }

            // Verificar username
            if (username !== this.adminCredentials.username) {
                res.status(401).json({
                    message: 'Credenciales inválidas'
                });
                return;
            }

            // Verificar contraseña
            if (password !== this.adminCredentials.password) {
                res.status(401).json({
                    message: 'Credenciales inválidas'
                });
                return;
            }

            // Generar JWT token
            const token = jwt.sign(
                {
                    username: this.adminCredentials.username,
                    role: 'admin',
                    timestamp: Date.now()
                },
                this.jwtSecret,
                { expiresIn: '24h' }
            );

            // Respuesta exitosa
            res.status(200).json({
                message: 'Inicio de sesión exitoso',
                token,
                user: {
                    username: this.adminCredentials.username,
                    role: 'admin'
                }
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                message: 'Error interno del servidor'
            });
        }
    };

    // Método para generar hash de contraseña (útil para setup inicial)
    generatePasswordHash = async (password: string): Promise<string> => {
        return await bcrypt.hash(password, 10);
    };
}