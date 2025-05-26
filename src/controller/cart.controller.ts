import { Request, Response } from 'express';
import { CartService } from '../services/cart.service';



export class CartController {
    private cartService: CartService;

    constructor() {
        this.cartService = new CartService();
    }

    // Crear un nuevo carrito
    async createCart(req: Request, res: Response) {
        try {
            const cartData = req.body;
            const newCart = await this.cartService.createCart(cartData);
            
            return res.status(201).json({
                success: true,
                message: 'Carrito creado exitosamente',
                data: newCart
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: 'Error al crear el carrito',
                error: error.message
            });
        }
    }

    // Obtener un carrito por ID
    async getCartById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const cart = await this.cartService.getCartById(id);

            if (!cart) {
                return res.status(404).json({
                    success: false,
                    message: 'Carrito no encontrado'
                });
            }

            return res.status(200).json({
                success: true,
                data: cart
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: 'Error al obtener el carrito',
                error: error.message
            });
        }
    }
    // Obtener todos los carritos
    async getAllCarts(req: Request, res: Response) {
        try {
            const carts = await this.cartService.getAllCarts();

            return res.status(200).json({
                success: true,
                data: carts
            });

        }   catch (error: any) {
            return res.status(500).json({
                success: false,
                message: 'Error al obtener los carritos',
                error: error.message
            });
        }
    }
    //controlador para obtener los carritos por usuario
    async getCartByUserId(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const carts = await this.cartService.getCartsByUserId(userId);

            if (!carts) {
                return res.status(404).json({
                    success: false,
                    message: 'Carritos no encontrados'
                });
            }

            return res.status(200).json({
                success: true,
                data: carts
            });

        }   catch (error: any) {
            return res.status(500).json({
                success: false,
                message: 'Error al obtener los carritos',
                error: error.message
            });
        }
    }

    // Actualizar un carrito
    async updateCart(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const cartData = req.body;
            
            const updatedCart = await this.cartService.updateCart(id, cartData);

            if (!updatedCart) {
                return res.status(404).json({
                    success: false,
                    message: 'Carrito no encontrado'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Carrito actualizado exitosamente',
                data: updatedCart
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: 'Error al actualizar el carrito',
                error: error.message
            });
        }
    }

    // Eliminar un carrito
    async deleteCart(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const isDeleted = await this.cartService.deleteCart(id);

            if (!isDeleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Carrito no encontrado'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Carrito eliminado exitosamente'
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar el carrito',
                error: error.message
            });
        }
    }

    // Procesar el pago del carrito
    async processPayment(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { paymentMethod } = req.body;

            const processedCart = await this.cartService.processCartPayment(id, paymentMethod);

            if (!processedCart) {
                return res.status(404).json({
                    success: false,
                    message: 'Carrito no encontrado'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Pago procesado exitosamente',
                data: processedCart
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: 'Error al procesar el pago',
                error: error.message
            });
        }
    }

    async deliveryCart(req: Request, res: Response) {
        try {
            const { id} = req.params;
            const { delivered } = req.body;

            const deliveryCart = await this.cartService.updateCartDeliveryStatus(id, delivered);

            if (!deliveryCart) {
                return res.status(404).json({
                    success: false,
                    message: 'Carrito no encontrado'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Carrito entregado exitosamente',
                data: deliveryCart
            })
        } catch (error) {
            
        }
    }
}