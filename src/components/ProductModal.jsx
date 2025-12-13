import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Plus, Minus, Star, Zap, Activity, MessageSquare, Trash2, Edit2, Save, XCircle } from 'lucide-react';
import { addReview, getProductReviews, deleteReview, updateReview } from '../firebase'; // Importam functiile noi
import toast from 'react-hot-toast';

export default function ProductModal({ product, isOpen, onClose, addToCart, user }) {
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('DESC'); 
  const [activeImage, setActiveImage] = useState(0);
  
  // Review States
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Review States
  const [editingId, setEditingId] = useState(null); // ID-ul review-ului pe care il editam
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState(5);

  // --- INIT MODAL ---
useEffect(() => {
      if (isOpen && product) {
          document.body.style.overflow = 'hidden';
          
          setActiveTab('DESC'); 
          setActiveImage(0);
          setQty(1);

          // FIX: Golim review-urile vechi inainte sa incarcam altele noi
          setReviews([]); 
          
          // Incarcam review-urile pentru produsul curent
          getProductReviews(product.id)
            .then(data => setReviews(data))
            .catch(err => console.log("Eroare incarcare review-uri:", err));

      } else {
          document.body.style.overflow = 'unset';
      }
      return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addToCart(product, qty);
    onClose();
  };

  // --- ADD REVIEW ---
  const handleSubmitReview = async (e) => {
      e.preventDefault();
      if (!user) { toast.error("Trebuie să fii logat."); return; }
      if (!newComment.trim()) { toast.error("Scrie ceva."); return; }

      setIsSubmitting(true);
      try {
          const reviewData = {
              userName: user.displayName || "Anonymous User",
              rating: newRating,
              comment: newComment,
              userId: user.uid
          };
          
          const newId = await addReview(product.id, reviewData);
          setReviews([{ ...reviewData, id: newId }, ...reviews]); // Adaugam local cu ID
          setNewComment("");
          toast.success("Review publicat!");
      } catch (error) { toast.error("Eroare."); } 
      finally { setIsSubmitting(false); }
  };

  // --- DELETE REVIEW ---
  const handleDelete = async (reviewId) => {
      if(!confirm("Sigur ștergi acest review?")) return;
      try {
          await deleteReview(reviewId);
          setReviews(reviews.filter(r => r.id !== reviewId)); // Scoatem din lista locala
          toast.success("Review șters.");
      } catch (e) { toast.error("Eroare la ștergere."); }
  };

  // --- EDIT REVIEW ---
  const startEdit = (review) => {
      setEditingId(review.id);
      setEditComment(review.comment);
      setEditRating(review.rating);
  };

  const saveEdit = async () => {
      try {
          await updateReview(editingId, editComment, editRating);
          // Actualizam lista locala
          setReviews(reviews.map(r => r.id === editingId ? { ...r, comment: editComment, rating: editRating } : r));
          setEditingId(null);
          toast.success("Review modificat!");
      } catch (e) { toast.error("Eroare la editare."); }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

      <div className="bg-white w-full max-w-5xl h-[90vh] md:h-auto md:max-h-[90vh] border-4 border-black shadow-[0_0_50px_rgba(57,255,20,0.2)] relative z-10 overflow-hidden flex flex-col md:flex-row">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-black text-white p-2 hover:bg-error hover:rotate-90 transition-all"><X size={24} /></button>

        {/* STANGA: Galerie */}
        <div className="w-full md:w-1/2 bg-gray-100 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col">
            <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden group">
                {product.gallery && product.gallery[activeImage] ? (<img src={product.gallery[activeImage]} alt={product.name} className="w-full h-full object-contain max-h-[400px] transition-transform duration-500 group-hover:scale-110" />) : (<div className="scale-150 text-gray-800">{product.icon}</div>)}
                <div className="absolute bottom-4 left-4 bg-black text-neon px-2 py-1 text-xs font-mono font-bold">IMG_0{activeImage + 1}</div>
            </div>
            {product.gallery && (<div className="h-24 bg-white border-t-4 border-black flex overflow-x-auto">{product.gallery.map((img, idx) => (<div key={idx} onClick={() => setActiveImage(idx)} className={`w-24 h-full border-r-2 border-black cursor-pointer hover:opacity-100 transition-opacity flex items-center justify-center p-2 ${activeImage === idx ? 'opacity-100 bg-gray-200' : 'opacity-50'}`}><img src={img} className="w-full h-full object-cover" /></div>))}</div>)}
        </div>

        {/* DREAPTA: Info */}
        <div className="w-full md:w-1/2 flex flex-col h-full overflow-y-auto bg-white">
            <div className="p-8 border-b-2 border-dashed border-gray-300">
                <div className="flex items-center gap-2 mb-2"><span className="bg-neon text-black px-2 py-1 text-xs font-bold uppercase">{product.category}</span>{product.stock && <span className="bg-black text-white px-2 py-1 text-xs font-bold uppercase flex items-center gap-1"><Activity size={12}/> STOC: {product.stock}</span>}</div>
                <h2 className="text-4xl font-black uppercase mb-2 leading-none">{product.name}</h2>
                <p className="text-3xl font-black">{product.price} RON</p>
            </div>

            <div className="p-8 bg-gray-50 border-b-4 border-black">
                <div className="flex gap-4">
                    <div className="flex items-center border-2 border-black bg-white"><button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:bg-gray-200 border-r-2 border-black"><Minus size={20}/></button><input type="text" value={qty} readOnly className="w-12 text-center font-bold font-mono text-xl outline-none" /><button onClick={() => setQty(qty + 1)} className="p-3 hover:bg-gray-200 border-l-2 border-black"><Plus size={20}/></button></div>
                    <button onClick={handleAddToCart} className="flex-1 bg-black text-neon font-black text-xl hover:bg-neon hover:text-black border-2 border-transparent hover:border-black transition-all flex items-center justify-center gap-2 shadow-brutal"><ShoppingCart /> ADD TO LOOT</button>
                </div>
            </div>

            <div className="flex border-b-2 border-black">
                {['DESC', 'SPECS', 'REVIEWS'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 font-bold border-b-4 transition-all ${activeTab === tab ? 'border-neon bg-black text-white' : 'border-transparent hover:bg-gray-100'}`}>{tab}</button>
                ))}
            </div>

            <div className="p-8 flex-1">
                {activeTab === 'DESC' && (<div className="prose"><p className="font-bold text-gray-700 leading-relaxed text-lg">{product.longDesc || product.desc}</p><div className="mt-6 p-4 bg-gray-100 border-l-4 border-neon"><h4 className="font-black flex items-center gap-2 mb-2"><Zap size={16}/> WHY IT'S GOOD:</h4><p className="text-sm font-bold text-gray-600">Testat în sesiuni de coding de 12 ore.</p></div></div>)}
                {activeTab === 'SPECS' && (<div className="space-y-2 font-mono text-sm">{product.specs ? Object.entries(product.specs).map(([key, val]) => (<div key={key} className="flex justify-between border-b border-dashed border-gray-300 pb-1"><span className="text-gray-500 font-bold uppercase">{key}</span><span className="font-black">{val}</span></div>)) : <p>No specs available.</p>}</div>)}
                
                {activeTab === 'REVIEWS' && (
                    <div className="space-y-6">
                        <form onSubmit={handleSubmitReview} className="bg-gray-100 p-4 border-2 border-black">
                            <h4 className="font-black mb-2 uppercase flex items-center gap-2"><MessageSquare size={16}/> Write Review</h4>
                            <div className="flex gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (<Star key={star} size={24} onClick={() => setNewRating(star)} fill={star <= newRating ? "black" : "none"} className={`cursor-pointer ${star <= newRating ? 'text-black' : 'text-gray-400'}`} />))}
                            </div>
                            <textarea className="w-full border-2 border-black p-2 font-bold text-sm mb-2 focus:outline-none focus:border-neon" placeholder="Opinia ta sinceră..." rows="2" value={newComment} onChange={(e) => setNewComment(e.target.value)}></textarea>
                            <button disabled={isSubmitting} className="bg-black text-white px-4 py-1 font-bold text-sm hover:bg-neon hover:text-black transition-colors w-full border-2 border-black">{isSubmitting ? 'SENDING...' : 'PUBLISH REVIEW'}</button>
                        </form>

                        {/* LISTA REVIEW-URI CU SCROLL */}
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {reviews.length === 0 ? (
                                <p className="text-gray-500 font-bold text-center italic">Fii primul care scrie un review.</p>
                            ) : (
                                reviews.map((rev) => (
                                    <div key={rev.id} className="bg-white p-4 border border-black shadow-sm group relative">
                                        {/* EDIT MODE */}
                                        {editingId === rev.id ? (
                                            <div className="animate-in fade-in">
                                                 <div className="flex gap-1 mb-2">
                                                    {[1, 2, 3, 4, 5].map((s) => (<Star key={s} size={16} onClick={() => setEditRating(s)} fill={s <= editRating ? "black" : "none"} className="cursor-pointer" />))}
                                                 </div>
                                                 <textarea className="w-full border p-2 font-bold text-sm mb-2" value={editComment} onChange={(e) => setEditComment(e.target.value)} />
                                                 <div className="flex gap-2">
                                                     <button onClick={saveEdit} className="bg-neon text-black px-2 py-1 text-xs font-bold flex items-center gap-1"><Save size={12}/> SAVE</button>
                                                     <button onClick={() => setEditingId(null)} className="bg-gray-200 text-black px-2 py-1 text-xs font-bold flex items-center gap-1"><XCircle size={12}/> CANCEL</button>
                                                 </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between mb-2">
                                                    <span className="font-black uppercase text-sm">{rev.userName}</span>
                                                    <div className="flex text-neon">
                                                        {[...Array(5)].map((_, i) => (<Star key={i} size={12} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "text-black" : "text-gray-300"} />))}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-700 font-bold border-l-2 border-gray-300 pl-2">"{rev.comment}"</p>
                                                
                                                {/* BUTOANE EDIT/DELETE (Doar pentru autor) */}
                                                {user && user.uid === rev.userId && (
                                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => startEdit(rev)} className="text-gray-400 hover:text-black" title="Edit"><Edit2 size={14}/></button>
                                                        <button onClick={() => handleDelete(rev.id)} className="text-gray-400 hover:text-error" title="Delete"><Trash2 size={14}/></button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}