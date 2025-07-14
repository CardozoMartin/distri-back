// services/cart.service.ts
import { ICart } from "../models/cart.model";
import { CartRepository, ICartRepository } from "../repositories/cart.repository";
import { BebidaService } from "./bebidas.service";
import { EmailService } from "./email.service";
import { whatsappService } from "./whatsapp.service";


export class CartService {
    private cartRepository: ICartRepository;
    private bebidaService: BebidaService;
    private notificationService;
    private notificationWhatsapp;
   

    constructor() {
        this.cartRepository = new CartRepository();
        this.bebidaService = new BebidaService();
        this.notificationService = new EmailService();
        this.notificationWhatsapp = whatsappService;
    }

    // Crear un nuevo carrito
    async createCart(cartData: Partial<ICart>): Promise<ICart> {
        try {
            // Verificar que los productos existan y calcular el total
            const { validatedProducts, total } = await this.validateAndCalculateCart(cartData.productos || []);

            // Verificar disponibilidad de stock
            await this.verifyStock(validatedProducts);

            // Crear el carrito con la fecha actual y el total calculado
            const cartToCreate = {
                ...cartData,
                productos: validatedProducts,
                fecha: new Date(),
                total,
                status: "pendiente",
                delivered: false,
                statusOrder: 'pending' 
            };

            const newCart = await this.cartRepository.createCart(cartToCreate);

            // Descontar stock de las bebidas usando los nuevos métodos
            await this.updateBebidasStock(validatedProducts, 'decrease');

            // 🚀 NUEVA FUNCIONALIDAD: Enviar notificación WebSocket
            this.notificationService.notifyNewCart(newCart);

            return newCart;
        } catch (error) {
            console.error("Error en createCart service:", error);
            throw error;
        }
    }

    // Actualizar un carrito
    async updateCart(id: string, cartData: Partial<ICart>): Promise<ICart | null> {
        try {
            // Obtener el carrito actual para comparar cambios
            const currentCart = await this.cartRepository.findCartById(id);
            if (!currentCart) {
                throw new Error("Carrito no encontrado");
            }

            // Guardar estado anterior para notificación
            const oldStatus = currentCart.status;

            // Si hay cambios en los productos, manejamos el stock
            if (cartData.productos) {
                // Restaurar stock de productos anteriores
                await this.updateBebidasStock(
                    currentCart.productos.map(p => ({ id: p.id, quantity: p.quantity })),
                    'increase'
                );

                // Validar nuevos productos
                const { validatedProducts, total } = await this.validateAndCalculateCart(cartData.productos);

                // Verificar stock disponible
                await this.verifyStock(validatedProducts);

                // Actualizar datos del carrito
                cartData.productos = validatedProducts;
                cartData.total = total;

                // Descontar stock de nuevos productos
                await this.updateBebidasStock(validatedProducts, 'decrease');
            }

            const updatedCart = await this.cartRepository.updateCart(id, cartData);

            // 🚀 NUEVA FUNCIONALIDAD: Notificar si cambió el estado
            if (updatedCart && cartData.status && oldStatus !== cartData.status) {
                this.notificationService.notifyCartStatusUpdate(id, oldStatus, cartData.status, updatedCart);
            }

            return updatedCart;
        } catch (error) {
            console.error("Error en updateCart service:", error);
            throw error;
        }
    }

    // Cambiar el estado del carrito
    async updateCartStatus(id: string, newStatus: string): Promise<ICart | null> {
        try {
            const currentCart = await this.cartRepository.findCartById(id);
            if (!currentCart) {
                throw new Error("Carrito no encontrado");
            }

            const oldStatus = currentCart.status;
            const updatedCart = await this.cartRepository.updateCart(id, { status: newStatus });

            // 🚀 NUEVA FUNCIONALIDAD: Notificar cambio de estado
            if (updatedCart) {
                this.notificationService.notifyCartStatusUpdate(id, oldStatus, newStatus, updatedCart);
            }

            return updatedCart;
        } catch (error) {
            console.error("Error en updateCartStatus service:", error);
            throw error;
        }
    }

    // Procesar el pago del carrito
    async processCartPayment(id: string, paymentMethod: string): Promise<ICart | null> {
        try {
            const cart = await this.cartRepository.findCartById(id);
            if (!cart) {
                throw new Error("Carrito no encontrado");
            }

            // Verificar nuevamente la disponibilidad antes de procesar el pago
            await this.verifyStock(cart.productos.map(p => ({ id: p.id, quantity: p.quantity })));

            // Actualizar el carrito con el método de pago y cambiar el estado
            const updatedCart = await this.cartRepository.updateCart(id, {
                paymentMethod,
                status: "pagado"
            });

            
            

            return updatedCart;
        } catch (error) {
            console.error("Error en processCartPayment service:", error);
            throw error;
        }
    }

    // Cambiar el estado de entrega del carrito
    async updateCartDeliveryStatus(id: string): Promise<ICart | null> {
        try {
            const cart = await this.cartRepository.findCartById(id);
            if (!cart) {
                throw new Error("Carrito no encontrado");
            }

            // Validar que el carrito esté en un estado válido para marcar como entregado
            if (cart.status !== "procesando_pago" && cart.status !== "Pagado" && cart.status !== "preparando") {
                throw new Error(`No se puede marcar como entregado un carrito con estado: ${cart.status}`);
            }

            // Marcar como entregado y actualizar el estado
            const updatedCart = await this.cartRepository.updateCart(id, {
                delivered: true,
                status: "entregado"
            });

            // 🚀 NUEVA FUNCIONALIDAD: Notificar entrega
            if (updatedCart) {
                this.notificationService.notifyCartDelivery(id, updatedCart);
            }

            return updatedCart;
        } catch (error) {
            console.error("Error en updateCartDeliveryStatus service:", error);
            throw error;
        }
    }

    // Todos los métodos existentes se mantienen igual...
    // (validateAndCalculateCart, verifyStock, updateBebidasStock, etc.)

    // Solo agrego los métodos que faltaban en tu código original:

    async getCartById(id: string): Promise<ICart | null> {
        try {
            return await this.cartRepository.findCartById(id);
        } catch (error) {
            console.error("Error en getCartById service:", error);
            throw error;
        }
    }

    async getAllCarts(): Promise<ICart[]> {
        try {
            return await this.cartRepository.findAllCarts();
        } catch (error) {
            console.error("Error en getAllCarts service:", error);
            throw error;
        }
    }
    //servicio para mostrar las ventas y pedidos del dia actual
    async getSalfesForDay(): Promise<ICart[]> {
        try {
            //obtenemos todos los carritos
            const allCarts = await this.cartRepository.findAllCarts();

            //obtenemos la fecha actual
            const today = new Date();
            //establecemos el inicio del dia
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            //establecemos el final del dia
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            //filtramos los carritos que son del dia actual y estan pagados
            const dailyCarts = allCarts.filter(cart => cart.fecha >= startOfDay && cart.fecha < endOfDay && cart.status === "Pagado");

            return dailyCarts;
        } catch (error) {
            console.error("Error en getSalesForDay service:", error);
            throw error;
        }
    }
    async getCartsByUserId(userId: string): Promise<ICart[]> {
        try {
            return await this.cartRepository.findCartByUserId(userId);
        } catch (error) {
            console.error("Error en getCartsByUserId service:", error);
            throw error;
        }
    }

    async deleteCart(id: string): Promise<boolean> {
        try {
            const cart = await this.cartRepository.findCartById(id);

            if (cart && cart.productos) {
                await this.updateBebidasStock(
                    cart.productos.map(p => ({ id: p.id, quantity: p.quantity })),
                    'increase'
                );
            }

            return await this.cartRepository.deleteCart(id);
        } catch (error) {
            console.error("Error en deleteCart service:", error);
            throw error;
        }
    }

    async cancelCart(id: string): Promise<ICart | null> {
        try {
            const cart = await this.cartRepository.findCartById(id);
            if (!cart) {
                throw new Error("Carrito no encontrado");
            }

            await this.updateBebidasStock(
                cart.productos.map(p => ({ id: p.id, quantity: p.quantity })),
                'increase'
            );

            const cancelledCart = await this.cartRepository.updateCart(id, { status: "cancelado" });

            // 🚀 Notificar cancelación
            if (cancelledCart) {
                this.notificationService.notifyCartStatusUpdate(id, cart.status, "cancelado", cancelledCart);
            }

            return cancelledCart;
        } catch (error) {
            console.error("Error en cancelCart service:", error);
            throw error;
        }
    }

    // Métodos privados (los mantienes igual)
    private async validateAndCalculateCart(productos: Array<{ id: string, quantity: number, price?: number }>): Promise<{
        validatedProducts: Array<{ id: string, quantity: number, price: number, name: string }>,
        total: number
    }> {
        const validatedProducts = [];
        let total = 0;

        for (const producto of productos) {
            const bebida = await this.bebidaService.getBebidaById(producto.id);

            if (!bebida) {
                throw new Error(`La bebida con ID ${producto.id} no existe`);
            }

            if (!bebida.isActive) {
                throw new Error(`La bebida ${bebida.name} no está disponible`);
            }

            const validatedProduct = {
                id: producto.id,
                quantity: producto.quantity,
                price: bebida.price,
                name: bebida.name
            };

            validatedProducts.push(validatedProduct);
            total += bebida.price * producto.quantity;
        }

        return { validatedProducts, total };
    }

    private async verifyStock(productos: Array<{ id: string, quantity: number }>): Promise<void> {
        const unavailableProducts = [];

        for (const producto of productos) {
            const stockCheck = await this.bebidaService.checkStockAvailability(producto.id, producto.quantity);

            if (!stockCheck.isAvailable) {
                unavailableProducts.push({
                    id: producto.id,
                    name: stockCheck.bebida?.name || 'Producto no encontrado',
                    requested: producto.quantity,
                    available: stockCheck.currentStock
                });
            }
        }

        if (unavailableProducts.length > 0) {
            throw new Error(`Stock insuficiente para los siguientes productos: ${JSON.stringify(unavailableProducts)}`);
        }
    }

    private async updateBebidasStock(productos: Array<{ id: string, quantity: number }>, operation: 'increase' | 'decrease'): Promise<void> {
        const updates = productos.map(producto => ({
            id: producto.id,
            quantity: producto.quantity,
            operation
        }));

        const result = await this.bebidaService.updateMultipleStock(updates);

        if (result.failed.length > 0) {
            throw new Error(`Error actualizando stock: ${JSON.stringify(result.failed)}`);
        }
    }

    //servicio para calcular las ventas cuantos pedidos se realizaron en el dia y cuando se recaudo
    async calculateDailySales(): Promise<{ totalSales: number, totalOrders: number }> {
        try {
            // Obtener todos los carritos y filtrar por fecha y estado
            const carts = await this.cartRepository.findAllCarts();
            // Filtrar los carritos que son del día de hoy y están pagados
            const today = new Date();
            // Asegurarse de que la hora sea 00:00:00 para el inicio del día
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            // Asegurarse de que la hora sea 23:59:59 para el final del día
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            // Filtrar los carritos que son del día de hoy y están pagados
            const dailyCarts = carts.filter(cart => cart.fecha >= startOfDay && cart.fecha < endOfDay && cart.status === "Pagado");
            // Calcular las ventas totales y el número de pedidos
            const totalSales = dailyCarts.reduce((sum, cart) => sum + cart.total, 0);
            // Contar el número de pedidos
            const totalOrders = dailyCarts.length;
            // Retornar el total de ventas y el número de pedidos
            return { totalSales, totalOrders };
        } catch (error) {
            console.error("Error en calculateDailySales service:", error);
            throw error;
        }
    }

    //servicio para calcular las ventas y comparar con el dia anterior
    async calculateSalesComparison(): Promise<{ today: { totalSales: number, totalOrders: number }, yesterday: { totalSales: number, totalOrders: number } }> {
        try {
            // Obtener todos los carritos
            const carts = await this.cartRepository.findAllCarts();

            // Obtener la fecha de hoy y ayer
            const today = new Date();
            const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            const startOfYesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
            const endOfYesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            // Filtrar carritos de hoy y ayer
            const todaysCarts = carts.filter(cart => cart.fecha >= startOfToday && cart.fecha < endOfToday && cart.status === "Pagado");
            const yesterdaysCarts = carts.filter(cart => cart.fecha >= startOfYesterday && cart.fecha < endOfYesterday && cart.status === "Pagado");

            // Calcular ventas y pedidos de hoy
            const totalSalesToday = todaysCarts.reduce((sum, cart) => sum + cart.total, 0);
            const totalOrdersToday = todaysCarts.length;

            // Calcular ventas y pedidos de ayer
            const totalSalesYesterday = yesterdaysCarts.reduce((sum, cart) => sum + cart.total, 0);
            const totalOrdersYesterday = yesterdaysCarts.length;

            return {
                today: { totalSales: totalSalesToday, totalOrders: totalOrdersToday },
                yesterday: { totalSales: totalSalesYesterday, totalOrders: totalOrdersYesterday }
            };
        } catch (error) {
            console.error("Error en calculateSalesComparison service:", error);
            throw error;
        }
    }
    //servicio para calcular las ventas del mes actual
    async calculateMonthlySales(): Promise<{ totalSales: number, totalOrders: number }> {
        try {
            // Obtener todos los carritos
            const carts = await this.cartRepository.findAllCarts();

            // Obtener la fecha actual y el inicio del mes
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

            // Filtrar carritos del mes actual y que estén pagados
            const monthlyCarts = carts.filter(cart => cart.fecha >= startOfMonth && cart.fecha < endOfMonth && cart.status === "Pagado");

            // Calcular las ventas totales y el número de pedidos
            const totalSales = monthlyCarts.reduce((sum, cart) => sum + cart.total, 0);
            const totalOrders = monthlyCarts.length;

            return { totalSales, totalOrders };
        } catch (error) {
            console.error("Error en calculateMonthlySales service:", error);
            throw error;
        }
    }
    //servicio para calcular y comparar las ventas del mes actual con el mes anterior
    async calculateMonthlySalesComparison(): Promise<{ currentMonth: { totalSales: number, totalOrders: number }, previousMonth: { totalSales: number, totalOrders: number } }> {
        try {
            // Obtener todos los carritos
            const carts = await this.cartRepository.findAllCarts();

            // Obtener la fecha actual y el inicio del mes actual y anterior
            const today = new Date();
            const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            const startOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const endOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 1);

            // Filtrar carritos del mes actual y anterior que estén pagados
            const currentMonthCarts = carts.filter(cart => cart.fecha >= startOfCurrentMonth && cart.fecha < endOfCurrentMonth && cart.status === "Pagado");
            const previousMonthCarts = carts.filter(cart => cart.fecha >= startOfPreviousMonth && cart.fecha < endOfPreviousMonth && cart.status === "Pagado");

            // Calcular ventas y pedidos del mes actual
            const totalSalesCurrentMonth = currentMonthCarts.reduce((sum, cart) => sum + cart.total, 0);
            const totalOrdersCurrentMonth = currentMonthCarts.length;

            // Calcular ventas y pedidos del mes anterior
            const totalSalesPreviousMonth = previousMonthCarts.reduce((sum, cart) => sum + cart.total, 0);
            const totalOrdersPreviousMonth = previousMonthCarts.length;

            return {
                currentMonth: { totalSales: totalSalesCurrentMonth, totalOrders: totalOrdersCurrentMonth },
                previousMonth: { totalSales: totalSalesPreviousMonth, totalOrders: totalOrdersPreviousMonth }
            };
        } catch (error) {
            console.error("Error en calculateMonthlySalesComparison service:", error);
            throw error;
        }
    }

    //servicio para cambiar el estado de pendiente a aceptado o cancelado y ademas vamos a enviar notificaiones por whatsappweb-js

    async changeCartAndNotifyForEmail(id: string, statusOrder: 'accepted' | 'cancelled'): Promise<ICart | null> {
        try {
            //primero buscamos el carrito por el id
            const cart = await this.cartRepository.findCartById(id);

            //verificamos si el carrito existe
            if(!cart){
                throw new Error('Carrito no encontrado')
            }

            //verficamos si el estado actual es pendiente
            if(cart.statusOrder === 'pending'){
                //actualizamos el estado del carrito
                //el estado solo puede ser aceptado o cancelado
               if(statusOrder !== 'accepted' && statusOrder !== 'cancelled'){
                    throw new Error('Estado no válido');
                }
                
                const updatedCart = await this.cartRepository.updateCart(id, { statusOrder: statusOrder });
                console.log('pudo actualizar elcarro {{', updatedCart, '}}');
                //enviamos la notificacion por whatsapp-web-js
               if (statusOrder === 'accepted') {
                   this.notificationService.notifyClienteOrderAccepted(cart.user, cart);
               } else {
                   this.notificationService.notifyClienteOrderCancelled(cart.user, cart);
               }


                return updatedCart;
            }
        } catch (error) {
            // Puedes agregar logging aquí si lo deseas
            return null;
        }
        // Si no entra en el if principal, también debe retornar null
        return null;
    }

 async changeCartAndNotifyForWhatsapp(id: string, statusOrder: 'accepted' | 'cancelled'): Promise<ICart | null> {
    try {
        // Paso 1: Buscar el carrito por el id
        const cart = await this.cartRepository.findCartById(id);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }

       

        // Paso 2: Verificar si el estado es pendiente y el nuevo estado es válido
        if (cart.statusOrder !== 'pending') {
           
            return null;
        }

        if (statusOrder !== 'accepted' && statusOrder !== 'cancelled') {
            throw new Error('Estado no válido');
        }

        // Paso 3: Actualizar el carrito PRIMERO
        const updatedCart = await this.cartRepository.updateCart(id, { statusOrder: statusOrder });
       

        // Paso 4: Obtener el destinatario (soporta array u objeto)
        const destinatario = Array.isArray(cart.user) ? cart.user[0] : cart.user;
        

        // Paso 5: Verificar que tenga teléfono
        if (!destinatario || !destinatario.phone) {
            console.log('No se puede enviar WhatsApp: el cliente no tiene teléfono definido');
            return updatedCart; // Retorna el carrito actualizado aunque no se envíe el mensaje
        }

        // Paso 6: Formatear el teléfono para WhatsApp
        let phone = destinatario.phone.toString().replace(/[^0-9]/g, '');
       

        // Para Argentina: convertir número local a formato internacional WhatsApp
        // Ejemplo: 3812032666 -> 5493812032666
        if (phone.length === 10 && phone.startsWith('381')) {
            // Es un número de Tucumán, convertir a formato internacional
            phone = '549' + phone;
        } else if (phone.length === 10 && !phone.startsWith('54')) {
            // Es un número argentino de 10 dígitos, agregar 549
            phone = '549' + phone;
        }

       

        // Paso 7: Crear el mensaje
        let mensaje;
        if (statusOrder === 'accepted') {
            mensaje = `Hola ${destinatario.name || 'Cliente'}, tu pedido ha sido aceptado. ¡Gracias por tu compra!`;
        } else {
            mensaje = `Hola ${destinatario.name || 'Cliente'}, lamentamos informarte que tu pedido ha sido cancelado.`;
        }

        

        // Paso 8: Enviar el mensaje por WhatsApp
        try {
            await this.notificationWhatsapp.sendMessage(phone, mensaje);
           
        } catch (whatsappError) {
           
            // No lanzamos el error para que el método continúe y retorne el carrito actualizado
        }

        return updatedCart;

    } catch (error) {
       
        throw error; // Re-lanzamos el error para que el controlador pueda manejarlo
    }
}

}
