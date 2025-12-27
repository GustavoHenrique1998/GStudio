"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Save, LayoutGrid, ArrowLeft, Upload, Loader2, CheckCircle, LogOut, Trash2, Package, Pencil, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// --- CONEXÃO ---
const supabase = createClient(
  "https://ngnzibntpncdcrkoktus.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbnppYm50cG5jZGNya29rdHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MDM2MzksImV4cCI6MjA4MTM3OTYzOX0.OujKy3UrxekqE47FWm9mBHKVmNtVxEY-GILQDJCHv3I"
);

interface Product {
  id: number;
  name: string;
  price: string;
  category: string;
  image_url: string;
  description?: string;
  sizes?: string[] | string;
  gallery?: string[] | string;
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [productList, setProductList] = useState<Product[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image_url: '',
    gallery: '',
    sizes: ''
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setCheckingAuth(false);
        fetchProducts();
      }
    };
    checkUser();
  }, [router]);

  const fetchProducts = async () => {
    setLoadingList(true);
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('id', { ascending: false });

    if (!error && data) {
      setProductList(data);
    }
    setLoadingList(false);
  };

  const handleEdit = (product: Product) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setEditingId(product.id);
    
    let sizesStr = '';
    if (Array.isArray(product.sizes)) sizesStr = product.sizes.join(', ');
    else if (typeof product.sizes === 'string') sizesStr = product.sizes.replace(/[\[\]"]/g, '');

    let galleryStr = '';
    if (Array.isArray(product.gallery)) galleryStr = product.gallery.join(', ');
    else if (typeof product.gallery === 'string') galleryStr = product.gallery.replace(/[\[\]"]/g, '');

    setFormData({
        name: product.name,
        price: product.price,
        description: product.description || '',
        category: product.category,
        image_url: product.image_url,
        gallery: galleryStr,
        sizes: sizesStr
    });
    toast('Modo de Edição Ativado! ✏️', { icon: '📝' });
  };

  const cancelEdit = () => {
      setEditingId(null);
      setFormData({ name: '', price: '', description: '', category: '', image_url: '', gallery: '', sizes: '' });
      toast('Edição cancelada.');
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (error) {
      toast.error("Erro ao excluir.");
    } else {
      toast.success("Produto removido!");
      if (editingId === id) cancelEdit();
      fetchProducts();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    toast.success('Saiu com sucesso!');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingImage(true);

    try {
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
      const { error } = await supabase.storage.from('images').upload(fileName, file);
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, image_url: publicUrlData.publicUrl }));
      toast.success('Imagem carregada!');
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao subir imagem.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sizesArray = formData.sizes.split(',').map(s => s.trim()).filter(s => s !== '');
      const galleryArray = formData.gallery.split(',').map(s => s.trim()).filter(s => s !== '');
      if (galleryArray.length === 0 && formData.image_url) galleryArray.push(formData.image_url);

      const payload = {
          name: formData.name,
          price: formData.price,
          description: formData.description,
          category: formData.category,
          image_url: formData.image_url,
          gallery: galleryArray,
          sizes: sizesArray
      };

      let error;

      if (editingId) {
          const response = await supabase.from('produtos').update(payload).eq('id', editingId);
          error = response.error;
      } else {
          const response = await supabase.from('produtos').insert([payload]);
          error = response.error;
      }

      if (error) throw error;
      toast.success(editingId ? 'Produto atualizado! 🔄' : 'Produto criado! 🚀');
      setEditingId(null);
      setFormData({ name: '', price: '', description: '', category: '', image_url: '', gallery: '', sizes: '' });
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 w-full overflow-x-hidden">
      
      <header className="bg-black text-white p-4 mb-6 shadow-md">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
             <LayoutGrid className="text-blue-500" />
             <h1 className="text-xl font-bold">Painel Admin</h1>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <Link href="/" className="flex-1 md:flex-none text-center text-sm border border-gray-600 px-4 py-2 rounded hover:bg-gray-800 transition-colors">Voltar pra Loja</Link>
            <button onClick={handleLogout} className="flex-1 md:flex-none text-sm bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors">Sair</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 grid gap-8">
        
        {/* === CARD DE CADASTRO === */}
        <div className={`rounded-xl shadow-sm border p-5 transition-all ${editingId ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-bold flex items-center gap-2 ${editingId ? 'text-blue-800' : 'text-gray-800'}`}>
                {editingId ? <Pencil size={24}/> : <Plus className="text-blue-600" size={24} />}
                {editingId ? 'Editar Produto' : 'Cadastrar Novo'}
            </h2>
            {editingId && (
                <button onClick={cancelEdit} className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full flex items-center gap-1 font-bold text-gray-600 transition-colors"><X size={14}/> Cancelar</button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Nome</label>
                <input required value={formData.name} name="name" onChange={handleChange} className="w-full p-3 bg-white rounded border border-gray-200 focus:border-black outline-none" placeholder="Ex: Nike Air" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Preço</label>
                <input required value={formData.price} name="price" onChange={handleChange} className="w-full p-3 bg-white rounded border border-gray-200 focus:border-black outline-none" placeholder="R$ 0,00" />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Categoria</label>
                <select required value={formData.category} name="category" onChange={handleChange} className="w-full p-3 bg-white rounded border border-gray-200 outline-none">
                  <option value="">Selecione...</option>
                  <option value="Streetwear">Streetwear</option>
                  <option value="Casual">Casual</option>
                  <option value="Esporte">Esporte</option>
                  <option value="Acessórios">Acessórios</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Tamanhos (P, M, G)</label>
                <input required value={formData.sizes} name="sizes" onChange={handleChange} className="w-full p-3 bg-white rounded border border-gray-200 outline-none" />
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white/50 hover:bg-blue-50 transition-colors">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Foto Principal</label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer bg-white border border-gray-300 px-4 py-2 rounded text-sm font-bold shadow-sm hover:bg-gray-100">
                    {uploadingImage ? 'Enviando...' : 'Escolher Foto'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
                </label>
                {formData.image_url ? <span className="text-green-600 text-sm font-bold flex items-center gap-1"><CheckCircle size={14}/> Ok!</span> : <span className="text-gray-400 text-xs">Nenhuma</span>}
              </div>
              {formData.image_url && <img src={formData.image_url} className="mt-3 w-20 h-20 object-cover rounded border border-gray-300" />}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Galeria</label>
              <textarea name="gallery" rows={2} value={formData.gallery} onChange={handleChange} placeholder="Cole links de imagens extras aqui..." className="w-full p-3 bg-white rounded border border-gray-200 outline-none" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Descrição</label>
              <textarea required rows={3} value={formData.description} name="description" onChange={handleChange} className="w-full p-3 bg-white rounded border border-gray-200 outline-none" placeholder="Detalhes..." />
            </div>

            <button type="submit" disabled={loading || uploadingImage} className={`w-full font-bold py-4 rounded-lg transition-colors shadow-lg ${editingId ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-black hover:bg-gray-800 text-white'}`}>
              {loading ? 'Processando...' : (editingId ? 'Salvar Alterações' : 'Cadastrar Produto')}
            </button>
          </form>
        </div>

        {/* === LISTA DE ESTOQUE === */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-10">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                <Package className="text-purple-600" size={24} />
                Seu Estoque
            </h2>

            {loadingList ? (
                <div className="text-center py-8"><Loader2 className="animate-spin mx-auto text-gray-400" /></div>
            ) : productList.length === 0 ? (
                <div className="text-center py-8 text-gray-400">Estoque vazio.</div>
            ) : (
                <>
                    {/* === VISÃO MOBILE (CARDS) - SÓ APARECE NO CELULAR === */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {productList.map((prod) => (
                            <div key={prod.id} className={`border border-gray-200 rounded-xl p-4 flex gap-4 bg-white shadow-sm ${editingId === prod.id ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}>
                                <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                                     <img src={prod.image_url || 'https://placehold.co/50'} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-900 leading-tight mb-1">{prod.name}</h3>
                                        <p className="text-xs text-gray-500 uppercase">{prod.category}</p>
                                    </div>
                                    <div className="flex items-end justify-between mt-2">
                                        <span className="font-bold text-blue-600">{prod.price}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(prod)} className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100"><Pencil size={16}/></button>
                                            <button onClick={() => handleDelete(prod.id)} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* === VISÃO DESKTOP (TABELA) - SÓ APARECE NO COMPUTADOR === */}
                    <div className="hidden md:block w-full overflow-x-auto border rounded-lg">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr className="text-gray-500 text-xs uppercase">
                                    <th className="p-3">Foto</th>
                                    <th className="p-3">Produto</th>
                                    <th className="p-3">Preço</th>
                                    <th className="p-3 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {productList.map((prod) => (
                                    <tr key={prod.id} className={`hover:bg-gray-50 transition-colors ${editingId === prod.id ? 'bg-blue-50' : ''}`}>
                                        <td className="p-3 w-16">
                                            <img src={prod.image_url || 'https://placehold.co/50'} className="w-10 h-10 object-cover rounded bg-gray-200" />
                                        </td>
                                        <td className="p-3 font-medium text-sm text-gray-800">
                                            {prod.name}
                                            {editingId === prod.id && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Editando</span>}
                                        </td>
                                        <td className="p-3 text-sm text-gray-600">{prod.price}</td>
                                        <td className="p-3 text-right flex justify-end gap-2">
                                            <button onClick={() => handleEdit(prod)} className="text-blue-500 hover:bg-blue-50 p-2 rounded" title="Editar"><Pencil size={18} /></button>
                                            <button onClick={() => handleDelete(prod.id)} className="text-red-500 hover:bg-red-50 p-2 rounded" title="Excluir"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>

      </main>
    </div>
  );
}