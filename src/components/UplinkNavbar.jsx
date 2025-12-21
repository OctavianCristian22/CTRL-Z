import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Brain } from 'lucide-react';
import { logout, db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function UplinkNavbar({ user, openLoginModal }) { 
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
      if(!user) return;
      
      const q = query(
          collection(db, "sessions"), 
          where("mentorId", "==", user.uid),
          where("status", "==", "pending")
      );

      const unsub = onSnapshot(q, (snap) => {
          setNotificationCount(snap.size);
      });

      return () => unsub();
  }, [user]);

  const handleLogout = async () => {
      await logout();
      navigate('/');
  };

  return (
    <nav className="flex flex-col md:flex-row justify-between items-center mb-16 border-b-4 border-black pb-6 sticky top-0 bg-[#f0f0f0] z-50 p-4 md:pt-4 md:ml-16 transition-all">
      
      <Link to="/uplink" className="flex items-center gap-2 group cursor-pointer mb-4 md:mb-0">
        <div className="bg-black text-white p-2 px-4 font-black text-2xl md:text-3xl border-2 border-black shadow-brutal tracking-tighter group-hover:bg-white group-hover:text-black transition-all flex items-center gap-2">
            <Brain size={24} /> NEURAL_UPLINK
        </div>
      </Link>

      <div className="flex items-center gap-2 md:gap-6 text-sm md:text-base font-bold">
        <Link to="/uplink" className={`hover:text-neon hover:bg-black px-2 py-1 transition-all ${location.pathname === '/uplink' ? 'bg-black text-white' : ''}`}>DASHBOARD</Link>
        <Link to="/uplink/about" className={`hover:text-neon hover:bg-black px-2 py-1 transition-all ${location.pathname === '/uplink/about' ? 'bg-black text-white' : ''}`}>ABOUT</Link>
        <Link to="/uplink/faq" className={`hover:text-neon hover:bg-black px-2 py-1 transition-all ${location.pathname === '/uplink/faq' ? 'bg-black text-white' : ''}`}>FAQ</Link>
      </div>

      <div className="flex items-center gap-4 mt-4 md:mt-0">
        {user ? (
            <Link to="/uplink/profile" className="flex items-center gap-3 bg-white border-2 border-black p-1 px-3 shadow-brutal cursor-pointer hover:bg-gray-100 transition-colors relative">
                {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-black object-cover" />
                ) : (
                    <div className="bg-black text-white w-8 h-8 rounded-full border border-black flex items-center justify-center font-bold text-sm">
                        {(user.displayName || user.email)[0].toUpperCase()}
                    </div>
                )}
                <span className="font-bold text-sm hidden md:inline uppercase">{user.displayName || 'AGENT'}</span>
                
                {notificationCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-black animate-pulse">
                        {notificationCount}
                    </span>
                )}

                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLogout(); }} className="ml-2 hover:text-red-600 transition-colors" title="Disconnect">
                    <LogOut size={20} />
                </button>
            </Link>
        ) : (
            <button onClick={openLoginModal} className="flex items-center gap-2 font-bold bg-black text-white px-4 py-2 border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-all shadow-brutal">
                LOGIN
            </button>
        )}
      </div>
    </nav>
  );
}