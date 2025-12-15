import React, { useState } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2, Tag, CreditCard, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer({ isOpen, onClose, cart, setCart, onCheckout, user }) {
    const navigate = useNavigate();
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) return { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) };
            return item;
        }));
    };

    const removeFromCart = (id) => setCart(cart.filter((item) => item.id !== id));

    const calculateSubtotal = () => cart.reduce((total, item) => total + (Number(item.price) * (item.quantity || 1)), 0);
    
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
            toast.error("INVALID ACCESS CODE");
        }
    };

    const handleInitiateCheckout = () => {
        onCheckout({
            finalTotal: calculateTotal(),
            discountValue: discount
        });
    };
    
    const goToCheckout = () => {
        onClose();
        navigate('/checkout');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-md bg-white h-full shadow-2xl border-l-4 border-black flex flex-col animate-in slide-in-from-right duration-300">
                
                <div className="bg-black text-neon p-6 flex justify-between items-center border-b-4 border-black">
                    <h2 className="text-2xl font-black uppercase flex items-center gap-2 tracking-tighter">
                        <ShoppingBag className="text-neon" /> LOOT STASH ({cart.length})
                    </h2>
                    <button onClick={onClose} className="hover:text-white transition-colors"><X size={32} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 bg-concrete">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-50 text-gray-400">
                            <ShoppingCart size={64} className="mb-4" />
                            <p className="text-xl font-bold uppercase">COȘUL E GOL.</p>
                            <p className="font-mono text-sm">Vizitează Depot-ul.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.id} className="bg-white border-2 border-black p-3 shadow-brutal flex flex-col gap-2 group">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3 w-full">

                                            <div className="w-16 h-16 bg-gray-200 border-2 border-black flex items-center justify-center overflow-hidden shrink-0">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-[10px] font-black text-gray-400">NO IMG</div>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <h4 className="font-black uppercase text-sm leading-tight">{item.name}</h4>
                                                <span className="text-xs font-bold text-neon bg-black px-1 mt-1 inline-block">{item.price} RON</span>
                                            </div>
                                        </div>
                                        
                                        <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-dashed border-gray-300 pt-2 mt-1">
                                        <span className="text-xs font-bold text-gray-500">QUANTITY</span>
                                        <div className="flex items-center gap-0 border-2 border-black">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 hover:bg-black hover:text-white transition-colors font-black bg-gray-100"><Minus size={14}/></button>
                                            <span className="font-mono font-bold text-sm w-8 text-center bg-white">{item.quantity || 1}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 hover:bg-black hover:text-white transition-colors font-black bg-gray-100"><Plus size={14}/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {cart.length > 0 && (
                    <div className="bg-white border-t-4 border-black p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
                        
                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-2"><Tag size={12}/> ACCESS CODE</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="ex: HACKER" 
                                    className="w-full border-2 border-black p-2 font-bold uppercase focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(57,255,20,1)] focus:border-neon transition-all placeholder-gray-400" 
                                    value={promoCode} 
                                    onChange={(e) => setPromoCode(e.target.value)} 
                                />
                                <button onClick={applyPromoCode} className="bg-black text-white px-4 font-bold hover:bg-neon hover:text-black border-2 border-black transition-all">APPLY</button>
                            </div>
                            {discount > 0 && <p className="text-xs font-bold text-neon bg-black inline-block px-1 mt-2 animate-pulse">DISCOUNT APPLIED: -{discount * 100}%</p>}
                        </div>

                        <div className="space-y-2 mb-6 pb-4 border-b-2 border-dashed border-gray-300">
                            <div className="flex justify-between text-sm font-bold text-gray-500">
                                <span>Subtotal</span>
                                <span>{calculateSubtotal()} RON</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm font-bold text-neon bg-black px-1">
                                    <span>REDUCERE</span>
                                    <span>-{(calculateSubtotal() * discount).toFixed(0)} RON</span>
                                </div>
                            )}
                            <div className="flex justify-between items-end pt-2">
                                <span className="text-gray-900 font-black text-xl uppercase tracking-tighter">TOTAL</span>
                                <span className="text-4xl font-black text-black">{calculateTotal().toFixed(0)} RON</span>
                            </div>
                        </div>

                        <button 
                            onClick={goToCheckout} 
                            className="w-full bg-neon text-black font-black py-4 text-xl hover:bg-black hover:text-neon border-2 border-black transition-all shadow-brutal flex items-center justify-center gap-2 group uppercase tracking-widest"
                        >
                            <CreditCard size={24} /> CHECKOUT <ArrowRight className="group-hover:translate-x-1 transition-transform"/>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}