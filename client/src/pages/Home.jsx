import { useNavigate } from 'react-router-dom'
import Logo from '../utils/Logo';


// Sub-components
const Navbar = () => {
  const navigate = useNavigate();
  
  return(
  <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl italic">S</div> */}
        <Logo className="size-8 text-blue-600" />
        
      <nav className="hidden md:flex items-center gap-8">
        {['Features', 'How It Works', 'Pricing', 'Testimonials'].map((item) => (
          <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
            {item}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        <button className="text-sm font-bold text-slate-700 hover:text-blue-600" 
        onClick={() => navigate('/login')} style={{cursor: 'pointer'}}>
          Login
        </button>
        <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
        onClick={() => navigate('/register')} style={{cursor: 'pointer'}}>
          Get Started Free
        </button>
      </div>
    </div>
  </header>
)};

const Hero = () =>{
  const navigate = useNavigate();

  return (
  <section className="relative pt-20 pb-32 overflow-hidden">
    {/* Decorative background doodles */}
    <div className="absolute top-10 left-10 text-blue-100 transform -rotate-12 hidden lg:block">
      <span className="material-symbols-outlined text-[120px]">group</span>
    </div>
    <div className="absolute top-20 right-10 text-orange-100 transform rotate-12 hidden lg:block">
      <span className="material-symbols-outlined text-[120px]">description</span>
    </div>
    
    <div className="max-w-7xl mx-auto px-6 text-center">
      <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-6">
        Split Expenses with<br />
        Friends, <span className="text-blue-600 relative">
          Simplified
          <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 10" preserveAspectRatio="none">
            <path d="M0,5 Q50,0 100,5" stroke="#dcecf7" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </span>
      </h1>
      <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10">
        The effortless way to track group spending, manage shared households, and settle debts in seconds without the awkward talks.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-200 transition-all"
          onClick={() => navigate('/register')}>
          Get Started Free
        </button>
        <button className="bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold text-lg transition-all"
          onClick={() => navigate('#how-it-works')}>
          See How It Works
        </button>
      </div>

      {/* Main Illustration Component */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-6 md:p-12 relative border border-slate-50">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 text-left">
            <div className="p-6 bg-blue-50/50 rounded-2xl border border-dashed border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-blue-600">bar_chart</span>
                <span className="font-bold text-slate-500 text-sm">Total Group Balance</span>
              </div>
              <div className="text-4xl font-black text-blue-600 mb-2">$1,240.00</div>
              <div className="flex items-center gap-2 text-green-500 font-bold text-sm">
                <span className="material-symbols-outlined text-xs">check_circle</span>
                Settled up with 4 friends
              </div>
            </div>
            
            <div className="p-6 bg-orange-50/50 rounded-2xl border border-dashed border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-orange-500">receipt_long</span>
                <span className="font-bold text-slate-500 text-sm">Pending Debts</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                  <span className="text-slate-600 text-sm">Dinner with Alex</span>
                  <span className="font-bold text-orange-600">$45.50</span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                  <span className="text-slate-600 text-sm">Groceries</span>
                  <span className="font-bold text-orange-600">$12.00</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative flex items-center justify-center py-10">
            {/* Visual breakdown like the image */}
            <div className="relative">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-blue-500 border-4 border-white shadow-lg flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">sentiment_satisfied</span>
                  </div>
                  <span className="text-xs font-bold text-blue-600">Alex</span>
                </div>
                <div className="flex flex-col items-center gap-2 -mt-8">
                  <div className="w-20 h-20 rounded-full bg-green-500 border-4 border-white shadow-xl flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-4xl">face</span>
                  </div>
                  <span className="text-xs font-bold text-green-600">You</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-orange-500 border-4 border-white shadow-lg flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">sentiment_very_satisfied</span>
                  </div>
                  <span className="text-xs font-bold text-orange-600">Sam</span>
                </div>
              </div>
              {/* Tooltip elements */}
              <div className="absolute -top-10 -right-8 bg-white shadow-lg rounded-lg px-3 py-1 text-xs font-bold border border-slate-100">
                <span className="text-green-500">+$250.00</span>
                <span className="ml-1 material-symbols-outlined text-[10px] align-middle">north_east</span>
              </div>
              <div className="absolute -bottom-8 -left-12 bg-white shadow-lg rounded-lg px-3 py-1 text-xs font-bold border border-slate-100 flex items-center gap-1">
                <span className="text-orange-500">Split Bill</span>
                <span className="material-symbols-outlined text-[14px] text-orange-500">content_cut</span>
              </div>
            </div>
            {/* Doodle line connections */}
            <svg className="absolute inset-0 pointer-events-none opacity-20" width="100%" height="100%">
              <path d="M100,100 Q150,50 200,100" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
          </div>
        </div>
        
        {/* Floating action icon */}
        <div className="absolute -bottom-6 -right-6 bg-green-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 animate-bounce">
          <span className="material-symbols-outlined">celebration</span>
        </div>
      </div>
    </div>
  </section>
)};

const Features = () => (
  <section id="features" className="py-24 bg-slate-50">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-slate-900 mb-4">Powerful Features</h2>
        <p className="text-slate-500">Everything you need to manage group finances without the headache.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { icon: 'group', title: 'Groups', desc: 'Organize trips, housemates, or weekend events with ease. Keep everything isolated and organized.' },
          { icon: 'calculate', title: 'Smart Splitting', desc: 'Our algorithm automatically calculates the most efficient way for everyone to settle up.' },
          { icon: 'account_balance_wallet', title: 'Balance Tracking', desc: 'Real-time updates on who owes what. Never lose track of a shared bill again.' },
          { icon: 'payments', title: 'Currency Support', desc: 'Traveling abroad? We support 150+ currencies with automated live exchange rates.' },
          { icon: 'photo_camera', title: 'Receipt Scanning', desc: 'Snap a photo and let our AI extract the totals, taxes, and individual line items.' },
          { icon: 'notifications_active', title: 'Instant Alerts', desc: 'Get notified the moment an expense is added or when someone settles a debt with you.' },
        ].map((feat, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all group">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">{feat.icon}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h3>
            <p className="text-slate-500 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);


const HowItWorks = () => (
  <section id="how-it-works" className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <h2 className="text-4xl font-black text-center text-slate-900 mb-20">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-12 relative">
        <div className="absolute top-1/4 left-0 w-full h-1 bg-slate-100 hidden md:block z-0"></div>
        {[
          { step: 1, icon: 'group_add', color: 'blue', title: 'Create Group', desc: 'Invite friends via a simple link or email. No account needed to view.' },
          { step: 2, icon: 'receipt_long', color: 'orange', title: 'Add Expenses', desc: 'Input bills, scan receipts, and choose how to split (equally or percentage).' },
          { step: 3, icon: 'check_circle', color: 'green', title: 'Settle Up', desc: 'Pay back your friends with a single click via your favorite payment app.' },
        ].map((item) => (
          <div key={item.step} className="flex flex-col items-center text-center relative z-10">
            <div className={`w-16 h-16 rounded-full border-4 border-${item.color}-500 bg-white flex items-center justify-center text-${item.color}-500 font-bold text-2xl mb-8 shadow-lg`}>
              {item.step}
            </div>
            <span className={`material-symbols-outlined text-4xl text-${item.color}-500 mb-4`}>{item.icon}</span>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
            <p className="text-slate-500 leading-relaxed max-w-xs">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Pricing = () => (
    <section id="pricing" className="py-24 bg-slate-50">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-slate-900 mb-4">Simple Pricing</h2>
        <p className="text-slate-500">Choose the plan that fits your spending habits.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Free</h3>
          <div className="flex items-baseline mb-8">
            <span className="text-5xl font-black text-slate-900">$0</span>
            <span className="text-slate-400 font-bold ml-1">/mo</span>
          </div>
          <ul className="space-y-4 mb-12 flex-1">
            {['Unlimited Groups', 'Core Balance Tracking', 'Standard Splitting'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
                <span className="text-slate-600 font-medium">{item}</span>
              </li>
            ))}
          </ul>
          <button className="w-full py-4 rounded-xl border-2 border-slate-100 text-blue-600 font-bold hover:bg-slate-50 transition-colors"
            onClick={() => navigate('/register')}>
            Get Started
          </button>
        </div>
        
        {/* Pro Plan */}
        <div className="bg-white p-10 rounded-3xl border-4 border-blue-500 shadow-2xl shadow-blue-100 flex flex-col relative scale-105">
          <div className="absolute -top-4 right-8 bg-blue-600 text-white text-xs font-black uppercase tracking-widest py-1.5 px-3 rounded-full">Most Popular</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Pro</h3>
          <div className="flex items-baseline mb-8">
            <span className="text-5xl font-black text-slate-900">$4.99</span>
            <span className="text-slate-400 font-bold ml-1">/mo</span>
          </div>
          <ul className="space-y-4 mb-12 flex-1">
            {['Everything in Free', 'Receipt Scanning AI', 'Ad-Free Experience', 'Priority 24/7 Support'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
                <span className="text-slate-600 font-medium">{item}</span>
              </li>
            ))}
          </ul>
          <button className="w-full py-4 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200">Go Pro Now</button>
        </div>
      </div>
    </div>
  </section>
);

const Testimonials = () => (
  <section id="testimonials" className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <h2 className="text-4xl font-black text-center text-slate-900 mb-16">Trusted by Millions</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { name: 'Sarah M.', text: '"SplitIt has completely changed how my housemates and I manage bills. No more spreadsheets or awkward Venmo requests!"', initials: 'SM' },
          { name: 'Mike R.', text: '"The receipt scanning is like magic. I just snap a photo at dinner and everyone\'s balance is updated instantly."', initials: 'MR' },
          { name: 'Jennifer L.', text: '"Best travel companion ever. We used it for our Euro trip and handled three different currencies without a single calculation error."', initials: 'JL' },
        ].map((t, i) => (
          <div key={i} className="bg-slate-50/50 p-8 rounded-2xl border border-slate-100 flex flex-col justify-between">
            <p className="text-slate-600 italic leading-relaxed mb-8">{t.text}</p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                {t.initials}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{t.name}</h4>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Verified User</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-white pt-24 pb-12 border-t border-slate-100">
    <div className="max-w-7xl mx-auto px-6">
      {/* CTA Box */}
      <div className="bg-blue-600 rounded-[40px] p-12 md:p-20 text-center mb-24 relative overflow-hidden shadow-2xl shadow-blue-200">
        <div className="absolute inset-0 bg-grid pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to Simplify?</h2>
          <p className="text-blue-50 text-lg mb-10 max-w-xl mx-auto">
            Join over 5 million users who trust SplitIt for their group expenses. Start splitting for free today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-xl">Create My First Group</button>
            <button className="bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-all border border-blue-500">Talk to Support</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-black text-sm italic">S</div>
            <span className="text-lg font-extrabold tracking-tight text-slate-800">SplitIt</span>
          </div>
          <p className="text-slate-400 max-w-xs mb-8 font-medium">
            Making group finances simple, transparent, and fair for everyone, everywhere.
          </p>
          <div className="flex gap-4">
            {['language', 'share', 'mail'].map((icon) => (
              <a key={icon} href="#" className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-blue-500 hover:text-white transition-all">
                <span className="material-symbols-outlined text-xl">{icon}</span>
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 mb-6">Product</h4>
          <ul className="space-y-4 text-slate-500 font-medium">
            <li><a href="#" className="hover:text-blue-600 transition-colors">Features</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Pricing</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Security</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Mobile App</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 mb-6">Company</h4>
          <ul className="space-y-4 text-slate-500 font-medium">
            <li><a href="#" className="hover:text-blue-600 transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 mb-6">Legal</h4>
          <ul className="space-y-4 text-slate-500 font-medium">
            <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Cookie Policy</a></li>
          </ul>
        </div>
      </div>
      
      <div className="pt-8 border-t border-slate-100 flex flex-col md:grid md:grid-cols-2 items-center gap-4">
        <p className="text-slate-400 text-sm font-medium">© 2024 SplitIt Financial Inc. All rights reserved.</p>
        <div className="md:justify-self-end flex items-center gap-6">
          <span className="text-xs text-slate-300 font-bold uppercase tracking-widest">Secured by SSL</span>
          <span className="text-xs text-slate-300 font-bold uppercase tracking-widest">GDPR Compliant</span>
        </div>
      </div>
    </div>
  </footer>
);

const Home = () => {
  return (
    <div className="w-full bg-white antialiased">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Home;

