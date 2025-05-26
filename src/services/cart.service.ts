import { ICart } from "../models/cart.model";
import { CartRepository, ICartRepository } from "../repositories/cart.repository";
import { BebidaService } from "./bebidas.service";


export class CartService {
    private cartRepository: ICartRepository;
    private bebidaService: BebidaService;

    constructor() {
        this.cartRepository = new CartRepository();
        this.bebidaService = new BebidaService();
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

            return newCart;
        } catch (error) {
            console.error("Error en createCart service:", error);
            throw error;
        }
    }

    // Validar productos y calcular total
    private async validateAndCalculateCart(productos: Array<{ id: string, quantity: number, price?: number }>): Promise<{
        validatedProducts: Array<{ id: string, quantity: number, price: number, name: string }>,
        total: number
    }> {
        const validatedProducts = [];
        let total = 0;

        for (const producto of productos) {
            // Buscar la bebida por ID
            const bebida = await this.bebidaService.getBebidaById(producto.id);
            
            if (!bebida) {
                throw new Error(`La bebida con ID ${producto.id} no existe`);
            }

            if (!bebida.isActive) {
                throw new Error(`La bebida ${bebida.name} no está disponible`);
            }

            // Usar el precio de la base de datos, no el que viene del cliente
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

    // Verificar stock disponible usando el nuevo método del servicio
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

    // Actualizar stock de bebidas usando los nuevos métodos específicos
    private async updateBebidasStock(productos: Array<{ id: string, quantity: number }>, operation: 'increase' | 'decrease'): Promise<void> {
        const updates = productos.map(producto => ({
            id: producto.id,
            quantity: producto.quantity,
            operation
        }));

        const result = await this.bebidaService.updateMultipleStock(updates);

        // Si alguna actualización falló, lanzar error con detalles
        if (result.failed.length > 0) {
            throw new Error(`Error actualizando stock: ${JSON.stringify(result.failed)}`);
        }
    }

    // Obtener un carrito por ID
    async getCartById(id: string): Promise<ICart | null> {
        try {
            return await this.cartRepository.findCartById(id);
        } catch (error) {
            console.error("Error en getCartById service:", error);
            throw error;
        }
    }
    // Obtener todos los carritos
    async getAllCarts(): Promise<ICart[]> {
        try {
            return await this.cartRepository.findAllCarts();
        } catch (error) {
            console.error("Error en getAllCarts service:", error);
            throw error;
        }
    }

    // obtener los carritos por usuario
    async getCartsByUserId(userId: string): Promise<ICart[]> {
        try {
            return await this.cartRepository.findCartByUserId(userId);
        } catch (error) {
            console.error("Error en getCartsByUserId service:", error);
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

            return await this.cartRepository.updateCart(id, cartData);
        } catch (error) {
            console.error("Error en updateCart service:", error);
            throw error;
        }
    }

    // Eliminar un carrito
    async deleteCart(id: string): Promise<boolean> {
        try {
            // Obtener el carrito antes de eliminarlo para restaurar stock
            const cart = await this.cartRepository.findCartById(id);
            
            if (cart && cart.productos) {
                // Restaurar stock de todos los productos
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

    // Cambiar el estado del carrito
    async updateCartStatus(id: string, newStatus: string): Promise<ICart | null> {
        try {
            return await this.cartRepository.updateCart(id, { status: newStatus });
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
            return await this.cartRepository.updateCart(id, {
                paymentMethod,
                status: "Pagado"
            });
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
        return await this.cartRepository.updateCart(id, {
            delivered: true,
                     // Agregar fecha de entrega
        });
    } catch (error) {
        console.error("Error en updateCartDeliveryStatus service:", error);
        throw error;
    }
}

    // Cancelar un carrito (restaurar stock)
    async cancelCart(id: string): Promise<ICart | null> {
        try {
            const cart = await this.cartRepository.findCartById(id);
            if (!cart) {
                throw new Error("Carrito no encontrado");
            }

            // Restaurar stock de todos los productos
            await this.updateBebidasStock(
                cart.productos.map(p => ({ id: p.id, quantity: p.quantity })), 
                'increase'
            );

            // Cambiar estado a cancelado
            return await this.cartRepository.updateCart(id, { status: "cancelado" });
        } catch (error) {
            console.error("Error en cancelCart service:", error);
            throw error;
        }
    }
}