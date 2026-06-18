import { Express } from 'express'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LSA API',
      version: '1.0.0',
      description: 'API para Lenguaje de Señas Argentino'
    },
    servers: [
      {
        url: 'http://localhost:3000'
      }
    ]
  },

  apis: ['./src/routes/*.ts']
}

const swaggerSpec = swaggerJsdoc(options)

export const setupSwagger = (app: Express) => {
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
  )
}