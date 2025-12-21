import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, MapPin, Truck, ShieldCheck, Lock } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function CheckoutPage({ cart, setCart, user, userData }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [shipping, setShipping] = useState({
    fullName: user?.displayName || '',
    address: '',
    city: '',
    county: '',
    zip: '',
    phone: userData?.phone || ''
  });

  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' });

  const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) * (item.quantity || 1)), 0);
  const shippingCost = subtotal > 100 ? 0 : 20;
  const total = subtotal + shippingCost;

  useEffect(() => {
    if (cart.length === 0) navigate('/shop');
  }, [cart, navigate]);

  const handleInputChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    let val = e.target.value;
    if (e.target.name === 'number') val = val.replace(/\D/g, '').slice(0, 16);
    if (e.target.name === 'cvc') val = val.replace(/\D/g, '').slice(0, 3);
    if (e.target.name === 'expiry') {
        val = val.replace(/\D/g, '');
        if(val.length >= 2) val = val.slice(0,2) + '/' + val.slice(2,4);
    }
    setCard({ ...card, [e.target.name]: val });
  };

  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();

    if (!user) return toast.error("Trebuie să fii logat!");
    
    if (!shipping.address || !shipping.city || !shipping.phone) {
        return toast.error("Completează adresa de livrare!");
    }

    setLoading(true);
    const toastId = toast.loading("Inițializare Stripe Secure Checkout...");

    try {
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        username: shipping.fullName,
        phone: shipping.phone,
        
        shippingAddress: {
            address: shipping.address,
            city: shipping.city,
            county: shipping.county,
            zip: shipping.zip
        },

        items: cart,
        subtotal: subtotal,
        shippingCost: shippingCost,
        total: total,
        
        status: 'pending_payment',
        paymentMethod: 'stripe',
        isPaid: false,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);

const response = await fetch('https://createstripecheckout-rjtaqw7mdq-uc.a.run.app', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
      items: cart,
      email: user.email,
      orderId: docRef.id
  }),
});

      const data = await response.json();

      if (data.url) {
        toast.success("Redirecting to Stripe...", { id: toastId });
        window.location.href = data.url;
      } else {
        console.error("Stripe Error:", data);
        throw new Error("Nu am primit URL de la Stripe. Verifica consola.");
      }

    } catch (error) {
      console.error("Eroare Checkout:", error);
      toast.error("Eroare la conectarea cu Stripe.", { id: toastId });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 font-mono">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="flex items-center gap-2 mb-8 text-gray-400 hover:text-black transition-colors w-fit">
            <ArrowLeft size={20} />
            <Link to="/shop" className="font-bold uppercase">Back to Shop</Link>
        </div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8">SECURE CHECKOUT</h1>
        <div className="grid lg:grid-cols-3 gap-12"> 
            <div className="lg:col-span-2 space-y-8">
               <div className="bg-white border-4 border-black p-6 shadow-brutal">
                    <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
                        <MapPin className="text-neon" /> SHIPPING DATA
                    </h2>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                            <input type="text" name="fullName" value={shipping.fullName} onChange={handleInputChange} className="w-full bg-gray-100 border-2 border-gray-300 p-3 font-bold focus:border-black focus:outline-none" placeholder="John Doe" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Address</label>
                            <input type="text" name="address" value={shipping.address} onChange={handleInputChange} className="w-full bg-gray-100 border-2 border-gray-300 p-3 font-bold focus:border-black focus:outline-none" placeholder="Str. Exemplului nr. 1" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">City</label>
                            <input type="text" name="city" value={shipping.city} onChange={handleInputChange} className="w-full bg-gray-100 border-2 border-gray-300 p-3 font-bold focus:border-black focus:outline-none" placeholder="Bucharest" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">County (Județ)</label>
                            <input type="text" name="county" value={shipping.county} onChange={handleInputChange} className="w-full bg-gray-100 border-2 border-gray-300 p-3 font-bold focus:border-black focus:outline-none" placeholder="Sector 1" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">ZIP Code</label>
                            <input type="text" name="zip" value={shipping.zip} onChange={handleInputChange} className="w-full bg-gray-100 border-2 border-gray-300 p-3 font-bold focus:border-black focus:outline-none" placeholder="010101" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                            <input type="text" name="phone" value={shipping.phone} onChange={handleInputChange} className="w-full bg-gray-100 border-2 border-gray-300 p-3 font-bold focus:border-black focus:outline-none" placeholder="07xx xxx xxx" />
                        </div>
                    </form>
                </div>

                    
                    <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
                        <ShieldCheck size={14} className="text-neon" />
                        <span>Encrypted by Stripe (Simulated). No real money will be charged.</span>
                    </div>
                </div>

            </div>
            
            <div className="lg:col-span-1">
                <div className="bg-white border-4 border-black p-6 sticky top-24">
                    <h3 className="text-xl font-black uppercase mb-4 border-b-4 border-black pb-2">ORDER SUMMARY</h3>
                    
                    <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
                        {cart.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start text-sm">
                                <div className="flex gap-2">
                                    <span className="font-bold">{item.quantity}x</span>
                                    <span className="text-gray-600">{item.name}</span>
                                </div>
                                <span className="font-bold">{item.price * item.quantity} RON</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2 border-t-2 border-dashed border-gray-300 pt-4 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-bold">Subtotal</span>
                            <span className="font-bold">{subtotal} RON</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-bold">Shipping</span>
                            <span className="font-bold">{shippingCost === 0 ? <span className="text-neon bg-black px-1">FREE</span> : `${shippingCost} RON`}</span>
                        </div>
                        <div className="flex justify-between items-end pt-2 border-t-2 border-black mt-2">
                            <span className="text-xl font-black uppercase">TOTAL</span>
                            <span className="text-3xl font-black text-neon bg-black px-2">{total} RON</span>
                        </div>
                    </div>

                    <button 
                        onClick={handlePlaceOrder} 
                        disabled={loading}
                        className={`w-full py-4 text-xl font-black uppercase tracking-widest border-2 border-black transition-all shadow-brutal flex items-center justify-center gap-2 ${loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-neon hover:bg-black hover:text-neon text-black'}`}
                    >
                        {loading ? 'PROCESSING...' : 'PAY NOW'}
                    </button>
                    
                    <div className="mt-4 flex justify-center gap-2 text-gray-400">
                         <Truck size={16} /> <span className="text-xs font-bold uppercase">Fast Delivery via FanCourier</span>
                    </div>
                </div>
            </div>

        </div>
      </div>
  );
}