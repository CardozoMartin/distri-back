import { Router } from 'express';
import { CartController } from '../controller/cart.controller';

const router = Router();
const cartController = new CartController();

// Ruta para crear un nuevo carrito
// POST /api/cart
router.post('/', (req, res) => {
    cartController.createCart(req, res);
});

// Ruta para obtener un carrito por ID
// GET /api/cart/:id
router.get('/:id', (req, res) => {
    cartController.getCartById(req, res);
});
router.get('/', (req, res) => {
    cartController.getAllCarts(req, res);
});

// Ruta para actualizar un carrito
// PUT /api/cart/:id
router.put('/:id', (req, res) => {
    cartController.updateCart(req, res);
});

// Ruta para eliminar un carrito
// DELETE /api/cart/:id
router.delete('/:id', (req, res) => {
    cartController.deleteCart(req, res);
});

// Ruta para procesar el pago de un carrito
// POST /api/cart/:id/payment
router.post('/:id/payment', (req, res) => {
    cartController.processPayment(req, res);
});

router.post('/:id/changedelivery', (req, res)=>{
    cartController.deliveryCart(req,res);
})

export default router;