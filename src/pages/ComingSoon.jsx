import React, { useState, useEffect } from 'react';
import { Zap, Lock } from 'lucide-react';
import GlitchText from '../components/text/GlitchText';

export default function ComingSoon() {
  const [text, setText] = useState('');
  const fullText = "ACCESS_RESTRICTED // SYSTEM_UPGRADE_IN_PROGRESS...";

  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(typing);
    }, 50);
    return () => clearInterval(typing);
  }, []);

  return (
    <div className="min-h-screen bg-black text-neon font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-neon selection:text-black">

      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>
      
      <div className="z-20 w-full max-w-4xl text-center border-y-2 border-neon/30 py-12 md:py-20 bg-black/80 backdrop-blur-sm relative">
        
        <div className="flex justify-center mb-4">
            <div className="relative">
                <div className="absolute inset-0 bg-neon blur-xl opacity-20"></div>
                <Zap size={48} className="text-white relative z-10" />
            </div>
        </div>

                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-8 ">
                    <GlitchText speed={100} enableOnHover={true} triggerEvery={3000}>CTRL&nbsp;</GlitchText>
                    <span className="text-neon">
                        <GlitchText speed={100} enableOnHover={true} triggerEvery={3000}>- Z</GlitchText>
                    </span>
                </h1>

        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-2 relative inline-block opacity-50">
          COMING SOON
        </h1>

        <div className="mt-8 text-sm md:text-lg font-bold text-neon/80 tracking-widest uppercase">
            {text}<span className="animate-pulse">_</span>
        </div>

        <div className="mt-12 flex justify-center opacity-50">
            <Lock size={24} className="animate-pulse" />
        </div>

      </div>
      <div className="absolute bottom-8 text-center z-20">
          <p className="text-gray-500 text-xs font-mono">
              SERVER: RO-<span className="text-red-600 font-black animate-pulse tracking-widest bg-black px-1">[REDACTED]</span>-01 <br/> 
              STATUS: <span className="text-neon animate-pulse">DEPLOYING</span>
          </p>
      </div>
    </div>
  );
}