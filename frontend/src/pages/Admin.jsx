import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const token = () => localStorage.getItem('haji_token');
const authHeaders = () => ({ 'Content-Type':'application/json', Authorization:`Bearer ${token()}` });

export default function Admin() {
  const navigate   = useNavigate();
  const [tab, setTab]     = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [news, setNews]   = useState([]);
  const [videos, setVideos] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [pForm, setPForm] = useState({ name_fr:'',name_ar:'',price:'',old_price:'',category:'Visage',stock:'',emoji:'🧴',badge:'',desc_fr:'',desc_ar:'',ingredients:'',image:'' });
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [nForm, setNForm] = useState({ title_fr:'',title_ar:'',excerpt_fr:'',excerpt_ar:'',category:'Actualité',emoji:'📰' });
  const [vForm, setVForm] = useState({ title:'',url:'',emoji:'🎬' });
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const logout = () => { localStorage.removeItem('haji_token'); navigate('/admin/login'); };

  const req = useCallback(async (path, method='GET', body=null) => {
    const res = await fetch(`${API}${path}`, {
      method, headers: authHeaders(),
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (res.status === 401) { logout(); return null; }
    return res.json();
  }, []);

  const loadStats    = () => req('/api/admin/stats').then(d => d && setStats(d));
  const loadOrders   = () => req('/api/admin/orders').then(d => d && setOrders(d));
  const loadProducts = () => req('/api/products').then(d => d && setProducts(d));
  const loadNews     = () => req('/api/news').then(d => d && setNews(d));
  const loadVideos   = () => req('/api/videos').then(d => d && setVideos(d));

  useEffect(() => {
    if (!token()) { navigate('/admin/login'); return; }
    loadStats(); loadOrders(); loadProducts(); loadNews(); loadVideos();
  }, []);

  // ── Order actions ──
  const updateOrderStatus = async (id, status) => {
    await req(`/api/admin/orders/${id}`, 'PATCH', { status });
    loadOrders(); loadStats(); showToast('✅ Statut mis à jour');
  };
  const deleteOrder = async (id) => {
    if (!window.confirm('Supprimer cette commande ?')) return;
    await req(`/api/admin/orders/${id}`, 'DELETE');
    loadOrders(); loadStats(); showToast('Commande supprimée');
  };

  // ── Image upload (base64) ──
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('⚠ Image trop lourde (max 2 Mo)'); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPForm(p => ({ ...p, image: reader.result }));
      setImagePreview(reader.result);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setPForm(p => ({ ...p, image: '' }));
    setImagePreview('');
  };

  // ── Product actions ──
  const saveProduct = async () => {
    if (!pForm.name_fr || !pForm.price) { showToast('⚠ Remplissez nom et prix'); return; }
    if (editProduct) {
      await req(`/api/admin/products/${editProduct}`, 'PUT', pForm);
      showToast('✅ Produit modifié');
    } else {
      await req('/api/admin/products', 'POST', pForm);
      showToast('✅ Produit ajouté');
    }
    loadProducts(); loadStats();
    setPForm({ name_fr:'',name_ar:'',price:'',old_price:'',category:'Visage',stock:'',emoji:'🧴',badge:'',desc_fr:'',desc_ar:'',ingredients:'',image:'' });
    setImagePreview('');
    setEditProduct(null); setTab('products');
  };
  const startEdit = (p) => {
    setEditProduct(p.id);
    setPForm({ name_fr:p.name_fr,name_ar:p.name_ar||'',price:p.price,old_price:p.old_price||'',category:p.category,stock:p.stock,emoji:p.emoji,badge:p.badge||'',desc_fr:p.desc_fr||'',desc_ar:p.desc_ar||'',ingredients:p.ingredients||'',image:p.image||'' });
    setImagePreview(p.image || '');
    setTab('add-product');
  };
  const deleteProduct = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    await req(`/api/admin/products/${id}`, 'DELETE');
    loadProducts(); loadStats(); showToast(' Produit supprimé');
  };

  // ── News actions ──
  const addNews = async () => {
    if (!nForm.title_fr) { showToast('⚠ Entrez un titre'); return; }
    await req('/api/admin/news', 'POST', nForm);
    loadNews(); setNForm({ title_fr:'',title_ar:'',excerpt_fr:'',excerpt_ar:'',category:'Actualité',emoji:'📰' });
    showToast('✅ Article publié');
  };
  const deleteNews = async (id) => {
    await req(`/api/admin/news/${id}`, 'DELETE');
    loadNews(); showToast('🗑️ Article supprimé');
  };

  // ── Video actions ──
  const addVideo = async () => {
    if (!vForm.title) { showToast('⚠ Entrez un titre'); return; }
    await req('/api/admin/videos', 'POST', vForm);
    loadVideos(); setVForm({ title:'',url:'',emoji:'🎬' });
    showToast('✅ Vidéo ajoutée');
  };
  const deleteVideo = async (id) => {
    await req(`/api/admin/videos/${id}`, 'DELETE');
    loadVideos(); showToast('🗑️ Vidéo supprimée');
  };

  const NAV = [
    { id:'dashboard',   icon:'', label:'Tableau de bord' },
    { id:'orders',      icon:'', label:'Commandes' },
    { id:'products',    icon:'', label:'Produits' },
    { id:'add-product', icon:'', label:'Ajouter produit' },
    { id:'videos',      icon:'', label:'Vidéos' },
    { id:'news',        icon:'', label:'Publications' },
  ];

  return (
    <div className="admin">
      {toast && <div className="admin-toast">{toast}</div>}
      <button className="admin-sidebar-toggle" onClick={()=>setSidebarOpen(v=>!v)}>☰</button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen?'open':''}`} onClick={()=>setSidebarOpen(false)}>
        <div className="admin-sidebar__logo">
          <span>Haji Cosmétique</span>
          <small>Panneau Admin</small>
        </div>
        {NAV.map(n => (
          <div key={n.id} className={`admin-nav-item ${tab===n.id?'active':''}`} onClick={() => setTab(n.id)}>
            <span>{n.icon}</span> {n.label}
          </div>
        ))}
        <div className="admin-nav-item" onClick={logout} style={{marginTop:'auto',color:'#ff6b6b'}}>
          <span></span> Déconnexion
        </div>
      </aside>

      {/* Content */}
      <main className="admin-main">

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div>
            <h1 className="admin-page-title"> Tableau de bord</h1>
            <div className="admin-stats">
              {[
                {num:stats.products||0, label:'Produits actifs',    icon:''},
                {num:stats.orders||0,   label:'Commandes totales',  icon:''},
                {num:(stats.revenue||0)+' TND', label:'Chiffre d\'affaires', icon:''},
                {num:stats.subscribers||0, label:'Abonnés newsletter', icon:''},
              ].map((s,i) => (
                <div key={i} className="admin-stat-card">
                  <div className="admin-stat-icon">{s.icon}</div>
                  <div className="admin-stat-num">{s.num}</div>
                  <div className="admin-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="admin-card">
              <div className="admin-card__title">Dernières commandes</div>
              <table className="admin-table">
                <thead><tr><th>#</th><th>Client</th><th>Produits</th><th>Total</th><th>Ville</th><th>Statut</th></tr></thead>
                <tbody>
                  {orders.slice(0,5).map(o => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>{o.name}</td>
                      <td style={{maxWidth:'160px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{typeof o.items==='string'?JSON.parse(o.items).map(i=>`${i.name}×${i.qty}`).join(', '):''}</td>
                      <td><strong>{o.total} TND</strong></td>
                      <td>{o.city}</td>
                      <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div>
            <h1 className="admin-page-title">Commandes</h1>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>#</th><th>Client</th><th>Tél</th><th>Produits</th><th>Total</th><th>Ville</th><th>Date</th><th>Statut</th><th>Actions</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td><strong>{o.name}</strong></td>
                      <td>{o.phone}</td>
                      <td style={{maxWidth:'140px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {typeof o.items==='string'?JSON.parse(o.items).map(i=>`${i.name}×${i.qty}`).join(', '):''}
                      </td>
                      <td><strong>{o.total} TND</strong></td>
                      <td>{o.city}</td>
                      <td style={{fontSize:'.78rem',color:'var(--mid)'}}>{o.created_at?.split('T')[0]}</td>
                      <td>
                        <select className="status-select" defaultValue={o.status} onChange={e=>updateOrderStatus(o.id,e.target.value)}>
                          {['pending','confirmed','shipped','delivered','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td><button className="admin-btn admin-btn--danger" onClick={()=>deleteOrder(o.id)}>🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCTS LIST */}
        {tab === 'products' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
              <h1 className="admin-page-title" style={{margin:0}}> Produits</h1>
              <button className="admin-btn admin-btn--primary" onClick={()=>{setEditProduct(null);setPForm({name_fr:'',name_ar:'',price:'',old_price:'',category:'Visage',stock:'',emoji:'🧴',badge:'',desc_fr:'',desc_ar:'',ingredients:'',image:''});setImagePreview('');setTab('add-product')}}>+ Ajouter</button>
            </div>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Image</th><th>Nom (FR)</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Badge</th><th>Actions</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        {p.image
                          ? <img src={p.image} alt={p.name_fr} className="admin-table__thumb" />
                          : <span style={{fontSize:'1.5rem'}}>{p.emoji}</span>}
                      </td>
                      <td><strong>{p.name_fr}</strong></td>
                      <td>{p.category}</td>
                      <td><strong>{p.price} TND</strong>{p.old_price&&<span style={{textDecoration:'line-through',color:'var(--light)',fontSize:'.78rem',marginLeft:'6px'}}>{p.old_price}</span>}</td>
                      <td>{p.stock}</td>
                      <td>{p.badge&&<span className="badge-forest">{p.badge}</span>}</td>
                      <td style={{display:'flex',gap:'8px'}}>
                        <button className="admin-btn admin-btn--edit" onClick={()=>startEdit(p)}>✏️</button>
                        <button className="admin-btn admin-btn--danger" onClick={()=>deleteProduct(p.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADD / EDIT PRODUCT */}
        {tab === 'add-product' && (
          <div>
            <h1 className="admin-page-title">{editProduct ? 'Modifier le produit' : ' Ajouter un produit'}</h1>
            <div className="admin-card">

              {/* ── Image upload ── */}
              <div className="rf-field" style={{marginBottom:'20px'}}>
                <label className="rf-label">Photo du produit</label>
                <div className="admin-image-upload">
                  {imagePreview ? (
                    <div className="admin-image-preview">
                      <img src={imagePreview} alt="Aperçu produit" />
                      <button type="button" className="admin-image-remove" onClick={removeImage}>✕</button>
                    </div>
                  ) : (
                    <label className="admin-image-dropzone">
                      <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                      <span style={{fontSize:'2rem'}}>📷</span>
                      <span>{uploading ? 'Chargement…' : 'Cliquez pour choisir une image'}</span>
                      <small>PNG, JPG — max 2 Mo</small>
                    </label>
                  )}
                </div>
              </div>

              <div className="admin-form-grid">
                {[
                  {key:'name_fr',  label:'Nom (FR)',           ph:'Sérum Rose Musquée'},
                  {key:'name_ar',  label:'Nom (AR)',           ph:'سيروم ورد المسك'},
                  {key:'price',    label:'Prix (TND)',         ph:'89', type:'number'},
                  {key:'old_price',label:'Prix barré (TND)',   ph:'120', type:'number'},
                  {key:'stock',    label:'Stock',              ph:'50', type:'number'},
                  {key:'emoji',    label:'Emoji (secours si pas d\'image)', ph:'🧴'},
                ].map(f => (
                  <div key={f.key} className="rf-field">
                    <label className="rf-label">{f.label}</label>
                    <input className="rf-input" type={f.type||'text'} placeholder={f.ph}
                      value={pForm[f.key]} onChange={e=>setPForm(p=>({...p,[f.key]:e.target.value}))} />
                  </div>
                ))}
                <div className="rf-field">
                  <label className="rf-label">Catégorie</label>
                  <select className="rf-input" value={pForm.category} onChange={e=>setPForm(p=>({...p,category:e.target.value}))}>
                    {['Visage','Corps','Cheveux','Maquillage','Parfum'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="rf-field">
                  <label className="rf-label">Badge</label>
                  <select className="rf-input" value={pForm.badge} onChange={e=>setPForm(p=>({...p,badge:e.target.value}))}>
                    {['','Nouveau','Promo','Best-seller','Limité'].map(b=><option key={b} value={b}>{b||'Aucun'}</option>)}
                  </select>
                </div>
              </div>
              {[
                {key:'desc_fr', label:'Description (FR)', ph:'Description du produit…'},
                {key:'desc_ar', label:'Description (AR)', ph:'وصف المنتج…'},
                {key:'ingredients', label:'Ingrédients', ph:'Huile d\'argan, Aloe vera…'},
              ].map(f => (
                <div key={f.key} className="rf-field" style={{marginBottom:'14px'}}>
                  <label className="rf-label">{f.label}</label>
                  <textarea className="rf-input" rows="3" placeholder={f.ph}
                    value={pForm[f.key]} onChange={e=>setPForm(p=>({...p,[f.key]:e.target.value}))} />
                </div>
              ))}
              <div style={{display:'flex',gap:'12px',marginTop:'8px'}}>
                <button className="admin-btn admin-btn--primary" style={{padding:'12px 28px'}} onClick={saveProduct}>
                  {editProduct ? 'Enregistrer les modifications' : 'Ajouter le produit'}
                </button>
                <button className="admin-btn" style={{padding:'12px 28px',background:'#f0ece8'}} onClick={()=>{setEditProduct(null);setImagePreview('');setTab('products')}}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {/* VIDEOS */}
        {tab === 'videos' && (
          <div>
            <h1 className="admin-page-title"> Vidéos & Tutoriels</h1>
            <div className="admin-card">
              <div className="admin-form-grid" style={{gridTemplateColumns:'1fr 1fr'}}>
                <div className="rf-field">
                  <label className="rf-label">Titre</label>
                  <input className="rf-input" placeholder="Tutoriel fond de teint" value={vForm.title} onChange={e=>setVForm(p=>({...p,title:e.target.value}))} />
                </div>
                <div className="rf-field">
                  <label className="rf-label">Emoji</label>
                  <input className="rf-input" placeholder="💄" value={vForm.emoji} onChange={e=>setVForm(p=>({...p,emoji:e.target.value}))} />
                </div>
              </div>
              <div className="rf-field" style={{marginBottom:'16px'}}>
                <label className="rf-label">URL YouTube (embed)</label>
                <input className="rf-input" placeholder="https://www.youtube.com/embed/VIDEO_ID" value={vForm.url} onChange={e=>setVForm(p=>({...p,url:e.target.value}))} />
              </div>
              <button className="admin-btn admin-btn--primary" style={{padding:'10px 24px'}} onClick={addVideo}>+ Ajouter la vidéo</button>
            </div>
            <div className="admin-card">
              <div className="admin-card__title" style={{marginBottom:'16px'}}>Vidéos publiées</div>
              <table className="admin-table">
                <thead><tr><th>Emoji</th><th>Titre</th><th>URL</th><th>Action</th></tr></thead>
                <tbody>
                  {videos.map(v => (
                    <tr key={v.id}>
                      <td style={{fontSize:'1.4rem'}}>{v.emoji}</td>
                      <td>{v.title}</td>
                      <td style={{fontSize:'.75rem',color:'var(--mid)',maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis'}}>{v.url}</td>
                      <td><button className="admin-btn admin-btn--danger" onClick={()=>deleteVideo(v.id)}>🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* NEWS */}
        {tab === 'news' && (
          <div>
            <h1 className="admin-page-title"> Publications & Actualités</h1>
            <div className="admin-card">
              <div className="admin-form-grid">
                <div className="rf-field">
                  <label className="rf-label">Titre (FR)</label>
                  <input className="rf-input" placeholder="Titre de l'article" value={nForm.title_fr} onChange={e=>setNForm(p=>({...p,title_fr:e.target.value}))} />
                </div>
                <div className="rf-field">
                  <label className="rf-label">Titre (AR)</label>
                  <input className="rf-input" placeholder="عنوان المقال" value={nForm.title_ar} onChange={e=>setNForm(p=>({...p,title_ar:e.target.value}))} />
                </div>
                <div className="rf-field">
                  <label className="rf-label">Catégorie</label>
                  <select className="rf-input" value={nForm.category} onChange={e=>setNForm(p=>({...p,category:e.target.value}))}>
                    {['Actualité','Nouveau produit','Promotion','Conseil beauté'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="rf-field">
                  <label className="rf-label">Emoji</label>
                  <input className="rf-input" placeholder="📰" value={nForm.emoji} onChange={e=>setNForm(p=>({...p,emoji:e.target.value}))} />
                </div>
              </div>
              {[
                {key:'excerpt_fr',label:'Extrait (FR)',ph:'Résumé court…'},
                {key:'excerpt_ar',label:'Extrait (AR)',ph:'ملخص قصير…'},
              ].map(f=>(
                <div key={f.key} className="rf-field" style={{marginBottom:'14px'}}>
                  <label className="rf-label">{f.label}</label>
                  <textarea className="rf-input" rows="2" placeholder={f.ph}
                    value={nForm[f.key]} onChange={e=>setNForm(p=>({...p,[f.key]:e.target.value}))} />
                </div>
              ))}
              <button className="admin-btn admin-btn--primary" style={{padding:'10px 24px'}} onClick={addNews}>Publier l'article</button>
            </div>
            <div className="admin-card">
              <div className="admin-card__title" style={{marginBottom:'16px'}}>Articles publiés</div>
              <table className="admin-table">
                <thead><tr><th>#</th><th>Emoji</th><th>Titre</th><th>Catégorie</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>
                  {news.map(n => (
                    <tr key={n.id}>
                      <td>{n.id}</td>
                      <td style={{fontSize:'1.4rem'}}>{n.emoji}</td>
                      <td>{n.title_fr}</td>
                      <td><span className="badge-forest">{n.category}</span></td>
                      <td style={{fontSize:'.78rem',color:'var(--mid)'}}>{n.created_at?.split('T')[0]}</td>
                      <td><button className="admin-btn admin-btn--danger" onClick={()=>deleteNews(n.id)}>🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
