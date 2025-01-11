const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

// Swagger definition
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Kartfy Api',
            version: '1.0.0',
            description: 'API documentation for Kartfy application',
        },
        servers: [
            {
                url: 'http://localhost:3000/api/v1', // Base URL of your API
            },
        ],
    },

    apis: ['../routes/**/*.js'], // Path to your API routes for documentation
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);


exports.swaggerSetup = (app) => {
    // Swagger Page
    app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))
    // Documentation in JSON format
    app.get('/api/v1/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.send(swaggerDocs)
    })

}

