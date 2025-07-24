import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import fs from 'fs';

class WhatsAppService {
    private client: Client;

    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth({
                dataPath: './whatsapp_session'
            }),
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
                    '--disable-extensions',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding'
                ],
                executablePath: this.getChromePath()
            }
        });

        // Configurar eventos antes de inicializar
        this.setupEvents();
    }

    private getChromePath(): string | undefined {
        const possiblePaths = [
            process.env.CHROME_BIN,
            process.env.GOOGLE_CHROME_BIN,
            '/usr/bin/google-chrome',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium',
            '/snap/bin/chromium',
            // Para Windows
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            // Para macOS
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        ];

        for (const path of possiblePaths) {
            if (path && fs.existsSync(path)) {
                console.log(`Chrome encontrado en: ${path}`);
                return path;
            }
        }

        console.log('No se encontró Chrome, usando configuración por defecto');
        return undefined; // Deja que Puppeteer use su configuración por defecto
    }

    private setupEvents(): void {
        this.client.on('qr', (qr) => {
            console.log('\n=== CÓDIGO QR PARA VINCULAR WHATSAPP ===');
            qrcode.generate(qr, { small: true });
            console.log('\n1. Abre WhatsApp en tu teléfono');
            console.log('2. Ve a Configuración > Dispositivos vinculados');
            console.log('3. Escanea este código QR');
            console.log('==========================================\n');
        });

        this.client.on('ready', () => {
            console.log('✅ WhatsApp bot listo y vinculado exitosamente');
        });

        this.client.on('authenticated', () => {
            console.log('🔐 Autenticación exitosa');
        });

        this.client.on('auth_failure', (msg) => {
            console.error('❌ Error de autenticación:', msg);
        });

        this.client.on('disconnected', (reason) => {
            console.log('⚠️ Cliente desconectado:', reason);
        });

        // Manejo de errores
        this.client.on('error', (error) => {
            console.error('❌ Error del cliente WhatsApp:', error);
        });
    }

    async sendMessage(phone: string, message: string): Promise<void> {
        try {
            const chatId = `${phone}@c.us`;
            await this.client.sendMessage(chatId, message);
            console.log(`✅ Mensaje enviado a ${phone}: ${message}`);
        } catch (error) {
            console.error('❌ Error enviando mensaje:', error);
            throw error;
        }
    }

    async start(): Promise<void> {
        try {
            console.log('🚀 Iniciando WhatsApp Service...');
            await this.client.initialize();
        } catch (error) {
            console.error('❌ Error al inicializar el cliente:', error);
            throw error;
        }
    }

    async stop(): Promise<void> {
        try {
            await this.client.destroy();
            console.log('🛑 WhatsApp Service detenido');
        } catch (error) {
            console.error('❌ Error al detener el cliente:', error);
        }
    }

    // Método para verificar el estado
    getState(): string {
        return this.client.info ? 'ready' : 'initializing';
    }
}

export const whatsappService = new WhatsAppService();

// Ejemplo de uso
export async function initializeWhatsApp(): Promise<void> {
    try {
        await whatsappService.start();
    } catch (error) {
        console.error('Error inicializando WhatsApp:', error);
        process.exit(1);
    }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando aplicación...');
    await whatsappService.stop();
    process.exit(0);
});
//funcionando
process.on('SIGTERM', async () => {
    console.log('\n🛑 Cerrando aplicación...');
    await whatsappService.stop();
    process.exit(0);
});