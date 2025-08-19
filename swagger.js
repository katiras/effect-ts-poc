const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Payment API',
    description: 'Auto-generated API docs'
  },
  host: 'localhost:3000'
};

const outputFile = './swagger-output.json';
const routes = ['./index.ts'];

swaggerAutogen(outputFile, routes, doc);
