import React, { useState, useEffect } from 'react';

const GlitchText = ({ 
  children, 
  speed = 1, 
  enableShadows = true, 
  enableOnHover = true, 
  triggerEvery = 0, 
  className = "" 
}) => {
  const duration = 2 / speed; 
  
  const [isAutoGlitching, setIsAutoGlitching] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!triggerEvery || triggerEvery <= 0) return;

    const intervalId = setInterval(() => {
      setIsAutoGlitching(true);
      
      setTimeout(() => {
        setIsAutoGlitching(false);
      }, 1000); 

    }, triggerEvery);

    return () => clearInterval(intervalId);
  }, [triggerEvery]);

  const isActive = isAutoGlitching;

  return (
    <div 
      className={`relative inline-block group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        .glitch-wrapper {
          position: relative;
          display: inline-block;
        }
        
        .glitch-base {
          position: relative;
          z-index: 10;
        }

        .glitch-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          z-index: 20;
          pointer-events: none;
        }

        /* Continutul pseudo-elementelor */
        .glitch-layer::before,
        .glitch-layer::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #000; /* Background negru sa acopere textul alb */
        }

        /* Doar cand clasa .glitch-active este prezenta, straturile devin vizibile si se anima */
        .glitch-active {
          opacity: 1 !important;
        }

        /* Animatiile ruleaza mereu, dar se vad doar cand opacity e 1 */
        .glitch-layer::before {
          left: 2px;
          text-shadow: -1px 0 #ff00c1;
          clip-path: inset(44% 0 61% 0);
          animation: glitch-anim-1 var(--duration) infinite linear alternate-reverse;
        }

        .glitch-layer::after {
          left: -2px;
          text-shadow: -1px 0 #00fff9;
          clip-path: inset(50% 0 30% 0);
          animation: glitch-anim-2 var(--duration) infinite linear alternate-reverse;
        }

        @keyframes glitch-anim-1 {
          0% { clip-path: inset(20% 0 80% 0); }
          20% { clip-path: inset(60% 0 10% 0); }
          40% { clip-path: inset(40% 0 50% 0); }
          60% { clip-path: inset(80% 0 5% 0); }
          80% { clip-path: inset(10% 0 70% 0); }
          100% { clip-path: inset(30% 0 20% 0); }
        }
        @keyframes glitch-anim-2 {
          0% { clip-path: inset(10% 0 60% 0); }
          20% { clip-path: inset(80% 0 5% 0); }
          40% { clip-path: inset(30% 0 20% 0); }
          60% { clip-path: inset(10% 0 80% 0); }
          80% { clip-path: inset(50% 0 40% 0); }
          100% { clip-path: inset(0% 0 10% 0); }
        }
      `}</style>

      <div 
        className="glitch-wrapper font-black uppercase tracking-tighter"
        style={{ '--duration': `${duration}s` }}>
        <span className="glitch-base text-current block">
          {children}
        </span>

        <span 
          className={`glitch-layer ${isActive ? 'glitch-active' : ''}`} 
          data-text={children}
          aria-hidden="true"
        >
        </span>
      </div>
    </div>
  );
};

export default GlitchText;