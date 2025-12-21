import React from 'react';
import LandingNavbar from '../../components/LandingNavbar';
import { Target, Zap, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white font-mono pt-24 pb-20 px-4 bg-grid-pattern">
      <LandingNavbar />
      
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-16">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-none">
                THE STUDENT <br/>
                <span className="text-neon">OVERRIDE</span> PROTOCOL.
            </h1>
            <p className="text-xl md:text-2xl font-bold text-gray-400 max-w-2xl">
                CTRL-Z nu este doar o platformă. Este un ecosistem digital unde haosul studenției primește un update de sistem.
            </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="border-4 border-white p-6 hover:translate-y-[-4px] transition-transform bg-black">
                <Target size={40} className="text-neon mb-4"/>
                <h3 className="text-xl font-black uppercase mb-2">MISSION</h3>
                <p className="text-sm text-gray-400">Să eliminăm sintagma "nu se poate". Oferim uneltele necesare pentru ca tu să îți transformi restanțele în reușite.</p>
            </div>
            <div className="border-4 border-white p-6 hover:translate-y-[-4px] transition-transform bg-black">
                <Users size={40} className="text-neon mb-4"/>
                <h3 className="text-xl font-black uppercase mb-2">COLLECTIVE</h3>
                <p className="text-sm text-gray-400">Un Jack-of-all-trades creat de studenți, pentru studenți. O comunitate descentralizată axată pe evoluție.</p>
            </div>
            <div className="border-4 border-white p-6 hover:translate-y-[-4px] transition-transform bg-black">
                <Zap size={40} className="text-neon mb-4"/>
                <h3 className="text-xl font-black uppercase mb-2">ECOSYSTEM</h3>
                <p className="text-sm text-gray-400">Shop. Mentorship. Resources. Tot ce ai nevoie într-un singur grid, la un click distanță.</p>
            </div>
        </div>

        <div className="border-l-8 border-neon pl-8 py-4 bg-gray-900/50">
            <p className="text-2xl font-black uppercase italic">
                "În viață nu există buton de Undo, dar în facultate există CTRL-Z."
            </p>
        </div>

      </div>
    </div>
  );
}