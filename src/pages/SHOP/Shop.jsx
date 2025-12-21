import React, { useState, useEffect } from 'react';
import { ShoppingCart, Filter, Search, XCircle, ArrowUpDown } from 'lucide-react'; 
import { db } from '../../firebase'; 
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'; 
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Shop({ addToCart, user, setCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');
  
  //  STATE PENTRU SORTARE
  const [sortOption, setSortOption] = useState('newest'); 

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const success = searchParams.get('payment_success');
    if (success === 'true') {
      toast.success("Plată reușită! Comanda este în procesare.", {
        duration: 5000,
        icon: '🎉',
        style: { border: '2px solid #39FF14', padding: '16px', color: '#000', fontWeight: 'bold' },
      });
      if (setCart) setCart([]);
      if (user) localStorage.removeItem(`cart_${user.uid}`);
      navigate('/profile', { replace: true });
    }
  }, [searchParams, navigate, setCart, user]);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  //  LOGICA DE SORTARE
  const getSortedProducts = (items) => {
      if (sortOption === 'priceAsc') return [...items].sort((a, b) => Number(a.price) - Number(b.price));
      if (sortOption === 'priceDesc') return [...items].sort((a, b) => Number(b.price) - Number(a.price));
      return items;
  };

  const filteredProducts = getSortedProducts(products.filter(product => {
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }));

  return (
    <div className="min-h-screen bg-concrete p-4 md:p-8 pt-24 pb-20 bg-[#f0f0f0]">
      
      <div className="max-w-7xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
            DEPOT_<span className="text-neon bg-black px-2 text-white selection:bg-neon selection:text-black">ACCESS</span>
        </h1>
        <div className="flex flex-col md:flex-row gap-4 justify-between items-end border-b-4 border-black pb-6"> 
            
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {['all', 'gear', 'tech', 'access'].map(cat => (
                        <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-4 py-2 font-bold uppercase border-2 transition-all whitespace-nowrap ${categoryFilter === cat ? 'bg-black text-neon border-black shadow-brutal translate-y-[-2px]' : 'bg-white text-gray-500 border-gray-300 hover:border-black hover:text-black'}`}>{cat === 'all' ? 'TOATE' : cat}</button>
                    ))}
                </div>

                {/* 3. DROPDOWN PENTRU SORTARE */}
                <div className="relative group">
                    <select 
                        value={sortOption} 
                        onChange={(e) => setSortOption(e.target.value)}
                        className="appearance-none bg-white border-2 border-black px-4 py-2 pr-8 font-bold uppercase cursor-pointer focus:outline-none hover:bg-black hover:text-white transition-colors"
                    >
                        <option value="newest">Newest First</option>
                        <option value="priceAsc">Price: Low to High</option>
                        <option value="priceDesc">Price: High to Low</option>
                    </select>
                    <ArrowUpDown size={16} className="absolute right-2 top-3 pointer-events-none" />
                </div>
            </div>

            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input type="text" placeholder="CAUTĂ ECHIPAMENT..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border-2 border-black p-2 pl-10 font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(57,255,20,1)] transition-shadow uppercase" />
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
            <div className="text-center py-20 font-mono text-xl animate-pulse font-bold">LOADING_INVENTORY_DATA...</div>
        ) : (
            <>
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white border-4 border-black shadow-brutal">
                        <p className="font-black text-2xl uppercase">NICIUN REZULTAT.</p>
                        <p className="text-gray-500 font-mono">Încearcă altă categorie.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts.map((product) => (
                          <div key={product.id} className={`group bg-white border-4 border-black relative hover:-translate-y-2 transition-transform duration-200 shadow-brutal flex flex-col h-full ${product.stock === 0 ? 'opacity-75 grayscale' : ''}`}>
                              <Link to={`/product/${product.id}`} className="block aspect-square bg-gray-100 border-b-4 border-black relative overflow-hidden cursor-pointer">
                                  {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" /> : <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-black text-3xl">NO IMG</div>}
                                  <div className="absolute top-0 right-0 bg-black text-white text-xs font-bold px-3 py-1 z-20">{product.category?.toUpperCase() || 'ITEM'}</div>
                                  {product.stock !== undefined && product.stock > 0 && product.stock < 5 && (<div className="absolute bottom-0 left-0 bg-red-600 text-white text-xs font-black px-2 py-1 animate-pulse border-t-2 border-r-2 border-black z-20">⚠ LOW STOCK: {product.stock} LEFT</div>)}
                                  {product.stock === 0 && (<div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-[2px]"><div className="bg-red-600 text-white font-black text-2xl px-4 py-2 border-4 border-white -rotate-12 shadow-lg uppercase tracking-widest">SOLD OUT</div></div>)}
                              </Link>
                              <div className="p-6 flex flex-col flex-grow">
                                  <div className="flex justify-between items-start mb-4">
                                      <Link to={`/product/${product.id}`} className="hover:text-neon transition-colors"><h3 className="text-xl font-black uppercase leading-tight line-clamp-2">{product.name}</h3></Link>
                                      <span className="bg-neon text-black px-2 py-1 font-bold border-2 border-black text-sm whitespace-nowrap ml-2">{product.price} RON</span>
                                  </div>
                                  <div className="mt-auto">
                                      <button onClick={() => addToCart(product)} disabled={product.stock === 0} className={`w-full font-bold py-3 transition-all flex items-center justify-center gap-2 border-2 uppercase ${product.stock === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400' : 'bg-black text-white hover:bg-neon hover:text-black border-transparent hover:border-black'}`}>
                                          {product.stock === 0 ? <><XCircle size={18} /> STOC EPUIZAT</> : <><ShoppingCart size={18} /> ADAUGA IN LOOT</>}
                                      </button>
                                  </div>
                              </div>
                          </div>
                        ))}
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
}