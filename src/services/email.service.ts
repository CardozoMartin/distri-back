import transporter from "../database/nodemailer";

export class EmailService {
    constructor() {}

    // Método para formatear la fecha
    private formatDate(date: Date): string {
        return new Intl.DateTimeFormat('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    // Método para generar la lista de productos
    private generateProductList(productos: any[]): string {
        return productos.map(producto => 
            `• ${producto.name} - Cantidad: ${producto.quantity} - Precio: $${producto.price}`
        ).join('\n');
    }

    // Método para notificar al cliente que su pedido ha sido aceptado
    async notifyClienteOrderAccepted(cliente: any, cart: any): Promise<void> {
        const destinatario = Array.isArray(cliente) ? cliente[0] : cliente;
        console.log('Notificando al cliente sobre el pedido aceptado:', destinatario);
        
        if (!destinatario || !destinatario.email) {
            throw new Error('No se puede enviar el correo: el cliente no tiene email definido.');
        }

        const productList = this.generateProductList(cart.productos);
        const formattedDate = this.formatDate(cart.fecha);

        const subject = `✅ Pedido Confirmado - ID: ${cart._id}`;
        
        const htmlMessage = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #28a745; text-align: center;">¡Pedido Confirmado!</h2>
                
                <p>Hola <strong>${destinatario.name}</strong>,</p>
                
                <p>Nos complace informarte que tu pedido ha sido <strong>ACEPTADO</strong> y está siendo procesado.</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Detalles del Pedido:</h3>
                    <p><strong>ID del Pedido:</strong> ${cart._id}</p>
                    <p><strong>Fecha:</strong> ${formattedDate}</p>
                    <p><strong>Estado:</strong> ${cart.statusOrder === 'accepted' ? 'Aceptado' : cart.statusOrder}</p>
                    <p><strong>Método de Pago:</strong> ${cart.paymentMethod}</p>
                    <p><strong>Estado de Entrega:</strong> ${cart.delivered ? 'Entregado' : 'Pendiente de entrega'}</p>
                </div>
                
                <div style="background-color: #fff; padding: 15px; border: 1px solid #dee2e6; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Productos Pedidos:</h3>
                    <div style="font-family: monospace; white-space: pre-line;">${productList}</div>
                </div>
                
                <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #0066cc; margin-top: 0;">Total a Pagar: $${cart.total}</h3>
                </div>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h4 style="color: #856404; margin-top: 0;">Información de Contacto:</h4>
                    <p><strong>Nombre:</strong> ${destinatario.name}</p>
                    <p><strong>Email:</strong> ${destinatario.email}</p>
                    <p><strong>Teléfono:</strong> ${destinatario.phone}</p>
                </div>
                
                <p style="margin-top: 30px;">¡Gracias por confiar en nosotros! Te mantendremos informado sobre el estado de tu pedido.</p>
                
                <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
                    <p style="margin: 0; color: #6c757d; font-size: 14px;">
                        Si tienes alguna pregunta, no dudes en contactarnos.<br>
                        <strong>¡Esperamos que disfrutes tu pedido!</strong>
                    </p>
                </div>
            </div>
        `;

        const textMessage = `
¡Pedido Confirmado!

Hola ${destinatario.name},

Nos complace informarte que tu pedido ha sido ACEPTADO y está siendo procesado.

DETALLES DEL PEDIDO:
- ID del Pedido: ${cart._id}
- Fecha: ${formattedDate}
- Estado: ${cart.statusOrder === 'accepted' ? 'Aceptado' : cart.statusOrder}
- Método de Pago: ${cart.paymentMethod}
- Estado de Entrega: ${cart.delivered ? 'Entregado' : 'Pendiente de entrega'}

PRODUCTOS PEDIDOS:
${productList}

TOTAL A PAGAR: $${cart.total}

INFORMACIÓN DE CONTACTO:
- Nombre: ${destinatario.name}
- Email: ${destinatario.email}
- Teléfono: ${destinatario.phone}

¡Gracias por confiar en nosotros! Te mantendremos informado sobre el estado de tu pedido.

Si tienes alguna pregunta, no dudes en contactarnos.
¡Esperamos que disfrutes tu pedido!
        `;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: destinatario.email,
            subject: subject,
            text: textMessage,
            html: htmlMessage
        });

        console.log(`Email de confirmación enviado a ${destinatario.email} para el pedido ${cart._id}`);
    }

    // Método para notificar al cliente que su pedido ha sido cancelado
    async notifyClienteOrderCancelled(cliente: any, cart: any): Promise<void> {
        const destinatario = Array.isArray(cliente) ? cliente[0] : cliente;
        
        if (!destinatario || !destinatario.email) {
            throw new Error('No se puede enviar el correo: el cliente no tiene email definido.');
        }

        const productList = this.generateProductList(cart.productos);
        const formattedDate = this.formatDate(cart.fecha);

        const subject = `❌ Pedido Cancelado - ID: ${cart._id}`;
        
        const htmlMessage = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #dc3545; text-align: center;">Pedido Cancelado</h2>
                
                <p>Hola <strong>${destinatario.name}</strong>,</p>
                
                <p>Lamentamos informarte que tu pedido ha sido <strong>CANCELADO</strong>.</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Detalles del Pedido Cancelado:</h3>
                    <p><strong>ID del Pedido:</strong> ${cart._id}</p>
                    <p><strong>Fecha Original:</strong> ${formattedDate}</p>
                    <p><strong>Estado:</strong> Cancelado</p>
                    <p><strong>Método de Pago:</strong> ${cart.paymentMethod}</p>
                </div>
                
                <div style="background-color: #fff; padding: 15px; border: 1px solid #dee2e6; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Productos que Estaban en el Pedido:</h3>
                    <div style="font-family: monospace; white-space: pre-line;">${productList}</div>
                </div>
                
                <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #721c24; margin-top: 0;">Monto que NO será Cobrado: $${cart.total}</h3>
                </div>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h4 style="color: #856404; margin-top: 0;">Información de Contacto:</h4>
                    <p><strong>Nombre:</strong> ${destinatario.name}</p>
                    <p><strong>Email:</strong> ${destinatario.email}</p>
                    <p><strong>Teléfono:</strong> ${destinatario.phone}</p>
                </div>
                
                <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h4 style="color: #0c5460; margin-top: 0;">¿Qué puedes hacer ahora?</h4>
                    <p>• Realizar un nuevo pedido cuando gustes</p>
                    <p>• Contactarnos para conocer las razones de la cancelación</p>
                    <p>• Si pagaste con tarjeta, tu dinero será reembolsado automáticamente</p>
                </div>
                
                <p style="margin-top: 30px;">Disculpas por cualquier inconveniente. ¡Esperamos poder atenderte pronto!</p>
                
                <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
                    <p style="margin: 0; color: #6c757d; font-size: 14px;">
                        Para más información, no dudes en contactarnos.<br>
                        <strong>¡Gracias por tu comprensión!</strong>
                    </p>
                </div>
            </div>
        `;

        const textMessage = `
Pedido Cancelado

Hola ${destinatario.name},

Lamentamos informarte que tu pedido ha sido CANCELADO.

DETALLES DEL PEDIDO CANCELADO:
- ID del Pedido: ${cart._id}
- Fecha Original: ${formattedDate}
- Estado: Cancelado
- Método de Pago: ${cart.paymentMethod}

PRODUCTOS QUE ESTABAN EN EL PEDIDO:
${productList}

MONTO QUE NO SERÁ COBRADO: $${cart.total}

INFORMACIÓN DE CONTACTO:
- Nombre: ${destinatario.name}
- Email: ${destinatario.email}
- Teléfono: ${destinatario.phone}

¿QUÉ PUEDES HACER AHORA?
• Realizar un nuevo pedido cuando gustes
• Contactarnos para conocer las razones de la cancelación
• Si pagaste con tarjeta, tu dinero será reembolsado automáticamente

Disculpas por cualquier inconveniente. ¡Esperamos poder atenderte pronto!

Para más información, no dudes en contactarnos.
¡Gracias por tu comprensión!
        `;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: destinatario.email,
            subject: subject,
            text: textMessage,
            html: htmlMessage
        });

        console.log(`Email de cancelación enviado a ${destinatario.email} para el pedido ${cart._id}`);
    }
}