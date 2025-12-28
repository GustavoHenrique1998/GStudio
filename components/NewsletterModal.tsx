"use client";

import React, { useEffect, useState } from 'react';
import { X, Mail, Gift, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // Passo 1: Email, Passo 2: Cupom
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Verifica se já foi fechado recentemente
    const hasSeenNewsletter = localStorage.getItem('@gstudio:newsletter_seen');
    if (!hasSeenNewsletter) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000); // Aparece após 5 segundos
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Salva que o usuário já viu (para não mostrar de novo hoje)
    localStorage.setItem('@gstudio:newsletter_seen', 'true');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Aqui você enviaria o email para seu banco de dados
    setStep(2); // Vai para a tela do cupom
    toast.success("E-mail cadastrado com sucesso!");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText("GSTUDIO10");
    setCopied(true);
    toast.success("Cupom copiado!", { icon: '🎟️' });
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Fundo Escuro */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* O Modal */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl"
          >
            {/* Botão Fechar */}
            <button onClick={handleClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-20">
              <X size={20} />
            </button>

            <div className="flex flex-col">
                {/* Lado Visual (Imagem ou Cor) */}
                <div className="h-32 bg-black flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-20"></div>
                    <div className="text-center relative z-10">
                        <Gift size={48} className="text-white mx-auto mb-2 animate-bounce" />
                        <h3 className="text-white font-black text-2xl tracking-tighter">PRIMEIRA COMPRA?</h3>
                    </div>
                    {/* Círculos decorativos */}
                    <div className="absolute -left-10 -top-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-50"></div>
                </div>

                {/* Conteúdo */}
                <div className="p-8 text-center">
                    {step === 1 ? (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ganhe 10% OFF</h2>
                            <p className="text-gray-500 text-sm mb-6">
                                Cadastre-se na nossa lista VIP e receba um cupom exclusivo para usar agora mesmo.
                            </p>
                            
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                                    <input 
                                        type="email" 
                                        placeholder="Seu melhor e-mail" 
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg">
                                    QUERO MEU DESCONTO
                                </button>
                            </form>
                            <p className="text-xs text-gray-400 mt-4">Prometemos zero spam. Apenas drops exclusivos.</p>
                        </>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Aí sim! 🎉</h2>
                            <p className="text-gray-500 text-sm mb-6">
                                Seu cupom foi desbloqueado. Copie e cole no carrinho.
                            </p>
                            
                            <div 
                                onClick={copyToClipboard}
                                className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-black hover:bg-gray-50 transition-all group"
                            >
                                <span className="font-mono font-black text-xl text-gray-800 tracking-widest">GSTUDIO10</span>
                                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                                    {copied ? <Check size={20} className="text-green-500"/> : <Copy size={20} className="text-gray-600"/>}
                                </div>
                            </div>
                            
                            <button onClick={handleClose} className="w-full mt-6 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition-colors">
                                IR PARA A LOJA
                            </button>
                        </div>
                    )}
                </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}