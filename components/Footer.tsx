"use client";

import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  
  // Função para rolar até a loja na Home
  const scrollToShop = () => {
    const shopSection = document.getElementById('shop-section');
    if (shopSection) {
        shopSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        window.location.href = "/#shop-section";
    }
  };

  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Marca */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black tracking-tighter">G-STUDIO.</h3>
            <p className="text-gray-400 text-sm">Streetwear premium e exclusivo.</p>
            <div className="flex gap-4 pt-2">
                <button className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center hover:bg-white hover:text-black"><Instagram size={20}/></button>
                <button className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center hover:bg-white hover:text-black"><Facebook size={20}/></button>
            </div>
          </div>

          {/* Explorar (Funciona!) */}
          <div>
            <h4 className="font-bold text-lg mb-6">Explorar</h4>
            <ul className="space-y-3 text-sm text-gray-400">
                <li><button onClick={scrollToShop} className="hover:text-white text-left">Lançamentos</button></li>
                <li><button onClick={scrollToShop} className="hover:text-white text-left">Coleções</button></li>
                <li><button onClick={scrollToShop} className="hover:text-white text-left">Todos os Produtos</button></li>
            </ul>
          </div>

          {/* Ajuda (Agora existe!) */}
          <div>
            <h4 className="font-bold text-lg mb-6">Ajuda</h4>
            <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/ajuda#trocas" className="hover:text-white">Trocas e Devoluções</Link></li>
                <li><Link href="/ajuda#envios" className="hover:text-white">Prazos de Entrega</Link></li>
                <li><Link href="/ajuda#pagamento" className="hover:text-white">Pagamentos</Link></li>
                <li><Link href="/admin" className="hover:text-white font-bold text-gray-600 mt-2 block">Área do Vendedor</Link></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-bold text-lg mb-6">Contato</h4>
            <ul className="space-y-4 text-sm text-gray-400">
                <li className="flex items-center gap-3"><Mail size={18}/> suporte@gstudio.com</li>
                <li className="flex items-center gap-3"><Phone size={18}/> (11) 99999-9999</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
            <p>© 2025 G-Studio. Todos os direitos reservados.</p>
            <p>Design by G-Studio</p>
        </div>

      </div>
    </footer>
  );
}