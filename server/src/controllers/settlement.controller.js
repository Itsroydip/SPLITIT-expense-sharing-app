import db from '../db.js'
import { settlements } from '../models/settlement.model.js'
import { expenses, expenseSplits } from '../models/expense.model.js'
import { groupMembers } from '../models/group.model.js'
import { users } from '../models/user.model.js'
import { eq, and, sql } from 'drizzle-orm'


//<----------------------- Settle up - mark splits as paid ----------------------->//
// client sends: { groupId, toUserId, amount, notes } 
// ✅APPROACH: Mark ALL unsettled splits between these two users as settled
export const settleUp = async (req, res) => {
  try {
    const { groupId, toUserId, amount, notes } = req.body
    const fromUserId = req.user.userId

    // Validation
    if (!groupId || !toUserId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'groupId, toUserId, and amount are required'
      })
    }

    if (parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      })
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot settle with yourself'
      })
    }

    // Check if both users are members
    const memberships = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          sql`${groupMembers.userId} IN (${fromUserId}, ${toUserId})`
        )
      )

    if (memberships.length !== 2) {
      return res.status(403).json({
        success: false,
        message: 'Both users must be members of this group'
      })
    }

    // Calculate actual pairwise net between these two users
    const fromOwesToResult = await db
      .select({
        total: sql`COALESCE(SUM(CAST(${expenseSplits.amountOwed} AS DECIMAL)), 0)`
      })
      .from(expenseSplits)
      .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
      .where(
        and(
          eq(expenses.groupId, groupId),
          eq(expenseSplits.userId, fromUserId),
          eq(expenses.paidBy, toUserId),
          eq(expenseSplits.isSettled, false)
        )
      )

    const toOwesFromResult = await db
      .select({
        total: sql`COALESCE(SUM(CAST(${expenseSplits.amountOwed} AS DECIMAL)), 0)`
      })
      .from(expenseSplits)
      .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
      .where(
        and(
          eq(expenses.groupId, groupId),
          eq(expenseSplits.userId, toUserId),
          eq(expenses.paidBy, fromUserId),
          eq(expenseSplits.isSettled, false)
        )
      )

    const fromOwesTo = parseFloat(fromOwesToResult[0]?.total || 0)
    const toOwesFrom = parseFloat(toOwesFromResult[0]?.total || 0)
    const pairwiseNet = fromOwesTo - toOwesFrom

    console.log('=== SETTLEMENT DEBUG ===')
    console.log(`From user owes to user: ₹${fromOwesTo}`)
    console.log(`To user owes from user: ₹${toOwesFrom}`)
    console.log(`Pairwise net: ₹${pairwiseNet}`)
    console.log(`Settlement amount: ₹${amount}`)

    if (pairwiseNet <= 0) {
      return res.status(400).json({
        success: false,
        message: toOwesFrom > 0
          ? `You don't owe this user. They owe you ₹${toOwesFrom.toFixed(2)}`
          : 'No outstanding balance between you and this user'
      })
    }

    // Validate amount matches pairwise net (allow small difference for rounding)
    if (Math.abs(parseFloat(amount) - pairwiseNet) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Amount should be ₹${pairwiseNet.toFixed(2)} (the net amount between you two)`,
        data: {
          expectedAmount: pairwiseNet.toFixed(2),
          providedAmount: parseFloat(amount).toFixed(2)
        }
      })
    }

    // Get all splits to settle
    const fromUserSplits = await db
      .select({
        splitId: expenseSplits.id,
        amountOwed: expenseSplits.amountOwed,
        description: expenses.description
      })
      .from(expenseSplits)
      .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
      .where(
        and(
          eq(expenses.groupId, groupId),
          eq(expenseSplits.userId, fromUserId),
          eq(expenses.paidBy, toUserId),
          eq(expenseSplits.isSettled, false)
        )
      )

    const toUserSplits = await db
      .select({
        splitId: expenseSplits.id,
        amountOwed: expenseSplits.amountOwed,
        description: expenses.description
      })
      .from(expenseSplits)
      .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
      .where(
        and(
          eq(expenses.groupId, groupId),
          eq(expenseSplits.userId, toUserId),
          eq(expenses.paidBy, fromUserId),
          eq(expenseSplits.isSettled, false)
        )
      )

    const settledSplits = []

    // Mark ALL splits where fromUser owes toUser as settled
    for (const split of fromUserSplits) {
      await db
        .update(expenseSplits)
        .set({
          isSettled: true,
          settledAt: new Date(),
          settledWith: toUserId
        })
        .where(eq(expenseSplits.id, split.splitId))

      settledSplits.push({
        description: split.description,
        amount: split.amountOwed,
        type: 'paid'
      })
      console.log(`✓ Settled: ${split.description} - ₹${split.amountOwed}`)
    }

    // Mark ALL splits where toUser owes fromUser as settled (offset)
    for (const split of toUserSplits) {
      await db
        .update(expenseSplits)
        .set({
          isSettled: true,
          settledAt: new Date(),
          settledWith: fromUserId
        })
        .where(eq(expenseSplits.id, split.splitId))

      settledSplits.push({
        description: split.description,
        amount: split.amountOwed,
        type: 'offset'
      })
      console.log(`✓ Offset: ${split.description} - ₹${split.amountOwed}`)
    }

    // Create settlement record
    const [settlement] = await db
      .insert(settlements)
      .values({
        groupId,
        fromUser: fromUserId,
        toUser: toUserId,
        amount: parseFloat(amount).toFixed(2),
        notes: notes || null
      })
      .returning()

    console.log(`✅ Settlement recorded: ₹${amount}`)
    console.log(`Total splits settled: ${settledSplits.length}`)

    res.status(201).json({
      success: true,
      message: 'All expenses between you two are now settled',
      data: {
        settlement,
        settledSplits,
        totalSplitsSettled: settledSplits.length,
        pairwiseNet: pairwiseNet.toFixed(2)
      }
    })
  } catch (error) {
    console.error('Settle up error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to record settlement',
      error: error.message
    })
  }
}



//<------------------------ Get settlement history for a group ------------------------->//
export const getGroupSettlements = async (req, res) => {
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

    // Get all settlements with user info
    const groupSettlements = await db
      .select({
        id: settlements.id,
        amount: settlements.amount,
        notes: settlements.notes,
        settledAt: settlements.settledAt,
        fromUserId: settlements.fromUser,
        fromUsername: sql`from_user.username`,
        fromFullName: sql`from_user.full_name`,
        toUserId: settlements.toUser,
        toUsername: sql`to_user.username`,
        toFullName: sql`to_user.full_name`
      })
      .from(settlements)
      .leftJoin(
        sql`${users} as from_user`,
        eq(settlements.fromUser, sql`from_user.id`)
      )
      .leftJoin(
        sql`${users} as to_user`,
        eq(settlements.toUser, sql`to_user.id`)
      )
      .where(eq(settlements.groupId, groupId))
      .orderBy(settlements.settledAt)

    res.json({
      success: true,
      data: { settlements: groupSettlements }
    })
  } catch (error) {
    console.error('Get settlements error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settlements'
    })
  }
}



//<--------------------- Get balance summary for user in a group --------------------->//
export const getUserBalance = async (req, res) => {
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

    // Calculate amount user is owed (what others owe user)
  const owedToMeResult = await db
  .select({
    total: sql`COALESCE(SUM(CAST(${expenseSplits.amountOwed} AS DECIMAL)), 0)`
  })
  .from(expenseSplits)
  .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
  .where(
    and(
      eq(expenses.groupId, groupId),
      eq(expenses.paidBy, userId),
      eq(expenseSplits.isSettled, false),
      sql`${expenseSplits.userId} != ${userId}`  // Exclude user's own split
    )
  )

    // Calculate amount user owes (expenses others paid)
    const iOweResult = await db
      .select({
        total: sql`COALESCE(SUM(CAST(${expenseSplits.amountOwed} AS DECIMAL)), 0)`
      })
      .from(expenseSplits)
      .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
      .where(
        and(
          eq(expenses.groupId, groupId),
          eq(expenseSplits.userId, userId),
          eq(expenseSplits.isSettled, false),
          sql`${expenses.paidBy} != ${userId}`
        )
      )

    const owedToMe = parseFloat(owedToMeResult[0]?.total || 0)
    const iOwe = parseFloat(iOweResult[0]?.total || 0)
    const netBalance = owedToMe - iOwe

    // Get breakdown of who owes you
    const oweMeBreakdown = await db
      .select({
        userId: expenseSplits.userId,
        username: users.username,
        fullName: users.fullName,
        totalOwed: sql`SUM(CAST(${expenseSplits.amountOwed} AS DECIMAL))`
      })
      .from(expenseSplits)
      .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
      .innerJoin(users, eq(expenseSplits.userId, users.id))
      .where(
        and(
          eq(expenses.groupId, groupId),
          eq(expenses.paidBy, userId),
          eq(expenseSplits.isSettled, false),
          sql`${expenseSplits.userId} != ${userId}`
        )
      )
      .groupBy(expenseSplits.userId, users.username, users.fullName)

    // Get breakdown of who you owe
    const iOweBreakdown = await db
      .select({
        userId: expenses.paidBy,
        username: users.username,
        fullName: users.fullName,
        totalOwed: sql`SUM(CAST(${expenseSplits.amountOwed} AS DECIMAL))`
      })
      .from(expenseSplits)
      .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
      .innerJoin(users, eq(expenses.paidBy, users.id))
      .where(
        and(
          eq(expenses.groupId, groupId),
          eq(expenseSplits.userId, userId),
          eq(expenseSplits.isSettled, false),
          sql`${expenses.paidBy} != ${userId}`
        )
      )
      .groupBy(expenses.paidBy, users.username, users.fullName)

    res.json({
      success: true,
      data: {
        netBalance: netBalance.toFixed(2),
        owedToMe: owedToMe.toFixed(2),
        iOwe: iOwe.toFixed(2),
        oweMeBreakdown: oweMeBreakdown.map(item => ({
          ...item,
          totalOwed: parseFloat(item.totalOwed).toFixed(2)
        })),
        iOweBreakdown: iOweBreakdown.map(item => ({
          ...item,
          totalOwed: parseFloat(item.totalOwed).toFixed(2)
        }))
      }
    })
  } catch (error) {
    console.error('Get user balance error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to calculate balance'
    })
  }
}


//<---------------------- Get current user's pairwise settlements only ----------------------->//
export const getMySettlements = async (req, res) => {
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

    // Get all other members in the group
    const otherMembers = await db
      .select({
        userId: groupMembers.userId,
        username: users.username,
        fullName: users.fullName
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          sql`${groupMembers.userId} != ${userId}`
        )
      )

    // Calculate pairwise balance with each other member
    const mySettlements = []

    for (const otherMember of otherMembers) {
      // Amount current user owes other member
      const iOweThemResult = await db
        .select({
          total: sql`COALESCE(SUM(CAST(${expenseSplits.amountOwed} AS DECIMAL)), 0)`
        })
        .from(expenseSplits)
        .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
        .where(
          and(
            eq(expenses.groupId, groupId),
            eq(expenseSplits.userId, userId),
            eq(expenses.paidBy, otherMember.userId),
            eq(expenseSplits.isSettled, false)
          )
        )

      // Amount other member owes current user
      const theyOweMeResult = await db
        .select({
          total: sql`COALESCE(SUM(CAST(${expenseSplits.amountOwed} AS DECIMAL)), 0)`
        })
        .from(expenseSplits)
        .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
        .where(
          and(
            eq(expenses.groupId, groupId),
            eq(expenseSplits.userId, otherMember.userId),
            eq(expenses.paidBy, userId),
            eq(expenseSplits.isSettled, false)
          )
        )

      const iOweThem = parseFloat(iOweThemResult[0]?.total || 0)
      const theyOweMe = parseFloat(theyOweMeResult[0]?.total || 0)
      const netAmount = iOweThem - theyOweMe

      // Only include if there's a net balance
      if (Math.abs(netAmount) > 0.01) {
        if (netAmount > 0) {
          // User owes this member
          mySettlements.push({
            type: 'i_owe',
            to: {
              userId: otherMember.userId,
              username: otherMember.username,
              fullName: otherMember.fullName
            },
            amount: netAmount.toFixed(2)
          })
        } else {
          // This member owes user
          mySettlements.push({
            type: 'owes_me',
            from: {
              userId: otherMember.userId,
              username: otherMember.username,
              fullName: otherMember.fullName
            },
            amount: Math.abs(netAmount).toFixed(2)
          })
        }
      }
    }

    // Sort: what I owe first (highest first), then what's owed to me
    const iOwe = mySettlements
      .filter(s => s.type === 'i_owe')
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))

    const oweMe = mySettlements
      .filter(s => s.type === 'owes_me')
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))

    // Calculate totals
    const totalIOwe = iOwe.reduce((sum, s) => sum + parseFloat(s.amount), 0)
    const totalOweMe = oweMe.reduce((sum, s) => sum + parseFloat(s.amount), 0)

    res.json({
      success: true,
      data: {
        iOwe,
        oweMe,
        summary: {
          totalIOwe: totalIOwe.toFixed(2),
          totalOweMe: totalOweMe.toFixed(2),
          netBalance: (totalOweMe - totalIOwe).toFixed(2)
        }
      }
    })
  } catch (error) {
    console.error('Get my settlements error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your settlements'
    })
  }
}


//<------------------ Get settlement suggestions (detailed pairwise calculation) ------------------>//
export const getSettlementSuggestions = async (req, res) => {
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

    // Get all members
    const members = await db
      .select({
        userId: groupMembers.userId,
        username: users.username,
        fullName: users.fullName
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.groupId, groupId))

    // Calculate pairwise net balances
    const pairwiseSettlements = []

    // For each pair of members
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const memberA = members[i]
        const memberB = members[j]

        // Amount A owes B (B paid, A's splits)
        const aOwesBResult = await db
          .select({
            total: sql`COALESCE(SUM(CAST(${expenseSplits.amountOwed} AS DECIMAL)), 0)`
          })
          .from(expenseSplits)
          .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
          .where(
            and(
              eq(expenses.groupId, groupId),
              eq(expenseSplits.userId, memberA.userId),
              eq(expenses.paidBy, memberB.userId),
              eq(expenseSplits.isSettled, false)
            )
          )

        // Amount B owes A (A paid, B's splits)
        const bOwesAResult = await db
          .select({
            total: sql`COALESCE(SUM(CAST(${expenseSplits.amountOwed} AS DECIMAL)), 0)`
          })
          .from(expenseSplits)
          .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
          .where(
            and(
              eq(expenses.groupId, groupId),
              eq(expenseSplits.userId, memberB.userId),
              eq(expenses.paidBy, memberA.userId),
              eq(expenseSplits.isSettled, false)
            )
          )

        const aOwesB = parseFloat(aOwesBResult[0]?.total || 0)
        const bOwesA = parseFloat(bOwesAResult[0]?.total || 0)
        const netAmount = aOwesB - bOwesA

        console.log(
          `${memberA.username} ↔ ${memberB.username}: ` +
          `A owes B: ₹${aOwesB}, B owes A: ₹${bOwesA}, Net: ₹${netAmount}`
        )

        // Only add if there's a net balance (ignore if perfectly balanced)
        if (Math.abs(netAmount) > 0.01) {
          pairwiseSettlements.push({
            from: netAmount > 0 ? memberA : memberB,
            to: netAmount > 0 ? memberB : memberA,
            amount: Math.abs(netAmount)
          })
        }
      }
    }

    // Sort by amount descending (largest debts first)
    pairwiseSettlements.sort((a, b) => b.amount - a.amount)

    // Format suggestions
    const suggestions = pairwiseSettlements.map(settlement => ({
      from: {
        userId: settlement.from.userId,
        username: settlement.from.username,
        fullName: settlement.from.fullName
      },
      to: {
        userId: settlement.to.userId,
        username: settlement.to.username,
        fullName: settlement.to.fullName
      },
      amount: settlement.amount.toFixed(2)
    }))

    console.log('Pairwise settlement suggestions:', suggestions)

    res.json({
      success: true,
      data: {
        suggestions,
        message:
          suggestions.length === 0
            ? 'All expenses are settled!'
            : `${suggestions.length} pairwise settlement(s) needed to balance the group`
      }
    })
  } catch (error) {
    console.error('Get settlement suggestions error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate suggestions'
    })
  }
}




//<------------------ Get settlement suggestions (simplified algorithm) ------------------>//
// // export const getSettlementSuggestions = async (req, res) => {
//   try {
//     const { groupId } = req.params
//     const userId = req.user.userId

//     // Check if user is member
//     const [membership] = await db
//       .select()
//       .from(groupMembers)
//       .where(
//         and(
//           eq(groupMembers.groupId, groupId),
//           eq(groupMembers.userId, userId)
//         )
//       )
//       .limit(1)

//     if (!membership) {
//       return res.status(403).json({
//         success: false,
//         message: 'You are not a member of this group'
//       })
//     }

//     // Get all members
//     const members = await db
//       .select({
//         userId: groupMembers.userId,
//         username: users.username,
//         fullName: users.fullName
//       })
//       .from(groupMembers)
//       .innerJoin(users, eq(groupMembers.userId, users.id))
//       .where(eq(groupMembers.groupId, groupId))

//     // Calculate balance for each member
//     const balances = []

//     for (const member of members) {
//       // Amount owed to member
//       const owedToMemberResult = await db
//         .select({
//           total: sql`COALESCE(SUM(CAST(${expenseSplits.amountOwed} AS DECIMAL)), 0)`
//         })
//         .from(expenses)
//         .innerJoin(expenseSplits, eq(expenses.id, expenseSplits.expenseId))
//         .where(
//           and(
//             eq(expenses.groupId, groupId),
//             eq(expenses.paidBy, member.userId),
//             eq(expenseSplits.isSettled, false),
//             sql`${expenseSplits.userId} != ${member.userId}`, // exclude self-paid portions           
//           )
//         )

//       // Amount member owes
//       const memberOwesResult = await db
//         .select({
//           total: sql`COALESCE(SUM(CAST(${expenseSplits.amountOwed} AS DECIMAL)), 0)`
//         })
//         .from(expenseSplits)
//         .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
//         .where(
//           and(
//             eq(expenses.groupId, groupId),
//             eq(expenseSplits.userId, member.userId),
//             eq(expenseSplits.isSettled, false),
//             sql`${expenses.paidBy} != ${member.userId}`// Only expenses others paid
//           )
//         )

//       const owedToMember = parseFloat(owedToMemberResult[0]?.total || 0)
//       const memberOwes = parseFloat(memberOwesResult[0]?.total || 0)
//       const netBalance = owedToMember - memberOwes

//       balances.push({
//         userId: member.userId,
//         username: member.username,
//         fullName: member.fullName,
//         balance: netBalance
//       })
//     }


//     // Simple settlement algorithm(Greedy Matching)
//     // Separate into creditors (positive balance) and debtors (negative balance)
//     const creditors = balances
//       .filter(b => b.balance > 0.01)
//       .sort((a, b) => b.balance - a.balance)

//     const debtors = balances
//       .filter(b => b.balance < -0.01)
//       .map(b => ({ ...b, balance: Math.abs(b.balance) }))
//       .sort((a, b) => b.balance - a.balance)

//     // Generate settlement suggestions
//     const suggestions = []

//     let i = 0
//     let j = 0

//     while (i < creditors.length && j < debtors.length) {
//       const creditor = creditors[i]
//       const debtor = debtors[j]

//       const amount = Math.min(creditor.balance, debtor.balance)

//       suggestions.push({
//         from: {
//           userId: debtor.userId,
//           username: debtor.username,
//           fullName: debtor.fullName
//         },
//         to: {
//           userId: creditor.userId,
//           username: creditor.username,
//           fullName: creditor.fullName
//         },
//         amount: amount.toFixed(2)
//       })

//       creditor.balance -= amount
//       debtor.balance -= amount

//       if (creditor.balance < 0.01) i++
//       if (debtor.balance < 0.01) j++
//     }

//     res.json({
//       success: true,
//       data: {
//         suggestions,
//         message:
//           suggestions.length === 0
//             ? 'All expenses are settled!'
//             : `${suggestions.length} settlement(s) needed to balance the group`
//       }
//     })
//   } catch (error) {
//     console.error('Get settlement suggestions error:', error)
//     res.status(500).json({
//       success: false,
//       message: 'Failed to generate suggestions'
//     })
//   }
// }

/*
Algorithm: Greedy Matching (Largest Creditor → Largest Debtor)

How it works:

Calculate everyone's net balance
Split into creditors (owed) and debtors (owe)
Sort both in descending order
Match largest with largest until all settled

Time Complexity: O(n log n) 
Space Complexity: O(n)
Best for: Groups of 2-20 people 
*/
