"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { 
  Trash2, Plus, Image as ImageIcon, Loader2, X, UploadCloud, 
  LayoutDashboard, Package, Pencil, Store, Lock, LogOut, Search 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const supabase = createClient(
  "https://ngnzibntpncdcrkoktus.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbnppYm50cG5jZGNya29rdHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MDM2MzksImV4cCI6MjA4MTM3OTYzOX0.OujKy3UrxekqE47FWm9mBHKVmNtVxEY-GILQDJCHv3I"
);

// Tipagem
interface Product {
  id: number;
  name: string;
  price: string;
  category: string;
  image_url: string;
  gallery: string[];
  stock: number;
  sizes: string[] | string;
}

const CLOTHING_SIZES = ["PP", "P", "M", "G", "GG", "XG", "ÚNICO"];
const SHOE_SIZES = ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"];

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // <--- ESTADO DA BUSCA
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products'>('dashboard');
  
  // FORMULÁRIO
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [category, setCategory] = useState("Streetwear");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sizeType, setSizeType] = useState<'roupa' | 'calcado'>('roupa');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProducts();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProducts();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('produtos').select('*').order('id', { ascending: false });
    if (data) setProducts(data);
  }

  // FILTRO INTELIGENTE
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- FUNÇÕES DE LOGIN/LOGOUT ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAuth(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error("Email ou senha incorretos."); } else { toast.success("Bem-vindo!"); }
    setLoadingAuth(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    toast.success("Saiu com sucesso.");
  };

  // --- HELPERS ---
  const parsePrice = (priceStr: string) => { try { return parseFloat(priceStr.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || 0; } catch { return 0; } };
  const totalStockValue = products.reduce((acc, curr) => acc + (parsePrice(curr.price) * (curr.stock || 0)), 0);
  const totalItems = products.reduce((acc, curr) => acc + (curr.stock || 0), 0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };
  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) { setSelectedSizes(prev => prev.filter(s => s !== size)); } 
    else { setSelectedSizes(prev => [...prev, size]); }
  };

  const handleEdit = (product: Product) => {
    setActiveTab('products');
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price);
    setStock(product.stock?.toString() || "0");
    setCategory(product.category);
    
    let loadedSizes: string[] = [];
    if (Array.isArray(product.sizes)) { loadedSizes = product.sizes; } 
    else if (typeof product.sizes === 'string') { loadedSizes = (product.sizes as string).split(',').map(s => s.trim()); }
    setSelectedSizes(loadedSizes);
    
    if (loadedSizes.some(s => parseInt(s) > 30)) { setSizeType('calcado'); } else { setSizeType('roupa'); }
    
    setSelectedFiles([]); setPreviewUrls([]); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null); setName(""); setPrice(""); setStock("10"); setCategory("Streetwear");
    setSelectedSizes([]); setSizeType('roupa'); setSelectedFiles([]); setPreviewUrls([]);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock || selectedSizes.length === 0) { toast.error("Preencha tudo e selecione tamanhos."); return; }

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
        for (const file of selectedFiles) {
            const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
            const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from('images').getPublicUrl(fileName);
            uploadedUrls.push(data.publicUrl);
        }

        const productData = { name, price, category, stock: parseInt(stock), sizes: selectedSizes };

        if (editingId) {
            const updatePayload: any = { ...productData };
            if (uploadedUrls.length > 0) {
                updatePayload.image_url = uploadedUrls[0];
                updatePayload.gallery = uploadedUrls.slice(1);
            }
            await supabase.from('produtos').update(updatePayload).eq('id', editingId);
            toast.success("Atualizado!");
        } else {
            if (selectedFiles.length === 0) { toast.error("Adicione foto."); setIsUploading(false); return; }
            await supabase.from('produtos').insert([{ ...productData, image_url: uploadedUrls[0], gallery: uploadedUrls.slice(1) }]);
            toast.success("Criado!");
        }
        handleCancelEdit(); fetchProducts();
    } catch (error) { console.error(error); toast.error("Erro ao salvar."); } finally { setIsUploading(false); }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Tem certeza?")) return;
    await supabase.from('produtos').delete().eq('id', id);
    toast.success("Removido.");
    fetchProducts();
  };

  // --- TELA DE LOGIN ---
  if (!session) {
      return (
          <div className="min-h-screen bg-black flex items-center justify-center p-6">
              <Toaster position="bottom-right"/>
              <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"><Lock size={32} className="text-black"/></div>
                  <h1 className="text-2xl font-black mb-2">Login Admin</h1>
                  <p className="text-gray-500 mb-6 text-sm">Entre com suas credenciais do Supabase.</p>
                  <form onSubmit={handleLogin} className="space-y-4">
                      <div className="text-left"><label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-black outline-none transition-all" placeholder="admin@loja.com"/></div>
                      <div className="text-left"><label className="text-xs font-bold text-gray-500 uppercase ml-1">Senha</label><input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-black outline-none transition-all" placeholder="******"/></div>
                      <button disabled={loadingAuth} type="submit" className="w-full bg-black text-white font-bold py-3 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50">{loadingAuth ? "Entrando..." : "ACESSAR SISTEMA"}</button>
                  </form>
                  <Link href="/" className="block mt-6 text-xs text-gray-400 hover:text-black underline">Voltar para a Loja</Link>
              </div>
          </div>
      );
  }

  // --- PAINEL LOGADO ---
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex flex-col md:flex-row">
      <Toaster position="bottom-right"/>
      
      {/* MENU MOBILE */}
      <div className="md:hidden bg-black text-white p-4 sticky top-0 z-50 flex justify-between items-center shadow-md">
          <h1 className="font-black text-lg">G-ADMIN</h1>
          <div className="flex gap-4">
              <button onClick={() => setActiveTab('dashboard')} className={`text-xs font-bold px-3 py-2 rounded-full transition-colors ${activeTab === 'dashboard' ? 'bg-white text-black' : 'text-gray-400'}`}>Visão Geral</button>
              <button onClick={() => setActiveTab('products')} className={`text-xs font-bold px-3 py-2 rounded-full transition-colors ${activeTab === 'products' ? 'bg-white text-black' : 'text-gray-400'}`}>Produtos</button>
          </div>
          <button onClick={handleLogout} className="bg-red-900/50 p-2 rounded-lg text-red-200"><LogOut size={18}/></button>
      </div>

      {/* SIDEBAR PC */}
      <aside className="w-64 bg-black text-white hidden md:flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-gray-800"><h1 className="text-2xl font-black tracking-tighter">G-ADMIN.</h1><p className="text-xs text-gray-500 mt-1">Gestão de Loja</p></div>
        <nav className="flex-1 p-4 space-y-2">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-white text-black font-bold' : 'text-gray-400 hover:bg-gray-900'}`}><LayoutDashboard size={20}/> Visão Geral</button>
            <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'products' ? 'bg-white text-black font-bold' : 'text-gray-400 hover:bg-gray-900'}`}><Package size={20}/> Produtos / Estoque</button>
        </nav>
        <div className="p-4 space-y-2 border-t border-gray-800">
            <div className="px-2 text-xs text-gray-500 truncate mb-2">Logado como: {session.user.email}</div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-900/20 text-red-400 px-4 py-3 rounded-xl font-bold hover:bg-red-900/40 transition-colors"><LogOut size={18}/> Sair</button>
            <Link href="/" className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"><Store size={18}/> Ir para a Loja</Link>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-6 md:p-10 relative">
        {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div><h2 className="text-3xl font-bold mb-2">Painel de Controle</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><p className="text-sm text-gray-500 font-bold uppercase">Patrimônio</p><p className="text-2xl font-black">{totalStockValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div>
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 hover:border-black cursor-pointer" onClick={() => setActiveTab('products')}><div className="bg-black text-white p-3 rounded-full"><Plus size={24} /></div><p className="font-bold">Cadastrar Novo Produto</p></div>
                </div>
            </div>
        )}

        {activeTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right-4 duration-500">
                
                {/* FORMULÁRIO */}
                <div className="lg:col-span-1 order-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
                        <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold flex items-center gap-2">{editingId ? "Editar Produto" : "Novo Cadastro"}</h2>{editingId && <button onClick={handleCancelEdit} className="text-xs text-red-500 underline font-bold">Cancelar</button>}</div>
                        <form onSubmit={handleSaveProduct} className="space-y-4">
                            <div><label className="text-xs font-bold text-gray-500 uppercase">Nome</label><input value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:border-black outline-none" placeholder="Ex: Tênis Nike..." /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-500 uppercase">Preço</label><input value={price} onChange={e => setPrice(e.target.value)} className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:border-black outline-none" placeholder="R$ 0,00" /></div>
                                <div><label className="text-xs font-bold text-gray-500 uppercase">Estoque</label><input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:border-black outline-none" /></div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Categoria</label>
                                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:border-black outline-none bg-white">
                                    <option>Streetwear</option><option>Casual</option><option>Esporte</option><option>Acessórios</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 flex justify-between">
                                    Tamanhos
                                    <div className="flex gap-2 text-[10px]">
                                        <button type="button" onClick={() => setSizeType('roupa')} className={`px-2 py-0.5 rounded ${sizeType==='roupa'?'bg-black text-white':'bg-gray-200'}`}>Roupas</button>
                                        <button type="button" onClick={() => setSizeType('calcado')} className={`px-2 py-0.5 rounded ${sizeType==='calcado'?'bg-black text-white':'bg-gray-200'}`}>Calçados</button>
                                    </div>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {(sizeType === 'roupa' ? CLOTHING_SIZES : SHOE_SIZES).map(size => (
                                        <button key={size} type="button" onClick={() => toggleSize(size)} className={`w-8 h-8 rounded text-xs font-bold transition-all ${selectedSizes.includes(size) ? 'bg-black text-white scale-110' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>{size}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{editingId ? "Substituir Fotos" : "Fotos"}</label>
                                <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                                    <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-black transition-colors"><UploadCloud size={24}/><span className="text-xs font-medium">Arraste aqui</span></div>
                                </div>
                            </div>
                            {previewUrls.length > 0 && (<div className="flex gap-2 overflow-x-auto pb-1">{previewUrls.map((url, i) => (<div key={i} className="relative w-12 h-12 shrink-0 rounded-md overflow-hidden border border-gray-200 group"><img src={url} className="w-full h-full object-cover" /><button type="button" onClick={() => removeFile(i)} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><X size={12}/></button></div>))}</div>)}
                            <button disabled={isUploading} type="submit" className={`w-full text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2 ${editingId ? 'bg-orange-600' : 'bg-black'}`}>{isUploading ? <Loader2 className="animate-spin" size={16}/> : (editingId ? "Atualizar" : "Salvar")}</button>
                        </form>
                    </div>
                </div>

                {/* TABELA COM BUSCA */}
                <div className="lg:col-span-2 order-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        
                        {/* HEADER DA TABELA COM INPUT DE BUSCA */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-700">Catálogo</h3>
                                <span className="text-xs font-bold bg-black text-white px-2 py-1 rounded">{filteredProducts.length} itens</span>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Buscar produto..." 
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs sticky top-0 z-10"><tr><th className="p-4">Produto</th><th className="p-4">Preço</th><th className="p-4 text-center">Estoque</th><th className="p-4 text-right">Ações</th></tr></thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredProducts.map(prod => (
                                        <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 flex items-center gap-3"><div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">{prod.image_url ? <img src={prod.image_url} className="w-full h-full object-cover"/> : <ImageIcon size={16} className="m-auto text-gray-300"/>}</div><span className="font-bold text-gray-900 line-clamp-1">{prod.name}</span></td>
                                            <td className="p-4 text-gray-600">{prod.price}</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${ (prod.stock || 0) > 5 ? 'bg-green-100 text-green-700' : (prod.stock || 0) > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600' }`}>
                                                    {(prod.stock || 0) > 0 ? `${prod.stock} un` : 'ESGOTADO'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => handleEdit(prod)} className="bg-orange-50 text-orange-600 p-2 rounded-lg hover:bg-orange-100"><Pencil size={16}/></button><button onClick={() => handleDelete(prod.id)} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100"><Trash2 size={16}/></button></div></td>
                                        </tr>
                                    ))}
                                    {filteredProducts.length === 0 && <tr className="text-center"><td colSpan={4} className="p-8 text-gray-400">Nenhum produto encontrado.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}