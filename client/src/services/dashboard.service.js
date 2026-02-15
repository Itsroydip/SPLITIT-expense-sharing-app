import api from './api.service'

export const getCategoryWiseSpending = async () => {
  try {
    const response = await api.get('/dashboard/category-spending')
    return response.data
  } catch (error) {
    console.error('Error fetching category-wise spending:', error)
    throw error
  }
}


export const getDashboardData = async () => {
  try {
    // Get all groups
    const groupsRes = await api.get('/groups')
    const groups = groupsRes.data.data.groups

    // Initialize totals
    let totalOwe = 0
    let totalOwed = 0
    let allExpenses = []
    let categorySpending = {}

    // Process each group
    for (const group of groups) {
      try {
        // Get balance for this group
        const balanceRes = await api.get(`/settlements/balance/${group.id}`)
        const balance = balanceRes.data.data

        totalOwe += parseFloat(balance.iOwe || 0)
        totalOwed += parseFloat(balance.owedToMe || 0)

        // Get expenses for this group
        const expensesRes = await api.get(`/expenses/group/${group.id}`)
        const expenses = expensesRes.data.data.expenses

        // Add group info to expenses
        const expensesWithGroup = expenses.map(exp => ({
          ...exp,
          groupName: group.name,
          groupId: group.id
        }))
        allExpenses = [...allExpenses, ...expensesWithGroup]

        // Calculate category spending
        expenses.forEach(expense => {
          const category = expense.category
          const amount = parseFloat(expense.amount)
          categorySpending[category] = (categorySpending[category] || 0) + amount
        })

        

      } catch (error) {
        console.error(`Error fetching data for group ${group.id}:`, error)
      }
    }

    // Sort expenses by date (newest first)
    allExpenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    // Get recent activity (last 5 expenses)
    const recentActivity = allExpenses.slice(0, 5)

    // Format category spending for pie chart
    const categorySpendingArray = Object.entries(categorySpending).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: parseFloat(value.toFixed(2))
    }))

    return {
      totalOwe: totalOwe.toFixed(2),
      totalOwed: totalOwed.toFixed(2),
      netBalance: (totalOwed - totalOwe).toFixed(2),
      recentActivity,
      categorySpending: categorySpendingArray,
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    throw error
  }
}


export const getMonthlySpending = async () => {
  try {
    const response = await api.get('/dashboard/monthly-spending')
    return response.data
  } catch (error) {
    console.error('Error fetching monthly spending:', error)
    throw error
  }
}


export const getGroupDetails = async () => {
  try {
    const response = await api.get('/groups')
    const groups = response.data.data.groups
    return groups
  } catch (error) {
    console.error('Error fetching group details:', error)
    throw error
  }
}

