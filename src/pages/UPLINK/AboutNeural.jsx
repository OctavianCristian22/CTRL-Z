import React from 'react';
import { Network, Cpu, Wifi, Zap, Share2, Lock } from 'lucide-react';
import LandingNavbar from '../../components/LandingNavbar'; // Asigura-te ca ai path-ul corect

export default function AboutNeural() {
  return (
    <div className="min-h-screen bg-black text-white font-mono pt-24 pb-20 px-4 bg-grid-pattern">
      
      <div className="max-w-5xl mx-auto">
        
        {/* HERO SECTION */}
        <div className="border-l-8 border-neon pl-6 mb-16 animate-in slide-in-from-left-4 duration-500">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 leading-none">
                NEURAL_<span className="text-black bg-neon px-4">UPLINK</span> PROTOCOL
            </h1>
            <p className="text-xl font-bold text-gray-400 max-w-2xl mt-6">
                Nu mai toci.
                <br/>
                Prima rețea descentralizată de <span className="text-neon">peer-to-peer knowledge transfer</span>. 
                Conectăm "nodurile" care știu cu "nodurile" care au nevoie să știe.
            </p>
        </div>

        {/* MISSION GRID */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
            <div className="bg-gray-900 border-2 border-gray-800 p-8 hover:border-neon transition-colors group">
                <div className="flex items-center gap-3 mb-4">
                    <Wifi size={32} className="text-red-500 group-hover:animate-pulse" />
                    <h2 className="text-2xl font-black uppercase text-gray-300">SYSTEM LAG</h2>
                </div>
                <p className="font-bold text-gray-500 leading-relaxed">
                    Sistemul academic are latență mare. Cursuri predate într-un limbaj criptat, profesori deconectați de realitate și tone de teorie inutilă.
                    Informația ajunge la tine distorsionată, iar examenul e mâine.
                </p>
            </div>

            <div className="bg-black border-2 border-neon p-8 shadow-[0_0_20px_rgba(57,255,20,0.15)] group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Cpu size={100}/></div>
                <div className="flex items-center gap-3 mb-4">
                    <Share2 size={32} className="text-neon" />
                    <h2 className="text-2xl font-black uppercase text-white">DIRECT LINK</h2>
                </div>
                <p className="font-bold text-gray-300 leading-relaxed relative z-10">
                    Neural Uplink elimină intermediarii. 
                    Te conectezi direct la un student care a decodat deja materia. 
                    Explicații "raw", fără filtre, pe limba ta. 
                    <span className="text-neon block mt-2">Bypass the academic firewall.</span>
                </p>
            </div>
        </div>

        {/* STATS STRIP (WIDE) */}
        <div className="border-y-2 border-gray-800 py-12 mb-20 flex flex-col md:flex-row justify-between items-center text-center gap-8 bg-gray-900/50 backdrop-blur-sm">
            <div className="flex-1">
                <div className="text-5xl md:text-6xl font-black mb-2 text-white">0<span className="text-neon text-2xl">ms</span></div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Latency</div>
            </div>
            <div className="flex-1 border-x-0 md:border-x-2 border-gray-800">
                <div className="text-5xl md:text-6xl font-black mb-2 text-white">P2P</div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Architecture</div>
            </div>
            <div className="flex-1">
                <div className="text-5xl md:text-6xl font-black mb-2 text-white">100<span className="text-neon text-2xl">%</span></div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Signal Clarity</div>
            </div>
        </div>

        {/* PHILOSOPHY / HIVE MIND */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-1 border-l-4 border-white pl-4">
                <h3 className="text-4xl font-black uppercase mb-2 text-white">THE HIVE<br/>MIND</h3>
                <Network className="text-neon mt-4" size={48} />
            </div>
            <div className="md:col-span-2 space-y-6 text-gray-400 font-bold text-lg">
                <p>
                    Nu credem în meditații rigide. Credem în faptul că cel mai bun profesor este colegul din camera de alături care tocmai a luat 10.
                </p>
                <p className="text-white">
                    Platforma funcționează simplu:
                </p>
                <ul className="space-y-3 text-sm md:text-base border-l-2 border-gray-800 pl-4">
                    <li className="flex items-center gap-2"><div className="w-2 h-2 bg-neon"></div> Identifici nodul (Mentorul) compatibil.</li>
                    <li className="flex items-center gap-2"><div className="w-2 h-2 bg-neon"></div> Stabilești conexiunea securizată.</li>
                    <li className="flex items-center gap-2"><div className="w-2 h-2 bg-neon"></div> Transferi datele (înveți materia).</li>
                    <li className="flex items-center gap-2"><div className="w-2 h-2 bg-neon"></div> Închizi conexiunea. Examen promovat.</li>
                </ul>
                <div className="bg-gray-900 p-4 border border-gray-700 mt-6 flex items-start gap-3">
                    <Lock className="text-neon shrink-0 mt-1" size={20}/>
                    <p className="text-xs text-gray-500 font-mono leading-tight">
                        ENCRYPTION NOTICE: Identitatea mentorilor și studenților este protejată până la stabilirea conexiunii. Datele rămân în rețea.
                    </p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}