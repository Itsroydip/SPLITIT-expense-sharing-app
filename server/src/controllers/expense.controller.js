import db from '../db.js'
import { expenses, expenseSplits } from '../models/expense.model.js'
import { groups, groupMembers } from '../models/group.model.js'
import { users } from '../models/user.model.js'
import { eq, and } from 'drizzle-orm'


//<----------------------------- Add expense ----------------------------->//
export const addExpense = async (req, res) => {
  try {
    const { groupId, amount, description, category, splitType, splits } = req.body
    const userId = req.user.userId

    // Validation
    if (!groupId || !amount || !description || !category || !splitType) {
      return res.status(400).json({
        success: false,
        message: 'groupId, amount, description, category, and splitType are required'
      })
    }

    if (!['equal', 'unequal', 'percentage'].includes(splitType)) {
      return res.status(400).json({
        success: false,
        message: 'splitType must be equal, unequal, or percentage'
      })
    }

    // Check if group exists
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, groupId))
      .limit(1)

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      })
    }

    // Check if user is member of group
    const [membership] = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
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

    // Get all group members
    const members = await db
      .select({
        userId: groupMembers.userId
      })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId))

    if (members.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Group has no members'
      })
    }

    // Create expense
    const [newExpense] = await db
      .insert(expenses)
      .values({
        groupId,
        paidBy: userId,
        amount: amount.toString(),
        description: description.trim(),
        category,
        splitType
      })
      .returning()

    // Calculate splits based on splitType
    let calculatedSplits = []

    if (splitType === 'equal') {
      // Equal split: divide amount equally among all members
      const amountPerPerson = (parseFloat(amount) / members.length).toFixed(2)
      
      calculatedSplits = members.map(member => ({
        expenseId: newExpense.id,
        userId: member.userId,
        amountOwed: amountPerPerson,
        percentage: null,
        isSettled: member.userId === userId // Auto-settle for person who paid
      }))
    } 
    else if (splitType === 'unequal') {
      // Unequal split: splits provided in request body
      if (!splits || !Array.isArray(splits)) {
        return res.status(400).json({
          success: false,
          message: 'splits array is required for unequal split'
        })
      }

      // Validate splits
      const totalSplitAmount = splits.reduce((sum, split) => sum + parseFloat(split.amount), 0)
      if (Math.abs(totalSplitAmount - parseFloat(amount)) > 0.01) {
        return res.status(400).json({
          success: false,
          message: `Split amounts (${totalSplitAmount}) must equal total amount (${amount})`
        })
      }

      // Validate all users are group members
      const splitUserIds = splits.map(s => s.userId)
      const memberUserIds = members.map(m => m.userId)
      const invalidUsers = splitUserIds.filter(id => !memberUserIds.includes(id))
      
      if (invalidUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'All split users must be group members'
        })
      }

      calculatedSplits = splits.map(split => ({
        expenseId: newExpense.id,
        userId: split.userId,
        amountOwed: parseFloat(split.amount).toFixed(2),
        percentage: null,
        isSettled: split.userId === userId
      }))
    } 
    else if (splitType === 'percentage') {
      // Percentage split: splits with percentages provided
      if (!splits || !Array.isArray(splits)) {
        return res.status(400).json({
          success: false,
          message: 'splits array with percentages is required for percentage split'
        })
      }

      // Validate percentages add up to 100
      const totalPercentage = splits.reduce((sum, split) => sum + parseFloat(split.percentage), 0)
      if (Math.abs(totalPercentage - 100) > 0.01) {
        return res.status(400).json({
          success: false,
          message: `Percentages must add up to 100 (got ${totalPercentage})`
        })
      }

      // Validate all users are group members
      const splitUserIds = splits.map(s => s.userId)
      const memberUserIds = members.map(m => m.userId)
      const invalidUsers = splitUserIds.filter(id => !memberUserIds.includes(id))
      
      if (invalidUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'All split users must be group members'
        })
      }

      calculatedSplits = splits.map(split => {
        const amountOwed = (parseFloat(amount) * parseFloat(split.percentage) / 100).toFixed(2)
        return {
          expenseId: newExpense.id,
          userId: split.userId,
          amountOwed: amountOwed,
          percentage: parseFloat(split.percentage).toFixed(2),
          isSettled: split.userId === userId
        }
      })
    }

    // Insert splits
    await db.insert(expenseSplits).values(calculatedSplits)

    // Get splits with user info for response
    const splitsWithUsers = await db
      .select({
        id: expenseSplits.id,
        userId: expenseSplits.userId,
        username: users.username,
        amountOwed: expenseSplits.amountOwed,
        percentage: expenseSplits.percentage,
        isSettled: expenseSplits.isSettled
      })
      .from(expenseSplits)
      .innerJoin(users, eq(expenseSplits.userId, users.id))
      .where(eq(expenseSplits.expenseId, newExpense.id))

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: {
        expense: newExpense,
        splits: splitsWithUsers
      }
    })
  } catch (error) {
    console.error('Add expense error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to add expense'
    })
  }
}



//<-------------------------- Get all expenses in a group ------------------------->//
export const getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params
    const userId = req.user.userId

    // Check if user is member
    const [membership] = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
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

    // Get all expenses with payer info
    const groupExpenses = await db
      .select({
        id: expenses.id,
        amount: expenses.amount,
        description: expenses.description,
        category: expenses.category,
        splitType: expenses.splitType,
        createdAt: expenses.createdAt,
        paidBy: expenses.paidBy,
        paidByUsername: users.username,
        paidByFullName: users.fullName
      })
      .from(expenses)
      .innerJoin(users, eq(expenses.paidBy, users.id))
      .where(eq(expenses.groupId, groupId))
      .orderBy(expenses.createdAt)

    res.json({
      success: true,
      data: { expenses: groupExpenses }
    })
  } catch (error) {
    console.error('Get group expenses error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expenses'
    })
  }
}




//<------------------------- Get expense details with splits ------------------------->//
export const getExpenseDetails = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    // Get expense
    const [expense] = await db
      .select({
        id: expenses.id,
        groupId: expenses.groupId,
        amount: expenses.amount,
        description: expenses.description,
        category: expenses.category,
        splitType: expenses.splitType,
        createdAt: expenses.createdAt,
        paidBy: expenses.paidBy,
        paidByUsername: users.username,
        paidByFullName: users.fullName
      })
      .from(expenses)
      .innerJoin(users, eq(expenses.paidBy, users.id))
      .where(eq(expenses.id, id))
      .limit(1)

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      })
    }

    // Check if user is member of the group
    const [membership] = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, expense.groupId),
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

    // Get splits
    const splits = await db
      .select({
        id: expenseSplits.id,
        userId: expenseSplits.userId,
        username: users.username,
        fullName: users.fullName,
        amountOwed: expenseSplits.amountOwed,
        percentage: expenseSplits.percentage,
        isSettled: expenseSplits.isSettled,
        settledAt: expenseSplits.settledAt
      })
      .from(expenseSplits)
      .innerJoin(users, eq(expenseSplits.userId, users.id))
      .where(eq(expenseSplits.expenseId, id))

    res.json({
      success: true,
      data: {
        expense,
        splits
      }
    })
  } catch (error) {
    console.error('Get expense details error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense details'
    })
  }
}



//<----------------------------------- Update expense ---------------------------------->//
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params
    const { description, category } = req.body
    const userId = req.user.userId

    // Get expense
    const [expense] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, id))
      .limit(1)

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      })
    }

    // Only person who paid can update
    if (expense.paidBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the person who paid can update this expense'
      })
    }

    // Update expense
    const [updatedExpense] = await db
      .update(expenses)
      .set({
        description: description?.trim() || expense.description,
        category: category || expense.category
      })
      .where(eq(expenses.id, id))
      .returning()

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: { expense: updatedExpense }
    })
  } catch (error) {
    console.error('Update expense error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update expense'
    })
  }
}



//<------------------------------- Delete expense ------------------------------->//
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    // Get expense
    const [expense] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, id))
      .limit(1)

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      })
    }

    // Only person who paid can delete
    if (expense.paidBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the person who paid can delete this expense'
      })
    }

    // Delete expense (cascade will delete splits)
    await db.delete(expenses).where(eq(expenses.id, id))

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    })
  } catch (error) {
    console.error('Delete expense error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense'
    })
  }
}