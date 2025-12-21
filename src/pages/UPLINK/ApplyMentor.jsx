import React, { useState, useEffect } from 'react'; 
import { useNavigate, useLocation, Link } from 'react-router-dom'; 
import { db } from '../../firebase'; 
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore'; 
import { Upload, ArrowLeft, Save, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ApplyMentor({ user, userData }) {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.listing; 

  const [formData, setFormData] = useState({
    subject: '',
    tags: '',
    price: '',
    contactInfo: '',
    description: '',
    availability: '',
    proofImage: '' 
  });

  useEffect(() => {
    if (editData) {
        setFormData({
            subject: editData.subject,
            tags: editData.tags.join(', '),
            price: editData.price,
            description: editData.description,
            availability: editData.availability || '',
            contactInfo: editData.contactInfo || '',
            proofImage: 'ALREADY_VERIFIED' 
        });
    }
  }, [editData]);

  if (!user) return <div className="p-20 text-center font-mono">ACCESS DENIED</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.price || !formData.description) {
        return toast.error("Completează toate câmpurile!");
    }

    try {
        const listingsRef = collection(db, "listings");
        
        const listingPayload = {
            userId: user.uid,
            username: userData?.username || user.displayName || 'Agent',
            userEmail: user.email,
            userPhoto: user.photoURL || '',
            subject: formData.subject.toUpperCase(),
            tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
            price: Number(formData.price),
            description: formData.description,
            contactInfo: formData.contactInfo || user.email,
            availability: formData.availability,
            updatedAt: serverTimestamp(),
            
            status: 'pending' 
        };

        if (editData) {
            await updateDoc(doc(db, "listings", editData.id), listingPayload);
            toast.success("Trimis la moderare!");
        } else {
            if (!formData.proofImage && !userData?.isTutor) {
                return toast.error("Trebuie să încarci o dovadă pentru verificare!");
            }
            
            await addDoc(listingsRef, {
                ...listingPayload,
                createdAt: serverTimestamp(),
                verificationProof: userData?.isTutor ? 'PREVIOUSLY_VERIFIED' : (formData.proofImage || '')
            });

            if (!userData?.isTutor) {
                await updateDoc(doc(db, "users", user.uid), { tutorStatus: 'pending' });
            }
            
            toast.success("Aplicație trimisă la Admin!");
        }
        navigate('/uplink/profile');
    } catch (error) {
        console.error(error);
        toast.error("Eroare la salvare.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] font-mono p-4 md:p-8 pt-24">
       <div className="max-w-3xl mx-auto bg-white border-4 border-black p-8 shadow-brutal">
            <Link to="/uplink/profile" className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-black"><ArrowLeft size={18}/> CANCEL</Link>
            
            <h1 className="text-4xl font-black uppercase mb-2">{editData ? 'EDIT NODE' : 'DEPLOY NEW NODE'}</h1>
            
            {/* Mesaj de avertizare */}
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-8">
                <div className="flex items-center gap-2 font-bold text-yellow-700">
                    <AlertTriangle size={20}/>
                    <span>ATENȚIE:</span>
                </div>
                <p className="text-sm text-yellow-800 mt-1">Orice modificare a anunțului va necesita o nouă aprobare din partea unui Admin înainte de a deveni vizibil public.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-black uppercase mb-1">Materia Predată</label>
                        <input type="text" className="w-full bg-gray-100 border-2 border-black p-3 font-bold focus:outline-none focus:bg-white placeholder-gray-400" placeholder="Ex: JAVA, ANALIZĂ..." value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase mb-1">Preț (Z-COINS / ORĂ)</label>
                        <input type="number" className="w-full bg-gray-100 border-2 border-black p-3 font-bold focus:outline-none focus:bg-white" placeholder="50" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-black uppercase mb-1 flex items-center gap-1"><Clock size={12}/> Program Disponibil (Text Liber)</label>
                    <input type="text" className="w-full bg-gray-100 border-2 border-black p-3 font-bold focus:outline-none focus:bg-white placeholder-gray-400" placeholder="Ex: Luni-Vineri dupa 18:00, Sambata toata ziua" value={formData.availability || ''} onChange={e => setFormData({...formData, availability: e.target.value})} />
                </div>

                <div>
                    <label className="block text-xs font-black uppercase mb-1">Tags (Keywords)</label>
                    <input type="text" className="w-full bg-gray-100 border-2 border-black p-3 font-bold focus:outline-none focus:bg-white" placeholder="Ex: Restanță, Începători, Examen" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
                </div>

                <div>
                    <label className="block text-xs font-black uppercase mb-1">Metoda Contact (Discord ID / WhatsApp)</label>
                    <input type="text" className="w-full bg-gray-100 border-2 border-black p-3 font-bold focus:outline-none focus:bg-white placeholder-gray-400" placeholder="Discord/Whatsapp/etc" value={formData.contactInfo || ''} onChange={e => setFormData({...formData, contactInfo: e.target.value})} />
                </div>

                <div>
                    <label className="block text-xs font-black uppercase mb-1">Descriere</label>
                    <textarea rows="4" className="w-full bg-gray-100 border-2 border-black p-3 font-bold focus:outline-none focus:bg-white" placeholder="Descriere..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} ></textarea>
                </div>

                {!editData && !userData?.isTutor && (
                    <div className="bg-black text-white p-4 border-2 border-neon">
                        <label className="block text-xs font-black text-neon uppercase mb-2 flex items-center gap-2"><Upload size={16}/> DOVADA COMPETENȚEI (LINK POZA)</label>
                        <input type="text" className="w-full bg-gray-900 border border-gray-700 p-2 text-white text-xs font-mono" placeholder="Paste Image URL here (Imgur/Drive/etc)" value={formData.proofImage} onChange={e => setFormData({...formData, proofImage: e.target.value})} />
                    </div>
                )}

                <button type="submit" className="w-full bg-neon text-black font-black py-4 uppercase text-xl hover:bg-black hover:text-neon transition-colors shadow-[4px_4px_0_0_#000] flex justify-center items-center gap-2">
                   <Save size={20}/> {editData ? 'SUBMIT UPDATES' : 'SUBMIT APPLICATION'}
                </button>

            </form>
       </div>
    </div>
  );
}