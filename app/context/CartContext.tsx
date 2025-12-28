"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  price: string;
  image_url: string;
  category?: string;
}

interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
}

interface CartContextType {
  // Carrinho
  cart: CartItem[];
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (id: number) => void;
  toggleCart: () => void;
  isCartOpen: boolean;
  
  // Wishlist (Favoritos)
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (id: number) => boolean;
  isWishlistOpen: boolean;         // <--- NOVO
  toggleWishlistSidebar: () => void; // <--- NOVO
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Carrinho
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Wishlist
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false); // <--- ESTADO DA GAVETA

  useEffect(() => {
    const savedCart = localStorage.getItem('@gstudio:cart');
    const savedWishlist = localStorage.getItem('@gstudio:wishlist');
    
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  useEffect(() => {
    localStorage.setItem('@gstudio:cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('@gstudio:wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (product: Product, size: string) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === product.id && item.selectedSize === size);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size }];
    });
    setIsCartOpen(true); // Abre carrinho ao comprar
    toast.success('Adicionado à sacola!', { icon: '🛍️' });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
    if (isWishlistOpen) setIsWishlistOpen(false); // Fecha wishlist se abrir carrinho
  };

  // --- WISHLIST ---
  const toggleWishlistSidebar = () => {
    setIsWishlistOpen((prev) => !prev);
    if (isCartOpen) setIsCartOpen(false); // Fecha carrinho se abrir wishlist
  };

  const toggleWishlist = (product: Product) => {
    const exists = wishlist.some((item) => item.id === product.id);

    if (exists) {
      toast('Removido dos favoritos', { icon: '💔' });
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
    } else {
      toast('Salvo nos favoritos!', { icon: '❤️' });
      setWishlist((prev) => [...prev, product]);
     // setIsWishlistOpen(true); // <--- AQUI ESTÁ A ESTRATÉGIA: ABRE A GAVETA AO FAVORITAR
    }
  };

  const isInWishlist = (id: number) => {
    return wishlist.some((item) => item.id === id);
  };

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, toggleCart, isCartOpen,
      wishlist, toggleWishlist, isInWishlist, isWishlistOpen, toggleWishlistSidebar
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart error');
  return context;
}