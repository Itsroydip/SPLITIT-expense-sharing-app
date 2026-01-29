import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import './Dashboard.css'

const Dashboard = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups')
      setGroups(response.data.data.groups)
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>💰 Expense Tracker</h1>
        <div className="user-info">
          <span>Welcome, {user?.fullName || user?.username}!</span>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="groups-header">
          <h2>Your Groups</h2>
          <button
            onClick={() => navigate('/groups/create')}
            className="btn-primary"
          >
            + Create Group
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading groups...</div>
        ) : groups.length === 0 ? (
          <div className="empty-state">
            <p>🏝️ You're not part of any groups yet.</p>
            <button
              onClick={() => navigate('/groups/create')}
              className="btn-primary"
            >
              Create Your First Group
            </button>
          </div>
        ) : (
          <div className="groups-list">
            {groups.map((group) => (
              <div
                key={group.id}
                className="group-card"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                <h3>{group.name}</h3>
                <p>{group.description || 'No description'}</p>
                <small>
                  Joined: {new Date(group.joinedAt).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard