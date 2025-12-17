"use client";

import React, { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingBag, ShieldCheck, Truck } from 'lucide-react'; // Ícones novos
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
  description: string;
  category: string;
  image_url: string;
  sizes: string | string[];
}

export default function ProductDetail() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [processedSizes, setProcessedSizes] = useState<string[]>([]);

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', params.id)
        .single();

      if (!error) {
        setProduct(data);
        // Tratamento dos tamanhos
        let safeSizes: string[] = [];
        if (data.sizes) {
            if (Array.isArray(data.sizes)) {
                safeSizes = data.sizes;
            } else if (typeof data.sizes === 'string') {
                try {
                    const jsonString = data.sizes.replace(/'/g, '"');
                    safeSizes = JSON.parse(jsonString);
                } catch (e) {
                    safeSizes = [data.sizes];
                }
            }
        }
        setProcessedSizes(safeSizes);
      }
      setLoading(false);
    }
    if (params.id) fetchProduct();
  }, [params.id]);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold animate-pulse">Carregando detalhes...</div>;
  if (!product) return <div className="h-screen flex items-center justify-center">Produto não encontrado.</div>;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-32">
      
      {/* BOTÃO VOLTAR FLUTUANTE */}
      <div className="fixed top-4 left-4 z-20">
        <Link href="/" className="bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:scale-105 transition-transform">
          <ArrowLeft size={22} />
        </Link>
      </div>

      {/* IMAGEM COM ANIMAÇÃO */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-[50vh] bg-gray-100 relative overflow-hidden"
      >
        {product.image_url && (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover"/>
        )}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
      </motion.div>

      {/* CONTEÚDO */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-6 relative z-10 -mt-8"
      >
        <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl font-extrabold leading-tight w-2/3">{product.name}</h1>
            <div className="flex flex-col items-end">
                <span className="text-2xl font-bold text-blue-600">{product.price}</span>
                <span className="text-xs text-gray-400 font-medium">em até 12x</span>
            </div>
        </div>
        
        <p className="text-gray-400 text-sm font-medium mb-6 uppercase tracking-wider">{product.category}</p>

        {/* SELETOR DE TAMANHOS */}
        <div className="mb-8">
          <h3 className="font-bold text-sm mb-3 text-gray-800">Selecione o Tamanho</h3>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {processedSizes.map((size) => (
              <motion.button 
                key={size} 
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedSize(size)}
                className={`min-w-[50px] h-[50px] rounded-2xl border-2 flex items-center justify-center font-bold text-lg transition-colors ${selectedSize === size ? 'bg-black border-black text-white shadow-lg' : 'bg-white border-gray-200 text-gray-400'}`}
              >
                {size}
              </motion.button>
            ))}
          </div>
        </div>

        {/* DESCRIÇÃO E BENEFÍCIOS */}
        <div className="mb-8 space-y-4">
            <h3 className="font-bold text-sm text-gray-800">Sobre o Produto</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>
            
            <div className="flex gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <ShieldCheck size={16} className="text-green-500"/> Garantia Original
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <Truck size={16} className="text-blue-500"/> Envio Rápido
                </div>
            </div>
        </div>
      </motion.div>
      
      {/* BARRA INFERIOR DE COMPRA */}
       <div className="fixed bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-gray-100 p-4 pb-8 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 text-lg shadow-xl ${selectedSize ? 'bg-black text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          disabled={!selectedSize}
          onClick={() => {
             if (!selectedSize) return;
             const phone = "5511999999999"; 
             window.open(`https://wa.me/${phone}?text=Olá! Quero comprar o *${product.name}* tamanho *${selectedSize}*`, '_blank');
          }}
        >
          <ShoppingBag size={22} />
          {selectedSize ? 'Comprar Agora' : 'Escolha um Tamanho'}
        </motion.button>
      </div>
    </div>
  );
}