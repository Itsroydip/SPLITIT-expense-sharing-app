import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())

// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' })
})



// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})