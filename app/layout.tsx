import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google"; // Adicionei Montserrat para títulos
import "./globals.css";
import WhatsAppButton from "@/components/WhatsAppButton";
import { CartProvider } from "./context/CartContext";
import CartSidebar from "@/components/CartSidebar";
import { Toaster } from 'react-hot-toast';
import { Instagram, Facebook, Twitter, CreditCard, Truck, ShieldCheck } from 'lucide-react'; // Ícones novos

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const montserrat = Montserrat({ subsets: ["latin"], weight: ['400', '700', '900'], variable: '--font-montserrat' });

export const metadata: Metadata = {
  title: "G-Studio | Streetwear Premium",
  description: "A melhor loja de streetwear do Brasil.",
  openGraph: {
    title: "G-Studio | Streetwear Premium",
    description: "Confira as novidades!",
    url: "https://g-studio-red.vercel.app",
    siteName: "G-Studio",
    locale: "pt_BR",
    type: "website",
  },
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
            <Toaster position="top-center" reverseOrder={false} />
            
            {/* 1. BARRA DE ANÚNCIOS (TOP BAR) */}
            <div className="bg-black text-white text-[10px] md:text-xs font-bold py-2 text-center tracking-widest uppercase flex justify-center gap-4">
                <span className="animate-pulse">🚚 Frete Grátis para todo Brasil</span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">💳 Em até 12x sem juros</span>
            </div>

            <CartSidebar />
            
            {children}
            
            <WhatsAppButton />
            
            {/* 2. RODAPÉ PROFISSIONAL (FOOTER) */}
            <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-6 mt-20">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    
                    {/* Coluna Marca */}
                    <div className="space-y-4">
                        <h3 className="font-black text-xl tracking-tighter">G-STUDIO.</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Redefinindo o streetwear com peças exclusivas e qualidade premium para quem tem atitude.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <button className="bg-gray-100 p-2 rounded-full hover:bg-black hover:text-white transition-colors"><Instagram size={18}/></button>
                            <button className="bg-gray-100 p-2 rounded-full hover:bg-black hover:text-white transition-colors"><Facebook size={18}/></button>
                            <button className="bg-gray-100 p-2 rounded-full hover:bg-black hover:text-white transition-colors"><Twitter size={18}/></button>
                        </div>
                    </div>

                    {/* Coluna Links */}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Institucional</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li className="hover:text-black cursor-pointer">Sobre Nós</li>
                            <li className="hover:text-black cursor-pointer">Guia de Medidas</li>
                            <li className="hover:text-black cursor-pointer">Política de Trocas</li>
                            <li className="hover:text-black cursor-pointer">Fale Conosco</li>
                        </ul>
                    </div>

                    {/* Coluna Ajuda */}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Ajuda</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li className="hover:text-black cursor-pointer">Acompanhar Pedido</li>
                            <li className="hover:text-black cursor-pointer">Fretes e Entregas</li>
                            <li className="hover:text-black cursor-pointer">Minha Conta</li>
                        </ul>
                    </div>

                    {/* Coluna Pagamento/Segurança */}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Compra Segura</h4>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <ShieldCheck className="text-green-600" size={20} /> Site Blindado
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <Truck className="text-blue-600" size={20} /> Entrega Garantida
                            </div>
                            <div className="flex gap-2 mt-2">
                                {/* Ícones de Cartão Fake para visual */}
                                <div className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-400">VISA</div>
                                <div className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-400">MASTER</div>
                                <div className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-green-600">PIX</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 text-center">
                    <p className="text-xs text-gray-400">© 2024 G-Studio. Todos os direitos reservados.</p>
                </div>
            </footer>

        </CartProvider>
      </body>
    </html>
  );
}