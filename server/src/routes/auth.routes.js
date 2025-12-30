import express from 'express'
import { register, login, getCurrentUser } from '../controllers/auth.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

// Public routes (no auth required)
router.post('/register', register)
router.post('/login', login)

// Protected route (auth required)
router.get('/me', authMiddleware, getCurrentUser)

export default router