import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
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

app.use(cors())
app.use(express.json({ limit: '6mb' }))

app.use('/api/auth', authRoutes)
app.use('/api', profileRoutes)
app.use('/api', progressRoutes)
app.use('/api', contentRoutes)
app.use('/api', alphabetRoutes)
app.use('/api', favoritesRoutes)
app.use('/api', gamificationRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'LSA API running' })
})

setupSwagger(app)

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

export default app
