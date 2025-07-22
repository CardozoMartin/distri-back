import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

class WhatsAppService {
    private client: Client;

    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu',
                    '--disable-extensions'
                ],
                // Especifica múltiples rutas posibles para Chrome
                executablePath: this.getChromePath()
            }
        });
    }
        private getChromePath(): string {
        // Lista de posibles ubicaciones de Chrome en diferentes sistemas
        const possiblePaths = [
            process.env.CHROME_BIN,
            process.env.GOOGLE_CHROME_BIN,
            '/usr/bin/google-chrome',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium',
            '/snap/bin/chromium'
        ];

        // Retorna la primera ruta que exista
        for (const path of possiblePaths) {
            if (path) {
                try {
                    const fs = require('fs');
                    if (fs.existsSync(path)) {
                        return path;
                    }
                } catch (error) {
                    continue;
                }
            }
        }

        // Si no encuentra ninguna, usa una por defecto
        return '/usr/bin/google-chrome';
    }

    async sendMessage(phone: string, message: string) {
        try {
            const chatId = `${phone}@c.us`;
            await this.client.sendMessage(chatId, message);
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }
}

export const whatsappService = new WhatsAppService();