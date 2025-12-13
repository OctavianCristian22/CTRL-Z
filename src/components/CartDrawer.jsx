import React, { useState } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2, Tag, CreditCard, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { createOrder } from '../firebase';
import { PRODUCTS } from '../pages/Shop';

export default function CartDrawer({ isOpen, onClose, cart, setCart, user, userData, openLoginModal }) {
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const updateQuantity = (id, delta) => {
      setCart(prev => prev.map(item => {
          if (item.id === id) return { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) };
          return item;
      }));
  };

  const removeFromCart = (id) => setCart(cart.filter((_, i) => i !== id));

  const calculateSubtotal = () => cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  
  const calculateTotal = () => {
      const subtotal = calculateSubtotal();
      return subtotal - (subtotal * discount);
  };

  const applyPromoCode = () => {
      const code = promoCode.toUpperCase().trim();
      if (code === 'HACKER') {
          setDiscount(0.20);
          toast.success("ACCESS GRANTED: 20% OFF", { icon: '🔓', style: {background: '#39FF14', color: 'black', fontWeight: 'bold'} });
      } else if (code === 'STUDENT') {
          setDiscount(0.10);
          toast.success("STUDENT DISCOUNT: 10% OFF");
      } else {
          setDiscount(0);
          toast.error("INVALID CODE");
      }
  };

  const handleCheckout = async () => {
      if (!user) { openLoginModal(); return; }
      if (cart.length === 0) return;
      
      const loadId = toast.loading("Processing...");
      try {
          await createOrder(user.uid, { 
              items: cart, 
              total: calculateTotal(), 
              discountApplied: discount,
              userEmail: user.email, 
              userName: user.displayName, 
              userPhone: userData?.phone || "N/A" 
          });
          setCart([]); setDiscount(0); setPromoCode('');
          toast.dismiss(loadId);
          setOrderSuccess(true);
          setTimeout(() => { setOrderSuccess(false); onClose(); }, 3000);
      } catch (err) { 
          toast.dismiss(loadId);
          toast.error("Eroare la comanda."); 
      }
  };

  return (
      <>
        {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] animate-in fade-in duration-200" />}
        <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white border-l-4 border-black shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
            <div className="bg-black text-neon p-4 flex justify-between items-center border-b-4 border-black">
                <h2 className="text-2xl font-black uppercase flex items-center gap-2"><ShoppingCart /> LOOT STASH</h2>
                <button onClick={onClose} className="hover:text-white transition-colors"><X size={32} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-concrete bg-noise">
                {orderSuccess ? (
                    <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in">
                        <CheckCircle size={80} className="text-neon mb-4" />
                        <h3 className="text-3xl font-black mb-2">ORDER SENT!</h3>
                        <p className="font-bold text-gray-600">Ne mișcăm repede.</p>
                    </div>
                ) : cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-50">
                        <ShoppingCart size={64} className="mb-4 text-gray-400" />
                        <p className="text-xl font-bold text-gray-500">COȘUL E GOL.</p>
                    </div>
                ) : (
                  <div className="space-y-4">{cart.map((item, index) => (
                    <div key={index} className="bg-white border-2 border-black p-3 shadow-brutal flex flex-col gap-2 group">
                        <div className="flex justify-between items-start">
                             <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-200 border border-black flex items-center justify-center overflow-hidden">
                                    {item.image ? (<img src={item.image} className="w-full h-full object-cover" />) : (PRODUCTS.find(p => p.id === item.id)?.icon)}
                                </div>
                                <div><h4 className="font-black uppercase text-sm">{item.name}</h4><span className="text-xs font-bold text-gray-500">{item.price} RON</span></div>
                             </div>
                             <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-error transition-colors"><Trash2 size={20} /></button>
                        </div>
                        <div className="flex items-center justify-between border-t border-dashed border-gray-300 pt-2 mt-1">
                            <span className="text-xs font-bold text-gray-500">QTY</span>
                            <div className="flex items-center gap-3 bg-gray-100 px-2 py-1 border border-black">
                                <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-error font-black"><Minus size={14}/></button>
                                <span className="font-mono font-bold text-sm w-4 text-center">{item.quantity || 1}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-neon text-black font-black"><Plus size={14}/></button>
                            </div>
                        </div>
                    </div>
                  ))}</div>
                )}
            </div>
            
            {!orderSuccess && cart.length > 0 && (
                <div className="bg-white border-t-4 border-black p-6">
                    <div className="mb-6">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-2"><Tag size={12}/> Discount Code</label>
                        <div className="flex gap-2">
                            <input type="text" placeholder="ex: HACKER" className="w-full border-2 border-black p-2 font-bold uppercase focus:outline-none focus:ring-2 focus:ring-neon placeholder-gray-400" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                            <button onClick={applyPromoCode} className="bg-black text-white px-4 font-bold hover:bg-neon hover:text-black border-2 border-black transition-all">APPLY</button>
                        </div>
                        {discount > 0 && <p className="text-xs font-bold text-neon bg-black inline-block px-1 mt-1">DISCOUNT ACTIV: -{discount * 100}%</p>}
                    </div>
                    <div className="space-y-2 mb-4 pb-4 border-b-2 border-dashed border-gray-300">
                        <div className="flex justify-between text-sm font-bold text-gray-500"><span>Subtotal</span><span>{calculateSubtotal()} RON</span></div>
                        {discount > 0 && (<div className="flex justify-between text-sm font-bold text-green-600"><span>Reducere</span><span>-{(calculateSubtotal() * discount).toFixed(0)} RON</span></div>)}
                        <div className="flex justify-between items-end pt-2"><span className="text-gray-900 font-black text-lg">TOTAL</span><span className="text-4xl font-black">{calculateTotal().toFixed(0)} RON</span></div>
                    </div>
                    <button onClick={handleCheckout} className="w-full bg-black text-neon font-black py-4 text-xl hover:bg-neon hover:text-black border-2 border-transparent hover:border-black transition-all shadow-brutal flex items-center justify-center gap-2"><CreditCard size={24} /> SEND ORDER</button>
                </div>
            )}
        </div>
      </>
  );
}