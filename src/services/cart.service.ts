// services/cart.service.ts
import { ICart } from "../models/cart.model";
import { CartRepository, ICartRepository } from "../repositories/cart.repository";
import { BebidaService } from "./bebidas.service";
import { NotificationService, INotificationService } from "../repositories/notificacion.repository";

export class CartService {
    private cartRepository: ICartRepository;
    private bebidaService: BebidaService;
    private notificationService: INotificationService;

    constructor() {
        this.cartRepository = new CartRepository();
        this.bebidaService = new BebidaService();
        this.notificationService = new NotificationService();
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
                delivered: false
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
                status: "Pagado"
            });

            // 🚀 NUEVA FUNCIONALIDAD: Notificar pago procesado
            if (updatedCart) {
                this.notificationService.notifyCartPayment(id, paymentMethod, updatedCart);
            }

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
}