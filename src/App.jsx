import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ShoppingCart, LogIn, LogOut, X, Mail, Key, Smartphone, AtSign, ShieldCheck, Eye, EyeOff, Command, CornerUpLeft } from 'lucide-react';
import { db, signInWithGoogle, logout, auth, registerWithEmail, loginWithEmail, updateUserProfile, createUserDocument, getUserDocument, checkUsernameAvailability } from './firebase';
import { onAuthStateChanged, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import toast, { Toaster } from 'react-hot-toast';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, writeBatch, increment } from 'firebase/firestore';

import Home from './pages/Home';
import Shop from './pages/Shop';
import About from './pages/About';
import FAQ from './pages/FAQ';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import CartDrawer from './components/CartDrawer';
import ScrollToTop from './components/ScrollToTop';
import ComingSoon from './pages/ComingSoon';
import Admin from './pages/Admin';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import Hub from './pages/Hub';
import PortalSidebar from './components/PortalSidebar';

export default function App() {
  const maintenanceMode = true;
  if (maintenanceMode) {
    return <ComingSoon />;
  }

  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const cmdInputRef = useRef(null);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const isImmersive = location.pathname === '/' || location.pathname === '/coming-soon';

  useEffect(() => {
    console.log("%c STOP! %c\nAi intrat în zona de developeri CTRLZ.", "color: red; font-size: 50px; font-weight: bold;", "color: #00ff00; font-size: 16px; background: #000; padding: 10px;");
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setIsCmdOpen((open) => !open); }
      if (e.key === 'Escape') { setIsCmdOpen(false); setIsCartOpen(false); setShowLoginModal(false); }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => { if (isCmdOpen && cmdInputRef.current) cmdInputRef.current.focus(); }, [isCmdOpen]);

  useEffect(() => {
    if (user) {
      try { const savedCart = localStorage.getItem(`cart_${user.uid}`); setCart(savedCart ? JSON.parse(savedCart) : []); } catch (e) { setCart([]); }
    } else { setCart([]); }
  }, [user]);

  useEffect(() => { if (user) localStorage.setItem(`cart_${user.uid}`, JSON.stringify(cart)); }, [cart, user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        if (currentUser.providerData[0].providerId === 'password' && !currentUser.emailVerified) {
          toast.error("Email neverificat!"); await logout(); setVerificationSent(true); return;
        }
        const data = await getUserDocument(currentUser.uid);
        if (data?.twoFactorEnabled && !sessionStorage.getItem(`2fa_verified_${currentUser.uid}`)) {
          setUser(null); setUserData(data); setShowLoginModal(false); setShow2FAModal(true); return;
        }
        setUser(currentUser); setUserData(data); setShowLoginModal(false);
        if (data)
          toast.success(`Welcome back, ${currentUser.displayName || 'Hacker'}!`, { icon: '👋', style: { borderRadius: '0px', border: '2px solid black', background: '#39FF14', color: 'black', fontWeight: 'bold' } });
      } else { setUser(null); setUserData(null); }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!showLoginModal) {
      const timer = setTimeout(() => {
        setIsRegistering(false);
        setVerificationSent(false);
        setEmail('');
        setPassword('');
        setUsername('');
        setPhone('');
        setError('');
        setPinInput('');
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [showLoginModal]);

  const addToCart = (product, qty = 1) => {
    if (!user) { toast.error("Loghează-te pentru a cumpăra!"); setShowLoginModal(true); return; }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        toast.success(`Cantitate actualizată (+${qty})`);
        return prev.map(item => item.id === product.id ? { ...item, quantity: (item.quantity || 1) + qty } : item);
      }
      const { icon, ...cleanProduct } = product;
      toast.success("Adăugat în Loot!");
      return [...prev, { ...cleanProduct, quantity: qty }];
    });
    setIsCartOpen(true);
  };

  const handleCheckout = async (checkoutData = {}) => {
    const { finalTotal, discountValue } = checkoutData;

    if (!user) {
      toast.error("Trebuie să fii logat!");
      setShowLoginModal(true);
      return;
    }

    if (cart.length === 0) {
      toast.error("Coșul e gol, hackerule!");
      return;
    }

    const toastId = toast.loading("Procesare tranzacție...");

    try {
      const orderTotal = finalTotal !== undefined
        ? finalTotal
        : cart.reduce((acc, item) => acc + (Number(item.price) * (item.quantity || 1)), 0);

      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        username: userData?.username || user.displayName || 'Anon',
        phone: userData?.phone || 'N/A',
        items: cart,
        total: Number(orderTotal.toFixed(2)),
        discountApplied: discountValue || 0,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "orders"), orderData);
      
      const batch = writeBatch(db);
      cart.forEach((item) => {
        const productRef = doc(db, "products", item.id);
        batch.update(productRef, { stock: increment(-item.quantity) });
      });
      await batch.commit();

      toast.success(`Comandă acceptată!`, { id: toastId });
      setCart([]);
      setIsCartOpen(false);

    } catch (error) {
      console.error("Checkout Error:", error);
      toast.error("Eroare server. Încearcă iar.", { id: toastId });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      if (!result || !result.user) throw new Error("Nu s-au primit datele utilizatorului.");
      const user = result.user;
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        await setDoc(userDocRef, {
          username: user.displayName || "User Nou",
          email: user.email,
          phone: "",
          createdAt: serverTimestamp(),
          twoFactorEnabled: false,
          photoURL: user.photoURL,
          role: "user"
        });
        toast.success("Cont Google configurat! Bine ai venit.", { icon: '👋' });
      } else {
        toast.success("Te-ai logat cu Google.", { icon: '🔓' });
      }
      setShowLoginModal(false);
    } catch (e) {
      if (e.code === 'auth/popup-closed-by-user') toast('Ai anulat logarea.', { icon: '❌' });
      else toast.error(`Eroare: ${e.message}`);
    }
  };

  const handle2FAVerify = () => {
    if (pinInput === userData.securityPin) {
      setUser(auth.currentUser); setShow2FAModal(false); setPinInput('');
      sessionStorage.setItem(`2fa_verified_${auth.currentUser.uid}`, 'true');
      toast.success("Access Granted.");
    } else { toast.error("PIN Incorect!"); }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setVerificationSent(false);

    try {
      if (isRegistering) {
        const phoneRegex = /^07[0-9]{8}$/;
        if (!phoneRegex.test(phone)) throw new Error("Telefon invalid.");
        if (username.length < 3) throw new Error("Username scurt.");
        if (!(await checkUsernameAvailability(username))) throw new Error("Username luat.");

        const { user: newUser } = await registerWithEmail(email, password);
        await updateUserProfile(newUser, username);
        await createUserDocument(newUser, { username, phone, twoFactorEnabled: false, role: 'user' });
        await logout();
        setVerificationSent(true);
        setIsRegistering(false);
      } else {
        if (rememberMe) await setPersistence(auth, browserLocalPersistence);
        else await setPersistence(auth, browserSessionPersistence);
        await loginWithEmail(email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const CommandPalette = () => {
    if (!isCmdOpen) return null;
    const actions = [
        { label: 'Go to Hub', action: () => navigate('/') },
        { label: 'Enter Store', action: () => navigate('/store') },
        { label: 'Shop Gear', action: () => navigate('/shop') }, 
        { label: 'View Profile', action: () => navigate('/profile') }, 
        { label: 'View Loot', action: () => setIsCartOpen(true) }
    ];
    return (
      <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20" onClick={() => setIsCmdOpen(false)}>
        <div className="bg-white w-full max-w-lg shadow-2xl border-4 border-black p-2 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2 border-b-2 border-gray-200 p-2"><Command className="text-gray-400" /><input ref={cmdInputRef} type="text" placeholder="Type a command..." className="w-full outline-none font-bold font-mono text-lg" /><span className="text-xs font-bold bg-gray-200 px-2 py-1 rounded">ESC</span></div>
          <div className="py-2"><p className="px-2 text-xs font-bold text-gray-400 mb-2">NAVIGATION</p>{actions.map((act, i) => (<button key={i} onClick={() => { act.action(); setIsCmdOpen(false); }} className="w-full text-left px-4 py-3 font-bold hover:bg-neon hover:text-black flex items-center gap-3 group transition-colors"><CornerUpLeft size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />{act.label}</button>))}</div>
        </div>
      </div>
    )
  };

  return (
    <div className={`min-h-screen font-mono relative overflow-x-hidden ${isImmersive ? 'bg-black p-0' : 'bg-concrete p-0 md:p-8 md:pt-0 bg-noise'}`}>
      
      <Toaster position="bottom-right" toastOptions={{ className: 'font-mono font-bold border-2 border-black shadow-brutal rounded-none' }} />
      <ScrollToTop />
      <CommandPalette />
      <PortalSidebar />
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} setCart={setCart} user={user} userData={userData} openLoginModal={() => setShowLoginModal(true)} onCheckout={handleCheckout} />
      
      {show2FAModal && (<div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"><div className="bg-black border-4 border-neon shadow-[0_0_50px_rgba(0,255,0,0.3)] w-full max-w-sm p-8 text-center animate-pulse-border"><ShieldCheck size={64} className="text-neon mx-auto mb-6" /><h2 className="text-3xl font-black text-white mb-2">SECURITY CHECK</h2><input type="password" autoFocus maxLength={6} className="w-full bg-gray-900 border-b-4 border-neon text-white text-center text-4xl font-black p-4 mb-6 focus:outline-none tracking-widest" value={pinInput} onChange={(e) => setPinInput(e.target.value)} /><button onClick={handle2FAVerify} className="w-full bg-neon text-black font-black py-4 text-xl hover:bg-white transition-all uppercase">UNLOCK SYSTEM</button></div></div>)}
      
      {showLoginModal && (<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"><div className="bg-white border-4 border-black shadow-brutal w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200"><button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 hover:text-error hover:rotate-90 transition-all"><X size={32} strokeWidth={3} /></button>{verificationSent ? (<div className="text-center py-10"><Mail size={64} className="mx-auto text-neon mb-4" /><h2 className="text-2xl font-black mb-4">VERIFICĂ MAILUL!</h2><p className="font-bold text-gray-600 mb-6">Ți-am trimis un link de activare.</p><button onClick={() => { setVerificationSent(false); setIsRegistering(false); }} className="bg-black text-white px-4 py-2 font-bold">AM ÎNȚELES</button></div>) : (<><h2 className="text-3xl font-black mb-6 uppercase border-b-4 border-black pb-2">{isRegistering ? 'NEW_RECRUIT' : 'SYSTEM_ACCESS'}</h2><form onSubmit={handleEmailAuth} className="flex flex-col gap-4" autoComplete="off">{error && <div className="bg-error text-white p-2 font-bold text-sm border-2 border-black animate-pulse">⚠️ {error}</div>}{isRegistering && (<><div className="relative"><AtSign className="absolute top-3 left-3 text-gray-500" size={20} /><input type="text" placeholder="USERNAME UNIC" className="w-full bg-gray-100 p-3 pl-10 border-2 border-black font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-neon" value={username} onChange={(e) => setUsername(e.target.value)} required /></div><div className="relative"><Smartphone className="absolute top-3 left-3 text-gray-500" size={20} /><input type="text" placeholder="TELEFON (07...)" className="w-full bg-gray-100 p-3 pl-10 border-2 border-black font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-neon" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div></>)}<div className="relative"><Mail className="absolute top-3 left-3 text-gray-500" size={20} /><input type="email" placeholder="EMAIL" className="w-full bg-gray-100 p-3 pl-10 border-2 border-black font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-neon" value={email} onChange={(e) => setEmail(e.target.value)} required /></div><div className="relative"><Key className="absolute top-3 left-3 text-gray-500" size={20} /><input type={showPassword ? "text" : "password"} placeholder="PAROLA" className="w-full bg-gray-100 p-3 pl-10 pr-10 border-2 border-black font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-neon" value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-3 right-3 text-gray-500 hover:text-black">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
        {!isRegistering && (
          <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
            <div className={`w-5 h-5 border-2 border-black flex items-center justify-center transition-all ${rememberMe ? 'bg-neon' : 'bg-gray-100'}`}>
              {rememberMe && <div className="w-2 h-2 bg-black"></div>}
            </div>
            <span className="text-sm font-bold select-none">RĂMÂI CONECTAT</span>
          </div>
        )}
        <button type="submit" className="bg-black text-neon font-black py-3 text-xl hover:bg-neon hover:text-black border-2 border-transparent hover:border-black transition-all shadow-brutal mt-2 uppercase">{isRegistering ? 'Initialize_User' : 'Connect'}</button></form><div className="flex items-center gap-4 my-6"><div className="h-1 bg-black flex-1"></div><span className="font-bold text-gray-400">SAU</span><div className="h-1 bg-black flex-1"></div></div><button onClick={handleGoogleLogin} className="w-full bg-white text-black font-bold py-3 border-2 border-black hover:bg-gray-100 transition-all flex items-center justify-center gap-2"><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" /> Google Access</button><div className="mt-6 text-center text-sm font-bold">{isRegistering ? "Ai deja cont?" : "Nu ai cont?"}<button onClick={() => { setIsRegistering(!isRegistering); }} className="ml-2 text-blue-600 hover:underline hover:text-neon hover:bg-black px-1">{isRegistering ? "Loghează-te" : "Fă-ți cont"}</button></div></>)}</div></div>)}
      {!isImmersive && (
        <nav className="flex flex-col md:flex-row justify-between items-center mb-16 border-b-4 border-black pb-6 sticky top-0 bg-[#f0f0f0] z-50 p-4 md:pt-4 md:ml-16 transition-all">
          <Link to="/store" className="flex items-center gap-2 group cursor-pointer mb-4 md:mb-0"><div className="bg-black text-neon p-2 px-4 font-black text-2xl md:text-3xl border-2 border-black shadow-brutal tracking-tighter group-hover:bg-neon group-hover:text-black transition-all">[ CTRL ] - [ Z ]</div></Link>
          <div className="flex items-center gap-2 md:gap-6 text-sm md:text-base font-bold">
            <Link to="/store" className={`hover:text-neon hover:bg-black px-2 py-1 transition-all ${location.pathname === '/store' ? 'bg-black text-white' : ''}`}>HOME</Link>
            <Link to="/shop" className={`hover:text-neon hover:bg-black px-2 py-1 transition-all ${location.pathname === '/shop' ? 'bg-black text-white' : ''}`}>SHOP</Link>
            <Link to="/about" className={`hover:text-neon hover:bg-black px-2 py-1 transition-all ${location.pathname === '/about' ? 'bg-black text-white' : ''}`}>ABOUT</Link>
            <Link to="/faq" className={`hover:text-neon hover:bg-black px-2 py-1 transition-all ${location.pathname === '/faq' ? 'bg-black text-white' : ''}`}>FAQ</Link>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {user ? (
              <Link to="/profile" className="flex items-center gap-3 bg-white border-2 border-black p-1 px-3 shadow-brutal cursor-pointer hover:bg-gray-100 transition-colors">
                {user.photoURL ? <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-black object-cover" /> : <div className="bg-neon text-black w-8 h-8 rounded-full border border-black flex items-center justify-center font-bold text-sm">{(user.displayName || user.email)[0].toUpperCase()}</div>}
                <span className="font-bold text-sm hidden md:inline uppercase">{user.displayName || 'USER'}</span>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); logout(); }} className="ml-2 hover:text-error transition-colors" title="Logout"><LogOut size={20} /></button>
              </Link>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 font-bold bg-black text-white px-4 py-2 border-2 border-transparent hover:bg-neon hover:text-black hover:border-black transition-all shadow-brutal"><LogIn size={18} /><span>LOGIN</span></button>
            )}
            <button onClick={() => { if (!user) setShowLoginModal(true); else setIsCartOpen(true); }} className="flex items-center gap-2 font-bold hover:bg-neon hover:text-black p-2 border-2 border-transparent hover:border-black transition-all relative">
              <ShoppingCart /><span className="hidden md:inline">LOOT ({cart.length})</span><span className="md:hidden">({cart.length})</span>
              {cart.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-error rounded-full animate-pulse"></span>}
            </button>
          </div>
        </nav>
      )}
      <main className={`min-h-[50vh] ${!isImmersive ? 'md:ml-16' : ''}`}>
        <Routes>
          <Route path="/" element={<Hub user={user} userData={userData} openLoginModal={() => setShowLoginModal(true)} />} />
          <Route path="/store" element={<Home />} />
          <Route path="/shop" element={<Shop addToCart={addToCart} user={user} />} />
          <Route path="/product/:id" element={<ProductPage addToCart={addToCart} user={user} />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/profile" element={user ? <Profile user={user} userData={userData} setUser={setUser} setUserData={setUserData} /> : <Navigate to="/" />} />
          <Route path="/admin" element={<Admin user={user} userData={userData} />} />
          <Route path="/checkout" element={<CheckoutPage cart={cart} setCart={setCart} user={user} userData={userData} />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      {!isImmersive && (
        <footer className="text-center py-10 border-t-4 border-black opacity-50 hover:opacity-100 transition-opacity mt-20 md:ml-16">
          <p className="font-bold">© 2025 CTRL-Z. Făcut de studenți, pentru studenți.</p>
          <p className="text-xs mt-2">Brașov, RO.</p>
        </footer>
      )}
    </div>
  )
}