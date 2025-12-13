import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Zap, ShieldAlert, Cpu, Settings, User, Terminal, Eye, Star } from 'lucide-react';
import ProductModal from '../components/ProductModal';

// --- BAZA DE DATE (PRODUSE) ---
const PRODUCTS = [
  { id: 1, name: "MAGMA MAT™", price: 149, category: "PERIPHERALS", stock: 24, desc: "Mousepad încălzit.", longDesc: "Singurul lucru cald din viața ta de student...", specs: { "Dimensions": "900x400mm", "Power": "USB-C 15W" }, image: "/magma-mat.jpg", gallery: ["/magma-mat.jpg"], icon: <Zap size={40} /> },
  { id: 2, name: "AIRGAP STAND", price: 69, category: "ACCESSORIES", stock: 120, desc: "Nu-ți prăji laptopul.", longDesc: "Ridică laptopul la nivelul ochilor...", specs: { "Material": "Aluminum Alloy" }, image: null, icon: <ShieldAlert size={40} /> },
  { id: 3, name: "MIDNIGHT BAR", price: 129, category: "LIGHTING", stock: 5, desc: "Lumină doar pe tastatură.", longDesc: "Lampa de monitor care nu reflectă...", specs: { "CRI": ">95" }, image: null, icon: <Cpu size={40} /> },
  { id: 4, name: "NEURAL NOISE", price: 299, category: "AUDIO", stock: 15, desc: "Căști cu izolare fonică.", longDesc: "Căști over-ear cu ANC...", specs: { "Battery": "30 Hours" }, image: null, icon: <Settings size={40} /> },
  { id: 5, name: "BINARY HOODIE", price: 180, category: "APPAREL", stock: 50, desc: "Hanorac negru oversize.", longDesc: "Bumbac 100% organic...", specs: { "Fit": "Oversized" }, image: null, icon: <User size={40} /> },
  { id: 6, name: "CAFFEINE_V2", price: 45, category: "LIFESTYLE", stock: 200, desc: "Cană termosensibilă.", longDesc: "Când e rece, e neagră complet...", specs: { "Capacity": "450ml" }, image: null, icon: <Terminal size={40} /> }
];

const CATEGORIES = ["ALL", "PERIPHERALS", "ACCESSORIES", "LIGHTING", "AUDIO", "APPAREL", "LIFESTYLE"];

// Primim user-ul din App.jsx ca sa il dam mai departe la Modal
export default function Shop({ addToCart, user }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
        if (e.key === '/' && document.activeElement !== searchInputRef.current) {
            e.preventDefault(); searchInputRef.current.focus();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredProducts = PRODUCTS.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "ALL" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-4 px-4 pt-8">
        <ProductModal 
            product={selectedProduct} 
            isOpen={!!selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
            addToCart={addToCart}
            user={user} // Trimitem user-ul pentru review-uri
        />

        <div className="mb-12 border-b-4 border-black pb-8">
            <h2 className="text-6xl font-black uppercase mb-6">/// DEPOT_ACCESS</h2>
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute top-3 left-3 text-gray-400 group-focus-within:text-neon transition-colors" />
                    <input ref={searchInputRef} type="text" placeholder="CAUTĂ ECHIPAMENT..." className="w-full bg-white border-2 border-black p-3 pl-10 pr-12 font-bold focus:outline-none focus:ring-4 focus:ring-neon shadow-brutal transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <div className="absolute top-2 right-2 border border-gray-300 bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-500 pointer-events-none">/</div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 font-bold border-2 border-black uppercase text-sm transition-all ${selectedCategory === cat ? 'bg-black text-neon shadow-brutal' : 'bg-white hover:bg-gray-200'}`}>{cat}</button>
                    ))}
                </div>
            </div>
        </div>

        {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
                {filteredProducts.map((product) => (
                <div key={product.id} onClick={() => setSelectedProduct(product)} className="bg-white border-4 border-black p-6 shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 group flex flex-col justify-between cursor-pointer relative">
                    <div>
                        <div className="bg-gray-100 h-56 mb-6 border-2 border-black flex items-center justify-center group-hover:bg-neon/10 transition-colors relative overflow-hidden p-4">
                            {product.image ? (<img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />) : (<div className="scale-150 text-gray-800 group-hover:scale-125 transition-transform duration-500">{product.icon}</div>)}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-2 py-1 text-xs font-bold flex items-center gap-1"><Eye size={12}/> QUICK VIEW</div>
                        </div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-2xl font-black uppercase leading-tight">{product.name}</h3>
                            <span className="bg-black text-white px-2 py-1 text-[10px] font-bold">{product.category}</span>
                        </div>
                        
                        {/* --- STARS ON CARD (PROFI LOOK) --- */}
                        <div className="flex items-center gap-1 text-yellow-500 mb-4 text-xs font-bold">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" className="text-yellow-500" />)}
                            </div>
                            <span className="text-gray-400">(Vezi Review-uri)</span>
                        </div>

                        <p className="text-sm font-bold text-gray-600 mb-6 border-l-2 border-neon pl-3">{product.desc}</p>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t-2 border-black border-dashed mt-auto">
                        <span className="text-2xl font-black">{product.price} RON</span>
                        <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="bg-neon text-black font-bold py-2 px-4 border-2 border-black hover:bg-black hover:text-white transition-colors uppercase text-sm">Adauga +</button>
                    </div>
                </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-20 opacity-50"><Filter size={64} className="mx-auto mb-4" /><h3 className="text-2xl font-black">NICIUN REZULTAT</h3></div>
        )}
    </div>
  );
}
export { PRODUCTS };