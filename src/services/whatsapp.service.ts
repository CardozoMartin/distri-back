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
                    '--disable-gpu'
                ],
                executablePath: process.env.CHROME_BIN || '/usr/bin/chromium-browser'
            }
        });

        this.client.on('qr', (qr) => {
            qrcode.generate(qr, { small: true });
            console.log('Escanea este QR con WhatsApp para autenticar.');
        });

        this.client.on('ready', () => {
            console.log('WhatsApp Web client is ready!');
        });

        this.client.on('auth_failure', (msg) => {
            console.error('Authentication failed:', msg);
        });

        this.client.on('disconnected', (reason) => {
            console.log('Client was logged out:', reason);
        });

        this.client.initialize();
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