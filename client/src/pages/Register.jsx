import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../utils/Logo'
import toast, { Toaster } from 'react-hot-toast';


const Navbar = () => {
  const navigate = useNavigate();

  return(
    <header className="flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b border-slate-100 sticky top-0 z-50">
          <Logo className="size-8 text-blue-600" />            
          
          <div className="flex items-center gap-8">           
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-6 rounded-lg transition-all shadow-sm cursor-pointer"
                onClick={() => navigate('/login')}>
                Log in
            </button>
          </div>
    </header>
)};

const Footer = () => (
  <footer className="bg-slate-50 py-8 text-center border-t border-slate-100">
        <p className="text-slate-600 text-xs font-medium">
          © {new Date().getFullYear()} SplitIt Inc. All rights reserved.
        </p>
  </footer>
);


const RegistrationCard = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    fullName: ''
  })

  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await register(
        formData.email,
        formData.username,
        formData.password,
        formData.fullName
      )
      toast.success('Account created successfully! Welcome to SplitIt.', {
        style: {
          borderRadius: '12px',
          background: '#fff',
          color: '#3b82f6',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
        },
      })

      setFormData({
        email: '',
        username: '',
        password: '',
        fullName: ''
      })
      navigate('/dashboard')
      
    } catch (err) {
      
        toast.error(err?.response?.data?.message || 'Registration failed. Please try again.', {
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
    <main className="flex-1 flex items-center justify-center p-4 md:p-8 bg-slate-50">

        <Toaster position="top-center" reverseOrder={false} />

        <div className="w-full max-w-300 flex flex-col md:flex-row bg-white rounded-2xl shadow-xl overflow-hidden min-h-187.5 border border-slate-200/60">
          
          {/* Left Panel: Hero */}
          <div className="hidden md:flex flex-1 relative bg-linear-to-br from-blue-50/30 to-slate-50 flex-col items-center justify-center p-12 text-center border-r border-slate-100">
            <div className="relative z-10 flex flex-col items-center max-w-md">
              {/* Logo Circle */}
              <div className="w-44 h-44 rounded-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex items-center justify-center mb-12 ring-1 ring-slate-100">
                <div className="text-blue-600">
                  <svg width="80" height="80" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 10C26.7614 10 29 12.2386 29 15C29 17.7614 26.7614 20 24 20C21.2386 20 19 17.7614 19 15C19 12.2386 21.2386 10 24 10Z" fill="currentColor"/>
                    <path d="M24 24C17.3726 24 12 29.3726 12 36H36C36 29.3726 30.6274 24 24 24Z" fill="currentColor"/>
                    <circle cx="15" cy="19" r="2.5" fill="currentColor"/>
                    <circle cx="33" cy="19" r="2.5" fill="currentColor"/>
                    <circle cx="24" cy="6" r="2.5" fill="currentColor"/>
                  </svg>
                </div>
              </div>

              <h1 className="text-3xl font-extrabold text-slate-900 mb-6 leading-tight">
                Split bills without the stress.
              </h1>
              <p className="text-slate-500 text-base leading-relaxed mb-12 px-4">
                Join thousands of people who manage group expenses effortlessly with SplitIt. From dinners to vacations, we keep it fair.
              </p>

              {/* Pagination Dots */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                </div>
                <div className="flex gap-6 mt-1">
                  <span className="text-[10px] font-bold text-blue-600 tracking-widest">SIMPLE</span>
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest">FAIR</span>
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest">FAST</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="flex-1 flex flex-col p-8 md:p-16 justify-center">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Create your account</h2>
              <p className="text-slate-500 text-sm">Join SplitIt to start managing group expenses easily.</p>
            </div>

            <form className="space-y-6 max-w-lg mx-auto md:mx-0 w-full" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-900 ml-1">Full Name</label>
                <input 
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  placeholder="John Doe"
                  className="w-full h-12 px-4 rounded-lg border border-slate-200 bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none placeholder:text-slate-400"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-900 ml-1">Username</label>
                <input 
                  type="text"
                  name="username"
                  value={formData.username}
                  placeholder="johndoe123"
                  className="w-full h-12 px-4 rounded-lg border border-slate-200 bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none placeholder:text-slate-400"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-900 ml-1">Email Address</label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  placeholder="john@example.com"
                  className="w-full h-12 px-4 rounded-lg border border-slate-200 bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none placeholder:text-slate-400"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-900 ml-1">Password</label>
                <div className="relative">
                  <input 
                    type="password"
                    name="password"
                    value={formData.password}
                    placeholder="••••••••"
                    className="w-full h-12 px-4 rounded-lg border border-slate-200 bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none placeholder:text-slate-400 pr-12"
                    onChange={handleChange}
                    required
                    minLength={8}
                  />                  
                </div>
                <p className="text-[10px] text-slate-400 ml-1 mt-1">Must be at least 8 characters long</p>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full h-12 text-white font-bold rounded-lg shadow-md transition-all mt-4 flex items-center justify-center gap-3 cursor-pointer ${
                  loading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] hover:shadow-lg'
                }`}
                
              >
                {loading ? 'Creating Account...' : 'Create Account'}

              </button>
              
              <div className="w-full h-px bg-slate-100 mt-6"></div>

              <div className="text-center md:text-left mt-6">
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm">
                  By signing up, you agree to our 
                  <a href="#" className="text-blue-600 hover:underline mx-1">Terms of Service</a> 
                  and 
                  <a href="#" className="text-blue-600 hover:underline mx-1">Privacy Policy</a>.
                </p>
                <p className="text-sm text-slate-900 mt-6">
                  Already have an account? 
                  <Link to="/login" className="text-blue-600 font-bold hover:underline ml-1" style={{cursor: 'pointer'}}>Log in</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
  );
};



const Register = () => {

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
        <RegistrationCard />      
      <Footer />
    </div>
  );
}

export default Register