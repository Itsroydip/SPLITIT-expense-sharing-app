import express from 'express'
import { getCategoryWiseSpending, getMonthlySpendingStats } from '../controllers/dashboard.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'


const router = express.Router()

// All settlement routes require authentication
router.use(authMiddleware)

// Get category-wise spending accross all groups
router.get('/category-spending', getCategoryWiseSpending)
// Get monthly spending statistics for dashboard
router.get('/monthly-spending', getMonthlySpendingStats)

export default router