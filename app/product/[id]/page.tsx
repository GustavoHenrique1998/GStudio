"use client";

import React, { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingBag, ChevronRight, ChevronLeft, Share2, Star, Truck, ShieldCheck, FileText, ChevronDown } from 'lucide-react';
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

  // Estado para controlar qual aba do Accordion está aberta
  // Pode começar com 'desc' aberto ou null (tudo fechado)
  const [openAccordion, setOpenAccordion] = useState<string | null>('desc');

  useEffect(() => {
    async function fetchProductData() {
      const { data: currentData, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', params.id)
        .single();

      if (!error && currentData) {
        setProduct(currentData);
        
        // Tratamento Galeria
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

        // Tratamento Tamanhos
        let safeSizes: string[] = [];
        if (currentData.sizes) {
            if (Array.isArray(currentData.sizes)) { safeSizes = currentData.sizes; }
            else if (typeof currentData.sizes === 'string') {
                try { safeSizes = JSON.parse(currentData.sizes.replace(/'/g, '"')); }
                catch (e) { safeSizes = [currentData.sizes]; }
            }
        }
        setProcessedSizes(safeSizes);

        // Produtos Relacionados
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

  // Função para alternar o Accordion
  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold animate-pulse">Carregando...</div>;
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
      
      {/* Botões Flutuantes */}
      <div className="fixed top-4 left-4 z-20 md:top-8 md:left-8">
        <Link href="/" className="bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:scale-105 transition-transform">
          <ArrowLeft size={22} />
        </Link>
      </div>
      <div className="fixed top-4 right-4 z-20 md:top-8 md:right-8">
        <button onClick={handleShare} className="bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:scale-105 transition-transform text-blue-600">
          <Share2 size={22} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-2 md:gap-16 md:px-8 items-start mb-20">

        {/* === IMAGENS === */}
        <div className="relative w-full">
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
            {images.length > 1 && (
                <>
                    <button onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md z-10 hover:bg-white"><ChevronLeft size={20} /></button>
                    <button onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md z-10 hover:bg-white"><ChevronRight size={20} /></button>
                </>
            )}
          </div>
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
             <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">{product.category}</p>
             <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">{product.name}</h1>
             <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-blue-600">{product.price}</span>
                <span className="text-sm text-gray-400 font-medium bg-gray-100 px-3 py-1 rounded-full">em até 12x sem juros</span>
             </div>
          </div>

          <div className="mb-10">
            <h3 className="font-bold text-sm mb-4 text-gray-800 flex justify-between">Tamanhos Disponíveis</h3>
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

          {/* === NOVA ÁREA: ACCORDIONS DE INFORMAÇÃO === */}
          <div className="mb-10 space-y-2">
              
              {/* ITEM 1: DESCRIÇÃO */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => toggleAccordion('desc')} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3 font-bold text-gray-800">
                        <FileText size={20} className="text-blue-600" />
                        Detalhes do Produto
                    </div>
                    <ChevronDown size={20} className={`transition-transform duration-300 ${openAccordion === 'desc' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                    {openAccordion === 'desc' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="p-4 text-gray-600 text-sm leading-relaxed border-t border-gray-200">
                                {product.description}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
              </div>

              {/* ITEM 2: FRETE (Estático) */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => toggleAccordion('shipping')} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3 font-bold text-gray-800">
                        <Truck size={20} className="text-green-600" />
                        Envio e Prazos
                    </div>
                    <ChevronDown size={20} className={`transition-transform duration-300 ${openAccordion === 'shipping' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                    {openAccordion === 'shipping' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="p-4 text-gray-600 text-sm leading-relaxed border-t border-gray-200">
                                <p className="mb-2">📦 <strong>Envio Rápido:</strong> Postamos seu pedido em até 24h úteis após a confirmação.</p>
                                <p>Todos os envios possuem código de rastreio e seguro contra extravio. O prazo varia de acordo com sua região, calculado no checkout.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
              </div>

              {/* ITEM 3: GARANTIA (Estático) */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => toggleAccordion('warranty')} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3 font-bold text-gray-800">
                        <ShieldCheck size={20} className="text-purple-600" />
                        Garantia e Troca Fácil
                    </div>
                    <ChevronDown size={20} className={`transition-transform duration-300 ${openAccordion === 'warranty' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                    {openAccordion === 'warranty' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="p-4 text-gray-600 text-sm leading-relaxed border-t border-gray-200">
                                <p className="mb-2">✅ <strong>Garantia de 30 dias</strong> contra defeitos de fabricação.</p>
                                <p>Não serviu? A primeira troca é por nossa conta! Você tem até 7 dias após o recebimento para solicitar a devolução ou troca sem custo.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
              </div>

          </div>

          <div className="hidden md:block mt-8">
             <AddToCartButton />
          </div>
        </div>
      </div>
      
       {/* RELACIONADOS */}
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
                                        {img ? (
                                            <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Sem Foto</div>
                                        )}
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

       {/* Mobile Button */}
       <div className="fixed bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-gray-100 p-4 pb-8 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20 md:hidden">
          <AddToCartButton mobile />
       </div>
    </div>
  );
}