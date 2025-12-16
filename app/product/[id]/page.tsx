"use client";

import React, { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
// Importação direta
import { createClient } from '@supabase/supabase-js';

// Conexão (Verifique se a URL e a Chave estão certas - sem espaços extras!)
const supabase = createClient(
  "https://ngnzibntpncdcrkoktus.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbnppYm50cG5jZGNya29rdHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MDM2MzksImV4cCI6MjA4MTM3OTYzOX0.OujKy3UrxekqE47FWm9mBHKVmNtVxEY-GILQDJCHv3I"
);

interface Product {
  id: number;
  name: string; // ATENÇÃO: Confirme se no banco a coluna é "name" mesmo
  price: string;
  description: string;
  category: string;
  image_url: string;
  sizes: string[];
}

export default function ProductDetail() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      // CORREÇÃO AQUI NA LINHA ABAIXO:
      const { data, error } = await supabase
        .from('produtos') // <--- Mudei de 'products' para 'produtos' (igual ao seu banco)
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error("Erro no Supabase:", error);
      } else {
        setProduct(data);
      }
      setLoading(false);
    }

    if (params.id) fetchProduct();
  }, [params.id]);

  if (loading) return <div className="h-screen flex items-center justify-center">Carregando...</div>;
  
  // Se não achar o produto, mostramos o erro na tela para ajudar
  if (!product) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
       <p className="font-bold">Produto não encontrado.</p>
       <p className="text-sm text-gray-500">Verifique se o ID existe na tabela produtos.</p>
       <Link href="/" className="text-blue-500 underline">Voltar</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-24 font-sans text-gray-900">
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10">
        <Link href="/" className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm">
          <ArrowLeft size={20} />
        </Link>
      </div>

      <div className="h-[45vh] bg-gray-100 relative">
        {/* Verifica se image_url existe antes de tentar mostrar */}
        {product.image_url && (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover"/>
        )}
      </div>

      <div className="px-5 py-6 -mt-6 bg-white rounded-t-3xl relative z-0">
        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
        <p className="text-xl font-bold text-blue-600 mb-4">{product.price}</p>
        
        <div className="flex gap-3 mb-6 overflow-x-auto">
            {product.sizes && product.sizes.map((size) => (
              <button key={size} onClick={() => setSelectedSize(size)}
                className={`w-12 h-12 rounded-full border flex items-center justify-center ${selectedSize === size ? 'bg-black text-white' : 'bg-white'}`}>
                {size}
              </button>
            ))}
        </div>
      </div>
      
       <div className="fixed bottom-0 w-full bg-white border-t p-4">
        <button 
          className="w-full bg-black text-white py-4 rounded-xl font-bold"
          onClick={() => {
             if (!selectedSize) return;
             const phone = "5511999999999"; 
             window.open(`https://wa.me/${phone}?text=Quero o ${product.name} tamanho ${selectedSize}`, '_blank');
          }}
        >
          {selectedSize ? 'Comprar no WhatsApp' : 'Selecione o Tamanho'}
        </button>
      </div>
    </div>
  );
}