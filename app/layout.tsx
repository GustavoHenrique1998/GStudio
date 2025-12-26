import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { CartProvider } from "./context/CartContext";
import CartSidebar from "@/components/CartSidebar";
import { Toaster } from 'react-hot-toast'; // <--- IMPORTANTE

const inter = Inter({ subsets: ["latin"] });

// --- CONFIGURAÇÃO DE SEO E WHATSAPP ---
export const metadata: Metadata = {
  title: "G-Studio | Streetwear Premium",
  description: "A melhor loja de streetwear do Brasil. Encontre Nike, Adidas e coleções exclusivas com o melhor preço.",
  openGraph: {
    title: "G-Studio | Streetwear Premium",
    description: "A melhor loja de streetwear do Brasil. Confira as novidades!",
    url: "https://g-studio-red.vercel.app", // Coloque o link final da sua Vercel aqui depois
    siteName: "G-Studio",
    locale: "pt_BR",
    type: "website",
    // Se quiser uma foto de capa no Zap, coloque uma imagem chamada 'og-image.jpg' na pasta public
    // images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <CartProvider>
            {/* O Toaster fica aqui, invisível, esperando ordens */}
            <Toaster position="top-center" reverseOrder={false} />
            
            <CartSidebar />
            
            {children}
            
            <WhatsAppButton />
            <Footer />
        </CartProvider>
      </body>
    </html>
  );
}