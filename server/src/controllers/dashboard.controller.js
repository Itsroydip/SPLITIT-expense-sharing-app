import  db  from '../db.js'
import { expenseSplits, expenses } from '../models/expense.model.js'
import { eq, and, sql, gte } from 'drizzle-orm'


//<-------------------------Get categorywise spending accross all groups of user ------------------->
export const getCategoryWiseSpending = async (req, res) => {
  try {
    const userId = req.user.userId; // Retrieved from your auth middleware

    const spendingByCategory = await db
      .select({
        category: expenses.category,
        totalSpent: sql`SUM(CAST(${expenseSplits.amountOwed} AS DECIMAL))`.mapWith(Number)
      })
      .from(expenseSplits)
      .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
      .where(eq(expenseSplits.userId, userId)) // Aggregates across all groups for this user
      .groupBy(expenses.category);

    // calculate total spent across all categories
    const totalSpent = spendingByCategory.reduce((sum, item) => sum + item.totalSpent, 0);
    // Format the response for the frontend charts
    res.status(200).json({
      success: true,
      data: spendingByCategory,
      totalSpent: totalSpent,
      message: "Spending retrieved across all groups"
    });
  } catch (error) {
    console.error('Error fetching category spending:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve spending data'
    });
  }
};



//<-------------------------Get Monthly Spending Statistics for Dashboard ------------------->
export const getMonthlySpendingStats = async (req, res) => {
 try {
    const userId = req.user.userId;
    const now = new Date();
    
    // Set start date to 5 months ago, at the 1st of the month
    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // 1. Fetch actual data
    const dbResults = await db
      .select({
        month: sql`DATE_TRUNC('month', ${expenses.createdAt})`.as('month_date'),
        value: sql`SUM(CAST(${expenseSplits.amountOwed} AS DECIMAL))`.mapWith(Number)
      })
      .from(expenseSplits)
      .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
      .where(and(eq(expenseSplits.userId, userId), gte(expenses.createdAt, startDate)))
      .groupBy(sql`month_date`)
      .orderBy(sql`month_date ASC`);

    const dataMap = new Map(
      dbResults.map(item => [new Date(item.month).getMonth(), item.value])
    );

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const paddedData = [];
    let growthRates = [];

    // 2. Generate 6 months of data with padding
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const mIndex = d.getMonth();
      const spent = dataMap.get(mIndex) || 0;

      paddedData.push({
        month: monthNames[mIndex],
        value: spent
      });

      // 3. Calculate growth rate for the trend (starting from the second month)
      if (i > 0) {
        const prevSpent = paddedData[i - 1].value;
        if (prevSpent > 0) {
          const growth = ((spent - prevSpent) / prevSpent) * 100;
          growthRates.push(growth);
        } else if (spent > 0) {
          growthRates.push(100); // 0 to something is 100% growth
        } else {
          growthRates.push(0); // 0 to 0 is flat
        }
      }
    }


    // 4. Final Aggregations
    const totalSpentSum = paddedData.reduce((acc, curr) => acc + curr.value, 0);
    const avgMonthlySpending = totalSpentSum / 6;
    const avgMonthlyTrend = growthRates.reduce((acc, curr) => acc + curr, 0) / growthRates.length;

    res.status(200).json({
      success: true,
      data: paddedData,
      stats: {
        sixMonthAverage: avgMonthlySpending.toFixed(2),
        avgMonthlyTrend: `${avgMonthlyTrend > 0 ? '+' : ''}${avgMonthlyTrend.toFixed(2)}`,
        trendDirection: avgMonthlyTrend >= 0 ? 'up' : 'down'
      }
    });
  } catch (error) {
    console.error('Trend logic error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};