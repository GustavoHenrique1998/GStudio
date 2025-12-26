"use client";

import React, { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingBag, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext'; 

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
  gallery: string | string[]; 
  sizes: string | string[];
}

export default function ProductDetail() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  
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
        
        // Tratamento Galeria
        let galleryList: string[] = [];
        if (data.gallery) {
            if (Array.isArray(data.gallery)) { galleryList = data.gallery; }
            else if (typeof data.gallery === 'string') {
                 try { galleryList = JSON.parse(data.gallery.replace(/'/g, '"')); }
                 catch (e) { galleryList = [data.gallery]; }
            }
        }
        if (galleryList.length === 0 && data.image_url) { galleryList = [data.image_url]; }
        setImages(galleryList);

        // Tratamento Tamanhos
        let safeSizes: string[] = [];
        if (data.sizes) {
            if (Array.isArray(data.sizes)) { safeSizes = data.sizes; }
            else if (typeof data.sizes === 'string') {
                try { safeSizes = JSON.parse(data.sizes.replace(/'/g, '"')); }
                catch (e) { safeSizes = [data.sizes]; }
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

  // Botão de Adicionar (Reutilizável)
  const AddToCartButton = ({ mobile }: { mobile?: boolean }) => (
    <motion.button 
      whileTap={{ scale: 0.95 }}
      className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 text-lg shadow-xl transition-all ${selectedSize ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
      disabled={!selectedSize}
      onClick={() => {
         if (!selectedSize) return;
         if (product) addToCart(product, selectedSize);
      }}
    >
      <ShoppingBag size={22} />
      {selectedSize ? 'Adicionar à Sacola' : 'Escolha um Tamanho'}
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-32 md:pb-0 md:pt-24">
      
      {/* Botão Voltar (Ajustado para PC e Mobile) */}
      <div className="fixed top-4 left-4 z-20 md:top-8 md:left-8">
        <Link href="/" className="bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:scale-105 transition-transform">
          <ArrowLeft size={22} />
        </Link>
      </div>

      {/* CONTAINER PRINCIPAL (Vira Grid no PC) */}
      <div className="max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-2 md:gap-16 md:px-8 items-start">

        {/* === COLUNA DA ESQUERDA: IMAGENS === */}
        <div className="relative w-full">
          {/* Galeria Principal (AUMENTADA AQUI: md:h-[80vh]) */}
          <div className="h-[50vh] md:h-[80vh] bg-gray-100 relative overflow-hidden group md:rounded-3xl shadow-sm">
            <AnimatePresence mode='wait'>
                {images.length > 0 ? (
                    <motion.img 
                        key={activeImageIndex}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                        src={images[activeImageIndex]} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">Sem Imagem</div>
                )}
            </AnimatePresence>
            {/* Setas de Navegação (Só se tiver mais de 1 foto) */}
            {images.length > 1 && (
                <>
                    <button onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md z-10 hover:bg-white"><ChevronLeft size={20} /></button>
                    <button onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md z-10 hover:bg-white"><ChevronRight size={20} /></button>
                </>
            )}
          </div>

          {/* Miniaturas */}
          {images.length > 1 && (
            <div className="px-6 md:px-0 relative z-10 -mt-12 md:mt-6 mb-6 md:mb-0 flex justify-center md:justify-start gap-3 overflow-x-auto py-2 scrollbar-hide">
                {images.map((img, idx) => (
                    <button key={idx} onClick={() => setActiveImageIndex(idx)} className={`w-20 h-20 rounded-xl border-2 overflow-hidden transition-all flex-shrink-0 bg-white ${activeImageIndex === idx ? 'border-black shadow-lg scale-105' : 'border-white opacity-70 hover:opacity-100'}`}>
                        <img src={img} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
          )}
        </div>

        {/* === COLUNA DA DIREITA: DETALHES === */}
        <div className="px-6 md:px-0 mt-4 md:mt-0 md:sticky md:top-24">
          
          {/* Nome e Preço */}
          <div className="mb-8">
             <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">{product.category}</p>
             <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">{product.name}</h1>
             <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-blue-600">{product.price}</span>
                <span className="text-sm text-gray-400 font-medium bg-gray-100 px-3 py-1 rounded-full">em até 12x sem juros</span>
             </div>
          </div>

          {/* Seletor de Tamanho */}
          <div className="mb-10">
            <h3 className="font-bold text-sm mb-4 text-gray-800 flex justify-between">Tamanhos Disponíveis <span className="text-gray-400 font-normal underline cursor-pointer hover:text-black">Guia de Medidas</span></h3>
            <div className="flex gap-3 flex-wrap">
              {processedSizes.map((size) => (
                <motion.button 
                  key={size} 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedSize(size)}
                  className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-bold text-xl transition-all ${selectedSize === size ? 'bg-black border-black text-white shadow-md scale-105' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:text-black'}`}
                >
                  {size}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div className="mb-10 space-y-4">
              <h3 className="font-bold text-lg text-gray-800 border-b pb-3 mb-4">Sobre o Produto</h3>
              <p className="text-gray-600 text-base leading-relaxed">{product.description}</p>
          </div>

          {/* Botão de Compra (Visível só no PC) */}
          <div className="hidden md:block mt-8">
             <AddToCartButton />
          </div>
        </div>
      </div>
      
       {/* Botão de Compra Fixo (Visível só no Celular) */}
       <div className="fixed bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-gray-100 p-4 pb-8 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20 md:hidden">
          <AddToCartButton mobile />
       </div>
    </div>
  );
}3