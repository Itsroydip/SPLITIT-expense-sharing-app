import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import StatCard from '../components/Statcard.jsx'
import {
  getCategoryWiseSpending,
  getDashboardData,
  getGroupDetails,
  getMonthlySpending,
} from '../services/dashboard.service.js'
import {
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const Dashboard = () => {
  const [categorySpending, setCategorySpending] = useState({})
  const [dashboardData, setDashboardData] = useState(null)
  const [monthlyData, setMonthlyData] = useState({})
  const [groupsData, setGroupsData] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const categoryData = await getCategoryWiseSpending();
      setCategorySpending(categoryData)

      const data = await getDashboardData()
      setDashboardData(data)
      console.log('Dashboard Data:', data.recentActivity)

      const monthly = await getMonthlySpending()
      setMonthlyData(monthly)

      const groups = await getGroupDetails()
      setGroupsData(groups)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }


  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`
  }

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return new Date(date).toLocaleDateString()
  }

  const getCategoryIcon = (category) => {
    const icons = {
      food: '🍔',
      transport: '🚗',
      accommodation: '🏨',
      entertainment: '🎬',
      shopping: '🛍️',
      utilities: '💡',
      health: '🏥',
      other: '📌'
    }
    return icons[category?.toLowerCase()] || '📌'
  }

  const getCategoryColor = (category) => {
    const colors = {
      food: '#ff6b6b',
      transport: '#4ecdc4',
      accommodation: '#f7b733',
      entertainment: '#45b7d1',
      shopping: '#f9ca24',
      utilities: '#6c5ce7',
      health: '#00b894',
      other: '#636e72'
    }
    return colors[category?.toLowerCase()] || '#636e72'
  }


  if (loading) {
    return (
      <DashboardSkeleton />
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in duration-500">
        <div className="bg-red-50 text-red-500 w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-5xl">cloud_off</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Data fetch failed</h2>
        <p className="text-gray-500 max-w-md mb-8">
          We encountered a temporary connection issue while trying to fetch your dashboard data. Please try again.
        </p>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-200"
        >
          <span className="material-symbols-outlined">refresh</span>
          Retry Now
        </button>
      </div>


    )
  }

  const { totalOwe, totalOwed, netBalance, recentActivity } = dashboardData

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Navbar />


      <main className="max-w-350 mx-auto w-full px-6 py-8 space-y-8">
      {/* Stats Cards */}     
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                title="Net Balance" 
                amount={formatCurrency(netBalance)}
                icon="account_balance_wallet" 
                color={netBalance >= 0 ? "text-emerald-600" : "text-red-600"} 
                bgIcon="bg-blue-100" 
                iconColor="text-blue-500" 
              />
              <StatCard 
                title="You Owe" 
                amount={formatCurrency(totalOwe)} 
                icon="arrow_downward" 
                color="text-red-600" 
                bgIcon="bg-red-50" 
                iconColor="text-red-600" 
              />
              <StatCard 
                title="Owed to You" 
                amount={formatCurrency(totalOwed)} 
                icon="arrow_upward" 
                color="text-emerald-600" 
                bgIcon="bg-green-50" 
                iconColor="text-emerald-600" 
              />
          </section>

          {/* Charts Row */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Expense Breakdown */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Expense Breakdown</h3>
                <span className="material-symbols-outlined text-gray-400 cursor-pointer">info</span>
              </div>
              
              {categorySpending.data && categorySpending.data.length > 0 ? (

                <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-64 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorySpending.data.map(item => ({ name: item.category, value: item.totalSpent }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categorySpending.data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Total Spent</span>
                    <span className="text-3xl font-bold">₹{categorySpending.totalSpent}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 w-full mt-8">
                  {categorySpending.data.map(item => (
                    <div key={item.category} className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
                      <div className="w-3 h-3 rounded-full mb-1" style={{ backgroundColor: getCategoryColor(item.category) }}></div>
                      <span className="text-xs text-gray-500 font-semibold">{item.category}</span>
                      <span className="text-sm font-bold">₹{item.totalSpent.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              ) : 
              (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500">No spending data available</p>
                </div>
              )}
            </div>

            {/*Monthly Spending Trend */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-lg font-bold">Spending Trend</h3>
                  <p className="text-xs text-gray-400 font-medium">Monthly expenditure analysis</p>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">LAST 6 MONTHS</span>
              </div>

              {monthlyData.data && monthlyData.data.length > 0 ? (

              <div className="h-64 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData.data.map(item => ({ month: item.month, amount: item.value }))}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} 
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorAmount)" 
                      dot={{ r: 4, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#3b82f6' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              ) :(
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500">No monthly spending data available</p>
                </div>
              )}

              {monthlyData.data && monthlyData.data.length > 0 && (
                <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Average Monthly</p>
                  <p className="text-2xl font-bold">₹{monthlyData.stats.sixMonthAverage}</p>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold bg-green-50 px-2 py-1 rounded">
                  <span className="material-symbols-outlined text-sm">
                    {monthlyData.stats.avgMonthlyTrend >= 0 ? 'trending_up' : 'trending_down' }
                  </span>
                  {monthlyData.stats.avgMonthlyTrend}
                </div>
              </div>
              )}
            </div>
          </section>


           {/* Bottom Lists Row */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6"> 
            {/* My Groups */}
            <div className="lg:col-span-4 space-y-4 ">              
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">My Groups</h3>
                <button className="flex items-center justify-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                  onClick={() => navigate('/groups/create')}
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Add Group</span>
                </button>
              </div>
            
              
              {groupsData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <p className="text-gray-500">No groups yet</p>
                </div>
              ) : 
              (
                <div className="space-y-3">
                {groupsData.map(group => (
                  <div key={group.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-amber-100`}>
                        <span className="material-symbols-outlined text-amber-600">home</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm">{group.name}</p>
                        <p className="text-[11px] text-gray-400">{group.description} </p>
                      </div>
                    </div>
                    <p className={`font-bold text-sm text-blue-300`}>
                      {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                ))}
                </div>

              )}
            </div>

            {/* Recent Activity Redesigned */}
            {recentActivity && recentActivity.length > 0 && (
              <div className="lg:col-span-8 space-y-4">
                <h3 className="text-lg font-bold">Recent Activity</h3>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="bg-slate-50 p-4 rounded-2xl flex items-center gap-5">
                      {/* Icon Box */}
                      <div className={` w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 text-white`} style={{ backgroundColor: getCategoryColor(activity.category) }}>
                        <span className="material-symbols-outlined text-3xl font-light">
                          {getCategoryIcon(activity.category)}
                        </span>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1">
                        {/* Top Row */}
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-base font-semibold text-slate-800">{activity.description}</h4>
                          <span className="text-blue-600 font-bold text-lg">₹{activity.amount}</span>
                        </div>

                        {/* Bottom Row */}
                        <div className="flex items-center gap-3">
                          <span className={`text-white px-3 py-0.5 rounded-lg text-[10px] font-bold tracking-wider`} style={{ backgroundColor: getCategoryColor(activity.category) }}>
                            {activity.category}
                          </span>
                          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                            <span>Paid by {activity.paidByUsername}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>{formatTimeAgo(activity.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
      </main>
    </div>
  )
}



// --- Skeleton View Component ---

const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {/* Summary Skeletons */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
          <div className="p-6 rounded-full bg-gray-200"></div>
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>

    {/* Chart Skeletons */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col min-h-112.5">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-10"></div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-64 h-64 rounded-full border-8 border-gray-100 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gray-50"></div>
          </div>
          <div className="grid grid-cols-3 gap-4 w-full mt-12">
            <div className="h-12 bg-gray-100 rounded-xl"></div>
            <div className="h-12 bg-gray-100 rounded-xl"></div>
            <div className="h-12 bg-gray-100 rounded-xl"></div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col min-h-112.5">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-100 rounded w-1/3 mb-10"></div>
        <div className="flex-1 bg-gray-50 rounded-xl mb-6"></div>
        <div className="h-12 bg-gray-50 rounded-xl w-full"></div>
      </div>
    </div>

    {/* List Skeletons */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
              <div className="space-y-1.5">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="h-2 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
        ))}
      </div>
      <div className="lg:col-span-8 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/6"></div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-50 p-4 rounded-2xl flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gray-200 shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </div>
                <div className="flex gap-3">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default Dashboard