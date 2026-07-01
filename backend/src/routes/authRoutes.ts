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
 *                 $ref: '#/components/schemas/LoginResponse'
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
 *               - first_name
 *               - last_name
 *               - birth_date
 *               - gender
 *               - country
 *             properties:
 *               email:
 *                 type: string
 *                 example: maria@gmail.com
 *               password:
 *                 type: string
 *                 example: Password123
 *               first_name:
 *                 type: string
 *                 example: Maria
 *               last_name:
 *                 type: string
 *                 example: Perez
 *               birth_date:
 *                 type: string
 *                 example: 1998-04-12
 *               gender:
 *                 type: string
 *                 example: Femenino
 *               country:
 *                 type: string
 *                 example: Argentina
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *         content:
 *           application/json:
 *              schema:
 *                  $ref: '#/components/schemas/RegisterResponse'
 */
router.post('/register', register)

export default router