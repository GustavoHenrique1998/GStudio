"use client";
import React from 'react';
import { Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/5516993326508?text=Olá! Vim pelo site da G-Studio."
      target="_blank"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors"
    >
      <Phone size={28} fill="white" />
      <span className="absolute right-0 top-0 -mt-1 -mr-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
    </motion.a>
  );
}