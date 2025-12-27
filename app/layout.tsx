import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google"; 
import "./globals.css";
import WhatsAppButton from "@/components/WhatsAppButton";
import { CartProvider } from "./context/CartContext";
import CartSidebar from "@/components/CartSidebar";
import { Toaster } from 'react-hot-toast';
import { Instagram, Facebook, Twitter, ShieldCheck, Mail, MapPin, Phone } from 'lucide-react';

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
            
            {/* TOP BAR */}
            <div className="bg-black text-white text-[10px] md:text-xs font-bold py-2 text-center tracking-widest uppercase flex justify-center gap-4">
                <span className="animate-pulse">🚚 Frete Grátis acima de R$ 299</span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">💳 Parcelamento em até 12x</span>
                <span className="hidden md:inline">•</span>
                <span>📦 Envio para todo Brasil</span>
            </div>

            <CartSidebar />
            
            {children}
            
            <WhatsAppButton />
            
            {/* RODAPÉ EVOLUÍDO */}
            <footer className="bg-white border-t border-gray-200 pt-16 pb-8 mt-20 text-gray-600">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    
                    {/* 1. SOBRE A MARCA */}
                    <div className="space-y-4">
                        <h3 className="font-black text-2xl tracking-tighter text-black">G-STUDIO.</h3>
                        <p className="text-sm leading-relaxed">
                            Nascida nas ruas, feita para o mundo. A G-Studio conecta você às tendências globais do streetwear com exclusividade e atitude.
                        </p>
                        <div className="flex gap-3 pt-2">
                            <button className="bg-gray-100 p-2.5 rounded-full hover:bg-black hover:text-white transition-colors"><Instagram size={18}/></button>
                            <button className="bg-gray-100 p-2.5 rounded-full hover:bg-black hover:text-white transition-colors"><Facebook size={18}/></button>
                            <button className="bg-gray-100 p-2.5 rounded-full hover:bg-black hover:text-white transition-colors"><Twitter size={18}/></button>
                        </div>
                    </div>

                    {/* 2. INSTITUCIONAL */}
                    <div>
                        <h4 className="font-bold text-black text-sm uppercase tracking-wider mb-5">Institucional</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="hover:text-black hover:underline cursor-pointer transition-colors">Quem Somos</li>
                            <li className="hover:text-black hover:underline cursor-pointer transition-colors">Guia de Tamanhos</li>
                            <li className="hover:text-black hover:underline cursor-pointer transition-colors">Política de Privacidade</li>
                            <li className="hover:text-black hover:underline cursor-pointer transition-colors">Termos de Uso</li>
                        </ul>
                    </div>

                    {/* 3. ATENDIMENTO */}
                    <div>
                        <h4 className="font-bold text-black text-sm uppercase tracking-wider mb-5">Atendimento</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <Mail size={18} className="text-black shrink-0" />
                                <span>
                                    <span className="block font-bold text-black">E-mail</span>
                                    suporte@gstudio.com.br
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone size={18} className="text-black shrink-0" />
                                <span>
                                    <span className="block font-bold text-black">WhatsApp</span>
                                    (11) 99999-9999
                                </span>
                            </li>
                            <li className="text-xs text-gray-400 mt-2">
                                Seg. a Sex. das 9h às 18h
                            </li>
                        </ul>
                    </div>

                    {/* 4. PAGAMENTO E SEGURANÇA */}
                    <div>
                        <h4 className="font-bold text-black text-sm uppercase tracking-wider mb-5">Pagamento & Segurança</h4>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                            {['Visa', 'Master', 'Elo', 'Hiper', 'Pix', 'Boleto'].map((pay) => (
                                <div key={pay} className="border border-gray-200 px-3 py-1 rounded text-xs font-bold text-gray-500 bg-gray-50">
                                    {pay}
                                </div>
                            ))}
                        </div>

                        <div className="bg-green-50 border border-green-100 p-3 rounded-lg flex items-center gap-3">
                            <ShieldCheck className="text-green-600" size={24} />
                            <div>
                                <p className="text-xs font-bold text-green-800">Compra 100% Segura</p>
                                <p className="text-[10px] text-green-700">Seus dados estão protegidos.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RODAPÉ INFERIOR (CNPJ) */}
                <div className="border-t border-gray-200 pt-8 mt-8">
                    <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400 text-center md:text-left">
                        <div>
                            <p>© 2024 G-Studio Streetwear Ltda.</p>
                            <p>CNPJ: 00.000.000/0001-00 • Rua da Moda, 123 - São Paulo/SP</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Desenvolvido com</span>
                            <span className="text-red-500">♥</span>
                            <span>por G-Studio Tech</span>
                        </div>
                    </div>
                </div>
            </footer>

        </CartProvider>
      </body>
    </html>
  );
}