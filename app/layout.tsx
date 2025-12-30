import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import CartSidebar from "../components/CartSidebar";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
import TopBar from "../components/TopBar"; // <--- IMPORTADO AQUI

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "G-STUDIO | Streetwear Premium",
  description: "Moda streetwear exclusiva.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <CartProvider>
            {/* 1. Barra de Anúncios (Topo de tudo) */}
            <TopBar />
            
            {/* 2. Elementos Flutuantes/Globais */}
            <CartSidebar />
            <WhatsAppButton />
            
            {/* 3. Conteúdo da Página (Home, Produto, etc) */}
            {children}
            
            {/* 4. Rodapé */}
            <Footer />
        </CartProvider>
      </body>
    </html>
  );
}