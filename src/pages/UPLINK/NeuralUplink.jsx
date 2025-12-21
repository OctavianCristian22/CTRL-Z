import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Cpu, BookOpen, Calculator, Languages, ShieldCheck, Zap, Signal, Ghost, Lock, Search, Star, Clock } from 'lucide-react'; // Added Clock
import toast from 'react-hot-toast';
import { db } from '../../firebase'; 
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

export default function NeuralUplink({ user, userData, openLoginModal }) {
  const [filter, setFilter] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]); 
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const navigate = useNavigate();

  // 1. CITIREA ANUNTURILOR
  useEffect(() => {
    const q = query(collection(db, "listings"), where("status", "==", "active"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedListings = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setListings(fetchedListings);
        setLoading(false); 
    });
    return () => unsubscribe();
  }, []);

  // 2. VERIFICARE SESIUNE ACTIVA
  useEffect(() => {
      if(!user) return;
      const q = query(
          collection(db, "sessions"), 
          where("studentId", "==", user.uid),
          where("status", "in", ["pending", "active"]) 
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
          setHasActiveSession(!snapshot.empty);
      });

      return () => unsubscribe();
  }, [user]);

  const getSubjectIcon = (subject) => {
      if (!subject) return <BookOpen size={16}/>;
      const sub = subject.toLowerCase();
      if (sub.includes('progr') || sub.includes('code') || sub.includes('c++') || sub.includes('java')) return <Cpu size={16}/>;
      if (sub.includes('mate') || sub.includes('calc') || sub.includes('algebr')) return <Calculator size={16}/>;
      if (sub.includes('engl') || sub.includes('franc') || sub.includes('germ')) return <Languages size={16}/>;
      return <BookOpen size={16}/>;
  };

  // --- CONNECT LOGIC ---
  const handleConnect = async (listing) => {
    if (!user) { toast.error("ACCESS DENIED. LOGIN REQUIRED."); openLoginModal(); return; }
    if (user.uid === listing.userId) { toast.error("SYSTEM ERROR: CANNOT CONNECT TO SELF."); return; }
    if (hasActiveSession) { toast.error("LINE BUSY! Finalizează sesiunea curentă."); return; }

    const toastId = toast.loading("Encrypting secure channel...");

    try {
        await addDoc(collection(db, "sessions"), {
            studentId: user.uid,
            studentName: userData?.username || user.displayName || user.email,
            studentEmail: user.email,
            mentorId: listing.userId,
            mentorName: listing.username,
            mentorContact: listing.contactInfo || listing.userEmail,
            subject: listing.subject,
            price: listing.price,
            status: 'pending',
            createdAt: serverTimestamp()
        });

        await new Promise(r => setTimeout(r, 1000));

        toast.success("CONNECTION ESTABLISHED!", { id: toastId });

    } catch (error) {
        console.error(error);
        toast.error("Connection failed.", { id: toastId });
    }
  };

  const handleProtectedAction = (action) => {
    if (!user) { toast.error("ACCESS DENIED. LOGIN REQUIRED."); openLoginModal(); } else { action(); }
  };

  const filteredListings = listings.filter(l => {
      if (filter === '') return true; 
      const search = filter.toLowerCase();
      return l.subject?.toLowerCase().includes(search) || 
             l.tags?.some(tag => tag.toLowerCase().includes(search));
  });

  return (
    <div className="min-h-screen bg-black text-white font-mono pb-20 pt-24 bg-grid-pattern">
      <div className="max-w-7xl mx-auto px-4 mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-neon font-bold uppercase transition-colors mb-6">
            <ArrowLeft size={20} /> RETURN TO HUB
          </Link>
          
          <div className="border-l-4 border-neon pl-6 py-2 mb-12">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-2">NEURAL_<span className="text-neon">UPLINK</span></h1>
            <p className="text-gray-400 font-bold max-w-xl">PEER-TO-PEER KNOWLEDGE TRANSFER PROTOCOL.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-between items-end border-b-2 border-gray-800 pb-6">
             <div className="flex-1 w-full md:w-auto relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon transition-colors" size={20}/>
                <input type="text" placeholder="SEARCH DATABASE (SUBJECT, TAGS...)" value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full bg-black border-2 border-gray-700 p-4 pl-12 text-white font-bold uppercase focus:border-neon focus:outline-none transition-all placeholder-gray-600 shadow-[4px_4px_0_0_#222] focus:shadow-[4px_4px_0_0_#39FF14]"/>
             </div>
            <button onClick={() => handleProtectedAction(() => navigate('/uplink/apply'))} className="bg-white text-black font-black px-6 py-4 border-2 border-white hover:bg-black hover:text-white hover:border-white transition-all uppercase flex items-center gap-2 shadow-brutal animate-pulse whitespace-nowrap">
                <Zap size={20} className="fill-black group-hover:fill-white"/> BECOME MENTOR
            </button>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => (<div key={i} className="h-64 bg-gray-900 border-2 border-gray-800 animate-pulse"></div>))}</div>
        ) : filteredListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-gray-800 border-dashed text-gray-600"><Ghost size={64} className="mb-4 opacity-50"/><h3 className="text-2xl font-black uppercase mb-2">NO SIGNALS DETECTED</h3><p className="font-bold text-sm">No matches found for "{filter}".</p>{filter !== '' && <button onClick={() => setFilter('')} className="mt-4 text-neon underline">Clear Search</button>}</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredListings.map((listing) => (
                    <div key={listing.id} className="group bg-black border-2 border-gray-700 hover:border-neon transition-all duration-300 relative overflow-hidden flex flex-col h-full hover:shadow-[0_0_30px_rgba(57,255,20,0.1)]">
                        <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-800 rounded-full border border-gray-600 flex items-center justify-center font-black text-lg overflow-hidden">
                                    {listing.userPhoto ? (<img src={listing.userPhoto} alt={listing.username} className="w-full h-full object-cover"/>) : ((listing.username || "U")[0].toUpperCase())}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white uppercase leading-none flex items-center gap-1">{listing.username || "AGENT"} <ShieldCheck size={14} className="text-neon" /></h3>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">VERIFIED MENTOR</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-neon font-black text-xl">{listing.price} ZC</div>
                                <div className="text-[10px] text-gray-500 uppercase">PER HOUR</div>
                            </div>
                        </div>

                        <div className="p-6 flex-grow relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-gray-800 text-white px-2 py-1 text-xs font-bold uppercase flex items-center gap-1 border border-gray-600">
                                    {getSubjectIcon(listing.subject)} {listing.subject}
                                </span>
                                {listing.rating ? (<span className="text-yellow-500 font-bold text-sm flex items-center gap-1"><Star size={14} fill="currentColor" /> {listing.rating.toFixed(1)} <span className="text-gray-600 text-[10px]">({listing.ratingCount})</span></span>) : (<span className="text-gray-600 font-bold text-xs uppercase bg-gray-900 px-1 border border-gray-800">NEW</span>)}
                            </div>
                            
                            <p className="text-gray-400 text-sm mb-6 line-clamp-3">{listing.description}</p>

                            {/* 1. DISPLAY AVAILABILITY */}
                            {listing.availability && (
                                <div className="mb-4 text-xs font-bold text-gray-500 flex items-center gap-2 border-t border-gray-800 pt-2">
                                    <Clock size={12} className="text-neon"/> 
                                    <span className="uppercase text-white">{listing.availability}</span>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 mt-auto">
                                {listing.tags?.map((tag, idx) => (<span key={idx} className="text-[10px] font-bold border border-gray-600 px-2 py-0.5 text-gray-500 uppercase">#{tag}</span>))}
                            </div>
                        </div>

                        <button onClick={() => handleConnect(listing)} disabled={hasActiveSession} className={`w-full font-black py-4 uppercase transition-colors flex items-center justify-center gap-2 tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300 absolute bottom-0 left-0 right-0 z-20 ${hasActiveSession ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-neon text-black hover:bg-white'}`}>
                            {hasActiveSession ? <><Lock size={18} /> SESSION ACTIVE</> : <><Signal size={18} /> ESTABLISH_CONNECTION</>}
                        </button>
                        <div className="p-4 border-t border-gray-800 text-center text-xs font-bold text-gray-600 uppercase group-hover:opacity-0 transition-opacity pointer-events-none">HOVER TO CONNECT</div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}