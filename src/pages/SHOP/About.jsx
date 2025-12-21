import React from 'react';
import { Package, Truck, ShieldCheck, Cpu, Terminal, Crosshair } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-[#f0f0f0] font-mono pt-10 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        
        <div className="border-l-8 border-black pl-6 mb-16 animate-in slide-in-from-left-4 duration-500">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 leading-none">
                SUPPLY_<span className="text-white bg-black px-4">DEPOT <br/></span> LOGS
            </h1>
            <p className="text-xl font-bold text-gray-600 max-w-2xl mt-6">
                Nu suntem un retailer generic. Suntem depozitul logistic al studenților.
                <br/>
                Gear curat, prețuri tăiate, livrare rapidă. <span className="bg-neon text-black px-1 font-bold">Fără "taxa de brand".</span>
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
            <div className="bg-white border-4 border-black p-8 shadow-brutal hover:-translate-y-2 transition-transform group">
                <div className="flex items-center gap-3 mb-4">
                    <Crosshair size={32} className="text-red-600 group-hover:rotate-90 transition-transform" />
                    <h2 className="text-2xl font-black uppercase">SIGNAL TO NOISE</h2>
                </div>
                <p className="font-bold text-gray-600 leading-relaxed">
                    Piața e plină de gunoaie electronice scumpe. Noi filtrăm zgomotul. 
                    Aici nu găsești 1000 de produse, ci doar pe cele 50 care chiar merită banii tăi. 
                    Dacă e pe site, înseamnă că rezistă la sesiune.
                </p>
            </div>

            <div className="bg-black text-white border-4 border-black p-8 shadow-brutal hover:-translate-y-2 transition-transform group">
                <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck size={32} className="text-neon" />
                    <h2 className="text-2xl font-black uppercase">BATTLE TESTED</h2>
                </div>
                <p className="font-bold text-gray-400 leading-relaxed">
                    Nu vindem ce nu am folosi noi. 
                    Fiecare tastatură, fiecare mouse și fiecare caiet mecanic a trecut prin mâinile echipei. 
                    Testăm anduranța, nu marketingul.
                </p>
            </div>
        </div>

        <div className="border-y-4 border-black py-12 mb-20 flex flex-col md:flex-row justify-between items-center text-center gap-8 bg-white">
            <div className="flex-1">
                <div className="flex justify-center mb-2"><Package size={40} /></div>
                <div className="text-3xl font-black mb-1">SECURE</div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Packaging</div>
            </div>
            <div className="flex-1 border-x-0 md:border-x-2 border-black/10">
                <div className="flex justify-center mb-2"><Truck size={40} /></div>
                <div className="text-3xl font-black mb-1">2-4 DAYS</div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Deploy Time</div>
            </div>
            <div className="flex-1">
                <div className="flex justify-center mb-2"><Cpu size={40} /></div>
                <div className="text-3xl font-black mb-1">OPTIMIZED</div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Specs/Price Ratio</div>
            </div>
        </div>

        <div className="bg-black text-neon p-8 font-mono text-sm md:text-base leading-relaxed border-l-4 border-neon shadow-[8px_8px_0_0_#ccc]">
            <div className="flex items-center gap-2 mb-4 text-white border-b border-gray-800 pb-2">
                <Terminal size={18} />
                <span className="font-bold">SYSTEM_MESSAGE</span>
            </div>
            <p className="mb-4">
                 CTRL-Z a fost fondat pe un principiu simplu: <span className="text-white">Studenții nu ar trebui să aleagă între calitate și mâncare.</span>
            </p>
            <p>
                 Negociem direct cu distribuitorii. Tăiem intermediarii. 
                 Păstrăm marjele la limita supraviețuirii operaționale.
                 Profitul se reinvestește în stoc și în comunitate.
            </p>
            <p className="mt-4 text-white font-bold animate-pulse">
                _END_OF_TRANSMISSION
            </p>
        </div>

      </div>
    </div>
  );
}