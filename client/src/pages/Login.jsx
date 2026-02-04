import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../utils/Logo'
import toast, { Toaster } from 'react-hot-toast';


const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)    

    try {
      await login(email, password)
      toast.success('Login successfully! Welcome back to SplitIt.', {
        style: {
          borderRadius: '12px',
          background: '#fff',
          color: '#3b82f6',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
        },
      })
      navigate('/dashboard')
    } catch (err) {
      console.log(err)
        toast.error(err?.response?.data?.message || 'Login failed. Please try again.', {
            style: {
              borderRadius: '12px',
              background: '#fff',
              fontSize: '18px',
              fontWeight: '500',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
            },
          });
    } finally {
      setLoading(false)
    }
  }


  return (
     <div className="min-h-screen flex flex-col font-display bg-[#f5f7f8]">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e7ecf4] px-6 md:px-10 py-3 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <Logo className="size-8 text-blue-600" />     
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden sm:block">New to SplitIt?</span>
          <button className="flex min-w-21 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#3c83f6] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:brightness-110 transition-all"
            onClick={() => navigate('/register')}
          >
            <span className="truncate">Sign Up</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-blue-50 via-[#f5f7f8] to-[#f5f7f8]">
       
          <Toaster position="top-center" reverseOrder={false} />

        <div className="w-full max-w-120 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e7ecf4] p-8 flex flex-col gap-6 animate-in fade-in zoom-in duration-500">
          
          <div className="flex flex-col items-center text-center">
            <div className={`text-primary size-12 text-blue-600 mb-4`}>
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z" 
                  fill="currentColor"
                />
              </svg>
            </div>
            <h1 className="text-[#0d131c] text-2xl font-bold leading-tight">Welcome back</h1>
            <p className="text-[#49699c] text-sm mt-2">Log in to manage your group expenses</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col">
              <label className="flex flex-col gap-2">
                <p className="text-[#0d131c] text-sm font-medium leading-normal">Email Address</p>
                <input      
                  name="email"
                  type="email"             
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d131c] focus:outline-0 focus:ring-2 focus:ring-[#3c83f6]/50 border border-[#ced8e8] bg-white focus:border-[#3c83f6] h-12 placeholder:text-[#49699c] p-3 text-base font-normal leading-normal transition-all"
                  placeholder="name@company.com"                  
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
            </div>

            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[#0d131c] text-sm font-medium leading-normal">Password</p>
                <a className="text-[#3c83f6] text-xs font-semibold hover:underline" href="#">Forgot password?</a>
              </div>
              <div className="relative flex w-full flex-1 items-stretch rounded-lg">
                <input 
                  name="password"
                  type="password"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d131c] focus:outline-0 focus:ring-2 focus:ring-[#3c83f6]/50 border border-[#ced8e8] bg-white focus:border-[#3c83f6] h-12 placeholder:text-[#49699c] p-3 pr-10 text-base font-normal leading-normal transition-all"
                  placeholder="Enter your password"                   
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#3c83f6] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#3c83f6]/90 transition-all mt-2 disabled:opacity-70 disabled:cursor-not-allowed" 
              
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="truncate">Log In</span>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-[#e7ecf4]"></div>
            <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Or</span>
            <div className="h-px flex-1 bg-[#e7ecf4]"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 h-11 border border-[#ced8e8] rounded-lg bg-white hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium text-[#0d131c]">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 h-11 border border-[#ced8e8] rounded-lg bg-white hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium text-[#0d131c]">Apple</span>
            </button>
          </div>

          <p className="text-center text-sm text-[#49699c]">
            Don't have an account? 
            <Link className="ml-1 text-[#3c83f6] font-bold hover:underline" to="/register">Create an account</Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-10 text-center text-xs text-gray-400">
        © 2024 SplitIt Inc. All rights reserved. • <a className="hover:text-[#3c83f6] transition-colors" href="#">Terms</a> • <a className="hover:text-[#3c83f6] transition-colors" href="#">Privacy</a>
      </footer>
    </div>
  )
}

export default Login