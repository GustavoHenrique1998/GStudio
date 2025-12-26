"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast'; // <--- O TOAST AQUI

export interface CartItem {
  id: number;
  name: string;
  price: string;
  image: string;
  size: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, size: string) => void;
  removeFromCart: (productId: number, size: string) => void;
  clearCart: () => void;
  cartOpen: boolean;
  toggleCart: () => void;
  totalValue: number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('gstudio-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gstudio-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any, size: string) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id && item.size === size);
      
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.size === size)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      let finalImage = product.image_url;
      if (product.gallery && Array.isArray(product.gallery) && product.gallery.length > 0) {
          finalImage = product.gallery[0];
      }

      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: finalImage || '',
        size: size,
        quantity: 1
      }];
    });
    setCartOpen(true);
    // A NOTIFICAÇÃO LINDA:
    toast.success(`Adicionado à sacola!`, {
        icon: '🛍️',
        style: { borderRadius: '10px', background: '#000', color: '#fff' },
    });
  };

  const removeFromCart = (productId: number, size: string) => {
    setCart(prev => prev.filter(item => !(item.id === productId && item.size === size)));
    toast.error("Item removido", { style: { borderRadius: '10px', background: '#333', color: '#fff' }});
  };

  const clearCart = () => setCart([]);
  const toggleCart = () => setCartOpen(!cartOpen);

  const totalValue = cart.reduce((acc, item) => {
    const priceNumber = parseFloat(
      item.price.replace('R$', '').replace('.', '').replace(',', '.').trim()
    );
    return acc + (priceNumber * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartOpen, toggleCart, totalValue }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);