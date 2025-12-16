"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Star, ArrowRight, Menu } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- SUA CONEXÃO (Igual à da página de detalhes) ---
const supabase = createClient(
  "https://ngnzibntpncdcrkoktus.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbnppYm50cG5jZGNya29rdHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MDM2MzksImV4cCI6MjA4MTM3OTYzOX0.OujKy3UrxekqE47FWm9mBHKVmNtVxEY-GILQDJCHv3I"
);

// Tipagem (Colunas em Inglês)
interface Product {
  id: number;
  name: string;
  price: string;
  category: string;
  image_url: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      // Busca na tabela 'produtos' (Português)
      const { data, error } = await supabase
        .from('produtos') 
        .select('*');
      
      if (error) {
        console.error("Erro ao buscar produtos:", error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Menu className="w-6 h-6 text-gray-600" />
          <span className="font-bold text-xl tracking-tight text-black">G<span className="text-blue-600">Studio</span></span>
        </div>
        <div className="relative p-2 bg-gray-100 rounded-full">
           <ShoppingBag className="w-5 h-5 text-gray-700" />
        </div>
      </header>

      {/* HERO BANNER (Estático por enquanto) */}
      <section className="px-4 py-6">
        <div className="bg-black rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2 py-1 rounded">Novidade</span>
            <h1 className="text-3xl font-bold mt-2 leading-tight">Coleção de Verão <br/> 2025</h1>
             <button className="mt-4 bg-white text-black px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
              Ver Ofertas <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* LISTA DINÂMICA (Vinda do Supabase) */}
      <main className="px-4">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          Disponíveis <Star size={16} className="text-yellow-500 fill-yellow-500" />
        </h2>

        {loading ? (
          <div className="flex justify-center p-10">Carregando...</div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500 p-10">Nenhum produto cadastrado ainda.</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id} className="block group">
                <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col justify-between h-full group-active:scale-95 transition-transform">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden relative">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Sem Foto</div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                    <h3 className="font-semibold text-sm leading-tight mb-2 h-10 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-bold text-sm">{product.price}</span>
                      <div className="bg-black text-white p-2 rounded-lg">
                        <ShoppingBag size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}