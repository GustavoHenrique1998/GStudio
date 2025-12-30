"use client";

import React from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext'; 
import { Trash2, ShoppingBag, Heart, ArrowRight, ArrowLeft } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useCart();

  // Função para mover do Favoritos para o Carrinho
  const moveToCart = (product: any) => {
    addToCart(product, product.sizes && product.sizes.length > 0 ? product.sizes[0] : "ÚNICO");
    toggleWishlist(product); // Remove dos favoritos depois de adicionar ao carrinho
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="p-2 bg-gray-100 rounded-full hover:bg-black hover:text-white transition-colors">
                <ArrowLeft size={20}/>
            </Link>
            <h1 className="text-3xl font-black tracking-tighter flex items-center gap-2">
                Meus Favoritos <Heart className="fill-black text-black" size={24}/>
            </h1>
        </div>

        {wishlist.length === 0 ? (
          // ESTADO VAZIO
          <div className="text-center py-24 bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart size={40} className="text-gray-400"/>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sua lista está vazia</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Salve os itens que você mais gostou aqui para não perder de vista.</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform">
              Explorar Loja <ArrowRight size={20}/>
            </Link>
          </div>
        ) : (
          // GRID DE FAVORITOS
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <div key={product.id} className="group relative bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-xl transition-all duration-300">
                
                {/* Botão de Remover (X) */}
                <button 
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Remover"
                >
                    <Trash2 size={16}/>
                </button>

                {/* Imagem */}
                <Link href={`/product/${product.id}`}>
                    <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4 relative">
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    </div>
                </Link>

                {/* Informações */}
                <div>
                    <Link href={`/product/${product.id}`}>
                        <h3 className="font-bold text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors">{product.name}</h3>
                    </Link>
                    <p className="text-gray-500 text-sm mb-4">{product.price}</p>
                    
                    {/* Botão Mover para Carrinho */}
                    <button 
                        onClick={() => moveToCart(product)}
                        className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors active:scale-95"
                    >
                        <ShoppingBag size={16}/> Mover p/ Sacola
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}