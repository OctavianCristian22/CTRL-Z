import React from 'react';
import { Globe, Hash } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto animate-in zoom-in duration-300 px-4 pt-12">
        <div className="bg-black text-white p-8 border-4 border-neon shadow-brutal mb-12">
            <h1 className="text-5xl font-black uppercase mb-4 text-neon">/// ORIGIN_STORY</h1>
            <p className="text-xl font-mono leading-relaxed mb-6">CTRL-Z nu e o corporație. E un răspuns la o problemă simplă: <span className="bg-white text-black px-1 mx-1 font-bold">tech-ul pentru studenți e ori prea scump, ori prea prost.</span></p>
            <p className="text-gray-400 font-bold border-l-4 border-white pl-4"> Fondat într-o cameră de cămin din Brașov, la ora 3 dimineața, după ce au fost băute 3 cafele.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border-4 border-black p-6 shadow-brutal"><Globe size={40} className="mb-4 text-gray-400" /><h3 className="text-2xl font-black uppercase mb-2">MISIUNEA</h3><p className="font-bold text-gray-600">Să aducem gear accesibil, testat în condiții de stres (sesiune), direct la tine pe birou.</p></div>
            <div className="bg-white border-4 border-black p-6 shadow-brutal"><Hash size={40} className="mb-4 text-gray-400" /><h3 className="text-2xl font-black uppercase mb-2">CODUL NOSTRU</h3><p className="font-bold text-gray-600">Fără BS. Fără marketing corporatist. Doar produse care funcționează.</p></div>
        </div>
    </div>
  );
}