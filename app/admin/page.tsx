"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { 
  Trash2, Plus, Image as ImageIcon, Loader2, X, UploadCloud, 
  LayoutDashboard, Package, Pencil, Store, Lock, LogOut, Search,
  ShoppingCart, CheckCircle, Clock, AlertTriangle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const supabase = createClient(
  "https://ngnzibntpncdcrkoktus.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbnppYm50cG5jZGNya29rdHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MDM2MzksImV4cCI6MjA4MTM3OTYzOX0.OujKy3UrxekqE47FWm9mBHKVmNtVxEY-GILQDJCHv3I"
);

// --- TIPAGEM ---
interface Product {
  id: number;
  name: string;
  price: string;
  category: string;
  image_url: string;
  stock: number;
  sizes: string[] | string;
}

interface Order {
  id: number;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  total_price: number;
  status: 'Pendente' | 'Aprovado' | 'Cancelado';
  items: any[]; // JSON com os produtos comprados
}

const CLOTHING_SIZES = ["PP", "P", "M", "G", "GG", "XG", "ÚNICO"];
const SHOE_SIZES = ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"];

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(false);

  // DADOS
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]); // <--- NOVO: Lista de Pedidos
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders'>('dashboard');
  const [searchTerm, setSearchTerm] = useState("");

  // FORMULÁRIO PRODUTO
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
      if (session) {
          fetchProducts();
          fetchOrders(); // <--- Carrega pedidos ao entrar
      }
    });
    // Monitora auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) { fetchProducts(); fetchOrders(); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('produtos').select('*').order('id', { ascending: false });
    if (data) setProducts(data);
  }

  async function fetchOrders() {
    // Busca pedidos ordenados do mais novo para o mais velho
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
  }

  // --- LÓGICA DE APROVAR PEDIDO (BAIXA DE ESTOQUE) ---
  const handleApproveOrder = async (order: Order) => {
    if (!confirm(`Confirmar pagamento de ${order.customer_name}? Isso vai baixar o estoque.`)) return;

    try {
        // 1. Atualiza status do pedido para 'Aprovado'
        const { error: orderError } = await supabase
            .from('orders')
            .update({ status: 'Aprovado' })
            .eq('id', order.id);
        
        if (orderError) throw orderError;

        // 2. Loop para baixar estoque de cada item
        // Nota: Em um sistema gigante faríamos isso via SQL (RPC), mas aqui via front funciona bem.
        for (const item of order.items) {
            // Busca o produto atual para saber o estoque atual
            const { data: currentProd } = await supabase.from('produtos').select('stock').eq('id', item.id).single();
            
            if (currentProd) {
                const newStock = Math.max(0, currentProd.stock - item.quantity);
                await supabase.from('produtos').update({ stock: newStock }).eq('id', item.id);
            }
        }

        toast.success("Pedido Aprovado e Estoque Atualizado!");
        fetchOrders();   // Recarrega lista de pedidos
        fetchProducts(); // Recarrega produtos para ver o estoque novo
    } catch (error) {
        console.error(error);
        toast.error("Erro ao aprovar pedido.");
    }
  };

  const handleDeleteOrder = async (id: number) => {
      if(!confirm("Excluir histórico deste pedido?")) return;
      await supabase.from('orders').delete().eq('id', id);
      toast.success("Pedido removido.");
      fetchOrders();
  };

  // --- LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoadingAuth(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error("Erro no login."); } else { toast.success("Bem-vindo!"); }
    setLoadingAuth(false);
  };
  const handleLogout = async () => { await supabase.auth.signOut(); setSession(null); };

  // --- FORMULÁRIOS ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock || selectedSizes.length === 0) { toast.error("Preencha tudo."); return; }
    setIsUploading(true);
    // ... (Logica de upload igual a anterior)
    try {
        const uploadedUrls: string[] = [];
        for (const file of selectedFiles) {
            const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
            await supabase.storage.from('images').upload(fileName, file);
            const { data } = supabase.storage.from('images').getPublicUrl(fileName);
            uploadedUrls.push(data.publicUrl);
        }
        const productData = { name, price, category, stock: parseInt(stock), sizes: selectedSizes };
        if (editingId) {
            const updatePayload: any = { ...productData };
            if (uploadedUrls.length > 0) { updatePayload.image_url = uploadedUrls[0]; updatePayload.gallery = uploadedUrls.slice(1); }
            await supabase.from('produtos').update(updatePayload).eq('id', editingId);
            toast.success("Atualizado!");
        } else {
            if (selectedFiles.length === 0) { toast.error("Falta foto."); setIsUploading(false); return; }
            await supabase.from('produtos').insert([{ ...productData, image_url: uploadedUrls[0], gallery: uploadedUrls.slice(1) }]);
            toast.success("Criado!");
        }
        handleCancelEdit(); fetchProducts();
    } catch (error) { console.error(error); toast.error("Erro."); } finally { setIsUploading(false); }
  };

  // Helpers de Edição
  const handleEdit = (p: Product) => {
      setActiveTab('products'); setEditingId(p.id); setName(p.name); setPrice(p.price); 
      setStock(p.stock.toString()); setCategory(p.category);
      // Tratamento seguro de array
      let loadedSizes: string[] = [];
      if (Array.isArray(p.sizes)) loadedSizes = p.sizes;
      else if (typeof p.sizes === 'string') loadedSizes = (p.sizes as string).split(',').map(s=>s.trim());
      setSelectedSizes(loadedSizes);
      if (loadedSizes.some(s => parseInt(s) > 30)) setSizeType('calcado'); else setSizeType('roupa');
      window.scrollTo(0,0);
  };
  const handleDelete = async (id: number) => { if(confirm("Deletar produto?")) { await supabase.from('produtos').delete().eq('id', id); fetchProducts(); } };
  const handleCancelEdit = () => { setEditingId(null); setName(""); setPrice(""); setStock("10"); setSelectedSizes([]); setSelectedFiles([]); setPreviewUrls([]); };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { if(e.target.files) { const f = Array.from(e.target.files); setSelectedFiles(prev=>[...prev,...f]); setPreviewUrls(prev=>[...prev, ...f.map(x=>URL.createObjectURL(x))]); } };
  const removeFile = (i: number) => { setSelectedFiles(p=>p.filter((_,x)=>x!==i)); setPreviewUrls(p=>p.filter((_,x)=>x!==i)); };
  const toggleSize = (s: string) => { setSelectedSizes(p => p.includes(s) ? p.filter(x=>x!==s) : [...p,s]); };
  
  // Totais
  const parsePrice = (s: string) => parseFloat(s.replace('R$','').replace(/\./g,'').replace(',','.')) || 0;
  const totalStockValue = products.reduce((acc, c) => acc + (parsePrice(c.price) * c.stock), 0);

  // TELA DE LOGIN
  if (!session) return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6"><Toaster/>
          <div className="bg-white p-8 rounded-3xl w-full max-w-sm text-center">
              <h1 className="text-2xl font-black mb-4">Login Admin</h1>
              <form onSubmit={handleLogin} className="space-y-4">
                  <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full border p-3 rounded-xl" placeholder="Email"/>
                  <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full border p-3 rounded-xl" placeholder="Senha"/>
                  <button type="submit" className="w-full bg-black text-white p-3 rounded-xl font-bold">{loadingAuth?"...":"Entrar"}</button>
              </form>
              <Link href="/" className="block mt-4 text-xs text-gray-400">Voltar a Loja</Link>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex flex-col md:flex-row"><Toaster position="bottom-right"/>
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-black text-white hidden md:flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-gray-800"><h1 className="text-2xl font-black">G-ADMIN.</h1></div>
        <nav className="flex-1 p-4 space-y-2">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab==='dashboard'?'bg-white text-black font-bold':'text-gray-400 hover:bg-gray-900'}`}><LayoutDashboard size={20}/> Visão Geral</button>
            <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab==='orders'?'bg-white text-black font-bold':'text-gray-400 hover:bg-gray-900'}`}><ShoppingCart size={20}/> Vendas / Pedidos</button>
            <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab==='products'?'bg-white text-black font-bold':'text-gray-400 hover:bg-gray-900'}`}><Package size={20}/> Produtos</button>
        </nav>
        <div className="p-4 border-t border-gray-800"><button onClick={handleLogout} className="w-full flex gap-2 justify-center bg-red-900/20 text-red-400 p-3 rounded-xl font-bold"><LogOut size={18}/> Sair</button></div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden bg-black text-white p-4 sticky top-0 z-50 flex justify-between items-center">
          <h1 className="font-black">G-ADMIN</h1>
          <div className="flex gap-2">
            <button onClick={()=>setActiveTab('dashboard')} className="p-2 bg-gray-800 rounded"><LayoutDashboard size={18}/></button>
            <button onClick={()=>setActiveTab('orders')} className="p-2 bg-gray-800 rounded"><ShoppingCart size={18}/></button>
            <button onClick={()=>setActiveTab('products')} className="p-2 bg-gray-800 rounded"><Package size={18}/></button>
            <button onClick={handleLogout} className="p-2 bg-red-900 rounded"><LogOut size={18}/></button>
          </div>
      </div>

      <main className="flex-1 md:ml-64 p-6 md:p-10">
        
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Faturamento (Aprovado)</p>
                    <p className="text-2xl font-black mt-1 text-green-600">
                        {orders.filter(o => o.status === 'Aprovado').reduce((acc, curr) => acc + (curr.total_price || 0), 0).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Pedidos Pendentes</p>
                    <p className="text-2xl font-black mt-1 text-orange-500">{orders.filter(o => o.status === 'Pendente').length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Valor em Estoque</p>
                    <p className="text-2xl font-black mt-1">{totalStockValue.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</p>
                </div>
            </div>
        )}

        {/* ABA DE PRODUTOS */}
        {activeTab === 'products' && (
             <div className="animate-in slide-in-from-right-4">
                
                {/* 1. FORMULÁRIO DE CADASTRO/EDIÇÃO (VOLTOU!) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 mb-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            {editingId ? <><Pencil size={18}/> Editar Produto</> : <><Plus size={18}/> Novo Produto</>}
                        </h2>
                        {editingId && <button onClick={handleCancelEdit} className="text-xs text-red-500 underline font-bold">Cancelar Edição</button>}
                    </div>

                    <form onSubmit={handleSaveProduct} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Nome do Produto</label>
                            <input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1 border border-gray-200 p-3 rounded-xl focus:border-black outline-none" placeholder="Ex: Camiseta Oversized..."/>
                        </div>
                        
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Preço</label>
                                <input value={price} onChange={e=>setPrice(e.target.value)} className="w-full mt-1 border border-gray-200 p-3 rounded-xl focus:border-black outline-none" placeholder="R$ 0,00"/>
                            </div>
                            <div className="w-1/2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Estoque</label>
                                <input type="number" value={stock} onChange={e=>setStock(e.target.value)} className="w-full mt-1 border border-gray-200 p-3 rounded-xl focus:border-black outline-none" placeholder="10"/>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Categoria</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full mt-1 border border-gray-200 p-3 rounded-xl bg-white focus:border-black outline-none">
                                <option>Streetwear</option><option>Casual</option><option>Esporte</option><option>Acessórios</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 flex justify-between">
                                Grade de Tamanhos
                                <div className="flex gap-2 text-[10px]">
                                    <button type="button" onClick={() => setSizeType('roupa')} className={`px-2 py-0.5 rounded ${sizeType==='roupa'?'bg-black text-white':'bg-gray-100'}`}>Roupas</button>
                                    <button type="button" onClick={() => setSizeType('calcado')} className={`px-2 py-0.5 rounded ${sizeType==='calcado'?'bg-black text-white':'bg-gray-100'}`}>Calçados</button>
                                </div>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {(sizeType==='roupa'?CLOTHING_SIZES:SHOE_SIZES).map(s=>(
                                    <button key={s} type="button" onClick={()=>toggleSize(s)} className={`h-10 w-10 text-xs font-bold border rounded-lg transition-all ${selectedSizes.includes(s)?'bg-black text-white border-black':'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                         <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{editingId ? "Substituir Fotos" : "Fotos do Produto"}</label>
                            <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors group">
                                <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-black">
                                    <UploadCloud size={24}/>
                                    <span className="text-xs font-bold">Clique ou arraste fotos aqui</span>
                                </div>
                            </div>
                        </div>

                        {/* Preview das imagens selecionadas */}
                        {previewUrls.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {previewUrls.map((url, i) => (
                                    <div key={i} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-gray-200 group">
                                        <img src={url} className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeFile(i)} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><X size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button disabled={isUploading} type="submit" className={`w-full text-white p-4 rounded-xl font-bold transition-transform active:scale-95 flex items-center justify-center gap-2 ${editingId ? 'bg-orange-600' : 'bg-black'}`}>
                            {isUploading ? <Loader2 className="animate-spin"/> : (editingId ? "Atualizar Produto" : "Cadastrar Produto")}
                        </button>
                    </form>
                </div>

                {/* 2. TABELA DE PRODUTOS (RESPONSIVA) */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                     <div className="p-4 border-b border-gray-100 bg-gray-50/50"><h3 className="font-bold text-gray-700">Catálogo Atual</h3></div>
                     <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 font-bold text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="p-4">Produto</th>
                                <th className="p-4 hidden md:table-cell">Preço</th>
                                <th className="p-4">Estoque</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map(p=>(
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-bold flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                            {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover"/> : <ImageIcon size={16} className="m-auto text-gray-300"/>}
                                        </div>
                                        <span className="line-clamp-1">{p.name}</span>
                                    </td>
                                    <td className="p-4 text-gray-500 hidden md:table-cell">{p.price}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${p.stock>5?'bg-green-100 text-green-700':p.stock>0?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-600'}`}>
                                            {p.stock} un
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={()=>handleEdit(p)} className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-colors"><Pencil size={16}/></button>
                                            <button onClick={()=>handleDelete(p.id)} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                     </table>
                     {products.length === 0 && <div className="p-8 text-center text-gray-400">Nenhum produto cadastrado.</div>}
                </div>
             </div>
        )}

        {/* ABA DE VENDAS / PEDIDOS */}
        {activeTab === 'orders' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Gestão de Pedidos</h2>
                    <button onClick={fetchOrders} className="text-sm flex items-center gap-1 text-gray-500 hover:text-black"><Clock size={14}/> Atualizar</button>
                </div>

                <div className="grid gap-4">
                    {orders.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">Nenhum pedido recebido ainda.</div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                                {/* Informações do Cliente */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${order.status === 'Aprovado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
                                            {order.status}
                                        </span>
                                        <span className="text-xs text-gray-400">#{order.id} • {new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <h3 className="font-bold text-lg">{order.customer_name}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{order.customer_phone}</p>
                                    
                                    {/* Lista de Itens do Pedido */}
                                    <div className="space-y-2 bg-gray-50 p-3 rounded-xl">
                                        {order.items && order.items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span><span className="font-bold">{item.quantity}x</span> {item.name} ({item.size})</span>
                                                <span className="text-gray-500">{item.price}</span>
                                            </div>
                                        ))}
                                        <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold">
                                            <span>Total</span>
                                            <span>{order.total_price?.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Ações */}
                                <div className="flex flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                                    {order.status === 'Pendente' && (
                                        <button 
                                            onClick={() => handleApproveOrder(order)}
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-200"
                                        >
                                            <CheckCircle size={18}/> Confirmar Pgto
                                        </button>
                                    )}
                                    {order.status === 'Aprovado' && (
                                        <div className="text-center text-green-600 font-bold text-sm bg-green-50 py-2 rounded-lg border border-green-100">
                                            ✅ Pago & Baixado
                                        </div>
                                    )}
                                    
                                    <button 
                                        onClick={() => handleDeleteOrder(order.id)}
                                        className="text-gray-400 hover:text-red-500 text-xs font-bold flex items-center justify-center gap-1 py-2 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={14}/> Excluir Pedido
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}

      </main>
    </div>
  );
}