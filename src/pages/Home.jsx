import React from 'react';
import { ShoppingCart, Terminal, Play, Users, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';


const Typewriter = ({ text, delay }) => {
  const [currentText, setCurrentText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
  
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return <span>{currentText}<span className="animate-pulse">_</span></span>;
};

export default function Home() {
  return (
    <div className="animate-in fade-in duration-500">
        <div className="relative h-[80vh] w-full bg-black border-b-8 border-black overflow-hidden flex items-center justify-center group mb-12">
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                <source src="/video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/20 z-0"></div>
            <div className="relative z-10 text-center p-4">
                 <div className="inline-block bg-neon text-black px-4 py-1 font-black mb-6 animate-pulse">/// SIGNAL_ESTABLISHED</div>
                 <h1 className="text-6xl md:text-9xl font-black text-white mb-4 leading-none tracking-tighter mix-blend-difference">CTRL<span className="text-neon">-Z</span></h1>
<div className="text-xl md:text-2xl font-bold text-gray-300 mb-8 max-w-2xl mx-auto border-l-4 border-neon pl-4 shadow-xl bg-black/50 p-4 backdrop-blur-sm min-h-[100px] flex items-center">
    <Typewriter text="> Nu lăsa sesiunea să te prindă nepregătit. Gear tactic pentru studenți și developeri nocturni..." delay={50} />
</div>                 <Link to="/shop" className="bg-neon text-black text-xl font-black py-4 px-10 border-4 border-black hover:bg-white hover:scale-105 transition-all uppercase flex items-center gap-3 mx-auto shadow-brutal w-fit">
                    <Terminal size={24} /> START_SHOPPING.EXE
                 </Link>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mb-24 text-center">
            <h2 className="text-3xl font-black mb-8 uppercase">Ce cauți astăzi?</h2>
            <div className="grid md:grid-cols-3 gap-4">
                <Link to="/shop" className="border-4 border-black p-8 hover:bg-black hover:text-white cursor-pointer transition-all shadow-brutal flex flex-col items-center gap-4">
                    <ShoppingCart size={48} /><span className="text-2xl font-black uppercase">Magazin Full</span>
                </Link>
                <Link to="/about" className="border-4 border-black p-8 hover:bg-neon hover:text-black cursor-pointer transition-all shadow-brutal flex flex-col items-center gap-4">
                    <Users size={48} /><span className="text-2xl font-black uppercase">Echipa</span>
                </Link>
                <Link to="/faq" className="border-4 border-black p-8 hover:bg-error hover:text-white cursor-pointer transition-all shadow-brutal flex flex-col items-center gap-4">
                    <HelpCircle size={48} /><span className="text-2xl font-black uppercase">Ajutor (FAQ)</span>
                </Link>
            </div>
        </div>
    </div>
  );
}