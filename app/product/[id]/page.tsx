"use client";

import React, { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingBag, ShieldCheck, Truck, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

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
  // Em vez de 'any', dizemos que pode ser Texto OU Lista de Textos
  gallery: string | string[]; 
  sizes: string | string[];
}

export default function ProductDetail() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [processedSizes, setProcessedSizes] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', params.id)
        .single();

      if (!error && data) {
        setProduct(data);
        
        // --- 1. TRATAMENTO DA GALERIA BLINDADO ---
        let galleryList: string[] = [];
        
        // Debug: Mostra no console o que veio do banco (ajuda a descobrir erros)
        console.log("Dados brutos da Galeria:", data.gallery); 

        if (data.gallery) {
            if (Array.isArray(data.gallery)) {
                 // Se já for uma lista bonitinha
                 galleryList = data.gallery;
            } else if (typeof data.gallery === 'string') {
                 // Se vier como Texto "['link', 'link']", a gente converte
                 try {
                     const jsonString = data.gallery.replace(/'/g, '"'); // Troca aspas simples por duplas
                     galleryList = JSON.parse(jsonString);
                 } catch (e) {
                     console.error("Erro ao converter galeria, usando como link único:", e);
                     // Se não der pra converter, assume que é um link só
                     galleryList = [data.gallery]; 
                 }
            }
        }
        
        // Se a galeria falhou ou está vazia, usa a foto principal (image_url)
        if (galleryList.length === 0 && data.image_url) {
            galleryList = [data.image_url];
        }
        
        setImages(galleryList);


        // --- 2. TRATAMENTO DOS TAMANHOS ---
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

  if (loading) return <div className="h-screen flex items-center justify-center font-bold animate-pulse">Carregando...</div>;
  if (!product) return <div className="h-screen flex items-center justify-center">Produto não encontrado.</div>;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-32">
      
      <div className="fixed top-4 left-4 z-20">
        <Link href="/" className="bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:scale-105 transition-transform">
          <ArrowLeft size={22} />
        </Link>
      </div>

      {/* ÁREA DA GALERIA */}
      <div className="h-[55vh] bg-gray-100 relative overflow-hidden group">
        <AnimatePresence mode='wait'>
            {images.length > 0 ? (
                <motion.img 
                    key={activeImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={images[activeImageIndex]} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Sem Imagem</div>
            )}
        </AnimatePresence>
        
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>

        {images.length > 1 && (
            <>
                <button onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md z-10">
                    <ChevronLeft size={20} />
                </button>
                <button onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md z-10">
                    <ChevronRight size={20} />
                </button>
            </>
        )}
      </div>

      {/* MINIATURAS */}
      <div className="px-6 relative z-10 -mt-12 mb-6">
        {images.length > 1 && (
            <div className="flex justify-center gap-2 overflow-x-auto py-2">
                {images.map((img, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-14 h-14 rounded-xl border-2 overflow-hidden transition-all flex-shrink-0 bg-white ${activeImageIndex === idx ? 'border-black scale-110 shadow-lg' : 'border-white opacity-70'}`}
                    >
                        <img src={img} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6"
      >
        <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl font-extrabold leading-tight w-2/3">{product.name}</h1>
            <div className="flex flex-col items-end">
                <span className="text-2xl font-bold text-blue-600">{product.price}</span>
                <span className="text-xs text-gray-400 font-medium">em até 12x</span>
            </div>
        </div>
        
        <p className="text-gray-400 text-sm font-medium mb-6 uppercase tracking-wider">{product.category}</p>

        <div className="mb-8">
          <h3 className="font-bold text-sm mb-3 text-gray-800">Tamanho</h3>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {processedSizes.map((size) => (
              <motion.button 
                key={size} 
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedSize(size)}
                className={`min-w-[50px] h-[50px] rounded-2xl border-2 flex items-center justify-center font-bold text-lg transition-colors ${selectedSize === size ? 'bg-black border-black text-white shadow-lg' : 'bg-white border-gray-200 text-gray-400'}`}
              >
                {size}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mb-8 space-y-4">
            <h3 className="font-bold text-sm text-gray-800">Detalhes</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>
        </div>
      </motion.div>
      
       <div className="fixed bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-gray-100 p-4 pb-8 shadow-2xl z-20">
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