import joi from 'joi';

 const post_schemaBebida = joi.object({
    name: joi.string().min(3).max(100).required().messages({
        'string.base': 'El nombre debe ser un texto',
        'string.empty': 'El nombre no puede estar vacío',
        'string.min': 'El nombre debe tener al menos 3 caracteres',
        'string.max': 'El nombre no puede exceder los 100 caracteres',
        'any.required': 'El nombre es obligatorio'
    }),
    description: joi.string().min(10).max(500).required().messages({
        'string.base': 'La descripción debe ser un texto',
        'string.empty': 'La descripción no puede estar vacía',
        'string.min': 'La descripción debe tener al menos 10 caracteres',
        'string.max': 'La descripción no puede exceder los 500 caracteres',
        'any.required': 'La descripción es obligatoria'
    }),
    price: joi.number().positive().required().messages({
        'number.base': 'El precio debe ser un número',
        'number.empty': 'El precio no puede estar vacío',
        'number.positive': 'El precio debe ser un número positivo',
        'any.required': 'El precio es obligatorio'
    }),
    stock: joi.number().integer().min(0).required().messages({
        'number.base': 'El stock debe ser un número entero',
        'number.empty': 'El stock no puede estar vacío',
        'number.integer': 'El stock debe ser un número entero',
        'number.min': 'El stock debe ser al menos 0',
        'any.required': 'El stock es obligatorio'
    }),
    marca: joi.string().min(3).max(50).required().messages({
        'string.base': 'La marca debe ser un texto',
        'string.empty': 'La marca no puede estar vacía',
        'string.min': 'La marca debe tener al menos 3 caracteres',
        'string.max': 'La marca no puede exceder los 50 caracteres',
        'any.required': 'La marca es obligatoria'
    }),
    imagen: joi.string().uri().required().messages({
        'string.base': 'La imagen debe ser una URL válida',
        'string.empty': 'La imagen no puede estar vacía',
        'any.required': 'La imagen es obligatoria'
    }),
    sabor: joi.string().min(3).max(50).required().messages({
        'string.base': 'El sabor debe ser un texto',
        'string.empty': 'El sabor no puede estar vacío',
        'string.min': 'El sabor debe tener al menos 3 caracteres',
        'string.max': 'El sabor no puede exceder los 50 caracteres',
        'any.required': 'El sabor es obligatorio'
    }),
    tipo: joi.string().valid('Gaseosa', 'Cerveza', 'Jugo', 'Agua Saborizada', 'Agua Mineral', 'Vino').required().messages({
        'string.base': 'El tipo debe ser un texto',
        'string.empty': 'El tipo no puede estar vacío',
        'any.required': 'El tipo es obligatorio'
    })
}).options({ abortEarly: false });

const put_schemaBebida = joi.object({
    name: joi.string().min(3).max(100).optional().messages({
        'string.base': 'El nombre debe ser un texto',
        'string.empty': 'El nombre no puede estar vacío',
        'string.min': 'El nombre debe tener al menos 3 caracteres',
        'string.max': 'El nombre no puede exceder los 100 caracteres'
    }),
    description: joi.string().min(10).max(500).optional().messages({
        'string.base': 'La descripción debe ser un texto',
        'string.empty': 'La descripción no puede estar vacía',
        'string.min': 'La descripción debe tener al menos 10 caracteres',
        'string.max': 'La descripción no puede exceder los 500 caracteres'
    }),
    price: joi.number().positive().optional().messages({
        'number.base': 'El precio debe ser un número',
        'number.empty': 'El precio no puede estar vacío',
        'number.positive': 'El precio debe ser un número positivo'
    }),
    stock: joi.number().integer().min(0).optional().messages({
        'number.base': 'El stock debe ser un número entero',
        'number.empty': 'El stock no puede estar vacío',
        'number.integer': 'El stock debe ser un número entero',
        'number.min': 'El stock debe ser al menos 0'
    }),
    marca: joi.string().min(3).max(50).optional().messages({
        'string.base': 'La marca debe ser un texto',
        'string.empty': 'La marca no puede estar vacía',
        'string.min': 'La marca debe tener al menos 3 caracteres',
        'string.max': 'La marca no puede exceder los 50 caracteres'
    }),
    imagen: joi.string().uri().optional().messages({
        'string.base': 'La imagen debe ser una URL válida',
        'string.empty': 'La imagen no puede estar vacía'
    }),
    sabor: joi.string().min(3).max(50).optional().messages({
        'string.base': 'El sabor debe ser un texto',
        'string.empty': 'El sabor no puede estar vacío',
        'string.min': 'El sabor debe tener al menos 3 caracteres',
        'string.max': 'El sabor no puede exceder los 50 caracteres'
    }),
    tipo: joi.string().valid('Gaseosa', 'Cerveza', 'Jugo', 'Agua Saborizada', 'Agua Mineral', 'Vino').optional().messages({
        'string.base': 'El tipo debe ser un texto',
        'string.empty': 'El tipo no puede estar vacío'
    })
}).custom((value, helpers) => {
    // Validación personalizada para asegurarse de que al menos un campo sea proporcionado
    const { name, description, price, stock, marca, imagen, sabor, tipo } = value;
    if (!name && !description && !price && !stock && !marca && !imagen && !sabor && !tipo) {
        return helpers.error('any.required');
    }
    return value;
});
export { post_schemaBebida, put_schemaBebida };