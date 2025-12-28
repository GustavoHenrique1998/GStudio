"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define o formato do Produto
interface Product {
  id: number;
  name: string;
  price: string;
  image_url: string;
}

// Define o formato do Item no Carrinho (Produto + Quantidade + Tamanho)
interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
}

// O que o contexto oferece para o resto do site
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (id: number) => void;
  toggleCart: () => void;
  isCartOpen: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false); // <--- ESTADO DO CARRINHO (ABERTO/FECHADO)

  // Carregar carrinho salvo no LocalStorage ao abrir o site
  useEffect(() => {
    const savedCart = localStorage.getItem('@gstudio:cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Salvar no LocalStorage sempre que o carrinho mudar
  useEffect(() => {
    localStorage.setItem('@gstudio:cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, size: string) => {
    setCart((prev) => {
      // Verifica se já existe o mesmo produto com o mesmo tamanho
      const existingItem = prev.find((item) => item.id === product.id && item.selectedSize === size);

      if (existingItem) {
        // Se existe, aumenta a quantidade
        return prev.map((item) =>
          item.id === product.id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Se não existe, adiciona novo
      return [...prev, { ...product, quantity: 1, selectedSize: size }];
    });
    
    setIsCartOpen(true); // <--- ABRE O CARRINHO AUTOMATICAMENTE AO ADICIONAR
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev); // <--- TROCA ENTRE ABERTO E FECHADO
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, toggleCart, isCartOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}