import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, ShoppingBag, Lock, Home } from 'lucide-react';

export default function PortalSidebar() {
    const location = useLocation();
    
    // Nu afisam bara pe pagina de Hub (root)
    if (location.pathname === '/') return null;

    const modules = [
        { name: 'CENTRAL HUB', path: '/', icon: <LayoutGrid size={24} />, color: 'text-white' },
        { name: 'CTRL-Z SHOP', path: '/store', icon: <ShoppingBag size={24} />, color: 'text-neon' },
        { name: 'SECRET ROOM', path: '/coming-soon', icon: <Lock size={24} />, color: 'text-gray-500' },
    ];

    return (
        <div className="fixed top-0 left-0 h-full z-[90] flex">
            {/* Bara propriu-zisa */}
            <div className="h-full bg-black border-r-4 border-neon w-16 hover:w-64 transition-all duration-300 overflow-hidden group flex flex-col shadow-[10px_0_20px_rgba(0,0,0,0.5)]">
                
                {/* Logo Mic */}
                <div className="h-16 flex items-center justify-center border-b-2 border-gray-800 shrink-0">
                    <span className="font-black text-neon text-xl group-hover:hidden">Z</span>
                    <span className="font-black text-neon text-xl hidden group-hover:block whitespace-nowrap">CTRL-Z // NAV</span>
                </div>

                {/* Lista Module */}
                <div className="flex-1 py-4 flex flex-col gap-2">
                    {modules.map((mod) => (
                        <Link 
                            key={mod.path} 
                            to={mod.path}
                            className={`flex items-center px-4 py-3 gap-4 hover:bg-white hover:bg-opacity-10 transition-colors ${location.pathname.startsWith(mod.path) && mod.path !== '/' ? 'bg-white/5 border-l-4 border-neon' : ''}`}
                        >
                            <div className={`${mod.color} shrink-0`}>{mod.icon}</div>
                            <span className={`font-mono font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 uppercase`}>
                                {mod.name}
                            </span>
                        </Link>
                    ))}
                </div>

                {/* Footer Bara */}
                <div className="p-4 border-t-2 border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] text-gray-500 font-mono">
                    SYSTEM_READY
                    <br/>V 2.0.1
                </div>
            </div>
        </div>
    );
}