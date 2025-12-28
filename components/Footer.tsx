"use client";

import React from 'react';
import { Instagram, Facebook, Twitter, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link'; // <--- IMPORTANTE

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t border-gray-900 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* GRID DE COLUNAS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* COLUNA 1: MARCA */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black tracking-tighter">G-STUDIO.</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Redefinindo o streetwear com peças exclusivas. Feito para quem cria.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://instagram.com" target="_blank" className="p-2 bg-gray-900 rounded-full hover:bg-white hover:text-black transition-all"><Instagram size={18}/></a>
              <a href="https://facebook.com" target="_blank" className="p-2 bg-gray-900 rounded-full hover:bg-white hover:text-black transition-all"><Facebook size={18}/></a>
              <a href="https://twitter.com" target="_blank" className="p-2 bg-gray-900 rounded-full hover:bg-white hover:text-black transition-all"><Twitter size={18}/></a>
            </div>
          </div>

          {/* COLUNA 2: NAVEGAÇÃO (Links para Home) */}
          <div>
            <h4 className="font-bold text-lg mb-6">Loja</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {/* Como é "Single Page", mandamos para a Home */}
              <li><Link href="/" className="hover:text-white transition-colors">Início</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Lançamentos</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Coleções</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Outlet</Link></li>
            </ul>
          </div>

          {/* COLUNA 3: INSTITUCIONAL (Links para a página Sobre) */}
          <div>
            <h4 className="font-bold text-lg mb-6">Suporte</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/sobre" className="hover:text-white transition-colors">Quem Somos</Link></li>
              <li><Link href="/sobre" className="hover:text-white transition-colors">Prazos de Entrega</Link></li>
              <li><Link href="/sobre" className="hover:text-white transition-colors">Trocas e Devoluções</Link></li>
              
              {/* LINK SECRETO DO ADMIN */}
              <li className="pt-4">
                  <Link href="/admin" className="hover:text-blue-400 transition-colors flex items-center gap-2 text-xs opacity-50 hover:opacity-100">
                      <Lock size={12}/> Área Restrita
                  </Link>
              </li>
            </ul>
          </div>

          {/* COLUNA 4: NEWSLETTER */}
          <div>
            <h4 className="font-bold text-lg mb-6">Novidades</h4>
            <p className="text-gray-400 text-sm mb-4">Cadastre-se para receber drops exclusivos.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Seu e-mail..." 
                className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-white text-sm"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white text-black rounded-md hover:bg-gray-200">
                <ArrowRight size={16}/>
              </button>
            </div>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">© 2024 G-Studio. Todos os direitos reservados.</p>
          <div className="flex items-center gap-3 opacity-50 grayscale hover:grayscale-0 transition-all">
             <div className="h-6 w-10 bg-white rounded flex items-center justify-center"><span className="text-[8px] font-bold text-black">VISA</span></div>
             <div className="h-6 w-10 bg-white rounded flex items-center justify-center"><span className="text-[8px] font-bold text-black">PIX</span></div>
          </div>
        </div>
      </div>
    </footer>
  );
}