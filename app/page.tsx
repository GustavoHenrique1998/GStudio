"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Search, Filter, X, Menu, Instagram, Facebook, Twitter, ChevronRight, User, LogIn } from 'lucide-react';
import { useCart } from './context/CartContext'; 
import { motion, AnimatePresence } from 'framer-motion';

// --- CONEXÃO SUPABASE ---
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
}

interface CartItem {
  id: number;
  name: string;
  quantity: number;
}

export default function Home() {
  const context = useCart();
  const { toggleCart, cart } = (context || {}) as unknown as { 
    toggleCart: () => void, 
    cart: CartItem[] 
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const CATEGORIES = ["Todos", "Streetwear", "Casual", "Esporte", "Acessórios"];

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('produtos')
        .select('id, name, price, category, image_url')
        .order('id', { ascending: false });

      if (!error && data) {
        setProducts(data);
        setFilteredProducts(data);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) || 
        p.category.toLowerCase().includes(lowerSearch)
      );
    }
    if (selectedCategory !== "Todos") {
      result = result.filter(p => p.category === selectedCategory);
    }
    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, products]);

  // Bloquear rolagem da página quando o menu estiver aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-20">
      
      {/* --- MENU MOBILE LATERAL (NOVO ESTILO) --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Fundo Escuro com Blur */}
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            
            {/* O Menu Deslizante */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-white z-[70] shadow-2xl flex flex-col"
            >
              {/* Cabeçalho do Menu */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg">G</div>
                      <span className="font-black text-lg tracking-tighter">MENU</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                      <X size={20} />
                  </button>
              </div>

              {/* Corpo do Menu */}
              <div className="flex-1 overflow-y-auto py-4 px-6 space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 mt-2">Navegação</p>
                  
                  <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl font-bold text-gray-800 hover:bg-gray-100 transition-colors">
                      Lançamentos <ChevronRight size={18} className="text-gray-400"/>
                  </a>
                  <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl font-bold text-gray-800 hover:bg-gray-100 transition-colors">
                      Coleções <ChevronRight size={18} className="text-gray-400"/>
                  </a>
                  <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl font-bold text-gray-800 hover:bg-gray-100 transition-colors">
                      Sobre Nós <ChevronRight size={18} className="text-gray-400"/>
                  </a>

                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 mt-8">Conta</p>
                  
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl font-medium text-gray-600 hover:border-black hover:text-black transition-all">
                      <LogIn size={20} /> Área Administrativa
                  </Link>
              </div>

              {/* Rodapé do Menu */}
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                  <p className="text-xs text-center text-gray-400 mb-4">Siga-nos nas redes</p>
                  <div className="flex justify-center gap-6 text-gray-400">
                      <Instagram size={24} className="hover:text-pink-600 cursor-pointer transition-colors"/>
                      <Facebook size={24} className="hover:text-blue-600 cursor-pointer transition-colors"/>
                      <Twitter size={24} className="hover:text-blue-400 cursor-pointer transition-colors"/>
                  </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* HEADER / NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-40 border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg">G</div>
                <span className="font-black text-xl tracking-tighter">G-STUDIO.</span>
            </div>
            <div className="hidden md:flex gap-8 text-sm font-bold text-gray-500">
                <a href="#" className="hover:text-black transition-colors">Lançamentos</a>
                <a href="#" className="hover:text-black transition-colors">Coleções</a>
                <a href="#" className="hover:text-black transition-colors">Sobre</a>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={toggleCart} className="relative p-2 hover:bg-gray-100 rounded-full transition-colors group">
                    <ShoppingBag size={22} className="text-gray-700 group-hover:text-black"/>
                    {cart && cart.length > 0 && (
                        <span className="absolute top-0 right-0 w-4 h-4 bg-black text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                            {cart.length}
                        </span>
                    )}
                </button>
                <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Menu size={24} className="text-gray-700"/>
                </button>
            </div>
        </div>
      </nav>

      {/* HERO SECTION COMPACTO */}
      <header className="pt-24 pb-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto bg-black rounded-2xl p-6 md:p-10 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] md:text-xs font-bold mb-3 border border-white/10">NOVA COLEÇÃO 2024</span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4">
              Estilo que define <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">sua atitude.</span>
            </h1>
            <p className="text-gray-400 mb-6 text-sm md:text-base max-w-lg">Peças exclusivas com design minimalista e qualidade premium.</p>
            <button 
                onClick={() => document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2"
            >
              Explorar Loja <ArrowRight size={16}/>
            </button>
          </div>
          <div className="absolute -right-20 -top-40 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute right-10 -bottom-20 w-[250px] h-[250px] bg-purple-600/20 rounded-full blur-3xl"></div>
        </div>
      </header>

      {/* FILTROS E BUSCA */}
      <section id="shop-section" className="max-w-7xl mx-auto px-6 mb-8 sticky top-16 md:top-20 z-30 bg-white/95 backdrop-blur-sm py-4 -mx-6 md:mx-auto md:rounded-b-2xl border-b border-gray-100 md:border-none shadow-sm md:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-black'}`}>
                        {cat}
                    </button>
                ))}
            </div>
            <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"/>
                {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"><X size={14} /></button>}
            </div>
        </div>
        <div className="mt-3 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Filter size={12} /> Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
        </div>
      </section>

      {/* PRODUTOS */}
      <main className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (<div key={i} className="animate-pulse space-y-3"><div className="bg-gray-200 h-56 rounded-2xl"></div><div className="h-3 bg-gray-200 rounded w-3/4"></div><div className="h-3 bg-gray-200 rounded w-1/4"></div></div>))}
          </div>
        ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                <Search size={40} className="mx-auto text-gray-300 mb-3"/>
                <h3 className="text-lg font-bold text-gray-900">Ops! Nada por aqui.</h3>
                <button onClick={() => {setSearchTerm(''); setSelectedCategory('Todos')}} className="mt-4 text-blue-600 font-bold text-sm hover:underline">Limpar Filtros</button>
            </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
            {filteredProducts.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id} className="group cursor-pointer block">
                <div className="relative aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden mb-3 shadow-sm border border-gray-100">
                  <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider z-10 shadow-sm">{product.category}</span>
                  {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"/> : <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-xs">Sem Foto</div>}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 backdrop-blur-[1px]">
                      <div className="bg-white text-black px-4 py-2 rounded-full font-bold text-xs shadow-lg flex items-center gap-1 transform translate-y-2 group-hover:translate-y-0 transition-transform"><ShoppingBag size={14}/> Comprar</div>
                  </div>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm md:text-base leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">{product.name}</h2>
                  <p className="text-gray-500 text-xs md:text-sm mt-0.5 font-medium">{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}