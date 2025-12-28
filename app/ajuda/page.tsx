"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Truck, CreditCard, Mail } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 font-sans text-gray-900">
      
      {/* Cabeçalho */}
      <div className="max-w-4xl mx-auto px-6 mb-12 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black mb-6 transition-colors">
          <ArrowLeft size={16}/> Voltar para a Loja
        </Link>
        <h1 className="text-4xl font-black mb-4">Central de Ajuda</h1>
        <p className="text-gray-500">Tire suas dúvidas sobre envios, trocas e pagamentos.</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 space-y-8">
        
        {/* Bloco 1: Trocas */}
        <section id="trocas" className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><RefreshCw size={24}/></div>
                <h2 className="text-xl font-bold">Trocas e Devoluções</h2>
            </div>
            <div className="text-gray-600 space-y-3 leading-relaxed">
                <p><strong>1. Prazo:</strong> Você tem até 7 dias corridos após o recebimento para devolução por arrependimento, ou 30 dias para trocas por defeito.</p>
                <p><strong>2. Custo:</strong> A primeira troca é gratuita! Geramos um código de postagem reversa.</p>
                <p><strong>3. Condição:</strong> O produto deve estar com a etiqueta e sem sinais de uso.</p>
            </div>
        </section>

        {/* Bloco 2: Envios */}
        <section id="envios" className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Truck size={24}/></div>
                <h2 className="text-xl font-bold">Prazos e Envios</h2>
            </div>
            <div className="text-gray-600 space-y-3 leading-relaxed">
                <p>Enviamos para todo o Brasil via Correios.</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Sedex:</strong> 2 a 5 dias úteis.</li>
                    <li><strong>PAC:</strong> 5 a 12 dias úteis.</li>
                </ul>
                <p className="text-sm mt-2 text-gray-400">*O prazo conta após a confirmação do pagamento.</p>
            </div>
        </section>

        {/* Bloco 3: Pagamento */}
        <section id="pagamento" className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><CreditCard size={24}/></div>
                <h2 className="text-xl font-bold">Formas de Pagamento</h2>
            </div>
            <div className="text-gray-600 space-y-3 leading-relaxed">
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>PIX:</strong> Aprovação imediata com 5% de desconto.</li>
                    <li><strong>Cartão de Crédito:</strong> Parcelamento em até 12x.</li>
                </ul>
            </div>
        </section>

        {/* Contato Final */}
        <div className="text-center mt-12 pt-12 border-t border-gray-200">
            <h3 className="font-bold text-lg mb-2">Ainda precisa de ajuda?</h3>
            <a 
                href="https://wa.me/5516999999999" // SEU ZAP AQUI
                target="_blank"
                className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform"
            >
                <Mail size={20}/> Falar com Suporte
            </a>
        </div>

      </div>
    </div>
  );
}