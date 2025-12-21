import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { 
  collection, query, where, onSnapshot, 
  doc, updateDoc, orderBy, getDoc, setDoc, addDoc 
} from 'firebase/firestore'; 
import { Check, X, Shield, ExternalLink, AlertTriangle, UserX, CheckCircle, FileText, Ban, Search, Copy, Filter, Activity, Clock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function UplinkAdmin({ userData }) {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]); 
  const [reports, setReports] = useState([]);
  
  // --- QoL STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [reportFilter, setReportFilter] = useState('all'); 

  if (userData?.role !== 'admin') {
      return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-black font-mono text-3xl">RESTRICTED AREA</div>;
  }

  // 1. Fetch PENDING LISTINGS
  useEffect(() => {
    const q = query(collection(db, "listings"), where("status", "==", "pending"));
    const unsub = onSnapshot(q, (snap) => {
        setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // 2. Fetch Reports
  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
        setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // --- HELPER: Time Ago ---
  const getTimeAgo = (timestamp) => {
      if (!timestamp) return 'UNKNOWN';
      const seconds = Math.floor((new Date() - new Date(timestamp.seconds * 1000)) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + " YRS AGO";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + " MO AGO";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + " DAYS AGO";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + " HRS AGO";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + " MIN AGO";
      return "JUST NOW";
  };

  // --- HELPER: Urgency Check ---
  const isUrgent = (timestamp) => {
      if (!timestamp) return false;
      const hours = Math.abs(new Date() - new Date(timestamp.seconds * 1000)) / 36e5;
      return hours > 24; // Daca e mai vechi de 24h e urgent
  };

  // --- HELPER: Copy ID ---
  const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
      toast.success("ID COPIED", { icon: '📋', style: { background: '#333', color: '#fff' } });
  };

  const logAdminAction = async (actionType, details) => {
      try {
          await addDoc(collection(db, "admin_logs"), {
              adminId: userData.uid || 'unknown',
              adminName: userData.username || 'Admin',
              action: actionType,
              details: details,
              timestamp: new Date()
          });
      } catch (e) { console.error("Log failed", e); }
  };

  // --- LOGICA ANUNTURI (Listings) ---
  const handleDecision = async (listingId, userId, decision) => {
      const listingRef = doc(db, "listings", listingId);
      const userRef = doc(db, "users", userId);
      try {
          if (decision === 'approve') {
              await updateDoc(listingRef, { status: 'active' });
              await updateDoc(userRef, { isTutor: true, tutorStatus: 'active' });
              await logAdminAction('LISTING_APPROVE', { listingId, userId });
              toast.success("LISTING ACTIVE. AGENT VERIFIED.");
          } else {
              await updateDoc(listingRef, { status: 'rejected' });
              await logAdminAction('LISTING_REJECT', { listingId, userId });
              toast.error("LISTING REJECTED.");
          }
      } catch (err) { toast.error("System Error"); }
  };

  // --- LOGICA RAPOARTE ---
  const handleReportAction = async (report, action) => {
      const reportRef = doc(db, "reports", report.id);
      const userRef = doc(db, "users", report.targetUserId);

      try {
          if (action === 'reject') {
              await updateDoc(reportRef, { status: 'rejected' });
              await logAdminAction('REPORT_DISMISS', { reportId: report.id });
              toast.success("RAPORT RESPINS. NO PENALTY.");
              return;
          }
          if (action === 'approve') {
              const userSnap = await getDoc(userRef);
              if (!userSnap.exists()) { toast.error("User missing."); return; }
              const targetUser = userSnap.data();
              const currentReports = targetUser.reportsCount || 0;
              const newCount = currentReports + 1;
              let userUpdates = { reportsCount: newCount };
              let outcomeMsg = `AVERTISMENT APLICAT (Total: ${newCount})`;

              if (newCount >= 25) {
                  userUpdates.isBanned = true;
                  userUpdates.tutorStatus = 'banned';
                  userUpdates.isTutor = false;
                  if (targetUser.ip) {
                      await setDoc(doc(db, "banned_ips", targetUser.ip.replace(/\./g, '_')), {
                          ip: targetUser.ip,
                          reason: "Too many reports (25+)",
                          bannedAt: new Date()
                      });
                  }
                  outcomeMsg = "USER BANAT (IP BLACKLISTED).";
              } else if (newCount >= 10 && targetUser.isTutor) {
                  userUpdates.isTutor = false;
                  userUpdates.tutorStatus = 'demoted'; 
                  outcomeMsg = "MENTOR RETROGRADAT LA LEARNER.";
              }

              await updateDoc(userRef, userUpdates);
              await updateDoc(reportRef, { status: 'approved', outcome: outcomeMsg });
              await logAdminAction('REPORT_VALIDATE', { reportId: report.id, newCount, outcome: outcomeMsg });
              toast.success(outcomeMsg);
          }
      } catch(e) { toast.error("Eroare la procesarea raportului."); }
  };

  // --- FILTRARE ---
  const filteredRequests = requests.filter(req => 
      req.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReports = reports.filter(rep => {
      const matchesSearch = 
          rep.targetUserName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
          rep.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rep.reporterName?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (reportFilter === 'pending') return rep.status === 'pending';
      if (reportFilter === 'resolved') return rep.status !== 'pending';
      return true; 
  });

  // --- CALCUL STATS ---
  const pendingCount = requests.length;
  const criticalReports = reports.filter(r => r.status === 'pending').length;
  const bannedToday = reports.filter(r => r.outcome?.includes('BANAT')).length; // Simplist

  return (
    <div className="min-h-screen bg-black font-mono p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        
        {/* --- QoL FEATURE: HUD STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-900 border-l-4 border-neon p-4 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-xs font-bold uppercase">Pending Listings</p>
                    <p className="text-3xl text-white font-black">{pendingCount}</p>
                </div>
                <Activity className="text-neon opacity-50" size={32} />
            </div>
            <div className={`bg-gray-900 border-l-4 ${criticalReports > 0 ? 'border-red-600 animate-pulse' : 'border-gray-700'} p-4 flex items-center justify-between`}>
                <div>
                    <p className="text-gray-500 text-xs font-bold uppercase">Active Incidents</p>
                    <p className={`text-3xl font-black ${criticalReports > 0 ? 'text-red-500' : 'text-white'}`}>{criticalReports}</p>
                </div>
                <AlertTriangle className={`${criticalReports > 0 ? 'text-red-600' : 'text-gray-600'} opacity-50`} size={32} />
            </div>
            <div className="bg-gray-900 border-l-4 border-purple-600 p-4 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-xs font-bold uppercase">System Status</p>
                    <p className="text-xl text-white font-bold tracking-widest">ONLINE</p>
                </div>
                <Shield className="text-purple-600 opacity-50" size={32} />
            </div>
        </div>

        {/* HEADER & SEARCH */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b-4 border-neon pb-4 mb-8 gap-4">
            <div>
                <h1 className="text-4xl text-white font-black uppercase tracking-tighter flex items-center gap-3">
                    <Shield className="text-neon" size={40}/> OVERWATCH_PANEL
                </h1>
                <p className="text-gray-500 mt-2 font-bold">VERIFY LISTINGS. PROTECT THE NETWORK.</p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon" size={16} />
                    <input 
                        type="text" 
                        placeholder="SEARCH DATABASE..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-900 border border-gray-700 text-white pl-10 pr-4 py-2 w-64 text-sm focus:border-neon outline-none uppercase font-bold transition-all focus:w-80"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <button onClick={() => setActiveTab('requests')} className={`px-4 py-2 font-bold uppercase ${activeTab === 'requests' ? 'bg-neon text-black' : 'bg-gray-800 text-gray-400'}`}>LISTINGS</button>
                        <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 font-bold uppercase flex items-center gap-2 ${activeTab === 'reports' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>REPORTS</button>
                    </div>
                    <Link to="/uplink/profile" className="text-white hover:text-neon underline font-bold ml-4">Back</Link>
                </div>
            </div>
        </div>

        {/* --- TAB REQUESTS (LISTINGS) --- */}
        {activeTab === 'requests' && (
            <>
                {filteredRequests.length === 0 ? (
                    <div className="text-center py-20 text-gray-600 font-bold text-xl uppercase border-2 border-gray-800 border-dashed">
                        {searchTerm ? 'NO MATCHES FOUND.' : 'NO PENDING LISTINGS. GRID CLEAR.'}
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredRequests.map(req => {
                            // --- QoL: AUTO TAGS ---
                            const isCheap = req.price && parseInt(req.price) < 15;
                            const isShort = req.description && req.description.length < 50;

                            return (
                                <div key={req.id} className="bg-gray-900 border-2 border-gray-700 p-6 flex flex-col md:flex-row gap-6 items-start animate-in slide-in-from-left duration-300">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-yellow-500 text-black px-2 py-0.5 text-xs font-black uppercase">PENDING REVIEW</span>
                                            <span className="text-gray-500 text-xs font-mono flex items-center gap-1">
                                                <Clock size={12}/> {getTimeAgo(req.updatedAt)}
                                            </span>
                                            {/* Auto Tags Display */}
                                            {isCheap && <span className="bg-blue-900 text-blue-200 px-2 py-0.5 text-[10px] font-bold uppercase border border-blue-500">LOW PRICE</span>}
                                            {isShort && <span className="bg-orange-900 text-orange-200 px-2 py-0.5 text-[10px] font-bold uppercase border border-orange-500">SHORT DESC</span>}
                                        </div>
                                        <h3 className="text-2xl text-white font-black uppercase mb-1 flex items-center gap-2">
                                            {req.username} 
                                            <button onClick={() => copyToClipboard(req.userId)} title="Copy UID" className="text-gray-600 hover:text-white"><Copy size={14}/></button>
                                            <span className="text-gray-500 text-lg font-normal">vrea să predea</span> <span className="text-neon">{req.subject}</span>
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mt-4">
                                            <div className="bg-black p-3 border border-gray-700">
                                                <span className="text-gray-500 block text-xs uppercase mb-1">Preț</span>
                                                <span className="font-bold text-white text-lg">{req.price} ZC / h</span>
                                            </div>
                                            <div className="bg-black p-3 border border-gray-700">
                                                <span className="text-gray-500 block text-xs uppercase mb-1">Contact</span>
                                                <span className="font-bold text-white break-all">{req.contactInfo}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 bg-black p-3 border-l-4 border-gray-600">
                                            <p className="text-gray-300 italic text-sm">"{req.description}"</p>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-64 flex flex-col gap-2">
                                        <p className="text-xs font-bold text-white uppercase flex items-center gap-1"><FileText size={12}/> PROOF:</p>
                                        <div className="aspect-video bg-black border border-gray-600 flex items-center justify-center overflow-hidden relative group">
                                            {req.verificationProof ? (
                                                <a href={req.verificationProof} target="_blank" className="text-neon font-bold flex items-center gap-2"><ExternalLink size={16}/> OPEN PROOF</a>
                                            ) : <span className="text-gray-500 text-xs">NO PROOF</span>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 w-full md:w-auto min-w-[140px]">
                                        <button onClick={() => handleDecision(req.id, req.userId, 'approve')} className="bg-neon text-black font-black px-6 py-4 hover:bg-white uppercase flex items-center justify-center gap-2 transition-colors">
                                            <Check size={20}/> ACTIVATE
                                        </button>
                                        <button onClick={() => handleDecision(req.id, req.userId, 'reject')} className="bg-red-600 text-white font-black px-6 py-4 hover:bg-white hover:text-red-600 border-2 border-transparent hover:border-red-600 uppercase flex items-center justify-center gap-2 transition-colors">
                                            <X size={20}/> REFUSE
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </>
        )}

        {/* --- TAB REPORTS --- */}
        {activeTab === 'reports' && (
            <div className="space-y-4">
                
                <div className="flex items-center gap-4 text-xs font-bold mb-4 bg-gray-900 p-2 border border-gray-800 w-fit">
                    <span className="text-gray-500 flex items-center gap-1"><Filter size={12}/> FILTER:</span>
                    <button onClick={() => setReportFilter('all')} className={`${reportFilter === 'all' ? 'text-neon underline' : 'text-gray-400 hover:text-white'}`}>ALL</button>
                    <span className="text-gray-700">/</span>
                    <button onClick={() => setReportFilter('pending')} className={`${reportFilter === 'pending' ? 'text-yellow-500 underline' : 'text-gray-400 hover:text-white'}`}>PENDING</button>
                    <span className="text-gray-700">/</span>
                    <button onClick={() => setReportFilter('resolved')} className={`${reportFilter === 'resolved' ? 'text-green-500 underline' : 'text-gray-400 hover:text-white'}`}>RESOLVED</button>
                </div>

                {filteredReports.length === 0 ? (
                    <div className="text-center py-20 text-gray-600 font-bold text-xl uppercase border-2 border-gray-800 border-dashed">
                        {searchTerm ? 'NO MATCHES.' : 'NO INCIDENTS REPORTED.'}
                    </div>
                ) : (
                    filteredReports.map(report => {
                        const urgent = isUrgent(report.createdAt) && report.status === 'pending';
                        return (
                            <div key={report.id} className={`p-4 border-2 flex flex-col md:flex-row gap-4 transition-all duration-300 ${report.status !== 'pending' ? 'bg-gray-900 border-gray-700 opacity-50' : urgent ? 'bg-black border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-black border-red-900'}`}>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs font-black uppercase px-2 py-1 ${report.status === 'approved' ? 'bg-red-600 text-white' : report.status === 'rejected' ? 'bg-gray-600 text-white' : 'bg-yellow-500 text-black animate-pulse'}`}>
                                            {report.status === 'pending' ? 'NEEDS REVIEW' : report.status}
                                        </span>
                                        <span className={`text-xs font-mono flex items-center gap-1 ${urgent ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                            <Clock size={12}/> {getTimeAgo(report.createdAt)} {urgent && '! OVERDUE !'}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-xl font-black text-white uppercase flex items-center gap-2">
                                        <AlertTriangle size={20} className={urgent ? "text-red-500 animate-bounce" : "text-red-800"} />
                                        {report.reason}
                                    </h3>
                                    
                                    <div className="my-2 p-3 bg-gray-800 border-l-2 border-gray-600 text-sm font-bold text-gray-300">
                                        "{report.description}"
                                    </div>
                                    
                                    <div className="text-xs text-gray-500 uppercase grid grid-cols-2 gap-2 mt-2">
                                        <div className="flex items-center gap-1">
                                            REPORTER: <span className="text-white">{report.reporterName}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            TARGET: <span className="text-red-500 font-black">{report.targetUserName}</span>
                                            <button onClick={() => copyToClipboard(report.targetUserId)} title="Copy Target UID" className="text-gray-600 hover:text-neon"><Copy size={10}/></button>
                                        </div>
                                    </div>

                                    {/* THREAT LEVEL METER */}
                                    {report.status === 'pending' && (
                                        <div className="mt-4 pt-2 border-t border-gray-800">
                                            <div className="flex justify-between text-[10px] text-gray-500 font-mono mb-1">
                                                <span>THREAT ANALYSIS</span>
                                                <span>LIMITS: 10 (DEMOTE) / 25 (BAN)</span>
                                            </div>
                                            <div className="h-1 w-full bg-gray-800 overflow-hidden flex">
                                                <div className="h-full bg-gradient-to-r from-green-900 to-red-900 w-full opacity-50 relative">
                                                    <div className="absolute left-[40%] h-full w-0.5 bg-yellow-500/50"></div>
                                                    <div className="absolute left-[95%] h-full w-0.5 bg-red-600"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {report.outcome && <div className="mt-2 text-neon text-xs font-bold uppercase">OUTCOME: {report.outcome}</div>}
                                </div>
                                
                                {report.status === 'pending' && (
                                    <div className="flex flex-col gap-2 justify-center border-l border-gray-800 pl-4 min-w-[160px]">
                                        <button onClick={() => handleReportAction(report, 'approve')} className="bg-red-600 text-white px-4 py-3 text-xs font-black uppercase hover:bg-white hover:text-red-600 transition-colors flex items-center justify-center gap-2">
                                            <CheckCircle size={16} /> VALIDATE (+1)
                                        </button>
                                        <button onClick={() => handleReportAction(report, 'reject')} className="bg-gray-800 text-gray-400 px-4 py-3 text-xs font-bold uppercase hover:bg-gray-700 hover:text-white transition-colors flex items-center justify-center gap-2">
                                            <X size={16} /> DISMISS (0)
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        )}

      </div>
    </div>
  );
}