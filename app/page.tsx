"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Star, ArrowRight, Menu, Search, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from './context/CartContext';

// --- CONEXÃO ---
const supabase = createClient(
  "https://ngnzibntpncdcrkoktus.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbnppYm50cG5jZGNya29rdHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MDM2MzksImV4cCI6MjA4MTM3OTYzOX0.OujKy3UrxekqE47FWm9mBHKVmNtVxEY-GILQDJCHv3I"
);

interface Product {
  id: number;
  name: string;
  price: string;
  category: string;
  image_url: string;
  gallery: string | string[];
}

// Lista de Categorias
const CATEGORIES = ["Todos", "Streetwear", "Casual", "Esporte", "Acessórios"];

// --- DADOS DO CARROSSEL (SLIDES) ---
const HERO_SLIDES = [
  {
    id: 1,
    badge: "Nova Coleção",
    title: "Streetwear Revolution",
    desc: "Descubra o estilo que define quem você é.",
    bgClass: "bg-black", // Fundo Preto
    blobColor: "bg-blue-600" // Luz Azul
  },
  {
    id: 2,
    badge: "Destaque",
    title: "Conforto & Atitude",
    desc: "Peças essenciais para o seu dia a dia.",
    bgClass: "bg-zinc-900", // Fundo Cinza Escuro
    blobColor: "bg-purple-600" // Luz Roxa
  },
   {
    id: 3,
    badge: "Imperdível",
    title: "Até 50% OFF",
    desc: "Corra antes que acabe o estoque de verão.",
    bgClass: "bg-[#0a0a0a]", // Fundo Quase Preto
    blobColor: "bg-green-600" // Luz Verde
  }
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const { cart, toggleCart } = useCart();

  // Estado do Carrossel
  const [currentSlide, setCurrentSlide] = useState(0);

  // Efeito para rodar o carrossel sozinho
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === HERO_SLIDES.length - 1 ? 0 : prev + 1));
    }, 5000); // Troca a cada 5 segundos
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('produtos').select('*');
      if (!error) setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === "Todos" || product.category === selectedCategory;
    const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const getMainImage = (product: Product) => {
    if (product.image_url) return product.image_url;
    if (product.gallery) {
        try {
            let gallery = product.gallery;
            if (typeof gallery === 'string') { gallery = JSON.parse(gallery.replace(/'/g, '"')); }
            if (Array.isArray(gallery) && gallery.length > 0) { return gallery[0]; }
        } catch (e) { return null; }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      
      {/* HEADER INTELIGENTE COM LOGO */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100 px-6 py-4 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
              <Menu className="w-5 h-5" />
            </div>
            {/* LOGO AQUI: Substitua o src pela sua logo real depois */}
            <Link href="/">
                <img 
                    src="https://placehold.co/140x40/000000/ffffff?text=G-STUDIO&font=montserrat" 
                    alt="G-Studio Logo" 
                    className="h-10 w-auto object-contain" 
                />
            </Link>
          </div>
          
          <div className="flex gap-4 items-center">
             <button onClick={() => setShowSearch(!showSearch)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
               {showSearch ? <X className="w-6 h-6" /> : <Search className="w-6 h-6 text-gray-400" />}
             </button>

             <button onClick={toggleCart} className="relative p-1 hover:bg-gray-100 rounded-full transition-colors">
               <ShoppingBag className="w-6 h-6 text-black" />
               {cart.length > 0 && (
                 <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                   {cart.reduce((acc, item) => acc + item.quantity, 0)}
                 </span>
               )}
             </button>
          </div>
        </div>

        <AnimatePresence>
          {showSearch && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <input 
                type="text" placeholder="O que você procura? (ex: Nike, Camisa...)" 
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full mt-4 p-3 bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-black outline-none text-sm"
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* FILTROS */}
      <div className="px-4 py-6 overflow-x-auto scrollbar-hide">
        <div className="flex gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-black text-white shadow-lg scale-105' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* === CARROSSEL ROTATIVO (HERO SLIDER) === */}
      {!searchTerm && selectedCategory === 'Todos' && (
        <section className="px-4 pb-8">
          <div className="relative h-[320px] rounded-[2rem] overflow-hidden shadow-2xl">
            <AnimatePresence mode='wait'>
              <motion.div 
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={`${HERO_SLIDES[currentSlide].bgClass} absolute inset-0 p-8 text-white flex flex-col justify-center`}
              >
                {/* Mancha de Luz Dinâmica */}
                <div className={`absolute top-0 right-0 w-72 h-72 ${HERO_SLIDES[currentSlide].blobColor} rounded-full blur-[120px] opacity-40 -mr-20 -mt-20 transition-colors duration-1000`}></div>
                
                <div className="relative z-10 max-w-xs">
                  <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm mb-4 inline-block">
                    {HERO_SLIDES[currentSlide].badge}
                  </motion.span>
                  <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-4xl font-extrabold mb-4 leading-tight">
                    {HERO_SLIDES[currentSlide].title}
                  </motion.h1>
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-gray-300 mb-6 text-sm">
                    {HERO_SLIDES[currentSlide].desc}
                  </motion.p>
                  <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} whileTap={{ scale: 0.95 }} className="bg-white text-black px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors w-fit shadow-md">
                    Ver Ofertas <ArrowRight size={16} />
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Bolinhas indicadoras (Dots) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {HERO_SLIDES.map((_, index) => (
                    <button 
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${currentSlide === index ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/70'}`}
                    />
                ))}
            </div>
          </div>
        </section>
      )}

      {/* LISTA DE PRODUTOS */}
      <main className="px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {searchTerm ? `Resultados para "${searchTerm}"` : `${selectedCategory}`} 
            <Star size={18} className="text-yellow-500 fill-yellow-500" />
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 text-sm animate-pulse">Carregando coleção...</p>
          </div>
        ) : (
          <>
            {filteredProducts.length > 0 ? (
              <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {filteredProducts.map((product) => {
                  const displayImage = getMainImage(product);
                  return (
                    <motion.div key={product.id} variants={item}>
                      <Link href={`/product/${product.id}`} className="block group">
                        <div className="bg-white rounded-2xl p-3 shadow-sm border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300 h-full flex flex-col relative overflow-hidden">
                          <div className="aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden relative">
                            {displayImage ? (
                              <img src={displayImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Sem Foto</div>
                            )}
                          </div>
                          <div className="flex flex-col flex-grow">
                            <p className="text-[10px] font-bold uppercase text-gray-400 mb-1 tracking-wide">{product.category}</p>
                            <h3 className="font-bold text-sm leading-tight mb-2 text-gray-800 line-clamp-2">{product.name}</h3>
                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                              <span className="font-extrabold text-base">{product.price}</span>
                              <div className="bg-black text-white p-2 rounded-full shadow-lg group-active:scale-90 transition-transform">
                                <ArrowRight size={14} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <p>Nenhum produto encontrado.</p>
                <button onClick={() => {setSearchTerm(''); setSelectedCategory('Todos');}} className="mt-4 text-blue-600 underline text-sm">Limpar Filtros</button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}