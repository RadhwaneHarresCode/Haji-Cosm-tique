import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LangContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { lang, t }   = useLang();
  const [fav, setFav] = useState(false);
  const navigate      = useNavigate();

  const name = lang === 'ar' ? product.name_ar : product.name_fr;
  const desc = lang === 'ar' ? product.desc_ar  : product.desc_fr;

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div className="pc" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="pc__img">
        {product.badge && <span className="pc__badge">{product.badge}</span>}

        {/* Image produit si disponible, sinon emoji */}
        {product.image
          ? <img src={product.image} alt={name} className="pc__photo" />
          : <span className="pc__emoji">{product.emoji || '🧴'}</span>
        }

        <button className={`pc__fav ${fav ? 'active' : ''}`} onClick={e => { e.stopPropagation(); setFav(v => !v); }}>
          {fav ? '♥' : '♡'}
        </button>
      </div>
      <div className="pc__body">
        <div className="pc__stars">★★★★★ <span className="pc__rcount">(127)</span></div>
        <div className="pc__name">{name}</div>
        <div className="pc__desc">{desc?.substring(0, 65)}…</div>
        <div className="pc__footer">
          <div className="pc__price">
            {product.price} TND
            {product.old_price && <span className="pc__old">{product.old_price} TND</span>}
          </div>
          <button className="pc__add" onClick={handleAdd}>{t('Ajouter +','أضف +')}</button>
        </div>
      </div>
    </div>
  );
}