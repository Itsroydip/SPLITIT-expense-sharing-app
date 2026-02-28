import { useState} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../components/Navbar.jsx'
import { createGroup } from '../services/group.service.js';
import { useNavigate } from 'react-router-dom';

function MaterialIcon({ name, className = "", size = 24 }) {
  return (
    <span 
      className={`material-symbols-outlined select-none ${className}`} 
      style={{ fontSize: size, fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
    >
      {name}
    </span>
  );
}


export default function CreateGroup() {

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [groupType, setGroupType] = useState("trip");
  const [isLoading, setIsLoading] = useState(false);
    
  const navigate = useNavigate();


  const addMember = () => {
    if (!newMemberName.trim()) return;
    const initials = newMemberName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    const newMember = {
      id: Math.random().toString(36).substr(2, 9),
      name: newMemberName,
      initials: initials || '??',
    };
    
    setMembers([...members, newMember]);
    setNewMemberName('');
  };

  const removeMember = (id) => {
    setMembers(members.filter(m => m.id !== id || m.isYou));
  };

  const handleCreateGroup = async () => {
    setIsLoading(true);
    try {      
      const memberUsernames = members.filter(m => !m.isYou).map(m => m.name);
      const result = await createGroup({
        name: groupName,
        description: description,
        memberUsernames: memberUsernames
      });
      console.log('Group created:', result);
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
        <Navbar />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-10 relative bg-[#3c83f6]/5">
        {/* Background Decorations */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#3c83f6]/5 rounded-full blur-[100px]" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-[#3c83f6]/5 rounded-full blur-[100px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-125 bg-white rounded-2xl shadow-3xl shadow-[#3c83f6]/5 border border-[#3c83f6]/5 overflow-hidden"
        >
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <button 
                type="button"
                className="flex items-center gap-1 text-gray-500 hover:text-[#3c83f6] transition-colors mb-4 -ml-1 group cursor-pointer"
                onClick={() => navigate('/dashboard')}
              >
                <MaterialIcon name="chevron_left" size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-sm font-medium cursor-pointer">Back</span>
              </button>
              <h1 className="text-2xl font-bold text-[#111418]">Create New Group</h1>
              <p className="text-gray-500 mt-1 text-sm">Organize expenses and settle up easily with friends.</p>
            </div>

            <form className="space-y-6 " onSubmit={(e) => {
              e.preventDefault();
              handleCreateGroup();
            }}>
              {/* Group Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#111418] block">Group Name</label>
                <input 
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#3c83f6] focus:border-transparent transition-all outline-none"
                  placeholder="e.g. Summer Trip 2024"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#111418] block">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#3c83f6] focus:border-transparent transition-all outline-none resize-none"
                  placeholder="What is this group for?"
                  rows={3}        
                />
              </div>

              {/* Group Type */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#111418] block">Group Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <TypeButton 
                    active={groupType === 'trip'} 
                    onClick={() => setGroupType('trip')}
                    icon={<MaterialIcon name="flight_takeoff" size={24} />}
                    label="Trip"
                  />
                  <TypeButton 
                    active={groupType === 'home'} 
                    onClick={() => setGroupType('home')}
                    icon={<MaterialIcon name="home" size={24} />}
                    label="Home"
                  />
                  <TypeButton 
                    active={groupType === 'couple'} 
                    onClick={() => setGroupType('couple')}
                    icon={<MaterialIcon name="favorite" size={24} />}
                    label="Couple"
                  />
                  <TypeButton 
                    active={groupType === 'other'} 
                    onClick={() => setGroupType('other')}
                    icon={<MaterialIcon name="more_horiz" size={24} />}
                    label="Other"
                  />
                </div>
              </div>

              {/* Members */}
              <div className="space-y-4">
                <label className="text-sm font-semibold text-[#111418] block">Members</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MaterialIcon name="person_add" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addMember()}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#3c83f6] focus:border-transparent transition-all outline-none"
                      placeholder="Enter name or email..."
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={addMember}
                    className="px-6 py-3 bg-gray-100 text-[#111418] font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <AnimatePresence>
                    {members.map((member) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`flex items-center gap-2 rounded-full pl-2 pr-2 py-1.5 border  ${
                          member.isYou 
                            ? 'bg-[#3c83f6]/10 border-[#3c83f6]/20 text-[#3c83f6]' 
                            : 'bg-gray-100 border-transparent text-gray-700'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          member.isYou ? 'bg-[#3c83f6] text-white' : 'bg-gray-300 text-gray-700'
                        }`}>
                          {member.initials}
                        </div>
                        <span className="text-sm font-medium">{member.name}</span>
                        {!member.isYou && (
                          <button 
                            type="button"
                            onClick={() => removeMember(member.id)}
                            className="hover:text-red-500 transition-colors flex items-center cursor-pointer"
                          >
                            <MaterialIcon name="close" size={14} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col md:flex-row gap-3 pt-6 border-t border-gray-100">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#3c83f6] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#3c83f6]/90 shadow-lg shadow-[#3c83f6]/20 transition-all active:scale-[0.98] cursor-pointer"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                        </span>
                        ) : (
                            <span className="truncate">Create Group</span>
                    )}
                </button>
                <button 
                  type="button"
                  disabled={isLoading}
                  className="px-8 py-4 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl transition-all cursor-pointer"
                    onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}



function TypeButton({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
        active 
          ? 'border-[#3c83f6] bg-[#3c83f6]/5 text-[#3c83f6]' 
          : 'border-gray-100 hover:border-[#3c83f6]/30 text-gray-400 hover:text-gray-600'
      }`}
    >
      {icon}
      <span className={`text-xs font-bold ${active ? 'text-[#3c83f6]' : 'text-gray-500'}`}>{label}</span>
    </button>
  );
}