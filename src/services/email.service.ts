
import transporter from "../database/nodemailer";
export class EmailService {

    //llamamos al constructor de la clase EmailService
    constructor() {}

    //metodo para notificar al cliente que su pedido ha sido aceptado
    async notifyClienteOrderAccepted(cliente: any, cart: any): Promise<void> {
        // Si cliente es un array, tomar el primero
        const destinatario = Array.isArray(cliente) ? cliente[0] : cliente;
        console.log('Notificando al cliente sobre el pedido aceptado:', destinatario);
        if (!destinatario || !destinatario.email) {
            throw new Error('No se puede enviar el correo: el cliente no tiene email definido.');
        }
        const message = `Hola ${destinatario.name || 'Cliente'}, tu pedido con ID ${cart.id} ha sido aceptado. ¡Gracias por tu compra!`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: destinatario.email,
            subject: 'Pedido Aceptado',
            text: message
        });
        console.log(message);
    }

    //metodo para notificar al cliente que su pedido ha sido cancelado
    async notifyClienteOrderCancelled(cliente: any, cart: any): Promise<void> {
        const destinatario = Array.isArray(cliente) ? cliente[0] : cliente;
        if (!destinatario || !destinatario.email) {
            throw new Error('No se puede enviar el correo: el cliente no tiene email definido.');
        }
        const message = `Hola ${destinatario.name || 'Cliente'}, lamentamos informarte que tu pedido con ID ${cart.id} ha sido cancelado. Por favor, contacta con nosotros para más información.`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: destinatario.email,
            subject: 'Pedido Cancelado',
            text: message
        });
        console.log(message);
    }
}