"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Save, Image as ImageIcon, LayoutGrid, ArrowLeft, Upload, Loader2, CheckCircle, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Para redirecionar
import toast from 'react-hot-toast'; // Notificações bonitas

// --- CONEXÃO ---
const supabase = createClient(
  "https://ngnzibntpncdcrkoktus.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbnppYm50cG5jZGNya29rdHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MDM2MzksImV4cCI6MjA4MTM3OTYzOX0.OujKy3UrxekqE47FWm9mBHKVmNtVxEY-GILQDJCHv3I"
);

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true); // Verificando se está logado
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image_url: '',
    gallery: '',
    sizes: ''
  });

  // --- 🔒 O PORTEIRO (VERIFICAÇÃO DE SEGURANÇA) ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Se não tem usuário, chuta pro login
        router.push('/login');
      } else {
        // Se tem usuário, libera o acesso
        setCheckingAuth(false);
      }
    };
    checkUser();
  }, [router]);

  // Função de Logout
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

      if (galleryArray.length === 0 && formData.image_url) {
          galleryArray.push(formData.image_url);
      }

      const { error } = await supabase.from('produtos').insert([
        {
          name: formData.name,
          price: formData.price,
          description: formData.description,
          category: formData.category,
          image_url: formData.image_url,
          gallery: galleryArray,
          sizes: sizesArray
        }
      ]);

      if (error) throw error;

      toast.success('Produto criado com sucesso! 🚀');
      
      setFormData({
        name: '', price: '', description: '', category: '', image_url: '', gallery: '', sizes: ''
      });

    } catch (error) {
      console.error(error);
      toast.error('Erro ao cadastrar.');
    } finally {
      setLoading(false);
    }
  };

  // Se estiver verificando, mostra tela em branco ou loading
  if (checkingAuth) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      
      <header className="bg-black text-white p-6 mb-8 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <LayoutGrid className="text-blue-500" />
             <h1 className="text-2xl font-bold">Painel de Controle</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-400 hover:text-white flex items-center gap-2">
                <ArrowLeft size={16} /> Loja
            </Link>
            <button onClick={handleLogout} className="text-sm bg-gray-800 hover:bg-red-600 px-3 py-2 rounded-lg transition-colors flex items-center gap-2">
                <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Plus className="bg-blue-100 text-blue-600 rounded p-1" size={28} />
            Novo Produto
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Produto</label>
                <input 
                  type="text" name="name" required
                  value={formData.name} onChange={handleChange}
                  placeholder="Ex: Nike Dunk Low"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Preço (Com R$)</label>
                <input 
                  type="text" name="price" required
                  value={formData.price} onChange={handleChange}
                  placeholder="Ex: R$ 899,00"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Categoria</label>
                <select 
                  name="category" required
                  value={formData.category} onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-white"
                >
                  <option value="">Selecione...</option>
                  <option value="Streetwear">Streetwear</option>
                  <option value="Casual">Casual</option>
                  <option value="Esporte">Esporte</option>
                  <option value="Acessórios">Acessórios</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tamanhos (Separe por vírgula)</label>
                <input 
                  type="text" name="sizes" required
                  value={formData.sizes} onChange={handleChange}
                  placeholder="Ex: 38, 39, 40, 41, 42"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {/* --- ÁREA DE UPLOAD --- */}
            <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors">
              <label className="block text-sm font-bold text-gray-700 mb-3">Imagem Principal (Upload)</label>
              
              <div className="flex items-center gap-4">
                <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-all ${uploadingImage ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-300 hover:bg-gray-100 text-gray-700'}`}>
                    {uploadingImage ? <Loader2 className="animate-spin" size={18}/> : <Upload size={18}/>}
                    {uploadingImage ? 'Enviando...' : 'Escolher Arquivo'}
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden" 
                    />
                </label>

                {formData.image_url ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-bold bg-green-50 px-3 py-1 rounded-full">
                        <CheckCircle size={16}/> Imagem Carregada!
                    </div>
                ) : (
                    <span className="text-xs text-gray-400">Nenhuma imagem selecionada</span>
                )}
              </div>

              {formData.image_url && (
                  <div className="mt-4 w-32 h-32 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group">
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Galeria (Links separados por vírgula)</label>
              <textarea 
                name="gallery" rows={2}
                value={formData.gallery} onChange={handleChange}
                placeholder="Cole mais links aqui se quiser..."
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Descrição Completa</label>
              <textarea 
                name="description" rows={4} required
                value={formData.description} onChange={handleChange}
                placeholder="Conte os detalhes do produto..."
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <button 
              type="submit" disabled={loading || uploadingImage}
              className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'}`}
            >
              {loading ? 'Salvando...' : <><Save size={20} /> Cadastrar Produto</>}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}