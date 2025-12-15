import React, { useState, useEffect } from 'react';
import { ShoppingCart, Filter, Search } from 'lucide-react';
import { db } from '../firebase'; 
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'; 
import { Link } from 'react-router-dom';

export default function Shop({ addToCart, user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');


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

  const filteredProducts = products.filter(product => {
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-concrete p-4 md:p-8 pt-24 pb-20">
      

      <div className="max-w-7xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
            DEPOT_<span className="text-neon bg-black px-2">ACCESS</span>
        </h1>
        <div className="flex flex-col md:flex-row gap-4 justify-between items-end border-b-4 border-black pb-6"> 

            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                {['all', 'gear', 'tech', 'access'].map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-4 py-2 font-bold uppercase border-2 transition-all whitespace-nowrap ${
                            categoryFilter === cat 
                            ? 'bg-black text-neon border-black shadow-brutal translate-y-[-2px]' 
                            : 'bg-white text-gray-500 border-gray-300 hover:border-black hover:text-black'
                        }`}
                    >
                        {cat === 'all' ? 'TOATE' : cat}
                    </button>
                ))}
            </div>

            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="CAUTĂ ECHIPAMENT..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 pl-10 font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(57,255,20,1)] transition-shadow uppercase"
                />
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
    <div key={product.id} className="group bg-white border-4 border-black relative hover:-translate-y-2 transition-transform duration-200 shadow-brutal">

        <Link to={`/product/${product.id}`} className="block aspect-square bg-gray-100 border-b-4 border-black relative overflow-hidden cursor-pointer">
            {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-black text-3xl">NO IMG</div>
            )}
            <div className="absolute top-0 right-0 bg-black text-white text-xs font-bold px-3 py-1">
                {product.category?.toUpperCase() || 'ITEM'}
            </div>
        </Link>
        <div className="p-6">
            <div className="flex justify-between items-start mb-2">
                <Link to={`/product/${product.id}`} className="hover:text-neon transition-colors">
                    <h3 className="text-xl font-black uppercase leading-tight">{product.name}</h3>
                </Link>
                <span className="bg-neon text-black px-2 py-1 font-bold border-2 border-black text-sm whitespace-nowrap">
                    {product.price} RON
                </span>
            </div>

            <button 
                onClick={() => addToCart(product)}
            >
                <ShoppingCart size={18} />
                ADAUGA IN LOOT
            </button>
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