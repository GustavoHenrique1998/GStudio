"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, CreditCard, Ticket } from 'lucide-react';

export default function TopBar() {
  const messages = [
    { text: "FRETE GRÁTIS EM PEDIDOS ACIMA DE R$ 350", icon: <Truck size={14} /> },
    { text: "PARCELE SUAS COMPRAS EM ATÉ 12X", icon: <CreditCard size={14} /> },
    { text: "GANHE 10% OFF NA PRIMEIRA COMPRA: GSTUDIO10", icon: <Ticket size={14} /> }
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4000); 
    return () => clearInterval(timer);
  }, []);

  return (
    // REMOVI 'fixed', 'top-0'. Agora é relative (padrão).
    <div className="relative w-full bg-black text-white text-[10px] md:text-xs font-bold py-2.5 flex items-center justify-center z-[50] border-b border-gray-800">
      <div className="w-full max-w-7xl mx-auto px-6 flex justify-center items-center h-4">
        <AnimatePresence mode='wait'>
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 uppercase tracking-widest text-center truncate"
          >
            <span className="text-gray-400 hidden md:block">{messages[index].icon}</span>
            {messages[index].text}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}