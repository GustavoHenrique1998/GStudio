"use client";

import React from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../app/context/CartContext';

export default function CartSidebar() {
  const { cart, cartOpen, toggleCart, removeFromCart, totalValue } = useCart();

  // Função que manda tudo pro WhatsApp
  const handleCheckout = () => {
    const phone = "5511999999999"; // SEU NÚMERO AQUI
    
    let message = "*🦁 NOVO PEDIDO DO SITE G-STUDIO 🦁*\n\n";
    cart.forEach(item => {
      message += `▪️ ${item.quantity}x *${item.name}*\n   Tamanho: ${item.size}\n   Preço: ${item.price}\n\n`;
    });
    
    message += `------------------------------\n`;
    message += `*💰 TOTAL: R$ ${totalValue.toFixed(2).replace('.', ',')}*\n`;
    message += `------------------------------\n\n`;
    message += `Gostaria de combinar a entrega e o pagamento!`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Fundo Escuro (clique para fechar) */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
          />

          {/* A Barra Lateral Branca */}
          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white z-[70] shadow-2xl flex flex-col"
          >
            {/* Cabeçalho do Carrinho */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                <ShoppingBag className="text-black" /> Sua Sacola ({cart.length})
              </h2>
              <button onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Lista de Produtos */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                  <ShoppingBag size={64} strokeWidth={1} className="mb-4" />
                  <p>Sua sacola está vazia.</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={`${item.id}-${item.size}-${idx}`} className="flex gap-4">
                    {/* Foto Pequena */}
                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm line-clamp-2">{item.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">Tamanho: <span className="font-bold text-black">{item.size}</span></p>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="font-bold text-blue-600">{item.price}</span>
                        <div className="flex items-center gap-3">
                           <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">x{item.quantity}</span>
                           <button 
                             onClick={() => removeFromCart(item.id, item.size)}
                             className="text-red-400 hover:text-red-600 transition-colors"
                           >
                             <Trash2 size={18} />
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Rodapé (Total e Botão) */}
            {cart.length > 0 && (
              <div className="p-6 bg-gray-50 border-t border-gray-100 pb-10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-500 font-medium">Total estimado</span>
                  <span className="text-2xl font-extrabold text-gray-900">
                    R$ {totalValue.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-5 h-5 filter brightness-0 invert" alt="" />
                  Finalizar Pedido no WhatsApp
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}