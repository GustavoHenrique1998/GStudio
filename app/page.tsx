"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Star, ArrowRight, Menu, Search } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';

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
  gallery: string | string[]; // Aceita texto ou lista
}

// Configuração das Animações
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('produtos').select('*');
      if (!error) setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // --- FUNÇÃO MÁGICA PARA PEGAR A FOTO CERTA ---
  const getMainImage = (product: Product) => {
    // 1. Se tiver a imagem principal antiga, usa ela
    if (product.image_url) return product.image_url;

    // 2. Se não, tenta pegar a primeira da galeria
    if (product.gallery) {
        try {
            let gallery = product.gallery;
            // Se vier como texto "['link']", converte para lista
            if (typeof gallery === 'string') {
                gallery = JSON.parse(gallery.replace(/'/g, '"'));
            }
            // Se for uma lista válida e tiver itens, pega o primeiro
            if (Array.isArray(gallery) && gallery.length > 0) {
                return gallery[0];
            }
        } catch (e) {
            return null;
        }
    }
    return null; // Sem foto
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm transition-all">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white p-2 rounded-lg">
            <Menu className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tighter">G-STUDIO</span>
        </div>
        <div className="flex gap-4">
           <Search className="w-6 h-6 text-gray-400" />
           <div className="relative">
             <ShoppingBag className="w-6 h-6 text-black" />
             <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">2</span>
           </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-black rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden min-h-[300px] flex flex-col justify-center"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-40 -mr-16 -mt-16"></div>
          
          <div className="relative z-10 max-w-xs">
            <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm mb-4 inline-block">Nova Coleção</span>
            <h1 className="text-4xl font-extrabold mb-4 leading-tight">Streetwear <br/> Revolution</h1>
            <p className="text-gray-400 mb-6 text-sm">Descubra o estilo que define quem você é. Qualidade premium para o dia a dia.</p>
            <button className="bg-white text-black px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors w-fit">
              Ver Ofertas <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* LISTA DE PRODUTOS */}
      <main className="px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Populares <Star size={18} className="text-yellow-500 fill-yellow-500" />
          </h2>
          <span className="text-sm text-gray-400 font-medium">Ver tudo</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 text-sm animate-pulse">Carregando coleção...</p>
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-4"
          >
            {products.map((product) => {
              // Calcula a imagem certa antes de renderizar
              const displayImage = getMainImage(product);

              return (
                <motion.div key={product.id} variants={item}>
                  <Link href={`/product/${product.id}`} className="block group">
                    <div className="bg-white rounded-2xl p-3 shadow-sm border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300 h-full flex flex-col relative overflow-hidden">
                      
                      {/* IMAGEM DO CARD (CORRIGIDA) */}
                      <div className="aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden relative">
                        {displayImage ? (
                          <img 
                            src={displayImage} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Sem Foto</div>
                        )}
                      </div>

                      {/* Informações */}
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
        )}
      </main>
    </div>
  );
}