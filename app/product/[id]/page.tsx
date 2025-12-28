"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ShoppingBag, Heart, Truck, ShieldCheck, Ruler, ArrowLeft, Minus, Plus, LayoutDashboard, AlertCircle } from 'lucide-react'; // Importei AlertCircle
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

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
  gallery?: string[];
  stock?: number;
  sizes?: string[] | string;
}

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState("");
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  // --- LÓGICA DE TAMANHOS ---
  const sizesFromDb = product?.sizes;
  const defaultSizes = product?.category === "Acessórios" ? ["ÚNICO"] : ["P", "M", "G", "GG", "XG"];
  let SIZES = defaultSizes;
  if (Array.isArray(sizesFromDb) && sizesFromDb.length > 0) { SIZES = sizesFromDb; } 
  else if (typeof sizesFromDb === 'string') { SIZES = (sizesFromDb as string).split(',').map(s => s.trim()); }

  // --- VERIFICAÇÃO DE ESTOQUE ---
  const stock = product?.stock || 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock < 5; // Gatilho de escassez

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      
      const { data: currentProduct } = await supabase.from('produtos').select('*').eq('id', id).single();

      if (currentProduct) {
        setProduct(currentProduct);
        setActiveImage(currentProduct.image_url);
        
        // Relacionados
        let query = supabase.from('produtos').select('*').neq('id', currentProduct.id).limit(4);
        if (currentProduct.category) {
            const { data: categoryData } = await supabase.from('produtos').select('*').eq('category', currentProduct.category).neq('id', currentProduct.id).limit(4);
            if (categoryData && categoryData.length > 0) { setRelatedProducts(categoryData); setLoading(false); return; }
        }
        const { data: anyData } = await query.order('id', { ascending: false });
        if (anyData) setRelatedProducts(anyData);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (isOutOfStock) return; // Bloqueia clique
    if (!selectedSize) { toast.error("Por favor, selecione um tamanho.", { icon: '📏' }); return; }
    
    // Bloqueia se tentar adicionar mais que o estoque
    if (quantity > stock) { toast.error(`Só temos ${stock} unidades em estoque.`); return; }

    for(let i=0; i<quantity; i++) { addToCart(product, selectedSize); }
  };

  const getInstallments = (priceStr: string) => { try { const num = parseFloat(priceStr.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()); return `12x de ${(num / 12).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`; } catch { return null; } };

  if (loading) return (<div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div></div>);
  if (!product) return <div className="min-h-screen flex items-center justify-center">Produto não encontrado.</div>;
  const galleryImages = product.gallery && product.gallery.length > 0 ? [product.image_url, ...product.gallery] : [product.image_url];
  const uniqueImages = Array.from(new Set(galleryImages));

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 relative">
      <div className="max-w-7xl mx-auto px-6 mb-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"><ArrowLeft size={18}/> Voltar</button>
          <Link href="/admin" className="flex items-center gap-2 text-xs font-bold bg-black text-white px-3 py-1.5 rounded-full hover:scale-105 transition-transform"><LayoutDashboard size={14}/> Painel Admin</Link>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="space-y-4">
                <div className="aspect-[4/5] bg-gray-100 rounded-3xl overflow-hidden relative border border-gray-100 shadow-sm group">
                    <motion.img key={activeImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} src={activeImage} alt={product.name} className="w-full h-full object-cover"/>
                    <button onClick={() => toggleWishlist(product)} className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"><Heart size={20} className={isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"} /></button>
                    {isOutOfStock && <span className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center font-black text-2xl uppercase text-gray-400">Esgotado</span>}
                </div>
                {uniqueImages.length > 1 && (<div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">{uniqueImages.map((img, idx) => (<button key={idx} onClick={() => setActiveImage(img)} className={`w-20 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-black opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}><img src={img} className="w-full h-full object-cover" /></button>))}</div>)}
            </div>

            <div className="flex flex-col">
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-2">{product.name}</h1>
                <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-end gap-3"><span className="text-4xl font-black text-gray-900">{product.price}</span><span className="text-sm text-green-600 font-bold mb-2">5% OFF no PIX</span></div>
                    <p className="text-gray-500 text-sm mt-1">Ou {getInstallments(product.price)} sem juros</p>
                </div>

                {/* AVISO DE ESTOQUE BAIXO */}
                {isLowStock && (
                    <div className="mb-6 flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-lg font-bold text-sm animate-pulse">
                        <AlertCircle size={18}/> Corre! Restam apenas {stock} unidades.
                    </div>
                )}

                <div className="mb-8">
                    <div className="flex justify-between items-center mb-3"><span className="font-bold text-gray-900">Selecione o Tamanho:</span><button className="text-xs text-gray-500 underline flex items-center gap-1 hover:text-black"><Ruler size={12}/> Tabela de Medidas</button></div>
                    <div className="flex flex-wrap gap-3">
                        {SIZES.map((size) => (
                            <button key={size} onClick={() => setSelectedSize(size)} disabled={isOutOfStock} className={`h-12 min-w-[3.5rem] px-3 rounded-xl font-bold text-sm border-2 transition-all ${selectedSize === size ? 'border-black bg-black text-white shadow-lg scale-105' : 'border-gray-200 text-gray-600 hover:border-gray-400'} ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}>{size}</button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 mb-8">
                    <div className="flex items-center border border-gray-200 rounded-full h-14 px-4 gap-4">
                        <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="text-gray-400 hover:text-black"><Minus size={18}/></button>
                        <span className="font-bold w-4 text-center text-gray-900">{quantity}</span>
                        <button onClick={() => setQuantity(q => Math.max(1, Math.min(stock, q+1)))} className="text-gray-400 hover:text-black"><Plus size={18}/></button>
                    </div>

                    <button 
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={`flex-1 rounded-full h-14 font-black uppercase tracking-wider flex items-center justify-center gap-3 transition-transform shadow-xl ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-black text-white hover:scale-[1.02] shadow-black/20'}`}
                    >
                        {isOutOfStock ? "Indisponível" : <><ShoppingBag size={20}/> Adicionar à Sacola</>}
                    </button>
                </div>
                
                {/* Ícones de Confiança */}
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500"><div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl"><Truck size={20} className="text-black"/> <div><p className="font-bold text-gray-900">Envio Rápido</p>Entrega p/ todo Brasil</div></div><div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl"><ShieldCheck size={20} className="text-black"/> <div><p className="font-bold text-gray-900">Compra Segura</p>Dados Protegidos</div></div></div>
            </div>
        </div>
        {relatedProducts.length > 0 && (<div className="mt-24 border-t border-gray-100 pt-16"><h3 className="text-2xl font-black mb-8 flex items-center gap-2 text-gray-900">Você também pode curtir <ArrowLeft size={20} className="rotate-180"/></h3><div className="grid grid-cols-2 md:grid-cols-4 gap-6">{relatedProducts.map((prod) => (<Link href={`/product/${prod.id}`} key={prod.id} className="group cursor-pointer"><div className="relative aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden mb-3"><img src={prod.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/></div><h4 className="font-bold text-sm text-gray-900 line-clamp-1">{prod.name}</h4><p className="text-gray-500 text-xs">{prod.price}</p></Link>))}</div></div>)}
      </div>
    </div>
  );
}