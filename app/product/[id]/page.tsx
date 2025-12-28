"use client";

import React, { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingBag, ChevronRight, ChevronLeft, Share2, Star, Truck, ShieldCheck, FileText, ChevronDown, Ruler, X, Eye } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext'; 
import toast from 'react-hot-toast';

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
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [processedSizes, setProcessedSizes] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [openAccordion, setOpenAccordion] = useState<string | null>('desc');

  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [viewers, setViewers] = useState(0);

  // --- ESTADOS DO ZOOM ---
  const [zoomStyle, setZoomStyle] = useState({ opacity: 0, transformOrigin: 'center', transform: 'scale(1)' });

  useEffect(() => {
    setViewers(Math.floor(Math.random() * (15 - 5 + 1)) + 5);
  }, []);

  useEffect(() => {
    async function fetchProductData() {
      // Pequeno delay fake só para você ver o Skeleton bonito funcionando
      // await new Promise(resolve => setTimeout(resolve, 1000)); 

      const { data: currentData, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', params.id)
        .single();

      if (!error && currentData) {
        setProduct(currentData);
        
        let galleryList: string[] = [];
        if (currentData.gallery) {
            if (Array.isArray(currentData.gallery)) { galleryList = currentData.gallery; }
            else if (typeof currentData.gallery === 'string') {
                 try { galleryList = JSON.parse(currentData.gallery.replace(/'/g, '"')); }
                 catch (e) { galleryList = [currentData.gallery]; }
            }
        }
        if (galleryList.length === 0 && currentData.image_url) { galleryList = [currentData.image_url]; }
        setImages(galleryList);

        let safeSizes: string[] = [];
        if (currentData.sizes) {
            if (Array.isArray(currentData.sizes)) { safeSizes = currentData.sizes; }
            else if (typeof currentData.sizes === 'string') {
                try { safeSizes = JSON.parse(currentData.sizes.replace(/'/g, '"')); }
                catch (e) { safeSizes = [currentData.sizes]; }
            }
        }
        setProcessedSizes(safeSizes);

        const { data: relatedData } = await supabase
            .from('produtos')
            .select('*')
            .neq('id', params.id)
            .limit(4);
            
        if (relatedData) setRelatedProducts(relatedData);
      }
      setLoading(false);
    }
    if (params.id) fetchProductData();
  }, [params.id]);

  const handleShare = () => {
    if (navigator.share) {
        navigator.share({
            title: product?.name,
            text: 'Olha o que eu achei na G-Studio!',
            url: window.location.href,
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copiado!", { icon: '🔗' });
    }
  };

  const getProductImage = (prod: Product) => {
      if (prod.image_url) return prod.image_url;
      try {
        if(prod.gallery) {
            const g = typeof prod.gallery === 'string' ? JSON.parse(prod.gallery.replace(/'/g, '"')) : prod.gallery;
            return Array.isArray(g) && g.length > 0 ? g[0] : null;
        }
      } catch(e) { return null; }
      return null;
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  // --- LÓGICA DO ZOOM ---
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomStyle({
        opacity: 1,
        transformOrigin: `${x}% ${y}%`,
        transform: 'scale(2.5)' // Nível de Zoom
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ opacity: 0, transformOrigin: 'center', transform: 'scale(1)' });
  };

  // --- SKELETON LOADING (Visual de Carregamento) ---
  if (loading) return (
    <div className="min-h-screen bg-white font-sans text-gray-900 md:pt-24 pb-20">
        <div className="max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-2 md:gap-16 md:px-8 items-start animate-pulse">
            {/* Skeleton Imagem */}
            <div className="h-[50vh] md:h-[80vh] bg-gray-200 md:rounded-3xl w-full"></div>
            {/* Skeleton Detalhes */}
            <div className="px-6 md:px-0 mt-8 space-y-6">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-12 bg-gray-200 rounded w-3/4"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                <div className="flex gap-3 mt-6">
                    {[1,2,3,4].map(i => <div key={i} className="w-16 h-16 bg-gray-200 rounded-2xl"></div>)}
                </div>
                <div className="space-y-3 mt-8">
                    <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
                    <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
                    <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
                </div>
            </div>
        </div>
    </div>
  );

  if (!product) return <div className="h-screen flex items-center justify-center">Produto não encontrado.</div>;

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
      
      {/* MODAL GUIA DE MEDIDAS */}
      <AnimatePresence>
        {showSizeGuide && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSizeGuide(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl p-6 w-full max-w-lg relative z-10 shadow-2xl max-h-[80vh] overflow-y-auto">
                <button onClick={() => setShowSizeGuide(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
                <div className="text-center mb-6">
                    <Ruler size={40} className="mx-auto text-black mb-2" />
                    <h2 className="text-2xl font-black">Guia de Medidas</h2>
                    <p className="text-gray-500 text-sm">Use uma fita métrica para conferir.</p>
                </div>
                <div className="space-y-6">
                    <div>
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">👟 Tênis / Calçados</h3>
                        <table className="w-full text-sm text-center border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gray-100 font-bold"><tr><th className="p-2">BR</th><th className="p-2">US</th><th className="p-2">CM</th></tr></thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr><td className="p-2">38</td><td className="p-2">7.5</td><td className="p-2">25.0 cm</td></tr>
                                <tr><td className="p-2">39</td><td className="p-2">8.5</td><td className="p-2">25.5 cm</td></tr>
                                <tr><td className="p-2">40</td><td className="p-2">9</td><td className="p-2">26.5 cm</td></tr>
                                <tr><td className="p-2">41</td><td className="p-2">9.5</td><td className="p-2">27.5 cm</td></tr>
                                <tr><td className="p-2">42</td><td className="p-2">10</td><td className="p-2">28.0 cm</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="fixed top-4 left-4 z-20 md:top-8 md:left-8">
        <Link href="/" className="bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:scale-105 transition-transform"><ArrowLeft size={22} /></Link>
      </div>
      <div className="fixed top-4 right-4 z-20 md:top-8 md:right-8">
        <button onClick={handleShare} className="bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:scale-105 transition-transform text-blue-600"><Share2 size={22} /></button>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-2 md:gap-16 md:px-8 items-start mb-20">

        {/* === ÁREA DA IMAGEM COM ZOOM === */}
        <div className="relative w-full">
          <div 
            className="h-[50vh] md:h-[80vh] bg-gray-100 relative overflow-hidden group md:rounded-3xl shadow-sm cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Imagem Normal (Base) */}
            <AnimatePresence mode='wait'>
                {images.length > 0 ? (
                    <motion.img 
                        key={activeImageIndex}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                        src={images[activeImageIndex]} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-200"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">Sem Imagem</div>
                )}
            </AnimatePresence>

            {/* Camada de Zoom (Só aparece no Hover) */}
            {images.length > 0 && (
                <div 
                    className="absolute inset-0 pointer-events-none hidden md:block"
                    style={{
                        backgroundImage: `url(${images[activeImageIndex]})`,
                        backgroundPosition: `${zoomStyle.transformOrigin}`,
                        backgroundSize: '250%', // Aumenta a imagem para o zoom
                        opacity: zoomStyle.opacity,
                        transition: 'opacity 0.2s ease-in-out'
                    }}
                />
            )}

            {images.length > 1 && (
                <>
                    <button onClick={(e) => {e.stopPropagation(); setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md z-10 hover:bg-white"><ChevronLeft size={20} /></button>
                    <button onClick={(e) => {e.stopPropagation(); setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md z-10 hover:bg-white"><ChevronRight size={20} /></button>
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

        {/* === DETALHES === */}
        <div className="px-6 md:px-0 mt-4 md:mt-0 md:sticky md:top-24">
          
          <div className="mb-8">
             <div className="flex justify-between items-start">
                 <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">{product.category}</p>
                 {/* Estrelas Fake */}
                 <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                    <Star size={14} fill="currentColor" /> 4.9 (42)
                 </div>
             </div>
             
             <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">{product.name}</h1>
             
             <div className="flex items-center gap-4 mb-2">
                <span className="text-4xl font-bold text-blue-600">{product.price}</span>
                <span className="text-sm text-gray-400 font-medium bg-gray-100 px-3 py-1 rounded-full">em até 12x</span>
             </div>

             <div className="flex items-center gap-2 text-sm text-red-600 font-bold animate-pulse">
                <Eye size={16} />
                <span>🔥 {viewers} pessoas estão vendo este produto agora</span>
             </div>
          </div>

          <div className="mb-10">
            <h3 className="font-bold text-sm mb-4 text-gray-800 flex justify-between items-center">
                Tamanhos Disponíveis 
                <button onClick={() => setShowSizeGuide(true)} className="flex items-center gap-1 text-gray-400 font-normal underline hover:text-black transition-colors text-xs md:text-sm">
                    <Ruler size={14}/> Guia de Medidas
                </button>
            </h3>
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

          <div className="mb-10 space-y-2">
              {/* Accordions (Iguais ao anterior, mantive a estrutura) */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => toggleAccordion('desc')} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3 font-bold text-gray-800"><FileText size={20} className="text-blue-600" />Detalhes do Produto</div>
                    <ChevronDown size={20} className={`transition-transform duration-300 ${openAccordion === 'desc' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openAccordion === 'desc' && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 text-gray-600 text-sm leading-relaxed border-t border-gray-200">{product.description}</div></motion.div>)}</AnimatePresence>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => toggleAccordion('shipping')} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3 font-bold text-gray-800"><Truck size={20} className="text-green-600" />Envio e Prazos</div>
                    <ChevronDown size={20} className={`transition-transform duration-300 ${openAccordion === 'shipping' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openAccordion === 'shipping' && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 text-gray-600 text-sm leading-relaxed border-t border-gray-200"><p className="mb-2">📦 <strong>Envio Rápido:</strong> Postamos seu pedido em até 24h úteis.</p><p>Rastreio garantido para todo Brasil.</p></div></motion.div>)}</AnimatePresence>
              </div>
              
               <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => toggleAccordion('warranty')} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3 font-bold text-gray-800"><ShieldCheck size={20} className="text-purple-600" />Garantia</div>
                    <ChevronDown size={20} className={`transition-transform duration-300 ${openAccordion === 'warranty' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openAccordion === 'warranty' && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 text-gray-600 text-sm leading-relaxed border-t border-gray-200"><p>✅ <strong>Garantia de 30 dias</strong>. Primeira troca grátis.</p></div></motion.div>)}</AnimatePresence>
              </div>
          </div>

          <div className="hidden md:block mt-8">
             <AddToCartButton />
          </div>
        </div>
      </div>
      
       {/* Relacionados */}
       {relatedProducts.length > 0 && (
           <section className="px-6 md:px-8 max-w-7xl mx-auto mt-20 mb-12 border-t border-gray-100 pt-12">
               <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">Quem viu, comprou também <Star className="fill-yellow-400 text-yellow-400" size={20}/></h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {relatedProducts.map((relProd) => {
                       const img = getProductImage(relProd);
                       return (
                           <Link key={relProd.id} href={`/product/${relProd.id}`} className="block group">
                                <div className="bg-gray-50 rounded-2xl p-3 hover:shadow-lg transition-all duration-300">
                                    <div className="aspect-square bg-white rounded-xl mb-3 overflow-hidden relative">
                                        {img ? <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Sem Foto</div>}
                                    </div>
                                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">{relProd.category}</p>
                                    <h4 className="font-bold text-sm text-gray-800 line-clamp-1 mb-1">{relProd.name}</h4>
                                    <span className="font-bold text-blue-600 text-sm">{relProd.price}</span>
                                </div>
                           </Link>
                       );
                   })}
               </div>
           </section>
       )}

       <div className="fixed bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-gray-100 p-4 pb-8 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20 md:hidden">
          <AddToCartButton mobile />
       </div>
    </div>
  );
}