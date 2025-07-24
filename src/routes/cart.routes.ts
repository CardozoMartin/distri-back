import { Router } from 'express';
import { CartController } from '../controller/cart.controller';
import { TokenMiddleware } from '../middleware/token.middleware';

const router = Router();
const cartController = new CartController();
const isAdmin = new TokenMiddleware()

// Ruta para crear un nuevo carrito
// POST /api/cart
router.post('/', (req, res) => {
    cartController.createCart(req, res);
});

// Ruta para obtener un carrito por ID
// GET /api/cart/:id

//rutas publicas
router.get('/saleforday', (req, res) => {
    cartController.getSalesData(req, res);
});
//obtenemos las ventas del dia actual y que esten pagadas
router.get('/ventasdeldia', (req, res) => {
    cartController.getCurrentDaySales(req, res);
});
router.get('/saleforweek', (req, res) => {
    cartController.getSalesComparison(req, res);
});
router.get('/saleforDay', (req, res) => {
    cartController.getCurrentMonthSales(req, res);
});
router.get(('/saleformonth'), (req, res) => {
    cartController.getMonthlySalesComparison(req, res);
});
router.get('/:id', (req, res) => {
    cartController.getCartById(req, res);
});
router.get('/', (req, res) => {
    cartController.getAllCarts(req, res);
});
router.get('/user/:userId', (req, res) => {
    cartController.getCartByUserId(req, res);
});

router.get('/lastcart/:phone', (req, res) => {
    cartController.getCartByPhone(req, res);
});

router.get('/lastcart/:phone', (req, res) => {
    cartController.getCartByPhone(req, res);});

// Ruta para actualizar un carrito
// PUT /api/cart/:id

//rutas privadas
//ruta para cambiar el estado del carrito y notificar por email
router.put('/changestateforemail/:id',  (req, res) => {
    cartController.changeOrderAndSendNotification(req, res);})
// Ruta para actualizar un carrito y notificar por whatsapp
// router.put('/changestateforwhatsapp/:id', (req, res) => {
//     cartController.changerOrderForWhatsappNotification(req, res);
// });
router.put('/:id', isAdmin.verifyAdminToken, (req, res) => {
    cartController.updateCart(req, res);
});

// Ruta para eliminar un carrito
// DELETE /api/cart/:id
router.delete('/:id', isAdmin.verifyAdminToken, (req, res) => {
    cartController.deleteCart(req, res);
});

// Ruta para procesar el pago de un carrito
// POST /api/cart/:id/payment
router.post('/:id/payment',  (req, res) => {
    cartController.processPayment(req, res);
});

router.post('/:id/changedelivery', isAdmin.verifyAdminToken, (req, res) => {
    cartController.deliveryCart(req, res);
})

export default router;