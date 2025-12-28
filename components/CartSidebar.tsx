"use client";

import React, { useEffect, useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Truck, PartyPopper, Sparkles, Tag, Check } from 'lucide-react';
import { useCart } from '../app/context/CartContext'; 
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface CartItem {
  id: number;
  name: string;
  price: string;
  image_url: string;
  quantity: number;
  selectedSize: string;
}

export default function CartSidebar() {
  const context = useCart();
  if (!context) return null;

  const { cart, removeFromCart, toggleCart, isCartOpen } = context as unknown as { 
    cart: CartItem[], 
    removeFromCart: (id: number) => void, 
    toggleCart: () => void, 
    isCartOpen: boolean 
  };

  const [total, setTotal] = useState(0);
  const FREE_SHIPPING_THRESHOLD = 350; 
  const [progress, setProgress] = useState(0);

  // --- LÓGICA DE CUPOM ---
  const [couponInput, setCouponInput] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const parseCurrency = (value: string) => {
    if(!value) return 0;
    try {
        return parseFloat(value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
    } catch (e) { return 0; }
  };

  useEffect(() => {
    if (!cart) return;
    const subtotal = cart.reduce((acc, item) => {
      const price = parseCurrency(item.price);
      return acc + (price * (item.quantity || 1));
    }, 0);
    
    // Recalcula desconto se o subtotal mudar
    let discountValue = 0;
    if (appliedCoupon === 'GSTUDIO10') {
        discountValue = subtotal * 0.10; // 10%
    } else if (appliedCoupon === 'VEMCOMIGO') {
        discountValue = subtotal * 0.05; // 5%
    }

    setDiscount(discountValue);
    setTotal(subtotal - discountValue);

    // Barra de Frete baseada no Subtotal (sem desconto, para não punir o cliente)
    let prog = (subtotal / FREE_SHIPPING_THRESHOLD) * 100;
    if (prog > 100) prog = 100;
    setProgress(prog);
  }, [cart, appliedCoupon]);

  const formatMoney = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleApplyCoupon = () => {
      const code = couponInput.toUpperCase().trim();
      
      if (code === 'GSTUDIO10') {
          setAppliedCoupon('GSTUDIO10');
          toast.success("Cupom de 10% aplicado!", { icon: '🎟️' });
      } else if (code === 'VEMCOMIGO') {
          setAppliedCoupon('VEMCOMIGO');
          toast.success("Cupom de 5% aplicado!", { icon: '🎟️' });
      } else {
          toast.error("Cupom inválido ou expirado.");
          setAppliedCoupon(null);
          setDiscount(0);
      }
  };

  const removeCoupon = () => {
      setAppliedCoupon(null);
      setDiscount(0);
      setCouponInput("");
      toast("Cupom removido.");
  };

  const handleCheckout = () => {
    let message = "Olá! Vim pelo site e quero fechar meu pedido:\n\n";
    cart.forEach(item => {
        message += `• ${item.quantity}x ${item.name} - ${item.selectedSize}\n`;
    });
    
    // Adiciona detalhes financeiros na mensagem
    const subtotal = total + discount;
    message += `\nSubtotal: ${formatMoney(subtotal)}`;
    
    if (discount > 0) {
        message += `\nDesconto (${appliedCoupon}): -${formatMoney(discount)}`;
    }
    
    message += `\n*Total Final: ${formatMoney(total)}*`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/5511999999999?text=${encodedMessage}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleCart} className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-md" />

          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} 
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-gray-50 z-[100] shadow-2xl flex flex-col border-l border-white/20"
          >
            
            {/* CABEÇALHO */}
            <div className="p-6 bg-white shadow-sm z-10 flex items-center justify-between">
                <h2 className="text-xl font-black flex items-center gap-2 text-gray-900 tracking-tight">
                    <ShoppingBag size={24} className="text-black"/> 
                    SUA SACOLA 
                    <span className="bg-black text-white text-xs px-2 py-1 rounded-full font-bold">{cart?.length || 0}</span>
                </h2>
                <button onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black"><X size={24} /></button>
            </div>

            {/* FRETE GRÁTIS */}
            {cart && cart.length > 0 && (
                <div className="px-6 py-5 bg-white border-b border-gray-100">
                    <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wide">
                        {progress >= 100 ? (
                            <span className="text-green-600 flex items-center gap-1 animate-pulse"><PartyPopper size={16}/> Frete Grátis Liberado!</span>
                        ) : (
                            <span className="text-gray-500">Faltam <span className="text-black font-black">{formatMoney(FREE_SHIPPING_THRESHOLD - (total + discount))}</span> para frete grátis</span>
                        )}
                        <span className="text-gray-400">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500'}`} />
                    </div>
                </div>
            )}

            {/* LISTA */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {(!cart || cart.length === 0) ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                        <div className="bg-gray-200 p-6 rounded-full mb-2"><ShoppingBag size={48} className="text-gray-400" /></div>
                        <p className="font-bold text-gray-900 text-lg">Sua sacola está vazia.</p>
                        <button onClick={toggleCart} className="mt-4 bg-black text-white px-8 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg">Ver Coleção</button>
                    </div>
                ) : (
                    cart.map((item, idx) => (
                        <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={`${item.id}-${idx}`} className="flex gap-4 p-3 bg-white rounded-2xl shadow-sm border border-gray-100 group hover:border-gray-300 transition-colors">
                            <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                                <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <h4 className="font-extrabold text-sm text-gray-900 line-clamp-1">{item.name}</h4>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] font-bold bg-black text-white px-2 py-1 rounded uppercase tracking-wider">{item.selectedSize}</span>
                                        <span className="text-xs text-gray-500">Qtd: {item.quantity}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="font-bold text-base text-blue-700">{item.price}</span>
                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* FOOTER - AGORA COM CUPOM */}
            {cart && cart.length > 0 && (
                <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 space-y-4">
                    
                    {/* ÁREA DO CUPOM */}
                    {!appliedCoupon ? (
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                <input 
                                    type="text" 
                                    placeholder="Cupom de desconto" 
                                    value={couponInput}
                                    onChange={(e) => setCouponInput(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black uppercase transition-all"
                                />
                            </div>
                            <button onClick={handleApplyCoupon} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black transition-colors">
                                Aplicar
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center bg-green-50 border border-green-100 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-green-700 text-sm font-bold">
                                <Tag size={16} />
                                <span>CUPOM: {appliedCoupon}</span>
                            </div>
                            <button onClick={removeCoupon} className="text-xs text-gray-400 hover:text-red-500 underline">Remover</button>
                        </div>
                    )}

                    {/* TOTAIS */}
                    <div className="space-y-2 pt-2">
                        {discount > 0 && (
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Subtotal</span>
                                <span>{formatMoney(total + discount)}</span>
                            </div>
                        )}
                        {discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600 font-bold">
                                <span>Desconto</span>
                                <span>- {formatMoney(discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <span className="text-gray-900 font-bold">Total Final</span>
                            <span className="font-black text-2xl text-gray-900 tracking-tight">{formatMoney(total)}</span>
                        </div>
                    </div>
                    
                    {progress >= 100 && (
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center justify-center gap-2 text-green-700 text-xs font-bold bg-green-50 p-2 rounded-xl border border-green-100">
                            <Truck size={16} /> <span>FRETE GRÁTIS ATIVADO</span> <Sparkles size={14} className="text-yellow-500" />
                        </motion.div>
                    )}

                    <button onClick={handleCheckout} className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-gray-900 hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-300 group">
                        Finalizar Compra <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                    </button>
                </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}