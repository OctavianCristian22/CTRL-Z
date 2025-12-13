import React, { useState, useEffect } from 'react';
import { Terminal, Zap, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ComingSoon() {
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const fullText = "INITIALIZING_SYSTEM... [CTRL-Z] STORE LOADING...";
  const targetDate = new Date("2026-07-04T00:00:00").getTime(); 
  const startDate = new Date("2025-12-13T00:00:00").getTime();
  
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(typing);
    }, 50);
    return () => clearInterval(typing);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      
      const distance = targetDate - now;

      const totalDuration = targetDate - startDate;
      const timeElapsed = now - startDate;
      const percentage = (timeElapsed / totalDuration) * 100;

      if (distance < 0) {
        clearInterval(interval);
        setProgress(100);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setProgress(percentage);
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [targetDate, startDate]);

  const formatTime = (time) => time < 10 ? `0${time}` : time;

  return (
    <div className="min-h-screen bg-black text-neon font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-neon selection:text-black">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>
      
      <div className="z-20 max-w-4xl w-full text-center space-y-8 border-4 border-neon p-8 md:p-12 shadow-[0_0_50px_rgba(57,255,20,0.2)] bg-black/90 backdrop-blur-sm relative">
        
        <div className="absolute top-0 left-0 w-4 h-4 bg-neon"></div>
        <div className="absolute top-0 right-0 w-4 h-4 bg-neon"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 bg-neon"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-neon"></div>

        <div className="flex justify-center mb-4">
            <Zap size={64} className="animate-pulse text-white" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-white">
          CTRL - Z
        </h1>
        
        <div className="w-full space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase font-mono">
                <span className="flex items-center gap-2"><ShieldCheck size={14}/> INSTALLING_UPDATE...</span>
                <span className="text-neon">{progress.toFixed(6)}%</span>
            </div>
            <div className="h-6 w-full bg-gray-900 border-2 border-neon p-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] w-full h-full animate-[shimmer_2s_infinite]"></div>
                
                <div 
                    className="h-full bg-neon transition-all duration-75 linear shadow-[0_0_15px_#39FF14]" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>

        <div className="min-h-[30px] text-lg font-bold text-gray-300 border-b border-dashed border-gray-700 pb-6">
             {text}<span className="animate-pulse text-neon">_</span>
        </div>

        <div className="pt-6">
            <div className="flex items-center justify-center gap-2 mb-6 text-neon animate-pulse">
                <AlertTriangle size={20} />
                <span className="font-black tracking-widest uppercase">Launch Sequence Initiated</span>
                <AlertTriangle size={20} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                <div className="bg-gray-900 border-2 border-gray-700 p-4 flex flex-col items-center justify-center shadow-lg group">
                    <span className="text-4xl md:text-6xl font-black text-white mb-2">{formatTime(timeLeft.days)}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Days</span>
                </div>
                <div className="bg-gray-900 border-2 border-gray-700 p-4 flex flex-col items-center justify-center shadow-lg group">
                    <span className="text-4xl md:text-6xl font-black text-white mb-2">{formatTime(timeLeft.hours)}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Hours</span>
                </div>
                <div className="bg-gray-900 border-2 border-gray-700 p-4 flex flex-col items-center justify-center shadow-lg group">
                    <span className="text-4xl md:text-6xl font-black text-white mb-2">{formatTime(timeLeft.minutes)}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Mins</span>
                </div>
                <div className="bg-gray-900 border-2 border-neon p-4 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.1)]">
                    <span className="text-4xl md:text-6xl font-black text-neon mb-2 animate-pulse">{formatTime(timeLeft.seconds)}</span>
                    <span className="text-xs font-bold text-neon uppercase tracking-[0.2em]">Secs</span>
                </div>
            </div>
        </div>

        <div className="pt-8">
            <p className="text-gray-500 text-xs font-mono">
                SERVER: RO-<span className="text-error font-black animate-pulse tracking-widest bg-black px-1">[REDACTED]</span>-01 <br/> 
                STATUS: <span className="text-neon animate-pulse">COMPILING ASSETS</span>
            </p>
        </div>
      </div>
    </div>
  );
}