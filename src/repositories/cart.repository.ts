import Cart, { ICart } from "../models/cart.model";
import Bebida from "../models/bebidas.model";

export interface ICartRepository {
    createCart(cartData: Partial<ICart>): Promise<ICart>;
    findCartById(id: string): Promise<ICart | null>;
    findAllCarts(): Promise<ICart[]>;
    findCartByUserId(userId: string): Promise<ICart[]>;
    updateCart(id: string, cartData: Partial<ICart>): Promise<ICart | null>;
    deleteCart(id: string): Promise<boolean>;
    verifyProductsAvailability(productos: Array<{ id: string, quantity: number }>): Promise<{
        isAvailable: boolean;
        unavailableProducts: Array<{ id: string; message: string }>;
    }>;
}

export class CartRepository implements ICartRepository {
    async createCart(cartData: Partial<ICart>): Promise<ICart> {
        try {
            const cart = new Cart(cartData);
            return await cart.save();
        } catch (error) {
            console.error("Error al crear el carrito:", error);
            throw error;
        }
    }

    async findCartById(id: string): Promise<ICart | null> {
        try {
            return await Cart.findById(id);
        } catch (error) {
            console.error("Error al buscar el carrito:", error);
            return null;
        }
    }
    async findAllCarts(): Promise<ICart[]> {
        try {
            return await Cart.find();
        } catch (error) {
            console.error("Error al buscar todos los carritos:", error);
            return [];
        }
    }
    async findCartByUserId(userId: string): Promise<ICart[]> {
        try {
            return await Cart.find({ userId });
        } catch (error) {
            console.error("Error al buscar carritos por usuario:", error);
            return [];
        }
    }

    async updateCart(id: string, cartData: Partial<ICart>): Promise<ICart | null> {
        try {
            return await Cart.findByIdAndUpdate(id, cartData, { new: true });
        } catch (error) {
            console.error("Error al actualizar el carrito:", error);
            return null;
        }
    }

    async deleteCart(id: string): Promise<boolean> {
        try {
            const result = await Cart.findByIdAndDelete(id);
            return result !== null;
        } catch (error) {
            console.error("Error al eliminar el carrito:", error);
            return false;
        }
    }

    async verifyProductsAvailability(productos: Array<{ id: string, quantity: number }>): Promise<{
        isAvailable: boolean;
        unavailableProducts: Array<{ id: string; message: string }>;
    }> {
        try {
            const unavailableProducts: Array<{ id: string; message: string }> = [];

            for (const producto of productos) {
                const bebida = await Bebida.findById(producto.id);

                if (!bebida) {
                    unavailableProducts.push({
                        id: producto.id,
                        message: "Bebida no encontrada"
                    });
                    continue;
                }

                if (!bebida.isActive) {
                    unavailableProducts.push({
                        id: producto.id,
                        message: "Bebida no disponible actualmente"
                    });
                    continue;
                }

                if (bebida.stock < producto.quantity) {
                    unavailableProducts.push({
                        id: producto.id,
                        message: `Stock insuficiente. Disponible: ${bebida.stock}, Solicitado: ${producto.quantity}`
                    });
                }
            }

            return {
                isAvailable: unavailableProducts.length === 0,
                unavailableProducts
            };
        } catch (error) {
            console.error("Error al verificar disponibilidad de productos:", error);
            throw error;
        }
    }
}