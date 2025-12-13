import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0000AA] text-white font-mono p-8 flex flex-col items-center justify-center text-center selection:bg-white selection:text-[#0000AA]">
        <h1 className="text-9xl font-black mb-4">:(</h1>
        <h2 className="text-2xl md:text-4xl mb-8">PC-ul tău a întâmpinat o problemă și trebuie să se restarteze.</h2>
        <div className="text-left bg-black/20 p-6 max-w-2xl border-2 border-white/20 mb-8">
            <p className="mb-2">*** STOP: 0x00000404 (PAGE_NOT_FOUND_EXCEPTION)</p>
            <p className="mb-2">*** Gv3.sys - Address FFFFF8800 functionality issue.</p>
            <p className="animate-pulse">_Collecting error info... 100%</p>
        </div>
        <Link to="/" className="bg-white text-[#0000AA] px-8 py-3 font-bold text-xl hover:scale-105 transition-transform flex items-center gap-2">
            <Terminal size={20} /> SYSTEM_REBOOT (GO HOME)
        </Link>
    </div>
  );
}