import React from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Coluna 1 - Marca */}
          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold tracking-tighter">G-STUDIO</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Redefinindo o streetwear com exclusividade e qualidade premium. Seu estilo, nossa missão.
            </p>
            <div className="flex gap-4 pt-2">
              <div className="bg-gray-800 p-2 rounded-full hover:bg-white hover:text-black transition-colors cursor-pointer"><Instagram size={18} /></div>
              <div className="bg-gray-800 p-2 rounded-full hover:bg-white hover:text-black transition-colors cursor-pointer"><Twitter size={18} /></div>
              <div className="bg-gray-800 p-2 rounded-full hover:bg-white hover:text-black transition-colors cursor-pointer"><Facebook size={18} /></div>
            </div>
          </div>

          {/* Coluna 2 - Links */}
          <div>
            <h4 className="font-bold mb-6 text-lg">Loja</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="hover:text-white cursor-pointer transition-colors">Lançamentos</li>
              <li className="hover:text-white cursor-pointer transition-colors">Coleção de Verão</li>
              <li className="hover:text-white cursor-pointer transition-colors">Mais Vendidos</li>
              <li className="hover:text-white cursor-pointer transition-colors">Ofertas</li>
            </ul>
          </div>

          {/* Coluna 3 - Suporte */}
          <div>
            <h4 className="font-bold mb-6 text-lg">Suporte</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="hover:text-white cursor-pointer transition-colors">Rastrear Pedido</li>
              <li className="hover:text-white cursor-pointer transition-colors">Trocas e Devoluções</li>
              <li className="hover:text-white cursor-pointer transition-colors">Guia de Tamanhos</li>
              <li className="hover:text-white cursor-pointer transition-colors">Fale Conosco</li>
            </ul>
          </div>

          {/* Coluna 4 - Pagamento */}
          <div>
            <h4 className="font-bold mb-6 text-lg">Pagamento Seguro</h4>
            <p className="text-gray-400 text-sm mb-4">Aceitamos todas as bandeiras e Pix.</p>
            <div className="flex gap-2 opacity-70">
               {/* Simulação de ícones de cartão */}
               <div className="w-10 h-6 bg-gray-700 rounded"></div>
               <div className="w-10 h-6 bg-gray-700 rounded"></div>
               <div className="w-10 h-6 bg-gray-700 rounded"></div>
               <div className="w-10 h-6 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">© 2025 G-Studio Inc. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-gray-500 text-xs">
            <span className="cursor-pointer hover:text-white">Privacidade</span>
            <span className="cursor-pointer hover:text-white">Termos</span>
          </div>
        </div>
      </div>
    </footer>
  );
}