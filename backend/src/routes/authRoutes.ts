import { Router } from 'express'
import { login, register } from '../controllers/authController'

const router = Router()

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: maria@gmail.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Login exitoso"
 *                  user:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: string
 *                        example: "60d0fe4f5311236168a109ca"
 *                      email:
 *                        type: string
 *                        example: maria@gmail.com
 *                      full_name:
 *                        type: string
 *                        example: Maria Perez
 *                  session:
 *                     type: object
 *                     properties:
 *                       token: 
 *                         type: string
 *                         example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                       expires_in:
 *                          type: integer
 *                          example: 3600
 */
router.post('/login', login)


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un usuario
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - full_name
 *               - birth_date
 *             properties:
 *               email:
 *                 type: string
 *                 example: maria@gmail.com
 *               password:
 *                 type: string
 *                 example: Password123
 *               full_name:
 *                 type: string
 *                 example: Maria Perez
 *               birth_date:
 *                 type: string
 *                 example: 1998-04-12
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Usuario registrado exitosamente"
 *                  user:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: string
 *                        example: "60d0fe4f5311236168a109ca"
 *                      email:
 *                        type: string
 *                        example: maria@gmail.com
 *                      full_name:
 *                        type: string
 *                        example: Maria Perez
 *                      birth_date:
 *                        type: string
 *                        example: "1998-04-12"
 */
router.post('/register', register)

export default router