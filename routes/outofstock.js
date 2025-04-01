const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const outOfStockController = require('../controllers/outofstock');

router.get('/', outOfStockController.getAllOutOfStock);

router.get('/:id', outOfStockController.getSingleOutOfStock);

router.post('/',
    [
        body('productType').notEmpty().withMessage('Product type is required'),
        body('productBrand').notEmpty().withMessage('Product brand is required'),
        body('productName').notEmpty().withMessage('Product name is required'),
        body('quantityToOrder').notEmpty().withMessage('Quantity must be a number and have weight unit'),
        body('netRatePerUnit').isNumeric().withMessage('Net rate must be a number'),
        body('requestDate').isISO8601().withMessage('Request date must be a valid date'),
    ],
    outOfStockController.createOutOfStock);

router.put('/:id',
    [
        body('productType').notEmpty().withMessage('Product type is required'),
        body('productBrand').notEmpty().withMessage('Product brand is required'),
        body('productName').notEmpty().withMessage('Product name is required'),
        body('quantityToOrder').notEmpty().withMessage('Quantity must be a number and have weight unit'),
        body('netRatePerUnit').isNumeric().withMessage('Net rate must be a number'),
        body('requestDate').isISO8601().withMessage('Request date must be a valid date'),
    ],
    outOfStockController.updateOutOfStock);

router.delete('/:id', outOfStockController.deleteOutOfStock);

module.exports = router;
