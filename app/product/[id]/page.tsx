"use client";

import React, { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// --- SUA CONEXÃO ---
// Note que aqui voltamos a usar as variáveis de ambiente para ficar seguro na Vercel
// Se der erro localmente, certifique-se de ter o arquivo .env.local
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ngnzibntpncdcrkoktus.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbnppYm50cG5jZGNya29rdHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MDM2MzksImV4cCI6MjA4MTM3OTYzOX0.OujKy3UrxekqE47FWm9mBHKVmNtVxEY-GILQDJCHv3I"
);

interface Product {
  id: number;
  name: string;
  price: string;
  description: string;
  category: string;
  image_url: string;
  sizes: string; // Mudamos para 'any' para aceitar texto ou array temporariamente
}

export default function ProductDetail() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [processedSizes, setProcessedSizes] = useState<string[]>([]); // Estado novo para os tamanhos tratados

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error("Erro Supabase:", error);
      } else {
        setProduct(data);
        
        // --- A MÁGICA DA CORREÇÃO AQUI ---
        // Verifica se 'sizes' veio como texto e converte para lista
        let safeSizes: string[] = [];
        if (data.sizes) {
            if (Array.isArray(data.sizes)) {
                safeSizes = data.sizes;
            } else if (typeof data.sizes === 'string') {
                try {
                    // Tenta converter texto "['39', '40']" em lista real
                    // Se o texto tiver aspas simples, troca por duplas para o JSON aceitar
                    const jsonString = data.sizes.replace(/'/g, '"');
                    safeSizes = JSON.parse(jsonString);
                } catch (e) {
                    // Se falhar, cria uma lista com o texto puro
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

  if (loading) return <div className="h-screen flex items-center justify-center font-bold">Carregando...</div>;
  if (!product) return <div className="h-screen flex items-center justify-center">Produto não encontrado.</div>;

  return (
    <div className="min-h-screen bg-white pb-24 font-sans text-gray-900">
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10">
        <Link href="/" className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm">
          <ArrowLeft size={20} />
        </Link>
      </div>

      <div className="h-[45vh] bg-gray-100 relative">
        {product.image_url && (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover"/>
        )}
      </div>

      <div className="px-5 py-6 -mt-6 bg-white rounded-t-3xl relative z-0">
        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
        <p className="text-xl font-bold text-blue-600 mb-4">{product.price}</p>
        
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-3">Tamanhos</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {/* Agora usamos 'processedSizes' que é garantido ser uma lista */}
            {processedSizes.map((size) => (
              <button key={size} onClick={() => setSelectedSize(size)}
                className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${selectedSize === size ? 'bg-black text-white scale-110' : 'bg-white'}`}>
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
            <h3 className="font-bold text-sm mb-2">Detalhes</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>
        </div>
      </div>
      
       <div className="fixed bottom-0 w-full bg-white border-t p-4 shadow-lg">
        <button 
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 ${selectedSize ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}
          disabled={!selectedSize}
          onClick={() => {
             if (!selectedSize) return;
             const phone = "5511999999999"; 
             window.open(`https://wa.me/${phone}?text=Quero o ${product.name} tamanho ${selectedSize}`, '_blank');
          }}
        >
          <ShoppingBag size={20} />
          {selectedSize ? 'Comprar no WhatsApp' : 'Selecione o Tamanho'}
        </button>
      </div>
    </div>
  );
}