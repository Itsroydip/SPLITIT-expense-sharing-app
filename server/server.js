import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config({ path: '../.env' })
import authRoutes from './src/routes/auth.routes.js'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())


// Routes
app.use('/api/auth', authRoutes)


// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' })
})


// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  })
})


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Database: ${process.env.DB_NAME}`)
})