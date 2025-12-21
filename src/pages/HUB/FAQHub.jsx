import React, { useState } from 'react';
import LandingNavbar from '../../components/LandingNavbar';
import { ChevronDown, ChevronUp, ShoppingCart, Brain, Globe } from 'lucide-react';

const faqData = [
  {
    category: "SYSTEM OVERALL",
    icon: <Globe className="text-neon" />,
    questions: [
      { q: "Ce înseamnă CTRL-Z ?", a: "Este comanda universală pentru >Undo<. Filosofia noastră este că în viața de student greșelile, restanțele sau lipsurile pot fi corectate dacă ai uneltele potrivite. Noi suntem acele unelte." },
      { q: "Este gratuit să îmi fac cont ?", a: "Da. Accesul în ecosistem este gratuit pentru toți studenții. Plătești doar pentru produsele fizice din Shop sau pentru timpul mentorilor." },
      { q: "Am uitat parola. Cum o resetez ?", a: "În pagina de Login, folosește funcția >Forgot Password<. Vei primi un link de resetare pe email. Dacă ai activat 2FA și ai pierdut PIN-ul, contactează un Admin." },
      { q: "Cum îmi protejez contul ?", a: "Recomandăm activarea 2-Factor Authentication (2FA) din Profil -> Configuration. Vei seta un PIN din 4 cifre care va fi cerut la operațiuni sensibile sau login." },
      { q: "Există o aplicație de mobil ?", a: "Platforma este optimizată 100% pentru mobil. Poți adăuga site-ul pe ecranul principal și se va comporta ca o aplicație nativă. O aplicație dedicată este în lucru pentru v2.0." },
      { q: "Vreau sa raportez o problema.", a: "Suntem în continuă dezvoltare. Dacă găsești un >glitch in the matrix<, te rugăm să ne scrii pe pagina de Contact. Poți primi Z-Coins recompensă pentru bug hunting." },
      { q: "Cine deține platforma ?", a: "CTRL-Z este un proiect creat de studenți, pentru studenți. Suntem o comunitate independentă care dorește să modernizeze experiența academică." }
    ]
  }
];

const FAQItem = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-2 border-gray-800 mb-2 bg-black hover:border-gray-600 transition-colors">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full text-left p-4 flex justify-between items-center font-bold text-sm uppercase hover:text-neon"
      >
        {q}
        {isOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 text-gray-400 text-sm border-t border-gray-900 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
};

export default function FAQ() {
  return (
    <div className="min-h-screen bg-black text-white font-mono pt-24 pb-20 px-4">
      <LandingNavbar />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black uppercase mb-2">Help_<span className="text-neon">Center</span></h1>
        <p className="text-gray-500 font-bold mb-12 border-l-4 border-neon pl-4">DATABASE OF COMMON INQUIRIES.</p>

        <div className="space-y-12">
          {faqData.map((section, idx) => (
            <div key={idx}>
              <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-2 border-gray-800 pb-2">
                {section.icon} {section.category}
              </h2>
              <div className="grid gap-2">
                {section.questions.map((item, i) => (
                  <FAQItem key={i} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}