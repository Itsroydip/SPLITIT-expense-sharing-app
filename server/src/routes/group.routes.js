import express from 'express'
import {
  createGroup,
  getUserGroups,
  getGroupDetails,
  joinGroup,
  leaveGroup,
  deleteGroup,
  addMember
} from '../controllers/group.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

// All group routes require authentication
router.use(authMiddleware)


// Create a group
router.post('/', createGroup)

// Get user's groups
router.get('/', getUserGroups)

// Get group details
router.get('/:id', getGroupDetails)

// Join a group
router.post('/:id/join', joinGroup)

// Add member to group
router.post('/:id/add-member', addMember)

// Leave a group
router.delete('/:id/leave', leaveGroup)

// Delete a group (creator only)
router.delete('/:id', deleteGroup)

export default router