import React from 'react';

export default function FAQ() {
  return (
    <div className="max-w-3xl mx-auto animate-in slide-in-from-right-4 px-4 pt-12">
        <h2 className="text-4xl font-black uppercase mb-8 border-b-4 border-black pb-4 text-center">/// KNOWLEDGE_BASE</h2>
        <div className="space-y-6">
            {[{q: "Cât durează livrarea?", a: "Dacă ești în Brașov, probabil azi. În restul țării, 24-48h."}, {q: "Pot returna produsele?", a: "Ai 14 zile. Dacă nu îți place ceva, trimite-l înapoi."}, {q: "Produsele sunt noi?", a: "Sigilate. Nu vindem hardware fals sau folosit."}, {q: "Primesc factură?", a: "Da, pe mail. Oricum, la ce să-ți trebuiască?"}].map((item, idx) => (
                <div key={idx} className="bg-white border-2 border-black shadow-brutal overflow-hidden group">
                    <div className="bg-gray-100 p-4 font-black text-lg border-b-2 border-black flex items-center gap-3 cursor-pointer group-hover:bg-neon transition-colors"><span className="text-xs bg-black text-white px-2 py-1">Q{idx+1}</span>{item.q}</div>
                    <div className="p-6 font-mono font-bold text-gray-600">{">"} {item.a}</div>
                </div>
            ))}
        </div>
    </div>
  );
}