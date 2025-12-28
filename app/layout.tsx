import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import CartSidebar from "../components/CartSidebar";
import TopBar from "../components/TopBar"; // Se estiver usando
import Footer from "../components/Footer"; // Se estiver usando

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "G-STUDIO | Streetwear Premium",
  description: "A melhor loja de streetwear do Brasil. Tênis, Roupas e Acessórios exclusivos.",
  icons: {
    icon: "/favicon.ico", // Você pode trocar o ícone depois colocando um arquivo na pasta public
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
            {/* O CartSidebar e TopBar ficam aqui para aparecer em todas as páginas */}
            <TopBar />
            <CartSidebar />
            
            {children}
            
            <Footer />
        </CartProvider>
      </body>
    </html>
  );
}