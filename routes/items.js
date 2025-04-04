const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth'); // Import authentication middleware

const itemsController = require('../controllers/items');

router.get('/', itemsController.getAll);

router.get('/:id', itemsController.getSingle);

// Protect POST, PUT, and DELETE routes with ensureAuthenticated middleware
router.post('/',
    ensureAuthenticated, // Protect POST route
    [
        body('productType').notEmpty().withMessage('Product type is required'),
        body('productBrand').notEmpty().withMessage('Product brand is required'),
        body('productName').notEmpty().withMessage('Product name is required'),
        body('weightPerUnit').isNumeric().withMessage('Weight must be a number'),
        body('pricePerUnit').isNumeric().withMessage('Price must be a number'),
        body('sellingPrice').isNumeric().withMessage('Selling price must be a number'),
        body('expirationDate').isISO8601().withMessage('Expiration date must be a valid date'),
    ],
    itemsController.createItem
);

router.put('/:id',
    ensureAuthenticated, // Protect PUT route
    [
        body('productType').notEmpty().withMessage('Product type is required'),
        body('productBrand').notEmpty().withMessage('Product brand is required'),
        body('productName').notEmpty().withMessage('Product name is required'),
        body('weightPerUnit').isNumeric().withMessage('Weight must be a number'),
        body('pricePerUnit').isNumeric().withMessage('Price must be a number'),
        body('sellingPrice').isNumeric().withMessage('Selling price must be a number'),
        body('expirationDate').isISO8601().withMessage('Expiration date must be a valid date'),
    ],
    itemsController.updateItem
);

router.delete('/:id', ensureAuthenticated, itemsController.deleteItem); // Protect DELETE route

module.exports = router;