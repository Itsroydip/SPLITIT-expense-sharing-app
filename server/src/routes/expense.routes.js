import express from 'express'
import {
  addExpense,
  getGroupExpenses,
  getExpenseDetails,
  updateExpense,
  deleteExpense
} from '../controllers/expense.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

// All expense routes require authentication
router.use(authMiddleware)


// Add expense
router.post('/', addExpense)

// Get all expenses in a group
router.get('/group/:groupId', getGroupExpenses)

// Get expense details
router.get('/:id', getExpenseDetails)

// Update expense
router.put('/:id', updateExpense)

// Delete expense
router.delete('/:id', deleteExpense)

export default router