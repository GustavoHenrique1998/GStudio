"use client";

import React from 'react';
import { Truck } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="bg-black text-white text-[10px] md:text-xs font-bold py-2.5 px-4 text-center tracking-widest uppercase flex items-center justify-center gap-2 z-50 relative border-b border-gray-900">
        <Truck size={14} className="text-white"/>
        <span>Frete Grátis para todo Brasil em compras acima de R$ 299</span>
    </div>
  );
}