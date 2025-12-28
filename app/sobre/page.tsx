"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Truck, MessageCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Botão Voltar */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black mb-8 transition-colors">
          <ArrowLeft size={18} /> Voltar para Loja
        </Link>

        <h1 className="text-4xl font-black mb-2">Central de Ajuda</h1>
        <p className="text-gray-500 mb-12 text-lg">Tudo o que você precisa saber sobre a G-Studio.</p>

        {/* Seção 1: Sobre */}
        <section className="mb-12 border-b border-gray-100 pb-12">
          <div className="flex items-center gap-3 mb-4 text-black">
             <div className="p-2 bg-gray-100 rounded-lg"><MessageCircle size={24}/></div>
             <h2 className="text-2xl font-bold">Quem somos?</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            A G-Studio nasceu da necessidade de expressão. Não vendemos apenas roupas, vendemos atitude. 
            Nossa curadoria é feita para quem busca exclusividade e qualidade premium em cada costura.
            Todas as nossas peças são selecionadas a dedo para garantir o melhor do streetwear mundial.
          </p>
        </section>

        {/* Seção 2: Entregas */}
        <section className="mb-12 border-b border-gray-100 pb-12">
          <div className="flex items-center gap-3 mb-4 text-green-600">
             <div className="p-2 bg-green-50 rounded-lg"><Truck size={24}/></div>
             <h2 className="text-2xl font-bold text-gray-900">Envios e Prazos</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            📦 <strong>Envio Imediato:</strong> Pedidos confirmados até as 14h são despachados no mesmo dia.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Sedex: 2 a 4 dias úteis (Capitais).</li>
            <li>PAC: 5 a 10 dias úteis (Interior).</li>
            <li>Motoboy: Entrega no mesmo dia para SP Capital.</li>
          </ul>
        </section>

        {/* Seção 3: Trocas */}
        <section>
          <div className="flex items-center gap-3 mb-4 text-purple-600">
             <div className="p-2 bg-purple-50 rounded-lg"><ShieldCheck size={24}/></div>
             <h2 className="text-2xl font-bold text-gray-900">Trocas e Devoluções</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Não serviu ou não curtiu? Sem problemas.
            Você tem até <strong>7 dias corridos</strong> após o recebimento para solicitar a devolução ou troca.
            A primeira troca é por nossa conta! O produto deve estar com a etiqueta e sem sinais de uso.
          </p>
        </section>

      </div>
    </div>
  );
}