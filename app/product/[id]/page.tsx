import React from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Metadata, ResolvingMetadata } from 'next';
import ProductUI from './ProductUI'; // <--- IMPORTAMOS O NOVO ARQUIVO

const supabase = createClient(
  "https://ngnzibntpncdcrkoktus.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbnppYm50cG5jZGNya29rdHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MDM2MzksImV4cCI6MjA4MTM3OTYzOX0.OujKy3UrxekqE47FWm9mBHKVmNtVxEY-GILQDJCHv3I"
);

type Props = {
    params: Promise<{ id: string }> // <--- AJUSTE IMPORTANTE: Promise
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// --- SEO DINÂMICO ---
export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
  ): Promise<Metadata> {
    // 1. Await no params (Nova regra do Next 15)
    const { id } = await params;
   
    const { data: product } = await supabase.from('produtos').select('*').eq('id', id).single();
   
    if (!product) {
        return { title: 'Produto não encontrado | G-STUDIO' }
    }
   
    return {
      title: `${product.name} | G-STUDIO`,
      description: `Confira ${product.name}. Parcele em até 12x sem juros. Frete Grátis disponível.`,
      openGraph: {
          title: product.name,
          description: `Por apenas ${product.price}. Atitude e estilo exclusivo G-Studio.`,
          images: [product.image_url],
      },
    }
  }

// --- PÁGINA PRINCIPAL (SERVER COMPONENT) ---
export default async function ProductPage({ params }: Props) {
  // 1. Await no params antes de usar
  const resolvedParams = await params;
  
  // 2. Passa o ID para o componente Cliente (ProductUI)
  return <ProductUI id={resolvedParams.id} />;
}