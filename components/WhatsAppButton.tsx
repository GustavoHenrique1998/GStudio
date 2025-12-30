"use client";

import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  // 👇 SEU NÚMERO AQUI
  const phoneNumber = "5516999999999"; 
  const message = "Olá! Vim pelo site e gostaria de tirar uma dúvida.";

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Falar no WhatsApp"
    >
      {/* Bolinha Verde */}
      <div className="bg-[#25D366] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center justify-center relative">
        <MessageCircle size={28} fill="white" className="text-white" />
        
        {/* Animação de "Ping" (Ondas) */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75 animate-ping -z-10"></span>
      </div>

      {/* Tooltip (Texto que aparece ao passar o mouse) */}
      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white px-3 py-1.5 rounded-lg shadow-lg text-xs font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Fale Conosco
      </div>
    </a>
  );
}