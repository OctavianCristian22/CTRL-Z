import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings, ShieldCheck, Save, Copy, ShieldAlert, Package, Clock, Truck, CheckCircle } from 'lucide-react';
import { doc, updateDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { updateUserProfile, db } from '../firebase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Heart, XCircle } from 'lucide-react';
import { toggleWishlist } from '../firebase';

export default function Profile({ user, userData, setUser, setUserData }) {
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();
  
  // State Profile Data
  const [tempPhone, setTempPhone] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [tempPin, setTempPin] = useState(''); 
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  
  // State Order History
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // --- 1. INITIALIZARE DATE PROFIL ---
  useEffect(() => {
      if(user) setTempUsername(user.displayName || '');
      if(userData) {
          setTempPhone(userData.phone || '');
          setIs2FAEnabled(userData.twoFactorEnabled || false);
          setTempPin(userData.securityPin || '');
      }
  }, [user, userData]);

  // --- 2. FETCH ISTORIC COMENZI (LIVE) ---
  useEffect(() => {
    if (!user) return;

    // Luam comenzile doar ale userului curent, ordonate descrescator dupa data
    const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setOrders(ordersData);
        setLoadingOrders(false);
    }, (error) => {
        console.error("Order Fetch Error:", error);
        // Daca apare eroare de index, avertizam userul
        if(error.message.includes("index")) {
             console.log("⚠️ CLICK PE LINK-UL DIN CONSOLA PENTRU A CREA INDEXUL FIREBASE!");
        }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = collection(db, "users", user.uid, "wishlist");
    const unsub = onSnapshot(q, (snap) => {
        setWishlist(snap.docs.map(d => d.data()));
    });
    return () => unsub();
}, [user]);

const removeFromWishlist = async (item) => {
    await toggleWishlist(user.uid, item);
    toast.success("REMOVED FROM SAVED");
};

  // --- 3. HELPERE ---
  const isAdmin = userData?.role === 'admin';

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

  // Helper pentru status culori
  const getStatusStyle = (status) => {
      switch(status) {
          case 'pending': return 'border-yellow-500 text-yellow-500 bg-yellow-500/10';
          case 'shipped': return 'border-blue-500 text-blue-500 bg-blue-500/10';
          case 'delivered': return 'border-neon text-neon bg-neon/10';
          default: return 'border-gray-500 text-gray-500';
      }
  };

  const getStatusIcon = (status) => {
      switch(status) {
          case 'pending': return <Clock size={16} />;
          case 'shipped': return <Truck size={16} />;
          case 'delivered': return <CheckCircle size={16} />;
          default: return <Package size={16} />;
      }
  };

  return (
    <div className="max-w-6xl mx-auto pt-10 animate-in fade-in slide-in-from-bottom-4 px-4 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="bg-black text-white p-2 hover:bg-neon hover:text-black transition-all"><ArrowLeft /></Link>
        <h2 className="text-4xl font-black uppercase">/// Personnel_File</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        
        {/* --- COLOANA STANGA: DATE USER --- */}
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

        {/* --- COLOANA DREAPTA: CONFIG & ADMIN --- */}
        <div className="flex flex-col gap-6">
            
            {/* ADMIN BTN */}
            {isAdmin && (
                <div onClick={() => navigate('/admin')} className="bg-black border-4 border-neon p-6 shadow-[8px_8px_0px_0px_rgba(57,255,20,0.5)] cursor-pointer hover:translate-y-[-2px] hover:shadow-[12px_12px_0px_0px_rgba(57,255,20,0.7)] transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity"><ShieldAlert size={64} className="text-neon animate-pulse" /></div>
                    <h3 className="text-3xl font-black text-neon uppercase italic mb-1 group-hover:tracking-widest transition-all">COMMAND_CENTER</h3>
                    <p className="text-white font-bold text-sm">ADMINISTRATOR ACCESS GRANTED</p>
                </div>
            )}

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

      {/* --- SECTIUNEA NOUA: ISTORIC COMENZI --- */}
      <div className="border-t-4 border-black pt-8 mb-12">
      <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3">
          <Heart size={32} className="text-red-600" fill="black" /> SAVED_GEAR ({wishlist.length})
      </h2>

      {wishlist.length === 0 ? (
          <p className="text-gray-500 font-bold italic">WISHLIST EMPTY. GO SHOPPING.</p>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {wishlist.map(item => (
                  <div key={item.id} className="bg-white border-2 border-black p-4 shadow-brutal flex gap-4 relative group">
                      <Link to={`/product/${item.id}`} className="w-20 h-20 bg-gray-200 border border-black shrink-0 overflow-hidden">
                          {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-xs">NO IMG</div>}
                      </Link>
                      <div className="flex flex-col justify-center">
                          <h4 className="font-black uppercase leading-tight line-clamp-2">{item.name}</h4>
                          <span className="text-neon bg-black px-1 text-xs font-bold w-fit mt-1">{item.price} RON</span>
                      </div>
                      <button 
                          onClick={() => removeFromWishlist(item)} 
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                          <XCircle size={20} />
                      </button>
                  </div>
              ))}
          </div>
      )}
  </div>
      <div className="border-t-4 border-black pt-8">
          <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3">
              <Package size={32} /> MISSION_LOGS (ORDER HISTORY)
          </h2>

          {loadingOrders ? (
              <div className="text-center py-10 font-mono text-gray-500 animate-pulse">SYNCING_DATABASE...</div>
          ) : orders.length === 0 ? (
              <div className="bg-gray-100 border-2 border-dashed border-gray-400 p-8 text-center">
                  <Package size={48} className="mx-auto text-gray-400 mb-2" />
                  <p className="font-bold text-gray-500 uppercase">NO COMBAT HISTORY FOUND.</p>
                  <Link to="/shop" className="text-black underline font-bold hover:text-neon bg-black hover:bg-black px-1 mt-2 inline-block">GO TO DEPOT</Link>
              </div>
          ) : (
              <div className="space-y-4">
                  {orders.map((order) => (
                      <div key={order.id} className="bg-white border-2 border-black p-4 shadow-brutal hover:translate-x-1 transition-transform group">
                          
                          {/* Order Header */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-gray-100 pb-2 mb-4 gap-4">
                              <div>
                                  <div className="flex items-center gap-2">
                                      <span className="font-black text-lg">ORDER #{order.id.slice(0, 8).toUpperCase()}</span>
                                      <span className="text-xs font-mono text-gray-400">
                                        {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                      </span>
                                  </div>
                              </div>
                              <div className={`flex items-center gap-2 px-3 py-1 border-2 font-black uppercase text-xs ${getStatusStyle(order.status)}`}>
                                  {getStatusIcon(order.status)}
                                  {order.status}
                              </div>
                          </div>

                          {/* Items Summary */}
                          <div className="flex flex-col md:flex-row justify-between items-end">
                              <div className="space-y-1 w-full md:w-auto">
                                  {order.items.map((item, i) => (
                                      <div key={i} className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                          <span className="bg-black text-white px-1 text-xs">{item.quantity}x</span> 
                                          {item.name}
                                      </div>
                                  ))}
                              </div>
                              <div className="mt-4 md:mt-0 text-right">
                                  <div className="text-xs text-gray-500 font-bold uppercase">TOTAL PAID</div>
                                  <div className="text-2xl font-black text-black">{order.total} RON</div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>

    </div>
  );
}