import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, deleteDoc, updateDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ShoppingCart, Star, ArrowLeft, Pencil, Trash2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { Heart } from 'lucide-react';
import { toggleWishlist, checkInWishlist } from '../firebase';

export default function ProductPage({ addToCart, user }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(5);

  useEffect(() => {
    const fetchProduct = async () => {
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() });
      } else {
        toast.error("Produsul nu există.");
      }
      setLoading(false);
    };

    const reviewsRef = collection(db, "products", id, "reviews");
    const qReviews = query(reviewsRef, orderBy("createdAt", "desc"));
    const unsubReviews = onSnapshot(qReviews, (snapshot) => {
        setReviews(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    fetchProduct();
    return () => unsubReviews();
  }, [id]);

  const handleWishlist = async () => {
    if (!user) return toast.error("LOGIN REQUIRED FOR WISHLIST");

    try {
        const result = await toggleWishlist(user.uid, product);
        setIsWishlisted(result.added);
        toast(result.message, { 
            icon: result.added ? '❤️' : '💔',
            style: { background: 'black', color: result.added ? '#39FF14' : 'white', border: '2px solid #39FF14' }
        });
    } catch (error) {
        console.error(error);
    }
};

  useEffect(() => {
    if(user && product) {
        checkInWishlist(user.uid, product.id).then(status => setIsWishlisted(status));
    }
}, [user, product]);

  const handleAddReview = async (e) => {
      e.preventDefault();
      if(!user) return toast.error("Loghează-te!");
      if(!newReviewText.trim()) return toast.error("Mesaj gol.");
      try {
          await addDoc(collection(db, "products", id, "reviews"), {
              userName: user.displayName || "Anonim",
              userId: user.uid,
              rating: newRating,
              text: newReviewText,
              createdAt: serverTimestamp(),
              isEdited: false
          });
          toast.success("Review adăugat!");
          setNewReviewText('');
          setNewRating(5);
      } catch (err) { toast.error("Eroare."); }
  };

  const handleDeleteReview = async (reviewId) => {
      if(window.confirm("Ștergi?")) {
          try { await deleteDoc(doc(db, "products", id, "reviews", reviewId)); toast.success("Șters."); } catch (err) { toast.error("Eroare."); }
      }
  };

  const startEditing = (review) => { setEditingId(review.id); setEditText(review.text); setEditRating(review.rating); };
  
  const handleUpdateReview = async () => {
      try { await updateDoc(doc(db, "products", id, "reviews", editingId), { text: editText, rating: editRating, isEdited: true }); toast.success("Updatat!"); setEditingId(null); } catch (err) { toast.error("Eroare."); }
  };

  const averageRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "NEW";

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-neon font-mono animate-pulse">LOADING...</div>;
  if (!product) return <div className="min-h-screen bg-black text-white p-20">NOT FOUND</div>;

  return (
    <div className="min-h-screen bg-concrete font-mono pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4 mb-8">
          <Link to="/shop" className="inline-flex items-center gap-2 text-gray-500 hover:text-black font-bold uppercase transition-colors"><ArrowLeft size={20} /> INVENTORY</Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white border-4 border-black p-4 shadow-brutal sticky top-24 h-fit">
            <div className="aspect-square bg-gray-100 overflow-hidden border-2 border-black relative">
                 {product.image ? (<img src={product.image} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />) : (<div className="w-full h-full flex items-center justify-center font-black text-4xl text-gray-300">NO SIGNAL</div>)}
                 <div className="absolute top-4 left-4 bg-black text-neon px-3 py-1 font-bold border border-neon shadow-[4px_4px_0_0_#39FF14]">{product.category?.toUpperCase() || 'ITEM'}</div>
            </div>
        </div>

        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-2">{product.name}</h1>
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-neon bg-black px-2 py-1">{[1,2,3,4,5].map(star => (<Star key={star} size={16} fill={star <= Math.round(Number(averageRating)) ? "#39FF14" : "none"} className={star <= Math.round(Number(averageRating)) ? "text-neon" : "text-gray-600"} />))}</div>
                    <span className="font-bold text-gray-500 text-sm">({reviews.length} LOGS)</span>
                </div>
                <div className="text-4xl font-black text-black mb-6">{product.price} RON</div>
                <p className="text-gray-600 font-bold text-sm leading-relaxed border-l-4 border-neon pl-4 mb-8">{product.description || "No data available."}</p>
            </div>

            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
<div className="flex gap-4 mb-4">
    <div className="flex items-center border-2 border-black bg-gray-100">
        <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-2 hover:bg-black hover:text-white font-black text-xl">-</button>
        <span className="px-4 font-bold text-xl min-w-[50px] text-center">{qty}</span>
        <button onClick={() => setQty(q => q + 1)} className="px-4 py-2 hover:bg-black hover:text-white font-black text-xl">+</button>
    </div>
<button onClick={() => addToCart(product, qty)} className="flex-1 bg-neon text-black font-black text-xl uppercase tracking-widest hover:bg-black hover:text-neon border-2 border-black transition-all flex items-center justify-center gap-2">
        <ShoppingCart /> <span className="hidden md:inline">ADD TO LOOT</span><span className="md:hidden">ADD</span>
    </button>
    <button 
        onClick={handleWishlist} 
        className={`px-4 border-2 border-black flex items-center justify-center transition-all ${isWishlisted ? 'bg-black text-red-500' : 'bg-white hover:bg-gray-100'}`}
        title="Save to Wishlist"
    >
        <Heart size={28} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={3} />
    </button>
                    </div>
            </div>
            {product.specs && product.specs.length > 0 ? (
                <div className="mt-8 grid grid-cols-2 gap-4">
                    {product.specs.map((spec, index) => (
                        <div key={index} className="bg-gray-200 p-4 border-2 border-gray-400 hover:border-black transition-colors">
                            <div className="text-xs text-gray-500 font-bold uppercase mb-1">{spec.key}</div>
                            <div className="font-black uppercase">{spec.value}</div>
                        </div>
                    ))}
                </div>
            ) : (

                <div className="mt-8 text-xs text-gray-400 font-mono border-t border-dashed border-gray-300 pt-2">
                    NO_TECH_SPECS_AVAILABLE
                </div>
            )}

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-20">
        <div className="border-t-4 border-black pt-10">
            <h2 className="text-3xl font-black uppercase mb-8 flex items-center gap-3"><span className="bg-black text-white px-2">USER_LOGS</span></h2>
            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                    {reviews.length === 0 ? (<p className="text-gray-500 italic">No logs found.</p>) : (reviews.map((rev) => (
                            <div key={rev.id} className={`bg-white border-2 border-black p-4 shadow-brutal relative ${editingId === rev.id ? 'border-neon' : ''}`}>
                                {editingId === rev.id ? (
                                    <div className="animate-in fade-in">
                                        <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full bg-gray-100 border-2 border-black p-2 font-bold mb-2 focus:outline-none focus:border-neon" rows={3} />
                                        <div className="flex gap-2 justify-end"><button onClick={() => setEditingId(null)} className="text-xs font-bold uppercase bg-gray-200 px-3 py-1">Cancel</button><button onClick={handleUpdateReview} className="text-xs font-bold uppercase bg-neon text-black px-3 py-1">Save</button></div>
                                    </div>
                                ) : (
                                    <><div className="flex justify-between items-start mb-2"><span className="font-black uppercase">{rev.userName}</span><div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < rev.rating ? "black" : "none"} />)}</div></div><p className="text-sm font-bold text-gray-600">{rev.text}</p><div className="flex justify-between items-end mt-3"><span className="text-[10px] text-gray-400 uppercase block">{rev.isEdited && <span className="text-neon mr-2">(EDITED)</span>} VERIFIED</span>{user && user.uid === rev.userId && (<div className="flex gap-2"><button onClick={() => startEditing(rev)} className="text-gray-500 hover:text-blue-600"><Pencil size={14}/></button><button onClick={() => handleDeleteReview(rev.id)} className="text-gray-500 hover:text-error"><Trash2 size={14}/></button></div>)}</div></>
                                )}
                            </div>
                    )))}
                </div>
                <div className="bg-black p-6 text-white border-4 border-neon shadow-[8px_8px_0_0_#39FF14] h-fit sticky top-24">
                    <h3 className="text-xl font-black text-neon uppercase mb-4">WRITE_LOG_ENTRY</h3>
                    {!user ? (<div className="text-center py-8"><p className="mb-4 font-bold">ACCESS DENIED.</p><Link to="/shop" className="text-neon underline">Login Required</Link></div>) : (<form onSubmit={handleAddReview} className="space-y-4"><div><div className="flex gap-2">{[1,2,3,4,5].map(star => (<button type="button" key={star} onClick={() => setNewRating(star)} className="focus:outline-none"><Star size={24} fill={star <= newRating ? "#39FF14" : "none"} className={star <= newRating ? "text-neon" : "text-gray-600"} /></button>))}</div></div><textarea rows="4" className="w-full bg-gray-900 border-2 border-gray-700 p-2 text-white focus:border-neon focus:outline-none font-mono" placeholder="System log entry..." value={newReviewText} onChange={e => setNewReviewText(e.target.value)}></textarea><button type="submit" className="w-full bg-neon text-black font-black py-3 uppercase tracking-widest hover:bg-white border-2 border-transparent hover:border-black transition-all">UPLOAD</button></form>)}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}