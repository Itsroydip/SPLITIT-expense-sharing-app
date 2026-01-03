import  db  from '../db.js'
import { groups, groupMembers} from '../models/group.model.js'
import { expenseSplits, expenses } from '../models/expense.model.js'
import { users } from '../models/user.model.js'
import { eq, and, sql } from 'drizzle-orm'

//<----------------------------- Create a new group ----------------------------->//
export const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body
    const userId = req.user.userId

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Group name is required'
      })
    }

    // Create group
    const [newGroup] = await db
      .insert(groups)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        createdBy: userId
      })
      .returning()

    // Add creator as first member
    await db.insert(groupMembers).values({
      groupId: newGroup.id,
      userId: userId
    })

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: { group: newGroup }
    })
  } catch (error) {
    console.error('Create group error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create group'
    })
  }
}



//<-------------------------- Get all groups for current user -------------------------->//
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user.userId

    // Get groups where user is a member
    const userGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        createdBy: groups.createdBy,
        createdAt: groups.createdAt,
        joinedAt: groupMembers.joinedAt
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(eq(groupMembers.userId, userId))
      .orderBy(groups.createdAt)

    res.json({
      success: true,
      data: { groups: userGroups }
    })
  } catch (error) {
    console.error('Get user groups error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch groups'
    })
  }
}



//<---------------------------- Get group details with members ----------------------------->//
export const getGroupDetails = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    // Check if user is member of this group
    const [membership] = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, id),
          eq(groupMembers.userId, userId)
        )
      )
      .limit(1)

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group'
      })
    }

    // Get group details
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, id))
      .limit(1)

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      })
    }

    // Get all members
    const members = await db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
        joinedAt: groupMembers.joinedAt
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.groupId, id))

    res.json({
      success: true,
      data: {
        group,
        members
      }
    })
  } catch (error) {
    console.error('Get group details error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group details'
    })
  }
}



//<---------------------------------- Join a group ---------------------------------->//
export const joinGroup = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    // Check if group exists
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, id))
      .limit(1)

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      })
    }

    // Check if already a member
    const [existingMember] = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, id),
          eq(groupMembers.userId, userId)
        )
      )
      .limit(1)

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group'
      })
    }

    // Add user to group
    const [newMember] = await db
      .insert(groupMembers)
      .values({
        groupId: id,
        userId: userId
      })
      .returning()

    res.status(201).json({
      success: true,
      message: 'Joined group successfully',
      data: { membership: newMember }
    })
  } catch (error) {
    console.error('Join group error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to join group'
    })
  }
}



//<------------------------- Add member to group (by creator or admin) ------------------------->//

export const addMember = async (req, res) => {
  try {
    const { id } = req.params // group id
    const { username } = req.body // username of person to add
    const userId = req.user.userId // current user

    // Validation
    if (!username || username.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      })
    }

    // Check if group exists
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, id))
      .limit(1)

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      })
    }

    // Check if current user is a member of the group
    const [currentUserMembership] = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, id),
          eq(groupMembers.userId, userId)
        )
      )
      .limit(1)

    if (!currentUserMembership) {
      return res.status(403).json({
        success: false,
        message: 'Only group members can add others'
      })
    }

    // Find user to add by username
    const [userToAdd] = await db
      .select()
      .from(users)
      .where(eq(users.username, username.trim()))
      .limit(1)

    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: `User with username "${username}" not found`
      })
    }

    // Check if user is already a member
    const [existingMember] = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, id),
          eq(groupMembers.userId, userToAdd.id)
        )
      )
      .limit(1)

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: `${username} is already a member of this group`
      })
    }

    // Add user to group
    await db.insert(groupMembers).values({
      groupId: id,
      userId: userToAdd.id
    })

    res.status(201).json({
      success: true,
      message: `${username} added to group successfully`,
      data: {
        username: userToAdd.username,
        fullName: userToAdd.fullName
      }
    })
  } catch (error) {
    console.error('Add member error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to add member'
    })
  }
}


//<---------------------------------- Leave a group ---------------------------------->//
export const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    // Check if user is member
    const [membership] = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, id),
          eq(groupMembers.userId, userId)
        )
      )
      .limit(1)

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'You are not a member of this group'
      })
    }

    // Check for unsettled expenses
    const unsettledSplits = await db
      .select()
      .from(expenseSplits)
      .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
      .where(
        and(
          eq(expenses.groupId, id),
          eq(expenseSplits.userId, userId),
          eq(expenseSplits.isSettled, false)
        )
      )

    if (unsettledSplits.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot leave group with unsettled expenses. Please settle all expenses first.'
      })
    }

    // Remove from group
    await db
      .delete(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, id),
          eq(groupMembers.userId, userId)
        )
      )

    res.json({
      success: true,
      message: 'Left group successfully'
    })
  } catch (error) {
    console.error('Leave group error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to leave group'
    })
  }
}



//<------------------------- Delete a group (only creator) ------------------------->//
export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    // Get group
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, id))
      .limit(1)

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      })
    }

    // Check if user is creator
    if (group.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only group creator can delete the group'
      })
    }

    // Delete group (cascade will delete members, expenses, splits, settlements)
    await db.delete(groups).where(eq(groups.id, id))

    res.json({
      success: true,
      message: 'Group deleted successfully'
    })
  } catch (error) {
    console.error('Delete group error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete group'
    })
  }
}



