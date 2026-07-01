import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LangContext';
import ReservationForm from './ReservationForm';
import './CartDrawer.css';

export default function CartDrawer() {
  const { cart, removeFromCart, total, count, isOpen, setIsOpen } = useCart();
  const { t } = useLang();
  const [showOrder, setShowOrder] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="cd-overlay" onClick={() => setIsOpen(false)} />
      <div className="cd">
        <div className="cd__header">
          <span className="cd__title">{t(`Mon Panier (${count})`, `سلة التسوق (${count})`)}</span>
          <button className="cd__close" onClick={() => setIsOpen(false)}>✕</button>
        </div>
        <div className="cd__body">
          {!cart.length
            ? <div className="cd__empty">{t('Votre panier est vide 🛒', 'السلة فارغة 🛒')}</div>
            : cart.map(item => (
              <div className="cd__item" key={item.id}>
                <span className="cd__item-emoji">{item.emoji}</span>
                <div className="cd__item-info">
                  <div className="cd__item-name">{item.name_fr} ×{item.qty}</div>
                  <div className="cd__item-price">{(item.price * item.qty).toFixed(2)} TND</div>
                </div>
                <button className="cd__item-rm" onClick={() => removeFromCart(item.id)}>🗑️</button>
              </div>
            ))
          }
        </div>
        {cart.length > 0 && (
          <div className="cd__footer">
            <div className="cd__total">
              <span>{t('Sous-total', 'المجموع الجزئي')}</span>
              <span className="cd__total-num">{total.toFixed(2)} TND</span>
            </div>
            <button className="cd__checkout-btn" onClick={() => setShowOrder(true)}>
              {t('Commander →', 'اطلب الآن →')}
            </button>
          </div>
        )}
      </div>

      {/* Modal commande */}
      {showOrder && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowOrder(false)}>
          <div className="modal-box">
            <button className="modal-close" onClick={() => setShowOrder(false)}>✕</button>
            <ReservationForm onSuccess={() => { setShowOrder(false); setIsOpen(false); }} />
          </div>
        </div>
      )}
    </>
  );
}
