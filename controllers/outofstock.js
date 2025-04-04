const mongodb = require('../data/database');
const { ObjectId } = require('mongodb');
const { validationResult } = require('express-validator');
const { ensureAuthenticated } = require('../middleware/auth'); // Import authentication middleware

// Get all outofstock items
const getAllOutOfStock = async (req, res) => {
    //#swagger.tags=['OutOfStock']
    try {
        const result = await mongodb.getDatabase().collection('outofstock').find().toArray();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving out-of-stock items', error });
    }
};

// Get outofstock item by id
const getSingleOutOfStock = async (req, res) => {
    //#swagger.tags=['OutOfStock']
    try {
        const itemId = new ObjectId(req.params.id);
        const result = await mongodb.getDatabase().collection('outofstock').findOne({ _id: itemId });

        if (!result) {
            return res.status(404).json({ message: 'Out-of-stock item not found' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving out-of-stock item', error });
    }
};

// Create outofstock item
const createOutOfStock = async (req, res) => {
    ensureAuthenticated(req, res, async () => { // Protect route
        //#swagger.tags=['OutOfStock']
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const item = {
            productType: req.body.productType,
            productBrand: req.body.productBrand,
            productName: req.body.productName,
            quantityToOrder: req.body.quantityToOrder,
            netRatePerUnit: req.body.netRatePerUnit,
            requestDate: req.body.requestDate,
        };

        try {
            const response = await mongodb.getDatabase().collection('outofstock').insertOne(item);
            res.status(201).json({ message: 'Out-of-stock item created', itemId: response.insertedId });
        } catch (error) {
            res.status(500).json({ message: 'Error creating out-of-stock item', error });
        }
    });
};

// Update outofstock item
const updateOutOfStock = async (req, res) => {
    ensureAuthenticated(req, res, async () => { // Protect route
        //#swagger.tags=['OutOfStock']
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const itemId = new ObjectId(req.params.id);
            const item = {
                productType: req.body.productType,
                productBrand: req.body.productBrand,
                productName: req.body.productName,
                quantityToOrder: req.body.quantityToOrder,
                netRatePerUnit: req.body.netRatePerUnit,
                requestDate: req.body.requestDate,
            };

            const response = await mongodb.getDatabase().collection('outofstock').replaceOne({ _id: itemId }, item);
            if (response.modifiedCount === 0) {
                return res.status(404).json({ message: 'Out-of-stock item not found' });
            }
            res.status(200).json({ message: 'Out-of-stock item updated' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating out-of-stock item', error });
        }
    });
};

// Delete outofstock item
const deleteOutOfStock = async (req, res) => {
    ensureAuthenticated(req, res, async () => { // Protect route
        //#swagger.tags=['OutOfStock']
        try {
            const itemId = new ObjectId(req.params.id);
            const response = await mongodb.getDatabase().collection('outofstock').deleteOne({ _id: itemId });

            if (response.deletedCount === 0) {
                return res.status(404).json({ message: 'Out-of-stock item not found' });
            }
            res.status(200).json({ message: 'Out-of-stock item deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting out-of-stock item', error });
        }
    });
};

module.exports = {
    getAllOutOfStock,
    getSingleOutOfStock,
    createOutOfStock,
    updateOutOfStock,
    deleteOutOfStock,
};
