// services/notification.service.ts
import { SocketManager } from '../server/Server';
import { ICart } from '../models/cart.model';

export interface INotificationService {
    notifyNewCart(cart: ICart): void;
    notifyCartStatusUpdate(cartId: string, oldStatus: string, newStatus: string, cart: ICart): void;
    notifyCartDelivery(cartId: string, cart: ICart): void;
    notifyCartPayment(cartId: string, paymentMethod: string, cart: ICart): void;
}

export class NotificationService implements INotificationService {
    // Remover esta línea:
    // private socketManager: SocketManager;

    constructor() {
        // Remover esta línea:
        // this.socketManager = SocketManager.getInstance();
    }

    // Método privado para obtener el SocketManager cuando se necesite
    private getSocketManager(): SocketManager {
        return SocketManager.getInstance();
    }

    // Notificar nuevo carrito
   // Notificar nuevo carrito
notifyNewCart(cart: ICart): void {
    console.log('Cart user data:', cart.user);
    try {
        // Verificar si cart.user es un array o un objeto
        const userData = Array.isArray(cart.user) ? cart.user[0] : cart.user;
        
        const notificationData = {
            cartId: cart._id,
            cart: cart,
            mensaje: '¡Nuevo pedido recibido!',
            tipo: 'nuevo_carrito',
            timestamp: new Date(),
            // Usar las propiedades correctas
            cliente: userData?.id || userData?._id || 'Cliente desconocido',
            nombre: userData?.name || 'Nombre no disponible', // 'name', no 'nombre'
            email: userData?.email || '',
            telefono: userData?.phone || '',
            total: cart.total,
            productos: cart.productos?.length || 0
        };

        // Usar el getter en lugar de la propiedad
        const socketManager = this.getSocketManager();
        socketManager.emitCartEvent('nuevoCarrito', notificationData);
        socketManager.emitAdminEvent('nuevoCarritoAdmin', {
            ...notificationData,
            mensaje: 'Nuevo pedido para procesar'
        });

        console.log('Notificación de nuevo carrito enviada:', cart._id);
    } catch (error) {
        console.error('Error enviando notificación de nuevo carrito:', error);
    }
}

    // Notificar cambio de estado
    notifyCartStatusUpdate(cartId: string, oldStatus: string, newStatus: string, cart: ICart): void {
        try {
            const notificationData = {
                cartId,
                cart,
                estadoAnterior: oldStatus,
                nuevoEstado: newStatus,
                mensaje: `Pedido cambió de ${oldStatus} a ${newStatus}`,
                tipo: 'cambio_estado',
                timestamp: new Date()
            };

            const socketManager = this.getSocketManager();
            socketManager.emitCartEvent('estadoCarritoActualizado', notificationData);
            
            console.log(`Notificación de cambio de estado enviada: ${cartId} - ${oldStatus} → ${newStatus}`);
        } catch (error) {
            console.error('Error enviando notificación de cambio de estado:', error);
        }
    }

    // Notificar entrega
    notifyCartDelivery(cartId: string, cart: ICart): void {
        try {
            const notificationData = {
                cartId,
                cart,
                mensaje: 'Pedido marcado como entregado',
                tipo: 'entregado',
                timestamp: new Date()
            };

            const socketManager = this.getSocketManager();
            socketManager.emitCartEvent('carritoEntregado', notificationData);
            
            console.log('Notificación de entrega enviada:', cartId);
        } catch (error) {
            console.error('Error enviando notificación de entrega:', error);
        }
    }

    // Notificar pago procesado
    notifyCartPayment(cartId: string, paymentMethod: string, cart: ICart): void {
        try {
            const notificationData = {
                cartId,
                cart,
                metodoPago: paymentMethod,
                mensaje: `Pago procesado exitosamente - ${paymentMethod}`,
                tipo: 'pago_procesado',
                timestamp: new Date()
            };

            const socketManager = this.getSocketManager();
            socketManager.emitCartEvent('pagoProcesado', notificationData);
            
            console.log('Notificación de pago enviada:', cartId);
        } catch (error) {
            console.error('Error enviando notificación de pago:', error);
        }
    }
}