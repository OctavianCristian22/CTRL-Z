import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Clock, User, LogOut, ShieldCheck, LogIn } from 'lucide-react';
import { logout } from '../firebase';
import GlitchText from '../components/text/GlitchText';

export default function Hub({ user, userData, openLoginModal }) {
  
return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden">
        
        {/* Background Grid Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(57,255,20,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(57,255,20,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        {/* HEADER PROFIL */}
        <div className="z-10 w-full max-w-5xl mb-12 flex justify-between items-end border-b-4 border-white pb-4">
            <div>
                {/* TITLU CU EFECT GLITCH */}
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-2 flex">
                    <GlitchText speed={100} enableOnHover={true} triggerEvery={3000}>CTRL</GlitchText>
                    <span className="text-neon ml-1">
                        <GlitchText speed={100} enableOnHover={true} triggerEvery={3000}>-Z</GlitchText>
                    </span>
                </h1>
                <p className="text-gray-400 text-xl font-bold">/// CENTRAL_HUB_ACCESS</p>
            </div>
            
            {/* Mini Profil */}
            <div className="text-right">
                {user ? (
                    <div className="flex flex-col items-end animate-in fade-in">
                        <span className="bg-neon text-black px-2 font-black uppercase text-sm mb-1">LOGGED_IN_AS</span>
                        <span className="text-2xl font-bold uppercase flex items-center gap-2">
                            {user.displayName || "HACKER"} 
                            {userData?.role === 'admin' && <ShieldCheck className="text-neon" size={20}/>}
                        </span>
                        <button onClick={logout} className="text-xs text-red-500 hover:underline font-bold mt-1 flex items-center gap-1 justify-end hover:bg-white hover:text-red-600 px-1 transition-colors">
                            DISCONNECT <LogOut size={10}/>
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-end animate-in fade-in">
                         <span className="bg-red-600 text-white px-2 font-black uppercase text-sm mb-1 animate-pulse">NO_CONNECTION</span>
                         <button 
                            onClick={openLoginModal} 
                            className="text-2xl font-bold uppercase flex items-center gap-2 hover:text-neon transition-colors border-2 border-transparent hover:border-neon px-2 py-1"
                         >
                            CONNECT TO SYSTEM <LogIn size={24}/>
                         </button>
                    </div>
                )}
            </div>
        </div>

        {/* GRID FUNCTIONALITATI */}
        <div className="z-10 grid md:grid-cols-2 gap-8 w-full max-w-5xl h-[400px]">
            
            {/* CARD 1: SHOP */}
            <Link to="/store" className="group relative border-4 border-neon bg-black hover:bg-neon/5 transition-all duration-300 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:scale-[1.02] shadow-[0_0_20px_rgba(57,255,20,0.2)]">
                <ShoppingCart size={80} className="text-white mb-6 group-hover:text-neon group-hover:scale-110 transition-transform duration-300" />
                <h2 className="text-4xl font-black uppercase z-10">CTRL-Z SHOP</h2>
                <p className="text-gray-400 font-bold mt-2 z-10 group-hover:text-white">GEAR // TECH // ACCESS</p>
                
                {/* Glitch effect background */}
                <div className="absolute inset-0 bg-neon/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 skew-y-12 origin-bottom-left"></div>
            </Link>

            {/* CARD 2: COMING SOON */}
            <Link to="/coming-soon" className="group relative border-4 border-gray-600 bg-gray-900/50 hover:bg-gray-800 transition-all duration-300 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-white opacity-80 hover:opacity-100">
                <Clock size={80} className="text-gray-500 mb-6 group-hover:text-white group-hover:rotate-12 transition-transform duration-300" />
                <h2 className="text-4xl font-black uppercase z-10 text-gray-400 group-hover:text-white">COMING SOON</h2>
                <p className="text-gray-600 font-bold mt-2 z-10">CLASSIFIED_SECTION</p>
                
                <div className="absolute top-4 right-4 bg-gray-700 text-white text-xs px-2 py-1 font-mono">V 2.1</div>
            </Link>

        </div>

        <div className="absolute bottom-4 text-gray-600 text-xs font-mono">
            SYSTEM_ID: {user?.uid || "GUEST_USER"} // HUB_V1.0
        </div>
    </div>
  );
}