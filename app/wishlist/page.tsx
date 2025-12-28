"use client";

import React from 'react';
import { X, Trash2, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext'; 
import { motion, AnimatePresence } from 'framer-motion';

// Definindo a interface Product aqui para evitar erros
interface Product {
  id: number;
  name: string;
  price: string;
  image_url: string;
  category?: string;
}

export default function WishlistSidebar() {
  // Tipagem forçada para garantir compatibilidade
  const { wishlist, toggleWishlist, isWishlistOpen, toggleWishlistSidebar, addToCart } = useCart() as unknown as {
    wishlist: Product[];
    toggleWishlist: (p: Product) => void;
    isWishlistOpen: boolean;
    toggleWishlistSidebar: () => void;
    addToCart: (p: Product, s: string) => void;
  };

  const moveToCart = (product: Product) => {
    addToCart(product, 'Padrão'); // Adiciona ao carrinho
    toggleWishlist(product); // Remove da wishlist automaticamente
  };

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={toggleWishlistSidebar}
            className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} 
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-white z-[100] shadow-2xl flex flex-col border-l border-gray-100"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                <h2 className="text-xl font-black flex items-center gap-2 text-red-500">
                    <Heart size={24} fill="currentColor" /> MEUS FAVORITOS
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">{wishlist.length}</span>
                </h2>
                <button onClick={toggleWishlistSidebar} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {wishlist.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                        <Heart size={64} className="text-gray-300" />
                        <p className="font-bold text-lg">Sua lista está vazia.</p>
                        <button onClick={toggleWishlistSidebar} className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm">
                            Voltar a navegar
                        </button>
                    </div>
                ) : (
                    wishlist.map((item) => (
                        <motion.div layout key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                <img src={item.image_url} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                                    <p className="text-gray-500 text-xs mt-1">{item.price}</p>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button 
                                        onClick={() => moveToCart(item)}
                                        className="flex-1 bg-black text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-gray-800"
                                    >
                                        <ShoppingBag size={12} /> Comprar
                                    </button>
                                    <button 
                                        onClick={() => toggleWishlist(item)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}