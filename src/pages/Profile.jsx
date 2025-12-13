import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings, ShieldCheck, Save, Copy } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { updateUserProfile, db } from '../firebase';
import toast from 'react-hot-toast';

export default function Profile({ user, userData, setUser, setUserData }) {
  const [editMode, setEditMode] = useState(false);
  const [tempPhone, setTempPhone] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [tempPin, setTempPin] = useState(''); 
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  useEffect(() => {
      if(user) setTempUsername(user.displayName || '');
      if(userData) {
          setTempPhone(userData.phone || '');
          setIs2FAEnabled(userData.twoFactorEnabled || false);
          setTempPin(userData.securityPin || '');
      }
  }, [user, userData]);

  const handleCopyId = () => {
    if(user?.uid) {
        navigator.clipboard.writeText(user.uid);
        toast.success("ID COPIED", { icon: <Copy size={16}/> });
    }
  };

  const saveProfileChanges = async () => {
    const loadId = toast.loading("Saving...");
    try {
        const phoneRegex = /^07[0-9]{8}$/; 
        if (tempPhone && !phoneRegex.test(tempPhone)) { toast.error("Telefon invalid", {id: loadId}); return; }
        
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { 
            phone: tempPhone, 
            username: tempUsername, 
            twoFactorEnabled: is2FAEnabled, 
            securityPin: is2FAEnabled ? tempPin : null 
        });
        await updateUserProfile(user, tempUsername);
        
        setUserData({ ...userData, phone: tempPhone, twoFactorEnabled: is2FAEnabled, securityPin: tempPin }); 
        setUser({ ...user, displayName: tempUsername });
        
        setEditMode(false); 
        toast.success("Profil salvat!", { id: loadId });
    } catch (e) { 
        toast.error("Eroare la salvare.", { id: loadId }); 
    }
  };

  return (
    <div className="max-w-6xl mx-auto pt-10 animate-in fade-in slide-in-from-bottom-4 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="bg-black text-white p-2 hover:bg-neon hover:text-black transition-all"><ArrowLeft /></Link>
        <h2 className="text-4xl font-black uppercase">/// Personnel_File</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
             <div className="bg-white border-4 border-black p-6 shadow-brutal text-center">
                 <div className="w-40 h-40 mx-auto bg-gray-200 rounded-full border-4 border-black overflow-hidden mb-4 flex items-center justify-center relative">
                    {user?.photoURL ? (<img src={user.photoURL} alt="User" className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center bg-neon text-6xl font-black text-black">{(user?.displayName || user?.email)?.[0]?.toUpperCase()}</div>)}
                 </div>
                 <h3 className="text-3xl font-black uppercase mb-1">{user?.displayName || "UNKNOWN"}</h3>
                 <span className="bg-black text-neon px-3 py-1 text-sm font-bold">LEVEL 1 USER</span>
                 
                 <div onClick={handleCopyId} className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 font-mono cursor-pointer hover:text-black hover:bg-gray-100 p-1 border border-transparent hover:border-gray-300 transition-all active:scale-95" title="Click to copy ID">
                    <span>ID: {user?.uid.slice(0,12)}...</span><Copy size={12} />
                 </div>

                 <div className="mt-8 text-left space-y-4 border-t-2 border-black border-dashed pt-6">
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Username / Callsign</label><input type="text" value={editMode ? tempUsername : (user?.displayName || '')} disabled={!editMode} onChange={(e) => setTempUsername(e.target.value)} className={`font-mono font-bold p-2 border-2 w-full ${editMode ? 'bg-white border-neon' : 'bg-gray-100 border-transparent'}`} /></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label><input type="text" value={editMode ? tempPhone : (userData?.phone || 'Not Set')} disabled={!editMode} onChange={(e) => setTempPhone(e.target.value)} className={`font-mono font-bold p-2 border-2 w-full ${editMode ? 'bg-white border-neon' : 'bg-gray-100 border-transparent'}`} /></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Email (Locked)</label><div className="font-mono font-bold bg-gray-100 p-2 border-2 border-transparent text-gray-500">{user?.email}</div></div>
                 </div>
             </div>
        </div>
        <div className="flex flex-col gap-6">
            <div className="bg-white border-4 border-black p-6 shadow-brutal relative h-full flex flex-col justify-between">
                <div>
                     <div className="flex items-center gap-2 mb-6 border-b-4 border-black pb-2"><Settings className="text-black" /><h3 className="text-2xl font-black uppercase">CONFIGURATION</h3></div>
                     <div className={`p-4 border-2 ${is2FAEnabled ? 'border-neon bg-black text-neon' : 'border-gray-300 bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-2"><span className="font-bold flex items-center gap-2"><ShieldCheck size={20} /> 2-FACTOR AUTH (PIN)</span>{editMode && (<button onClick={() => setIs2FAEnabled(!is2FAEnabled)} className={`px-3 py-1 font-bold text-xs border-2 ${is2FAEnabled ? 'bg-neon text-black border-neon' : 'bg-gray-200 text-gray-500 border-gray-400'}`}>{is2FAEnabled ? 'ENABLED' : 'DISABLED'}</button>)}</div>
                        <p className={`text-xs mb-4 ${is2FAEnabled ? 'text-gray-300' : 'text-gray-500'}`}>{is2FAEnabled ? "Contul este protejat. Se cere PIN la logare." : "Contul este vulnerabil. Activează protecția."}</p>
                        {is2FAEnabled && (<div className="mt-2"><label className="text-xs font-bold uppercase block mb-1">SECURITY PIN (4 digits)</label><input type="text" maxLength={6} placeholder="Set PIN..." value={tempPin} disabled={!editMode} onChange={(e) => setTempPin(e.target.value.replace(/\D/g,''))} className="w-full bg-white text-black p-2 font-bold border-2 border-neon focus:outline-none" /></div>)}
                     </div>
                </div>
                <div className="flex justify-end gap-3 mt-8 pt-4 border-t-2 border-gray-200 border-dashed">
                    {editMode ? (<><button onClick={() => setEditMode(false)} className="px-6 py-3 font-bold hover:bg-gray-200 border-2 border-transparent">CANCEL</button><button onClick={saveProfileChanges} className="bg-neon text-black px-6 py-3 font-bold border-2 border-black hover:shadow-brutal flex items-center gap-2"><Save size={18} /> SAVE ALL</button></>) : (<button onClick={() => setEditMode(true)} className="w-full bg-black text-white px-6 py-4 font-bold hover:bg-neon hover:text-black border-2 border-transparent hover:border-black transition-all text-xl uppercase">UNLOCK EDIT MODE</button>)}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}