import { Express } from 'express'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CARPISEÑAS API',
      version: '1.0.0',
      description: 'API para enseñanza de Lenguaje de Señas Argentino'
    },
    tags: [
      { name: 'Auth', description: 'Operaciones de registro, login y tokens' },
    ],
    servers: [
      {
        url: 'http://localhost:3000'
      }
    ],
    components: {
      schemas: {
        LoginResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Login exitoso'
            },
            user: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '60d0fe4f5311236168a109ca'   
                },
                email: {
                  type: 'string',
                  example: 'maria@gmail.com'
                },
                full_name: {
                  type: 'string',
                  example: 'María Perez'
                }
              }
            },
            session: {
              type: 'object',
              properties: {
                access_token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                },
                expired_in: {
                  type: 'integer',
                  example: 3600
                }
              }
            }         
          }
        },
        RegisterResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Usuario registrado exitosamente'
            },
            user: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '60d0fe4f5311236168a109ca'
                },
                email: {
                  type: 'string',
                  example: 'maria@gmail.com'
                },
                full_name: {
                  type: 'string',
                  example: 'María Perez'
                },
                birth_date: {
                  type: 'string',
                  example: '1998-04-12'
                },
                gender: {
                  type: 'string',
                  example: 'Femenino'
                },
                country: {
                  type: 'string',
                  example: 'Argentina'
                }
              }
            }
          }
        }
      },
    }
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