import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import ProductCard from '../components/ProductCard';
import './Shop.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const CATS = ['all','Visage','Corps','Cheveux','Maquillage','Parfum'];

export default function Shop() {
  const { t, lang }         = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const category = searchParams.get('category') || 'all';
  const search   = searchParams.get('search')   || '';
  const sort     = searchParams.get('sort')     || '';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (search)   params.set('search', search);
    if (sort)     params.set('sort', sort);
    fetch(`${API}/api/products?${params}`)
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category, search, sort]);

  const setFilter = (key, val) => {
    const p = new URLSearchParams(searchParams);
    p.set(key, val);
    setSearchParams(p);
  };

  return (
    <div className="shop">
      {/* Header */}
      <div className="shop__hero">
        <div className="container">
          <h1 className="shop__title">{t('Notre','متجرنا')} <span>{t('Boutique','المميز')}</span></h1>
          <p>{t('Découvrez toute notre gamme de cosmétiques naturels tunisiens','اكتشف مجموعتنا الكاملة من مستحضرات التجميل الطبيعية التونسية')}</p>
        </div>
      </div>

      <div className="container shop__content">
        {/* Filters */}
        <div className="shop__filters">
          <div className="shop__filter-cats">
            {CATS.map(c => (
              <button
                key={c}
                className={`shop__filter-btn ${category === c ? 'active' : ''}`}
                onClick={() => setFilter('category', c)}
              >
                {c === 'all' ? t('Tout','الكل') : c}
              </button>
            ))}
          </div>
          <div className="shop__sort">
            <span>{t('Trier par :','ترتيب:')}</span>
            <select value={sort} onChange={e => setFilter('sort', e.target.value)}>
              <option value="">{t('Par défaut','الافتراضي')}</option>
              <option value="price-asc">{t('Prix croissant','سعر تصاعدي')}</option>
              <option value="price-desc">{t('Prix décroissant','سعر تنازلي')}</option>
            </select>
          </div>
        </div>

        {/* Search indicator */}
        {search && (
          <div className="shop__search-info">
            🔍 {t(`Résultats pour "${search}"`, `نتائج البحث عن "${search}"`)}
            <button onClick={() => { const p = new URLSearchParams(searchParams); p.delete('search'); setSearchParams(p); }}>✕</button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="shop__loading">⌛ {t('Chargement…','جارٍ التحميل…')}</div>
        ) : products.length === 0 ? (
          <div className="shop__empty">{t('Aucun produit trouvé.','لا توجد منتجات.')}</div>
        ) : (
          <div className="grid-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
