import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../utils/Logo.jsx'


const Navbar = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const username = user.username || 'User';
    const { logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 lg:px-10 py-3 flex items-center justify-between">
        <Logo className="size-8 text-blue-600" />
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="/dashboard" className="text-blue-500 font-bold text-sm border-b-2 border-blue-500 py-1" >Dashboard</a>
          <a href="/groups/create" className="text-gray-500 font-medium text-sm hover:text-blue-500 transition-colors">Groups</a>
          <a href="/friends" className="text-gray-500 font-medium text-sm hover:text-blue-500 transition-colors">Friends</a>
        </nav>

        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold text-gray-700 hidden sm:inline">Welcome, {username}</span>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-gray-500 hover:text-red-600 text-sm font-bold transition-colors group"
          >
            <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">logout</span>
            Logout
          </button>
        </div>
      </header>
  )
}

export default Navbar