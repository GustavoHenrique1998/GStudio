"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define o que é um Produto no carrinho
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

  // Carregar carrinho salvo quando o site abre
  useEffect(() => {
    const savedCart = localStorage.getItem('gstudio-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Salvar carrinho sempre que mudar
  useEffect(() => {
    localStorage.setItem('gstudio-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any, size: string) => {
    setCart((prev) => {
      // Verifica se o produto JÁ existe com aquele tamanho
      const existing = prev.find(item => item.id === product.id && item.size === size);
      
      if (existing) {
        // Se já existe, só aumenta a quantidade
        return prev.map(item => 
          (item.id === product.id && item.size === size)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Se não existe, adiciona novo
      // Tenta pegar a imagem certa (se for lista ou texto)
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
    setCartOpen(true); // Abre o carrinho automaticamente ao adicionar
  };

  const removeFromCart = (productId: number, size: string) => {
    setCart(prev => prev.filter(item => !(item.id === productId && item.size === size)));
  };

  const clearCart = () => setCart([]);

  const toggleCart = () => setCartOpen(!cartOpen);

  // Calcula o total (converte "R$ 1.200,00" para número 1200.00)
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

// Atalho para usar o carrinho em qualquer lugar
export const useCart = () => useContext(CartContext);