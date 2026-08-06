import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/authRoutes'
import profileRoutes from './routes/profileRoutes'
import progressRoutes from './routes/progressRoutes'
import contentRoutes from './routes/contentRoutes'
import alphabetRoutes from './routes/alphabetRoutes'
import favoritesRoutes from './routes/favoritesRoutes'
import gamificationRoutes from './routes/gamificationRoutes'
import { setupSwagger } from './docs/swagger'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Vercel/proxies exponen la IP real vía X-Forwarded-For; sin esto, express-rate-limit
// cuenta todas las requests como si vinieran de una sola IP.
app.set('trust proxy', 1)

app.use(cors({
  origin: ['https://carpisenias.vercel.app', 'http://localhost:8081'],
}))

// Límite ampliado sólo para el avatar (viaja en base64 dentro del body JSON);
// va antes del parser global para que corra primero en esa ruta puntual —
// body-parser detecta el body ya parseado y el siguiente parser no lo repite.
app.use('/api/profile/avatar', express.json({ limit: '6mb' }))
app.use(express.json({ limit: '100kb' }))

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Probá de nuevo en unos minutos.' },
})

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api', profileRoutes)
app.use('/api', progressRoutes)
app.use('/api', contentRoutes)
app.use('/api', alphabetRoutes)
app.use('/api', favoritesRoutes)
app.use('/api', gamificationRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'LSA API running' })
})

/**
 * Diagnóstico temporal para confirmar `trust proxy` en Vercel: pegarle desde dos
 * redes distintas (wifi de casa vs datos móviles) y comparar `ip`. Si difiere,
 * el rate limiter está contando por IP real y no por el hop interno de Vercel.
 * Sacar esta ruta una vez confirmado.
 */
app.get('/api/_debug/ip', (req, res) => {
  res.json({ ip: req.ip, xForwardedFor: req.headers['x-forwarded-for'] })
})

setupSwagger(app)

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

export default app
