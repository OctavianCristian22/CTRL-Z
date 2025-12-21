import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HelpCircle, Info, Home } from 'lucide-react';

export default function LandingNavbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'text-neon b  order-b-2 border-neon' : 'text-gray-400 hover:text-white';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b-2 border-gray-800 h-16 flex items-center justify-between px-6 md:px-12">
      
      <Link to="/" className="text-2xl font-black uppercase tracking-tighter text-white">
        CTRL<span className="text-neon">-Z</span>
      </Link>

      <div className="flex items-center gap-6 font-mono text-sm font-bold uppercase">
        <Link to="/hub" className={`flex items-center gap-2 transition-all ${isActive('/')}`}>
            <Home size={16} /> <span className="hidden md:inline">Hub</span>
        </Link>
        <Link to="/hub/AboutHub" className={`flex items-center gap-2 transition-all ${isActive('/about')}`}>
            <Info size={16} /> About
        </Link>
        <Link to="/hub/FAQHub" className={`flex items-center gap-2 transition-all ${isActive('/faq')}`}>
            <HelpCircle size={16} /> FAQ
        </Link>
      </div>
    </nav>
  );
}