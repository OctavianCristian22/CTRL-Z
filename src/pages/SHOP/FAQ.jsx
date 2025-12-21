import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: "SHOP",
      q: "Cum pot plasa o comandă ?",
      a: "Navighează în Depot, adaugă produsele dorite în coș și urmează procedura de checkout. Plata se face securizat prin Stripe. Odată confirmată tranzacția, ordinul de livrare este generat instant."
    },
    {
      category: "SHOP",
      q: "Ce metode de plată sunt acceptate ?",
      a: "Acceptăm carduri bancare prin procesatorul securizat. Momentan, Z-Coins pot fi folosiți doar pentru reduceri sau servicii digitale, nu pentru plata integrală a produselor fizice."
    },
    {
      category: "SHOP",
      q: "În cât timp ajunge comanda ?",
      a: "Timpul standard de >deployment< este de 2-4 zile lucrătoare, în funcție de locația ta. Poți urmări statusul (Pending -> Shipped -> Delivered) direct din profilul tău, secțiunea >Mission Logs<."
    },
    {
      category: "SHOP",
      q: "Pot returna un produs dacă nu îmi place ?",
      a: "Da. Ai la dispoziție 14 zile de la recepție pentru a iniția protocolul de retur, cu condiția ca produsul să fie sigilat și în starea originală. Contactează echipa de suport pentru instrucțiuni."
    },
        {
      category: "SHOP",
      q: "Produsul dorit apare ca >Out of Stock<. Când revine ?",
      a: "Inventarul este actualizat săptămânal. Îți recomandăm să adaugi produsul în Wishlist (Saved Gear) pentru a-l monitoriza rapid când reapare în stoc."
    },
        {
      category: "SHOP",
      q: "Datele mele sunt sigure ?",
      a: "Absolut. Folosim criptare standard industrială. Datele tale (telefon, adresă) sunt vizibile doar administratorilor pentru procesarea livrării și sunt șterse din cache-ul operațional după finalizare, conform GDPR."
    },
        {
      category: "SHOP",
      q: "Primesc factură pentru echipament ?",
      a: "Da, factura fiscală se generează automat și este trimisă pe email-ul asociat contului tău imediat ce plata este confirmată."
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