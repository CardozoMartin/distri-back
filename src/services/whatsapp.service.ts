import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

class WhatsAppService {
    private client: Client;

    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: { headless: true }
        });

        this.client.on('qr', (qr) => {
            qrcode.generate(qr, { small: true });
            console.log('Escanea este QR con WhatsApp para autenticar.');
        });

        this.client.on('ready', () => {
            console.log('WhatsApp Web client is ready!');
        });

        this.client.initialize();
    }

    async sendMessage(phone: string, message: string) {
        const chatId = `${phone}@c.us`;
        await this.client.sendMessage(chatId, message);
    }
}

// Exporta una sola instancia global
export const whatsappService = new WhatsAppService();
