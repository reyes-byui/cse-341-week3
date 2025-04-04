const mongodb = require('../data/database');
const { ObjectId } = require('mongodb');
const { validationResult } = require('express-validator');
const { ensureAuthenticated } = require('../middleware/auth'); // Import ensureAuthenticated

const getAll = async (req, res) => {
    //#swagger.tags=['Items']
    try {
        const result = await mongodb.getDatabase().collection('items').find().toArray();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving items', error });
    }
};

// get items by id
const getSingle = async (req, res) => {
    //#swagger.tags=['Items']
    try {
        const itemId = new ObjectId(req.params.id);
        const result = await mongodb.getDatabase().collection('items').findOne({ _id: itemId });

        if (!result) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving item', error });
    }
};

// create item
const createItem = async (req, res) => {
    ensureAuthenticated(req, res, async () => { // Protect route
        //#swagger.tags=['Items']
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const item = {
            productType: req.body.productType,
            productBrand: req.body.productBrand,
            productName: req.body.productName,
            weightPerUnit: req.body.weightPerUnit,
            pricePerUnit: req.body.pricePerUnit,
            sellingPrice: req.body.sellingPrice,
            expirationDate: req.body.expirationDate,
        };

        try {
            const response = await mongodb.getDatabase().collection('items').insertOne(item);
            res.status(201).json({ message: 'Item created', itemId: response.insertedId });
        } catch (error) {
            res.status(500).json({ message: 'Error creating item', error });
        }
    });
};

// update item
const updateItem = async (req, res) => {
    ensureAuthenticated(req, res, async () => { // Protect route
        //#swagger.tags=['Items']
        // Validate input
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
                weightPerUnit: req.body.weightPerUnit,
                pricePerUnit: req.body.pricePerUnit,
                sellingPrice: req.body.sellingPrice,
                expirationDate: req.body.expirationDate,
            };

            const response = await mongodb.getDatabase().collection('items').replaceOne({ _id: itemId }, item);
            if (response.modifiedCount === 0) {
                return res.status(404).json({ message: 'Item not found' });
            }
            res.status(200).json({ message: 'Item updated' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating item', error });
        }
    });
};

// delete item
const deleteItem = async (req, res) => {
    ensureAuthenticated(req, res, async () => { // Protect route
        //#swagger.tags=['Items']
        try {
            const itemId = new ObjectId(req.params.id);
            const response = await mongodb.getDatabase().collection('items').deleteOne({ _id: itemId }); // Use getDatabase
            if (response.deletedCount === 0) {
                return res.status(404).json({ message: 'Item not found' });
            }
            res.status(200).json({ message: 'Item deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting item', error });
        }
    });
};

module.exports = {
    getAll,
    getSingle,
    createItem,
    updateItem,
    deleteItem
};
