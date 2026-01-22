import express from 'express'
import {
  settleUp,
  getGroupSettlements,
  getUserBalance,
  getSettlementSuggestions,
  getMySettlements
} from '../controllers/settlement.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

// All settlement routes require authentication
router.use(authMiddleware)

// Settle up (mark payment)
router.post('/settle', settleUp)

// Get settlement history
router.get('/group/:groupId', getGroupSettlements)

// Get user's balance in a group
router.get('/balance/:groupId', getUserBalance)

// Get current user's pairwise settlements only
router.get('/my-settlements/:groupId', getMySettlements) 

// Get settlement suggestions
router.get('/suggestions/:groupId', getSettlementSuggestions)

export default router