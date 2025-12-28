import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google"; 
import "./globals.css";
import WhatsAppButton from "@/components/WhatsAppButton";
import { CartProvider } from "./context/CartContext"; 
import CartSidebar from "@/components/CartSidebar"; 
import Footer from "@/components/Footer"; 
import NewsletterModal from "@/components/NewsletterModal";
import WishlistSidebar from "./wishlist/page";
// 👇 IMPORTAR A TOPBAR
import TopBar from "@/components/TopBar"; 
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const montserrat = Montserrat({ subsets: ["latin"], weight: ['400', '700', '900'], variable: '--font-montserrat' });

export const metadata: Metadata = {
  title: "G-Studio | Streetwear Premium",
  description: "Loja oficial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${inter.variable} ${montserrat.variable} font-sans antialiased bg-gray-50`}>
        <CartProvider>
            <Toaster position="top-center" />
            
            {/* 👇 TOPBAR FICA AQUI, NO TOPO DE TUDO */}
            <TopBar />

            <NewsletterModal /> 
            <CartSidebar /> 
            <WishlistSidebar /> 
            
            {/* Adicionei padding-top na div principal para compensar a altura do TopBar se necessário, 
                mas como a Navbar é fixed, o TopBar vai ficar acima dela naturalmente se ajustar o CSS da Navbar */}
            <div className="min-h-screen">
               {children}
            </div>

            <WhatsAppButton />
            <Footer />
            
        </CartProvider>
      </body>
    </html>
  );
}