const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const mongodb = require('./data/database');
const cors = require('cors'); // Add this line

const app = express();
const PORT = process.env.PORT || 3001;

// Apply CORS Headers Globally
app.use(cors()); // Add this line
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    next();
});

app.use(bodyParser.json());

// Swagger UI Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Require routes>index.js
app.use('/', require('./routes'));

// Initialize MongoDB Connection and Start Server
mongodb.initDb((err) => {
    if (err) {
        console.log(err);
    } else {
        app.listen(PORT, () => {
            console.log(`Database is listening and Node.js server is running on port ${PORT}`);
        });
    }
});