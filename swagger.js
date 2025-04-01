const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: "Items API",
        description: "API for Managing Items and Out-of-Stock Items"
    },
    host: "cse-341-project3-bc0r.onrender.com", 
    basePath: "/", 
    schemes: ["https"]
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js', './routes/outofstock.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);