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
            console.log('Datos del carrito:', cartData);
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

        } catch (error: any) {
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

        } catch (error: any) {
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
            const { id } = req.params;
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

    //controlador para saber las cuanto se recaudo y cuantos carritos se han vendido
    async getSalesData(req: Request, res: Response) {
        try {
            const salesData = await this.cartService.calculateDailySales();
            return res.status(200).json({
                success: true,
                data: salesData
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: 'Error al obtener los datos de ventas',
                error: error.message
            });
        }
    }
    //controlador para obtener y calcular las ventas con el dia anterior
    async getSalesComparison(req: Request, res: Response) {
        try {
            const salesComparison = await this.cartService.calculateMonthlySalesComparison();
            return res.status(200).json({
                success: true,
                data: salesComparison
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: 'Error al obtener los datos de comparación de ventas',
                error: error.message
            });
        }
    }

    //controlador para cacular las ventas del mes actual
    async getCurrentMonthSales(req: Request, res: Response) {
        try {
            const currentMonthSales = await this.cartService.calculateCurrentMonthSales();
            return res.status(200).json({
                success: true,
                data: currentMonthSales
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: 'Error al obtener los datos de ventas del mes actual',
                error: error.message
            });
        }
    }

    //controlador para calcular las ventas con el mes actual y el mes anterior
    async getMonthlySalesComparison(req: Request, res: Response) {
        try {
            const monthlyComparison = await this.cartService.calculateMonthlySalesComparison();
            return res.status(200).json({
                success: true,
                data: monthlyComparison
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: 'Error al obtener los datos de comparación de ventas mensuales',
                error: error.message
            });
        }
    }

    //controlador para obtener las ventas del dia actual
    async getCurrentDaySales(req: Request, res: Response) {
        try {
            // Llama al servicio para obtener las ventas del día actual
            const currentDaySales = await this.cartService.getSalfesForDay();
            // Verifica si se encontraron ventas para el día actual
            if (!currentDaySales) {
                return res.status(404).json({
                    success: false,
                    message: 'No se encontraron ventas para el día actual'
                });
            }
            // Devuelve las ventas del día actual
            res.status(200).json({
                message: 'Ventas del día actual obtenidas exitosamente',
                data: currentDaySales
            })
        } catch (error) {
            console.error("Error en getCurrentDaySales controller:", error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener las ventas del día actual',
                error: error.message
            });
        }
    }

    //controlador para cambiar el estado de la orden y enviar la notificaion
    async changeOrderAndSendNotification(req: Request, res: Response) {
        const { statusOrder } = req.body;
        const { id } = req.params;

        try {
            const updatedCart = await this.cartService.changeCartAndNotifyForEmail(id, statusOrder);
            return res.status(200).json({
                success: true,
                data: updatedCart
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: 'Error al cambiar el estado de la orden',
                error: error.message
            });
        }

    }
    //notificaion para cambiar el estado por whatsapp
    // async changerOrderForWhatsappNotification(req: Request, res: Response) {

    //     console.log(req.body)
    //     try {
    //         const { id } = req.params;
    //         const { statusOrder } = req.body;

    //         const updatedCart = await this.cartService.changeCartAndNotifyForWhatsapp(id, statusOrder);
    //         return res.status(200).json({
    //             success: true,
    //             data: updatedCart
    //         });
    //     } catch (error) {
    //         console.error("Error en changerOrderForWhatsappNotification controller:", error);
    //         return res.status(500).json({
    //             success: false,
    //             message: 'Error al cambiar el estado de la orden por WhatsApp',
    //             error: error.message
    //         });
    //     }
    // }

    //controlador para obtener carrito por su numero y devolver el ultimo carrito
   async getCartByPhone(req: Request, res: Response) {
    try {
        // Obtenemos el número de teléfono de los parámetros de la URL
        const { phone } = req.params;
        
        // Validamos que el parámetro phone esté presente
        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'El número de teléfono es requerido'
            });
        }
        
        // Llamamos al servicio para obtener el carrito por teléfono
        const cart = await this.cartService.getLastCartByPhone(phone);
        
        // Verificamos si el carrito existe
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Carrito no encontrado para el número de teléfono proporcionado'
            });
        }
        
        // Devolvemos el carrito encontrado
        return res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el carrito por número de teléfono',
            error: error.message
        });
    }
}

    }
