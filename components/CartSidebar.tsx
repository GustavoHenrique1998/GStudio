"use client";

import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, CreditCard, Banknote, User, FileText } from 'lucide-react';
import { useCart } from '../app/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

// 👇 SEU NÚMERO (Mantenha o formato internacional 55 + DDD + Numero)
const PHONE_NUMBER = "5516999999999"; 

export default function CartSidebar() {
  const { cart, removeFromCart, toggleCart, isCartOpen } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PIX");

  // Calcular Total
  const totalValue = cart.reduce((acc, item) => {
    const price = parseFloat(item.price.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
    return acc + (price * item.quantity);
  }, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!customerName) {
        alert("Por favor, digite seu nome para identificarmos o pedido.");
        return;
    }

    const date = new Date().toLocaleDateString('pt-BR');
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // --- MENSAGEM PROFISSIONAL ---
    let message = `🏛️ *G-STUDIO | Novo Pedido*\n`;
    message += `📅 Data: ${date} às ${time}\n\n`;
    
    message += `👤 *DADOS DO CLIENTE*\n`;
    message += `Nome: ${customerName}\n\n`;

    message += `🛒 *RESUMO DO PEDIDO*\n`;
    message += `--------------------------------\n`;

    cart.forEach((item) => {
        message += `▪️ *${item.quantity}x* ${item.name}\n`;
        message += `   Tam: ${item.selectedSize} | Ref: #${item.id}\n`;
        message += `   Valor: ${item.price}\n`;
        message += `--------------------------------\n`;
    });

    message += `\n💳 *FORMA DE PAGAMENTO*\n`;
    message += `Método: ${paymentMethod}\n`;
    message += `*TOTAL A PAGAR: ${totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}*\n\n`;
    
    message += `📍 *Status:* Aguardando confirmação do vendedor.`;

    // Abrir WhatsApp
    const url = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop (Fundo Escuro) */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={toggleCart}
            className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm"
          />

          {/* Sidebar (Gaveta) */}
          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} 
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            // ADICIONEI 'text-gray-900' AQUI PARA FORÇAR LETRA ESCURA
            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white text-gray-900 z-[100] shadow-2xl flex flex-col"
          >
            {/* Cabeçalho */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                <h2 className="text-xl font-black flex items-center gap-2 text-gray-900">
                    <ShoppingBag size={24} /> SACOLA <span className="text-gray-400 font-medium text-sm">({cart.length})</span>
                </h2>
                <button onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                    <X size={24} />
                </button>
            </div>

            {/* Lista de Produtos */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                        <ShoppingBag size={64} className="text-gray-300" />
                        <p className="font-bold text-lg text-gray-500">Sua sacola está vazia.</p>
                        <button onClick={toggleCart} className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm">
                            Começar a comprar
                        </button>
                    </div>
                ) : (
                    cart.map((item, index) => (
                        <motion.div layout key={`${item.id}-${item.selectedSize}-${index}`} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                            {/* Foto */}
                            <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
                            </div>
                            
                            {/* Detalhes */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-sm line-clamp-1 text-gray-900">{item.name}</h4>
                                        <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                    </div>
                                    <p className="text-gray-500 text-xs mt-1">Tamanho: <span className="font-bold text-black">{item.selectedSize}</span></p>
                                </div>
                                
                                <div className="flex justify-between items-end mt-2">
                                    <p className="font-bold text-sm text-gray-900">{item.price}</p>
                                    <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-2 py-1">
                                        <span className="text-xs font-bold text-gray-600">Qtd: {item.quantity}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Rodapé (Checkout) */}
            {cart.length > 0 && (
                <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
                    
                    {/* Input Nome */}
                    <div className="mb-4">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Seu Nome</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                            <input 
                                type="text" 
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Nome completo"
                                // ADICIONEI text-gray-900 E bg-gray-50 PARA GARANTIR CONTRASTE
                                className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-black focus:ring-0 outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Seleção Pagamento */}
                    <div className="mb-6">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Forma de Pagamento</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setPaymentMethod("PIX")}
                                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-bold text-sm ${paymentMethod === 'PIX' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 text-gray-400 hover:border-gray-300'}`}
                            >
                                <Banknote size={18}/> PIX
                            </button>
                            <button 
                                onClick={() => setPaymentMethod("CARTÃO")}
                                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-bold text-sm ${paymentMethod === 'CARTÃO' ? 'border-black bg-black text-white' : 'border-gray-100 text-gray-400 hover:border-gray-300'}`}
                            >
                                <CreditCard size={18}/> Cartão
                            </button>
                        </div>
                    </div>

                    {/* Totais */}
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-gray-500 font-medium">Total do Pedido</span>
                        <div className="text-right">
                            <span className="block text-2xl font-black text-gray-900">{totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            {paymentMethod === 'PIX' && <span className="text-xs text-green-600 font-bold">Economize 5% pagando agora</span>}
                        </div>
                    </div>

                    {/* Botão Finalizar */}
                    <button 
                        onClick={handleCheckout}
                        className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-lg tracking-wide hover:bg-green-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200"
                    >
                        <FileText size={20}/> FINALIZAR PEDIDO NO WHATS
                    </button>
                </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}