import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google"; 
import "./globals.css";
import WhatsAppButton from "@/components/WhatsAppButton";
// 👇 IMPORTANTE 1: Importar o Contexto e o Sidebar
import { CartProvider } from "./context/CartContext"; 
import CartSidebar from "@/components/CartSidebar"; 
import { Toaster } from 'react-hot-toast';

// ... (resto do código de fontes e metadata mantém igual) ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className="...">
        {/* 👇 IMPORTANTE 2: O Provider abraça tudo */}
        <CartProvider>
            <Toaster position="top-center" />
            
            {/* 👇 IMPORTANTE 3: O Sidebar TEM QUE ESTAR AQUI */}
            <CartSidebar /> 
            
            {children}
            
            <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}