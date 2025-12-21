import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, BookOpen, Clock, Zap, Edit, Trash2, Plus, CheckCircle, Smartphone, Check, X, Loader, History, Star, Flag, AlertTriangle } from 'lucide-react';
import { db, updateUserProfile, submitReport } from '../../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc, addDoc, serverTimestamp, getDoc, getDocs, writeBatch } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Copy, Save } from 'lucide-react';

// --- COMPONENTA INTERNA: REVIEW MODAL ---
const ReviewModal = ({ isOpen, onClose, onSubmit, title }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white border-4 border-black p-6 w-full max-w-md shadow-brutal animate-in zoom-in duration-200">
                <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
                    <Star className="text-neon fill-black" /> {title || "RATE_USER"}
                </h3>
                
                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                            key={star} 
                            onClick={() => setRating(star)}
                            className={`transition-transform hover:scale-125 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        >
                            <Star size={32} />
                        </button>
                    ))}
                </div>

                <textarea 
                    className="w-full bg-gray-100 border-2 border-black p-3 font-bold mb-4 focus:outline-none focus:border-neon h-24 resize-none"
                    placeholder="Cum a fost colaborarea? (Opțional)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />

                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 bg-gray-200 font-black py-3 hover:bg-red-500 hover:text-white transition-colors uppercase">Cancel</button>
                    <button onClick={() => onSubmit(rating, comment)} className="flex-1 bg-black text-neon font-black py-3 border-2 border-transparent hover:border-black hover:bg-neon hover:text-black transition-colors uppercase shadow-brutal">SUBMIT DATA</button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTA INTERNA: REPORT MODAL ---
const ReportModal = ({ isOpen, onClose, onSubmit }) => {
    const [reason, setReason] = useState('no_show');
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-black border-4 border-red-600 p-6 w-full max-w-md shadow-[0_0_40px_rgba(255,0,0,0.4)] animate-in zoom-in duration-200">
                <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2 text-red-600">
                    <AlertTriangle className="text-red-600" /> REPORT_USER
                </h3>
                
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="text-white text-xs font-bold uppercase mb-1 block">Motivul Report-ului</label>
                        <select 
                            value={reason} 
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-gray-900 text-white border-2 border-gray-700 p-3 font-bold focus:border-red-600 outline-none uppercase"
                        >
                            <option value="no_show">No Show (Nu a venit)</option>
                            <option value="harassment">Harassment (Hărțuire)</option>
                            <option value="scam">Scam / Fraudă</option>
                            <option value="toxic">Comportament Toxic</option>
                            <option value="other">Altul</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-white text-xs font-bold uppercase mb-1 block">Detalii Incident</label>
                        <textarea 
                            className="w-full bg-gray-900 text-white border-2 border-gray-700 p-3 font-bold focus:outline-none focus:border-red-600 h-32 resize-none"
                            placeholder="Descrie ce s-a întâmplat..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 bg-gray-800 text-white font-black py-3 hover:bg-white hover:text-black transition-colors uppercase">Cancel</button>
                    <button onClick={() => onSubmit(reason, description)} className="flex-1 bg-red-600 text-white font-black py-3 border-2 border-transparent hover:bg-white hover:text-red-600 hover:border-red-600 transition-colors uppercase shadow-brutal">SEND REPORT</button>
                </div>
            </div>
        </div>
    );
};

export default function UplinkProfile({ user, userData }) {
  const navigate = useNavigate();
  
  // State-uri Editare
  const [editMode, setEditMode] = useState(false);
  const [tempPhone, setTempPhone] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [tempContact, setTempContact] = useState(''); 
  
  // State-uri Uplink
  const [myListings, setMyListings] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);  
  const [historySessions, setHistorySessions] = useState([]); 

  // State-uri Modale
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedSessionForAction, setSelectedSessionForAction] = useState(null);

  const isTutor = userData?.isTutor || false; 
  const tutorStatus = userData?.tutorStatus || 'none';

  // --- INITIALIZARE ---
  useEffect(() => {
      if(user) setTempUsername(user.displayName || '');
      if(userData) {
          setTempPhone(userData.phone || '');
          setTempContact(userData.contactInfo || '');
      }
  }, [user, userData]);

  // --- SAVE IDENTITY ---
  const saveProfileChanges = async () => {
    const loadId = toast.loading("Saving identity...");
    try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { 
            phone: tempPhone, 
            contactInfo: tempContact, 
            username: tempUsername
        });
        await updateUserProfile(user, tempUsername);
        setEditMode(false); 
        toast.success("Identity updated!", { id: loadId });
    } catch (e) { 
        toast.error("Update failed.", { id: loadId }); 
    }
  };

  const handleCopyId = () => {
    if(user?.uid) {
        navigator.clipboard.writeText(user.uid);
        toast.success("ID COPIED");
    }
  };

  // --- FETCHING DATA ---
  useEffect(() => {
      if(!user) return;
      const q = query(collection(db, "listings"), where("userId", "==", user.uid));
      const unsub = onSnapshot(q, (snap) => setMyListings(snap.docs.map(d => ({id: d.id, ...d.data()}))));
      return () => unsub();
  }, [user]);

  useEffect(() => {
      if(!user) return;
      
      const qStudent = query(collection(db, "sessions"), where("studentId", "==", user.uid));
      const qMentor = query(collection(db, "sessions"), where("mentorId", "==", user.uid));

      const processSessions = (docs, role) => docs.map(d => ({id: d.id, role, ...d.data()}));

      let rawStudentDocs = [];
      let rawMentorDocs = [];

      const updateAllSessions = () => {
          const allDocs = [...rawStudentDocs, ...rawMentorDocs];
          
          const active = allDocs.filter(s => ['pending', 'active'].includes(s.status));
          const history = allDocs.filter(s => ['rejected', 'completed', 'cancelled'].includes(s.status));

          history.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

          setActiveSessions(active);
          setHistorySessions(history);
      };

      const unsubStudent = onSnapshot(qStudent, (snap) => {
          rawStudentDocs = processSessions(snap.docs, 'student');
          updateAllSessions();
      });

      const unsubMentor = onSnapshot(qMentor, (snap) => {
          rawMentorDocs = processSessions(snap.docs, 'mentor');
          updateAllSessions();
      });

      return () => { unsubStudent(); unsubMentor(); };
  }, [user]);

  // --- LOGICA DE REVIEW ---
  const openReviewModal = (session) => {
      setSelectedSessionForAction(session);
      setShowReviewModal(true);
  };

  const handleSubmitReview = async (rating, comment) => {
    if (!selectedSessionForAction) return;
    const loadId = toast.loading("Calculating ratings...");
    setShowReviewModal(false);

    try {
        const sessionId = selectedSessionForAction.id;
        
        const isMeStudent = user.uid === selectedSessionForAction.studentId;
        const targetId = isMeStudent ? selectedSessionForAction.mentorId : selectedSessionForAction.studentId;
        const targetName = isMeStudent ? selectedSessionForAction.mentorName : selectedSessionForAction.studentName;

        // 1. Salvam Review-ul
        await addDoc(collection(db, "reviews"), {
            targetId: targetId,         
            reviewerId: user.uid,      
            reviewerName: user.displayName || "Anon",
            sessionId: sessionId,
            rating: rating,
            comment: comment,
            role: isMeStudent ? "student_to_mentor" : "mentor_to_student",
            createdAt: serverTimestamp()
        });

        // 2. Updatam sesiunea cu Flag-uri
        await updateDoc(doc(db, "sessions", sessionId), {
            [isMeStudent ? 'studentReviewed' : 'mentorReviewed']: true
        });

        // 3. Recalculare Medie pentru TARGET (Cel care primeste nota)
        const targetRef = doc(db, "users", targetId);
        const targetSnap = await getDoc(targetRef);
        
        let newRating = rating;
        let newCount = 1;

        if (targetSnap.exists()) {
            const mData = targetSnap.data();
            const currentRating = mData.rating || 0;
            const currentCount = mData.ratingCount || 0;
            newCount = currentCount + 1;
            newRating = ((currentRating * currentCount) + rating) / newCount;
        }

        // 4. Update Profil Target
        await updateDoc(targetRef, {
            rating: newRating,
            ratingCount: newCount
        });

        // 5. Update Listings
        if (isMeStudent) {
            const listingsQuery = query(collection(db, "listings"), where("userId", "==", targetId));
            const listingsSnap = await getDocs(listingsQuery);
            if (!listingsSnap.empty) {
                const batch = writeBatch(db);
                listingsSnap.forEach((listingDoc) => {
                    batch.update(listingDoc.ref, { 
                        rating: newRating,
                        ratingCount: newCount
                    });
                });
                await batch.commit();
            }
        }

        toast.success(`Review for ${targetName} submitted!`, { id: loadId });
    } catch (error) {
        console.error(error);
        toast.error("Error submitting review.", { id: loadId });
    }
  };

  // --- LOGICA DE REPORT ---
  const openReportModal = (session) => {
      setSelectedSessionForAction(session);
      setShowReportModal(true);
  };

  const handleSubmitReport = async (reason, description) => {
      if(!selectedSessionForAction) return;
      const loadId = toast.loading("Sending report to admins...");
      setShowReportModal(false);

      try {
          const targetId = selectedSessionForAction.role === 'student' 
                ? selectedSessionForAction.mentorId 
                : selectedSessionForAction.studentId;
          
          const targetName = selectedSessionForAction.role === 'student'
                ? selectedSessionForAction.mentorName
                : selectedSessionForAction.studentName;

          await submitReport({
              reporterId: user.uid,
              reporterName: user.displayName || "Anon",
              targetUserId: targetId,
              targetUserName: targetName,
              sessionId: selectedSessionForAction.id,
              reason,
              description,
              sessionInfo: selectedSessionForAction.subject
          });

          toast.success("REPORT FILED. Admins alerted.", { id: loadId });
      } catch (error) {
          console.error(error);
          toast.error("Report failed.", { id: loadId });
      }
  };

  // --- ACTIONS (Listing & Session) ---
  const handleDeleteListing = async (id) => {
      if(window.confirm("Ștergi acest anunț?")) {
          await deleteDoc(doc(db, "listings", id));
          toast.success("Nod șters.");
      }
  };

  const handleEditListing = (listing) => {
      navigate('/uplink/apply', { state: { listing } });
  };

  const handleAcceptSession = async (sessionId) => {
      await updateDoc(doc(db, "sessions", sessionId), { status: 'active' });
      toast.success("CONNECTION ESTABLISHED.");
  };

  const handleRejectSession = async (sessionId) => {
      if(window.confirm("Respingi această cerere?")) {
          await updateDoc(doc(db, "sessions", sessionId), { status: 'rejected' });
          toast.error("CONNECTION REJECTED.");
      }
  };

  const handleCancelSession = async (sessionId) => {
      if(window.confirm("Anulezi cererea?")) {
          await updateDoc(doc(db, "sessions", sessionId), { status: 'cancelled' });
          toast.success("Request cancelled.");
      }
  };

  const handleSessionDone = async (sessionId) => {
      if(window.confirm("Sesiune finalizată?")) {
          await updateDoc(doc(db, "sessions", sessionId), { status: 'completed' });
          toast.success("Mission Accomplished.");
      }
  };

  // Helper colors
  const getHistoryStatusColor = (status) => {
      switch(status) {
          case 'completed': return 'text-green-600 bg-green-100 border-green-600';
          case 'rejected': return 'text-red-600 bg-red-100 border-red-600';
          case 'cancelled': return 'text-gray-600 bg-gray-200 border-gray-600';
          default: return 'text-gray-500 bg-gray-100';
      }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] font-mono pb-20 pt-10 px-4 md:px-8">
      
      {/* MODALE */}
      <ReviewModal 
          isOpen={showReviewModal} 
          onClose={() => setShowReviewModal(false)} 
          onSubmit={handleSubmitReview}
          title={selectedSessionForAction?.role === 'student' ? "RATE_MENTOR" : "RATE_STUDENT"} 
      />
      <ReportModal 
          isOpen={showReportModal} 
          onClose={() => setShowReportModal(false)} 
          onSubmit={handleSubmitReport} 
      />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 border-b-4 border-black pb-4">
            OPERATOR_FILE
        </h1>
        
        {userData?.role === 'admin' && (
            <div className="mb-8 bg-black p-4 border-2 border-neon flex justify-between items-center shadow-[4px_4px_0_0_#39FF14]">
                <div><h3 className="text-white font-black text-xl uppercase flex items-center gap-2"><ShieldCheck className="text-neon"/> ADMIN ACCESS GRANTED</h3></div>
                <Link to="/uplink/admin" className="bg-neon text-black font-black px-4 py-2 uppercase hover:bg-white transition-colors">OPEN OVERWATCH</Link>
            </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
            
            {/* --- IDENTITY CARD --- */}
            <div className="md:col-span-1">
                <div className="bg-white border-4 border-black p-6 shadow-brutal text-center sticky top-24">
                     <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full border-4 border-black overflow-hidden mb-4 flex items-center justify-center">
                        {user?.photoURL ? (<img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center bg-black text-white text-4xl font-black">{(user?.displayName || "U")[0]}</div>)}
                     </div>
                     <h3 className="text-2xl font-black uppercase mb-1">{user?.displayName || "UNKNOWN AGENT"}</h3>
                     <div className="inline-block bg-black text-white px-3 py-1 font-bold text-xs uppercase mb-4">{isTutor ? "VERIFIED MENTOR" : "STUDENT / LEARNER"}</div>
                     <div onClick={handleCopyId} className="flex items-center justify-center gap-2 text-xs text-gray-400 font-mono cursor-pointer hover:text-black mb-6"><span>ID: {user?.uid.slice(0,12)}...</span><Copy size={12} /></div>

                     <div className="text-left space-y-4 border-t-2 border-black border-dashed pt-4">
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Callsign</label><input type="text" value={editMode ? tempUsername : (user?.displayName || '')} disabled={!editMode} onChange={(e) => setTempUsername(e.target.value)} className={`font-mono font-bold p-2 border-2 w-full ${editMode ? 'bg-white border-neon' : 'bg-gray-100 border-transparent'}`} /></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Phone</label><input type="text" value={editMode ? tempPhone : (userData?.phone || 'Not Set')} disabled={!editMode} onChange={(e) => setTempPhone(e.target.value)} className={`font-mono font-bold p-2 border-2 w-full ${editMode ? 'bg-white border-neon' : 'bg-gray-100 border-transparent'}`} /></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Smartphone size={12}/> Secure Contact</label><input type="text" placeholder="Discord/Tel" value={editMode ? tempContact : (userData?.contactInfo || 'Not Set')} disabled={!editMode} onChange={(e) => setTempContact(e.target.value)} className={`font-mono font-bold p-2 border-2 w-full ${editMode ? 'bg-white border-neon' : 'bg-gray-100 border-transparent'}`} /></div>
                        <div className="pt-4 flex gap-2 justify-end">{editMode ? (<><button onClick={() => setEditMode(false)} className="px-3 py-2 font-bold text-xs hover:bg-gray-200">CANCEL</button><button onClick={saveProfileChanges} className="bg-neon text-black px-3 py-2 font-bold text-xs border-2 border-black flex items-center gap-1"><Save size={14} /> SAVE</button></>) : (<button onClick={() => setEditMode(true)} className="w-full bg-black text-white px-4 py-3 font-bold text-xs hover:bg-neon hover:text-black uppercase transition-colors">UNLOCK EDIT MODE</button>)}</div>
                     </div>
                </div>
            </div>

            {/* --- LOGS SECTION --- */}
            <div className="md:col-span-2 space-y-6">
                
                {/* ACTIVE SESSIONS */}
                <div className="bg-white border-4 border-black p-6 shadow-brutal">
                    <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2 text-neon bg-black w-fit px-2"><Clock size={24} /> ACTIVE SESSIONS</h3>
                    {activeSessions.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300"><p className="text-gray-400 font-bold">NO ACTIVE CONNECTIONS.</p><Link to="/uplink" className="text-black font-bold underline hover:text-neon">Find a Mentor</Link></div>
                    ) : (
                        <div className="grid gap-4">
                            {activeSessions.map(session => (
                                <div key={session.id} className={`border-2 border-black p-4 flex flex-col gap-4 ${session.status === 'pending' ? 'bg-yellow-50' : 'bg-green-50'}`}>
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2"><span className="bg-black text-neon text-xs font-bold px-2 py-1 uppercase">{session.subject}</span>{session.status === 'pending' ? (<span className="bg-yellow-500 text-black text-xs font-black px-2 py-1 uppercase animate-pulse flex items-center gap-1"><Loader size={12}/> WAITING CONFIRMATION</span>) : (<span className="bg-green-600 text-white text-xs font-black px-2 py-1 uppercase flex items-center gap-1"><CheckCircle size={12}/> ACTIVE LINK</span>)}</div>
                                            {session.role === 'student' && (<><h4 className="font-black text-lg">MENTOR: {session.mentorName}</h4>{session.status === 'active' ? (<div className="mt-2 bg-green-100 border-l-4 border-green-500 p-2 text-sm animate-in fade-in"><p className="font-bold text-xs text-gray-500 uppercase flex items-center gap-1"><Smartphone size={12}/> SECURE CONTACT:</p><p className="font-black text-black select-all">{session.mentorContact}</p></div>) : (<p className="text-xs text-gray-500 font-bold mt-2 italic">Contact info hidden until mentor accepts.</p>)}</>)}
                                            {session.role === 'mentor' && (<><h4 className="font-black text-lg">STUDENT: {session.studentName}</h4><p className="text-sm text-gray-500 font-bold">{session.studentEmail}</p>{session.status === 'pending' && <p className="text-xs text-yellow-600 font-bold mt-1">Student is waiting for approval.</p>}</>)}
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <div className="text-2xl font-black">{session.price} ZC</div>
                                            {session.role === 'mentor' && (<>{session.status === 'pending' ? (<div className="flex gap-2"><button onClick={() => handleAcceptSession(session.id)} className="bg-neon text-black font-black px-4 py-2 hover:bg-black hover:text-neon transition-colors flex items-center gap-1 text-sm shadow-[2px_2px_0_0_#000]"><Check size={16}/> ACCEPT</button><button onClick={() => handleRejectSession(session.id)} className="bg-red-500 text-white font-black px-4 py-2 hover:bg-black transition-colors flex items-center gap-1 text-sm shadow-[2px_2px_0_0_#000]"><X size={16}/> DENY</button></div>) : (<button onClick={() => handleSessionDone(session.id)} className="bg-gray-800 text-white font-black px-4 py-2 hover:bg-green-600 transition-colors flex items-center gap-2 text-sm"><CheckCircle size={16}/> MARK DONE</button>)}</>)}
                                            {session.role === 'student' && session.status === 'pending' && (<button onClick={() => handleCancelSession(session.id)} className="text-gray-400 hover:text-red-500 text-xs font-bold underline">Cancel Request</button>)}
                                        </div>
                                    </div>
                                    
                                    {/* REPORT BUTTON ON ACTIVE SESSION */}
                                    {session.status === 'active' && (
                                        <div className="border-t border-gray-300 pt-2 flex justify-end">
                                            <button 
                                                onClick={() => openReportModal(session)} 
                                                className="text-xs font-bold text-gray-400 hover:text-red-600 flex items-center gap-1"
                                            >
                                                <Flag size={12}/> REPORT ISSUE
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* MISSION HISTORY (CU REVIEW & REPORT) */}
                {historySessions.length > 0 && (
                    <div className="bg-gray-100 border-2 border-gray-400 p-6">
                        <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2 text-gray-600"><History size={24} /> MISSION HISTORY LOGS</h3>
                        <div className="space-y-2">
                            {historySessions.map(session => (
                                <div key={session.id} className="flex flex-col p-3 border border-gray-300 bg-white gap-2">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm uppercase">{session.subject}</span>
                                                <span className={`text-[10px] font-black px-2 border uppercase ${getHistoryStatusColor(session.status)}`}>{session.status.toUpperCase()}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-bold mt-1">{session.role === 'student' ? `MENTOR: ${session.mentorName}` : `STUDENT: ${session.studentName}`}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-gray-400 text-sm font-bold">{session.price} ZC</div>
                                            
                                            {/* BUTON DE REVIEW DINAMIC (Pentru AMBII) */}
                                            {session.status === 'completed' && (
                                                <>
                                                    {/* Daca sunt STUDENT si nu am dat review mentorului */}
                                                    {session.role === 'student' && !session.studentReviewed && (
                                                        <button 
                                                            onClick={() => openReviewModal(session)}
                                                            className="bg-black text-neon text-xs font-black px-3 py-1 uppercase hover:bg-neon hover:text-black border border-black flex items-center gap-1 shadow-[2px_2px_0_0_#000]"
                                                        >
                                                            <Star size={12}/> RATE MENTOR
                                                        </button>
                                                    )}
                                                    {session.role === 'student' && session.studentReviewed && (
                                                        <span className="text-yellow-500 flex items-center gap-1 text-xs font-bold"><Check size={12}/> YOU RATED</span>
                                                    )}

                                                    {/* Daca sunt MENTOR si nu am dat review studentului */}
                                                    {session.role === 'mentor' && !session.mentorReviewed && (
                                                        <button 
                                                            onClick={() => openReviewModal(session)}
                                                            className="bg-black text-blue-400 text-xs font-black px-3 py-1 uppercase hover:bg-blue-400 hover:text-black border border-black flex items-center gap-1 shadow-[2px_2px_0_0_#000]"
                                                        >
                                                            <Star size={12}/> RATE STUDENT
                                                        </button>
                                                    )}
                                                    {session.role === 'mentor' && session.mentorReviewed && (
                                                        <span className="text-yellow-500 flex items-center gap-1 text-xs font-bold"><Check size={12}/> YOU RATED</span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* REPORT BUTTON ON HISTORY */}
                                    <div className="border-t border-dashed border-gray-300 pt-2 flex justify-end">
                                        <button 
                                            onClick={() => openReportModal(session)} 
                                            className="text-[10px] font-bold text-gray-400 hover:text-red-600 flex items-center gap-1 uppercase"
                                        >
                                            <Flag size={10}/> Report {session.role === 'student' ? 'Mentor' : 'Student'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* MY LISTINGS */}
                {(isTutor || myListings.length > 0) && (
                    <div className="bg-white border-4 border-black p-6 shadow-brutal">
                        <div className="flex justify-between items-end mb-6 border-b-2 border-black pb-2">
                             <h3 className="text-xl font-black uppercase flex items-center gap-2"><BookOpen size={24} /> MY NODES</h3>
                            <Link to="/uplink/apply" className="bg-black text-white px-3 py-1 font-bold text-sm uppercase hover:bg-neon hover:text-black transition-colors flex items-center gap-1"><Plus size={16}/> New Listing</Link>
                        </div>
                        {myListings.length === 0 ? (
                            <p className="text-gray-400 font-bold border-2 border-dashed border-gray-300 p-4 text-center">NO ACTIVE NODES.</p>
                        ) : (
                            <div className="space-y-4">
                                {myListings.map(listing => (
                                    <div key={listing.id} className="border-2 border-black p-4 flex flex-col md:flex-row justify-between items-start gap-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1"><span className={`text-[10px] font-black uppercase px-2 py-0.5 text-white ${listing.status === 'active' ? 'bg-green-600' : 'bg-yellow-500'}`}>{listing.status}</span><h4 className="font-black text-lg uppercase">{listing.subject}</h4></div>
                                            <div className="flex items-center gap-2 text-xs font-bold mb-2 text-gray-500">
                                                {listing.rating ? <span className="flex items-center text-yellow-500"><Star size={12} fill="currentColor"/> {listing.rating.toFixed(1)} ({listing.ratingCount})</span> : <span>NO RATINGS</span>}
                                            </div>
                                            <div className="mt-2 text-neon font-black bg-black inline-block px-2 text-sm">{listing.price} ZC / h</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditListing(listing)} className="bg-gray-200 hover:bg-yellow-400 p-2 border-2 border-black transition-colors"><Edit size={16}/></button>
                                            <button onClick={() => handleDeleteListing(listing.id)} className="bg-gray-200 hover:bg-red-500 hover:text-white p-2 border-2 border-black transition-colors"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* CTA */}
                {!isTutor && myListings.length === 0 && (
                    <div className="bg-black text-white border-4 border-neon p-6 shadow-[8px_8px_0_0_#39FF14] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity"><Zap size={100} /></div>
                        <h3 className="text-2xl font-black text-neon uppercase mb-2">INITIALIZE MENTOR PROTOCOL</h3>
                        <p className="font-bold text-gray-400 mb-6 max-w-md">Ai cunoștințe de împărtășit? Aplică pentru a deveni Mentor verificat.</p>
                        {tutorStatus === 'pending' ? (<div className="bg-yellow-500 text-black font-black px-4 py-3 inline-flex items-center gap-2"><Clock size={20} /> APPLICATION UNDER REVIEW</div>) : (<Link to="/uplink/apply" className="bg-white text-black font-black px-6 py-3 uppercase hover:bg-neon transition-colors inline-block">START APPLICATION &rarr;</Link>)}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}