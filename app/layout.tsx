import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
// 1. IMPORTAR O CONTEXTO
import { CartProvider } from "./context/CartContext"; 
import CartSidebar from "../components/CartSidebar"; // <--- NOVO

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "G-Studio | Streetwear",
  description: "A melhor loja de streetwear do Brasil.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <CartProvider>
            <CartSidebar /> {/* <--- ADICIONE AQUI! Ele fica invisível até ser chamado */}
            
            {children}
            
            <WhatsAppButton />
            <Footer />
        </CartProvider>
      </body>
    </html>
  );
}