import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LangContext';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function ProductDetail() {
  const { id }            = useParams();
  const { addToCart, setIsOpen } = useCart();
  const { lang, t }       = useLang();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty,     setQty]     = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/products/${id}`)
      .then(r => r.json())
      .then(p => {
        setProduct(p);
        setLoading(false);
        // Load related
        fetch(`${API}/api/products?category=${p.category}`)
          .then(r => r.json())
          .then(all => setRelated(all.filter(x => x.id !== p.id).slice(0, 4)))
          .catch(() => {});
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="pd-loading">⌛ {t('Chargement…','جارٍ التحميل…')}</div>;
  if (!product) return <div className="pd-loading">{t('Produit introuvable.','المنتج غير موجود.')}</div>;

  const name = lang === 'ar' ? product.name_ar : product.name_fr;
  const desc = lang === 'ar' ? product.desc_ar  : product.desc_fr;

  return (
    <div className="pd container">
      <Link to="/shop" className="pd__back">← {t('Retour à la boutique','العودة للمتجر')}</Link>

      <div className="pd__grid">
        {/* Image */}
        <div>
          <div className="pd__main-img">
            {product.image && product.image.length > 100 ? (
              <img
                src={product.image}
                alt={name}
                className="pd__photo"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <span style={{
              display: product.image && product.image.length > 100 ? 'none' : 'flex',
              fontSize: 'clamp(5rem,12vw,9rem)'
            }}>
              {product.emoji || '🧴'}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="pd__info">
          <div className="pd__brand">Haji Cosmétique</div>
          <h1 className="pd__name">{name}</h1>
          <div className="pd__stars">★★★★★ <span style={{color:'var(--mid)',fontSize:'.85rem'}}>(127 {t('avis','تقييم')})</span></div>
          <div className="pd__price">
            {product.price} TND
            {product.old_price && <span className="pd__old-price">{product.old_price} TND</span>}
          </div>
          <p className="pd__desc">{desc}</p>

          <div className="pd__qty">
            <div className="pd__qty-control">
              <button onClick={() => setQty(q => Math.max(1, q-1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => q+1)}>+</button>
            </div>
            <span className="pd__stock">✅ {t(`En stock (${product.stock})`,'متوفر')}</span>
          </div>

          <div className="pd__actions">
            <button className="btn btn--primary" onClick={() => { addToCart({...product}, qty); setIsOpen(true); }}>
              {t('Ajouter au panier','أضف للسلة')}
            </button>
            <button className="btn btn--rose" onClick={() => { addToCart({...product}, qty); setIsOpen(true); }}>
              {t('Commander maintenant','اطلب الآن')}
            </button>
          </div>

          <div className="pd__meta">
            <div className="pd__meta-row"><strong>{t('Catégorie','الفئة')}</strong><span>{product.category}</span></div>
            {product.ingredients && <div className="pd__meta-row"><strong>{t('Ingrédients','المكونات')}</strong><span>{product.ingredients}</span></div>}
            <div className="pd__meta-row"><strong>{t('Livraison','التوصيل')}</strong><span>{t('Partout en Tunisie','لجميع ولايات تونس')}</span></div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="pd__related">
          <h2 className="section__title" style={{marginBottom:'24px'}}>{t('Produits','منتجات')} <span>{t('Similaires','مماثلة')}</span></h2>
          <div className="grid-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
