import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; 
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { Package, Truck, CheckCircle, DollarSign, AlertTriangle, Plus, Trash2, Edit, X, Layers, ShoppingBag, List, ChevronDown, ChevronUp, MapPin, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Admin({ user, userData }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, count: 0, pending: 0 });
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const [products, setProducts] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', price: '', category: 'gear', image: '', description: '', specs: [], stock: 10, images: ['']
  });

  useEffect(() => {
    if (userData) {
        if (userData.role !== 'admin') {
           navigate('/'); 
        }
    }
  }, [user, userData, navigate]);

  useEffect(() => {
    const qOrders = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
      const total = data.reduce((acc, order) => acc + (order.total || 0), 0);
      const pending = data.filter(o => o.status === 'pending' || o.status === 'processing').length;
      setStats({ total, count: data.length, pending });
    });

    const qProducts = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(data);
    });

    return () => { unsubOrders(); unsubProducts(); };
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      toast.success(`STATUS: ${newStatus.toUpperCase()}`);
    } catch (error) { toast.error("Eroare update status"); }
  };

  const toggleOrderDetails = (id) => {
      if (expandedOrderId === id) {
          setExpandedOrderId(null);
      } else {
          setExpandedOrderId(id);
      }
  };

  // --- SPECIFICATIONS LOGIC ---
  const addSpecField = () => setFormData({ ...formData, specs: [...formData.specs, { key: '', value: '' }] });
  const removeSpecField = (index) => setFormData({ ...formData, specs: formData.specs.filter((_, i) => i !== index) });
  const updateSpecField = (index, field, text) => {
      const newSpecs = [...formData.specs];
      newSpecs[index][field] = text;
      setFormData({ ...formData, specs: newSpecs });
  };

  // --- IMAGES LOGIC ---
  const addImageField = () => setFormData({ ...formData, images: [...formData.images, ''] });
  const removeImageField = (index) => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  const updateImageField = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const handleProductSubmit = async (e) => {
      e.preventDefault();
      if(!formData.name || !formData.price) return toast.error("Date incomplete!");
      try {
          const cleanImages = formData.images ? formData.images.filter(img => img.trim() !== '') : [];
          const finalImages = cleanImages.length > 0 ? cleanImages : [];
          
          const cleanSpecs = formData.specs ? formData.specs.filter(s => s.key.trim() !== '' && s.value.trim() !== '') : [];
          
          const productData = { 
            ...formData, 
            price: Number(formData.price), 
            stock: Number(formData.stock),
            specs: cleanSpecs, 
            images: finalImages, 
            image: finalImages[0] || '', 
            createdAt: new Date() 
          };
          
          if(isEditing) {
              const { createdAt, ...updateData } = productData;
              await updateDoc(doc(db, "products", isEditing), updateData);
              toast.success("Produs actualizat!");
              setIsEditing(null);
          } else {
              await addDoc(collection(db, "products"), productData);
              toast.success("Produs adaugat!");
          }
          setFormData({ name: '', price: '', category: 'gear', image: '', description: '', specs: [], stock: 10, images: [''] });
      } catch (err) { toast.error("Eroare salvare."); console.error(err); }
  };

  const handleEditClick = (product) => {
      setIsEditing(product.id);

      let editImages = [''];
      if (product.images && product.images.length > 0) {
          editImages = product.images;
      } else if (product.image) {
          editImages = [product.image];
      }

      setFormData({ 
          name: product.name, 
          price: product.price, 
          category: product.category || 'gear', 
          image: product.image || '', 
          description: product.description || '', 
          specs: product.specs || [],
          stock: product.stock !== undefined ? product.stock : 10,
          images: editImages
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (id) => {
      if(window.confirm("Stergi acest produs?")) {
          await deleteDoc(doc(db, "products", id));
          toast.success("Sters.");
      }
  };

  if (!user || !userData) return <div className="min-h-screen bg-black text-neon flex items-center justify-center font-mono animate-pulse">VERIFYING_ADMIN_CLEARANCE...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-mono p-4 md:p-8 pt-24 pb-20">

      <div className="flex flex-col md:flex-row justify-between items-end border-b-4 border-neon pb-4 mb-8">
        <div>
            <h1 className="text-4xl md:text-6xl font-black text-neon tracking-tighter">COMMAND_CENTER</h1>
            <p className="text-gray-500 mt-2">ADMIN PANEL V3.2 // <span className="text-white">FULL_CONTROL</span></p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
            <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 font-bold flex items-center gap-2 border-2 ${activeTab === 'orders' ? 'bg-neon text-black border-neon' : 'bg-black text-gray-500 border-gray-800'}`}><Layers size={18} /> COMMANDS</button>
            <button onClick={() => setActiveTab('products')} className={`px-4 py-2 font-bold flex items-center gap-2 border-2 ${activeTab === 'products' ? 'bg-neon text-black border-neon' : 'bg-black text-gray-500 border-gray-800'}`}><ShoppingBag size={18} /> ARMORY</button>
        </div>
      </div>

      {activeTab === 'orders' && (
        <div className="animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-gray-900 border-2 border-gray-800 p-6"><div className="flex justify-between items-start mb-4"><DollarSign className="text-neon" size={32} /><span className="text-xs text-gray-500">TOTAL REVENUE</span></div><div className="text-4xl font-black text-white">{stats.total} RON</div></div>
                <div className="bg-gray-900 border-2 border-gray-800 p-6"><div className="flex justify-between items-start mb-4"><Package className="text-white" size={32} /><span className="text-xs text-gray-500">TOTAL ORDERS</span></div><div className="text-4xl font-black text-white">{stats.count}</div></div>
                <div className="bg-gray-900 border-2 border-gray-800 p-6"><div className="flex justify-between items-start mb-4"><AlertTriangle className="text-yellow-500" size={32} /><span className="text-xs text-gray-500">PENDING / PROCESSING</span></div><div className="text-4xl font-black text-yellow-500">{stats.pending}</div></div>
            </div>

            <div className="border-2 border-gray-800 bg-black overflow-x-auto shadow-brutal">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-900 text-gray-500 text-xs uppercase border-b-2 border-gray-800">
                        <tr>
                            <th className="p-4 w-10"></th>
                            <th className="p-4">ID / Date</th>
                            <th className="p-4">Client Data</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {orders.map((order) => (
                            <React.Fragment key={order.id}>
                                <tr className={`border-b border-gray-800 hover:bg-gray-900/50 transition-colors ${expandedOrderId === order.id ? 'bg-gray-900' : ''}`}>
                                    <td className="p-4 text-center">
                                        <button onClick={() => toggleOrderDetails(order.id)} className="text-neon hover:scale-110 transition-transform">
                                            {expandedOrderId === order.id ? <ChevronUp /> : <ChevronDown />}
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-gray-400 font-mono text-xs">#{order.id.slice(0,6).toUpperCase()}</span>
                                        <div className="text-xs text-gray-600">{order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-white uppercase">{order.username || order.shippingAddress?.fullName || "ANON"}</div>
                                        <div className="text-xs text-gray-500">{order.userEmail}</div>
                                    </td>
                                    <td className="p-4 font-black text-neon">{order.total} RON</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-black uppercase border ${
                                            order.status === 'delivered' ? 'border-neon text-neon' : 
                                            order.status === 'shipped' ? 'border-blue-500 text-blue-500' : 
                                            'border-yellow-500 text-yellow-500'}`
                                        }>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => updateStatus(order.id, 'shipped')} title="Mark Shipped" className="p-2 border border-gray-700 hover:text-blue-500 hover:border-blue-500 transition-colors"><Truck size={16} /></button>
                                        <button onClick={() => updateStatus(order.id, 'delivered')} title="Mark Delivered" className="p-2 border border-gray-700 hover:text-neon hover:border-neon transition-colors"><CheckCircle size={16} /></button>
                                    </td>
                                </tr>

                                {expandedOrderId === order.id && (
                                    <tr>
                                        <td colSpan="6" className="bg-black border-b-4 border-gray-800 p-0">
                                            <div className="grid md:grid-cols-2 gap-0 animate-in slide-in-from-top-2 duration-200">

                                                <div className="p-6 border-r border-gray-800">
                                                    <h3 className="text-neon font-black uppercase mb-4 flex items-center gap-2"><MapPin size={18}/> DELIVERY INTEL</h3>
                                                    {order.shippingAddress ? (
                                                        <div className="space-y-2 text-sm text-gray-300">
                                                            <p><span className="text-gray-600 font-bold uppercase w-20 inline-block">Nume:</span> <span className="font-bold text-white">{order.shippingAddress.fullName}</span></p>
                                                            <p><span className="text-gray-600 font-bold uppercase w-20 inline-block">Adresa:</span> {order.shippingAddress.address}</p>
                                                            <p><span className="text-gray-600 font-bold uppercase w-20 inline-block">Oras:</span> {order.shippingAddress.city}, {order.shippingAddress.county}</p>
                                                            <p><span className="text-gray-600 font-bold uppercase w-20 inline-block">ZIP:</span> {order.shippingAddress.zip}</p>
                                                            <p><span className="text-gray-600 font-bold uppercase w-20 inline-block">Telefon:</span> <span className="text-neon">{order.phone}</span></p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 italic">No shipping data provided (Legacy Order)</p>
                                                    )}

                                                    <div className="mt-6 pt-4 border-t border-gray-800">
                                                        <h4 className="text-neon font-black uppercase mb-2 flex items-center gap-2 text-xs"><CreditCard size={14}/> PAYMENT INFO</h4>
                                                        <div className="text-xs text-gray-400">
                                                            <p>Method: <span className="text-white font-bold uppercase">{order.paymentMethod || 'UNKNOWN'}</span></p>
                                                            <p>Status: <span className="text-white font-bold uppercase">{order.isPaid ? 'PAID / SECURED' : 'PENDING'}</span></p>
                                                            {order.discountApplied > 0 && <p className="text-neon mt-1">HACKER DISCOUNT APPLIED: -{order.discountApplied * 100}%</p>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-6 bg-gray-900/30">
                                                    <h3 className="text-neon font-black uppercase mb-4 flex items-center gap-2"><List size={18}/> CARGO MANIFEST</h3>
                                                    <div className="space-y-3">
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className="flex justify-between items-center border-b border-gray-800 pb-2">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="bg-gray-800 text-white font-bold px-2 py-1 text-xs">x{item.quantity}</div>
                                                                    <div>
                                                                        <div className="font-bold text-sm text-white">{item.name}</div>
                                                                        <div className="text-[10px] text-gray-500">{item.id}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="font-mono text-gray-300">{item.price} RON</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-4 flex justify-between items-end">
                                                        <span className="text-gray-500 text-xs font-bold uppercase">Subtotal Cargo</span>
                                                        <span className="text-white font-bold">{order.subtotal || order.total} RON</span>
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-gray-500 text-xs font-bold uppercase">Shipping Cost</span>
                                                        <span className="text-white font-bold">{order.shippingCost || 0} RON</span>
                                                    </div>
                                                    <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between items-end">
                                                        <span className="text-neon font-black text-lg">TOTAL</span>
                                                        <span className="text-neon font-black text-xl">{order.total} RON</span>
                                                    </div>
                                                </div>

                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="animate-in fade-in">
             <div className={`border-4 ${isEditing ? 'border-yellow-500' : 'border-gray-800'} bg-gray-900/50 p-6 mb-12`}>
                <h3 className={`text-2xl font-black uppercase mb-6 flex items-center gap-2 ${isEditing ? 'text-yellow-500' : 'text-white'}`}>{isEditing ? <Edit /> : <Plus />} {isEditing ? 'EDIT DATA' : 'ADD NEW LOOT'}</h3>
                <form onSubmit={handleProductSubmit} className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Product Name</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black border-2 border-gray-700 p-3 text-white focus:border-neon focus:outline-none font-bold" /></div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Price (RON)</label><input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-black border-2 border-gray-700 p-3 text-white focus:border-neon focus:outline-none font-bold" /></div>
                            
                            {/* INPUT PENTRU STOC */}
                            <div><label className="text-xs font-bold text-gray-500 uppercase">STOCK QTY</label><input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full bg-gray-800 border-2 border-gray-700 p-3 text-white focus:border-neon focus:outline-none font-bold focus:bg-black" /></div>
                            
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Category</label><select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black border-2 border-gray-700 p-3 text-white focus:border-neon focus:outline-none font-bold"><option value="gear">GEAR</option><option value="tech">TECH</option><option value="access">ACCESS</option></select></div>
                        </div>

                        {/* SECTIUNEA DE IMAGINI MULTIPLE */}
                        <div className="bg-black border-2 border-gray-700 p-4">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-2">
                                    Product Gallery
                                </label>                                    
                            {formData.images?.map((img, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input 
                                        type="text" 
                                        placeholder={`Image URL #${index + 1}`} 
                                        value={img} 
                                        onChange={(e) => updateImageField(index, e.target.value)} 
                                        className="flex-1 bg-gray-900 border border-gray-600 p-2 text-xs text-white focus:border-neon focus:outline-none" 
                                    />
                                    {formData.images.length > 1 && (
                                        <button type="button" onClick={() => removeImageField(index)} className="text-red-500 hover:text-white px-2">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addImageField} className="w-full border border-gray-600 border-dashed text-gray-500 text-xs py-2 hover:border-neon hover:text-neon transition-colors">
                                + ADD ANOTHER IMAGE
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex flex-col h-full">
                        <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                        <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black border-2 border-gray-700 p-3 text-white focus:border-neon focus:outline-none font-bold flex-1 mb-4 text-sm" rows={5}></textarea>
                        
                        <div className="bg-black border-2 border-gray-700 p-4 mb-4">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-2"><List size={14}/> Tech Specs</label>
                            {formData.specs?.map((spec, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input placeholder="Label" value={spec.key} onChange={(e) => updateSpecField(index, 'key', e.target.value)} className="w-1/3 bg-gray-900 border border-gray-600 p-2 text-xs text-white focus:border-neon focus:outline-none" />
                                    <input placeholder="Value" value={spec.value} onChange={(e) => updateSpecField(index, 'value', e.target.value)} className="flex-1 bg-gray-900 border border-gray-600 p-2 text-xs text-white focus:border-neon focus:outline-none" />
                                    <button type="button" onClick={() => removeSpecField(index)} className="text-red-500 hover:text-white"><X size={16} /></button>
                                </div>
                            ))}
                            <button type="button" onClick={addSpecField} className="w-full border border-gray-600 border-dashed text-gray-500 text-xs py-2 hover:border-neon hover:text-neon transition-colors">+ ADD SPEC ROW</button>
                        </div>

                        <div className="flex gap-4 mt-auto">
                            {isEditing && <button type="button" onClick={() => {setIsEditing(null); setFormData({ name: '', price: '', category: 'gear', image: '', description: '', specs: [], stock: 10, images: [''] });}} className="flex-1 bg-gray-700 text-white font-black py-3 hover:bg-white hover:text-black uppercase">CANCEL</button>}
                            <button type="submit" className={`flex-[2] font-black py-3 uppercase shadow-brutal ${isEditing ? 'bg-yellow-500 text-black' : 'bg-neon text-black'}`}>{isEditing ? 'SAVE CHANGES' : 'DEPLOY ITEM'}</button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map(prod => (
                    <div key={prod.id} className="bg-black border-2 border-gray-800 p-4 group hover:border-white transition-all">
                        <div className="flex justify-between items-start mb-2"><h4 className="font-bold text-lg leading-tight">{prod.name}</h4><span className="text-neon font-black">{prod.price} RON</span></div>
                        
                        {/* Afisare Stoc pe card */}
                        <div className="text-xs font-bold text-gray-400 mb-4 flex items-center gap-2">
                             <Package size={14}/> STOC: {prod.stock !== undefined ? prod.stock : 'N/A'}
                             {/* Indicator Low Stock */}
                             {prod.stock < 5 && <span className="text-red-500 flex items-center gap-1 border border-red-500 px-1"><AlertTriangle size={10}/> LOW</span>}
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-gray-800 opacity-50 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditClick(prod)} className="flex-1 bg-gray-800 hover:bg-yellow-500 hover:text-black text-white py-2 text-xs font-bold uppercase"><Edit size={14} className="mx-auto" /></button>
                            <button onClick={() => handleDeleteClick(prod.id)} className="flex-1 bg-gray-800 hover:bg-red-600 text-white py-2 text-xs font-bold uppercase"><Trash2 size={14} className="mx-auto" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}