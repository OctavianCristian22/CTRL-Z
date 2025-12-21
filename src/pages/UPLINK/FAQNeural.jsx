import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
{
      category: "NEURAL UPLINK",
      q: "Cum funcționează Neural Uplink ?",
      a: "Este un protocol P2P (Peer-to-Peer). Tu cauți un mentor în baza de date, apeși >Establish Connection<, iar sistemul vă pune în legătură directă prin Email/Discord pentru a stabili detaliile sesiunii."
    },
    {
      category: "NEURAL UPLINK",
      q: "Cum devin Mentor Verificat ?",
      a: "Accesează >Initialize Mentor Mode< din Neural Uplink. Completează formularul cu materia și prețul tău. Un Admin va revizui aplicația (verifica cunoștințele/notele) și îți va acorda badge-ul de >Verified Mentor<."
    },
{
      category: "NEURAL UPLINK",
      q: "Este sigur să îmi dau datele de contact ?",
      a: "Datele tale (Discord/Telefon) sunt ascunse (criptate) până când tu, ca mentor, accepți o cerere. Studentul vede datele tale doar DUPĂ ce ai apăsat >ACCEPT< la sesiunea respectivă."
    },
        {
      category: "NEURAL UPLINK",
      q: "Unde au loc sesiunile de meditații ?",
      a: "Platforma CTRL-Z este punctul de legătură. Sesiunea propriu-zisă are loc unde stabiliți voi: Discord, Google Meet, Zoom sau fizic (pe propria răspundere). Recomandăm Discord pentru screen-share ușor."
    },
{
      category: "NEURAL UPLINK",
      q: "Ce fac dacă un student/mentor nu apare la oră ?",
      a: "Raportează incidentul. Avem un sistem de >Mission History<. Dacă un utilizator acumulează report-uri negative, îi va fi revocat accesul la Neural Uplink."
    },
    {
      category: "NEURAL UPLINK",
      q: "Pot preda orice materie ?",
      a: "Da. De la programare (Java, Python) la matematică, limbi străine sau chiar chitară. Ecosistemul este deschis pentru orice tip de skill transfer."
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono pt-24 pb-20 px-4 bg-grid-pattern">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-12 text-center">
            <HelpCircle size={64} className="mx-auto text-neon mb-4 animate-bounce" />
            <h1 className="text-5xl font-black uppercase tracking-tighter">KNOWLEDGE_BASE</h1>
            <p className="text-gray-500 font-bold mt-2">FREQUENTLY ASKED QUESTIONS & PROTOCOLS</p>
        </div>

        <div className="space-y-4">
            {faqs.map((faq, index) => (
                <div 
                    key={index} 
                    className={`border-2 transition-all duration-300 ${
                        openIndex === index 
                        ? 'border-neon bg-gray-900' 
                        : 'border-gray-700 bg-black hover:border-white'
                    }`}
                >
                    <button 
                        onClick={() => toggleFAQ(index)}
                        className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                    >
                        <div>
                            <span className={`text-xs font-black px-2 py-1 mr-4 border ${
                                openIndex === index ? 'bg-neon text-black border-neon' : 'text-gray-500 border-gray-500'
                            }`}>
                                {faq.category}
                            </span>
                            <span className={`font-bold text-lg uppercase ${openIndex === index ? 'text-white' : 'text-gray-300'}`}>
                                {faq.q}
                            </span>
                        </div>
                        {openIndex === index ? <Minus className="text-neon" /> : <Plus className="text-gray-500" />}
                    </button>

                    <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                        <div className="p-6 pt-0 text-gray-400 font-bold text-sm border-t border-gray-800 mt-2">
                            <div className="py-4">
                                <span className="text-neon mr-2">{'>'}</span> 
                                {faq.a}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-16 text-center border-t-2 border-dashed border-gray-800 pt-8">
            <p className="text-gray-500 font-bold mb-4">STILL HAVE BUGS?</p>
            <a href="mailto:support@ctrlz.ro" className="bg-white text-black font-black px-8 py-3 uppercase hover:bg-neon hover:text-black transition-all shadow-[4px_4px_0_0_rgba(57,255,20,1)]">
                CONTACT ADMIN
            </a>
        </div>

      </div>
    </div>
  );
}