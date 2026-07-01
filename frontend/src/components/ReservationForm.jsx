/**
 * ReservationForm.jsx – Haji Cosmétique
 * Basé sur le ReservationForm original du MVP Lumora
 * Flux : GET /api/shipping-costs → dropdown villes tunisiennes
 *        POST /api/orders → email au fondateur + confirmation client
 */
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LangContext';
import './ReservationForm.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function ReservationForm({ onSuccess }) {
  const { cart, total, clearCart } = useCart();
  const { t, lang } = useLang();

  const [form, setForm]           = useState({ name:'', phone:'', email:'', city:'', address:'', note:'' });
  const [shippingMap, setShippingMap] = useState({});
  const [shippingCost, setShippingCost] = useState(0);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [orderId, setOrderId]     = useState(null);
  const [error, setError]         = useState('');

  // 1. Charger les villes / frais de livraison
  useEffect(() => {
    fetch(`${API}/api/shipping-costs`)
      .then(r => r.json())
      .then(data => setShippingMap(data))
      .catch(() => setError(t('Impossible de charger les villes.', 'تعذر تحميل المدن.')));
  }, []);

  // 2. Recalculer frais dès que la ville change
  useEffect(() => {
    setShippingCost(shippingMap[form.city] ?? 0);
  }, [form.city, shippingMap]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // 3. Soumettre la commande
  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.city || !form.address) {
      setError(t('Veuillez remplir tous les champs obligatoires.', 'يرجى ملء جميع الحقول المطلوبة.'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const items = cart.map(i => ({ id:i.id, name:lang==='ar'?i.name_ar:i.name_fr, price:i.price, qty:i.qty }));
      const res   = await fetch(`${API}/api/orders`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ ...form, items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur.');
      setOrderId(data.orderId);
      setSuccess(true);
      clearCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const grandTotal = total + shippingCost;

  // ── Succès ──
  if (success) {
    return (
      <div className="rf-wrapper">
        <div className="rf-success">
          <div className="rf-success__icon">✓</div>
          <h3>{t('Commande confirmée !', 'تم تأكيد الطلب!')}</h3>
          <p>{t(`Commande #${orderId} enregistrée.`, `الطلب رقم #${orderId} تم تسجيله.`)}</p>
          <p>{t('Nous vous contacterons au', 'سنتواصل معك على')} <strong>{form.phone}</strong> {t('pour confirmer la livraison.','لتأكيد التوصيل.')}</p>
          <button className="rf-btn rf-btn--outline" onClick={() => { setSuccess(false); setForm({ name:'',phone:'',email:'',city:'',address:'',note:'' }); if(onSuccess) onSuccess(); }}>
            {t('Fermer', 'إغلاق')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rf-wrapper">
      {/* Résumé panier */}
      <div className="rf-cart-summary">
        <div className="rf-cart-title">{t('Votre commande', 'طلبك')}</div>
        {cart.map(i => (
          <div key={i.id} className="rf-cart-row">
            <span>{i.emoji} {lang==='ar'?i.name_ar:i.name_fr} ×{i.qty}</span>
            <span>{(i.price * i.qty).toFixed(2)} TND</span>
          </div>
        ))}
      </div>

      <h2 className="rf-title">{t('Finaliser la commande', 'إتمام الطلب')}</h2>
      <p className="rf-subtitle">{t('Livraison partout en Tunisie', 'توصيل لجميع ولايات تونس')}</p>

      <form onSubmit={handleSubmit} className="rf-form" noValidate>

        <div className="rf-row">
          <div className="rf-field">
            <label className="rf-label">{t('Prénom & Nom *', 'الاسم الكامل *')}</label>
            <input name="name" type="text" className="rf-input" value={form.name} onChange={handleChange} placeholder="Mohammed Ben Ali" required />
          </div>
          <div className="rf-field">
            <label className="rf-label">{t('Téléphone *', 'الهاتف *')}</label>
            <input name="phone" type="tel" className="rf-input" value={form.phone} onChange={handleChange} placeholder="+216 XX XXX XXX" required />
          </div>
        </div>

        <div className="rf-field">
          <label className="rf-label">{t('Email (optionnel)', 'البريد الإلكتروني (اختياري)')}</label>
          <input name="email" type="email" className="rf-input" value={form.email} onChange={handleChange} placeholder="email@example.com" />
        </div>

        <div className="rf-field">
          <label className="rf-label">{t('Gouvernorat *', 'الولاية *')}</label>
          <select name="city" className="rf-select" value={form.city} onChange={handleChange} required>
            <option value="">{t('— Choisissez votre ville —', '— اختر مدينتك —')}</option>
            {Object.entries(shippingMap).map(([city, cost]) => (
              <option key={city} value={city}>{city} — {cost} TND</option>
            ))}
          </select>
        </div>

        <div className="rf-field">
          <label className="rf-label">{t('Adresse complète *', 'العنوان الكامل *')}</label>
          <input name="address" type="text" className="rf-input" value={form.address} onChange={handleChange} placeholder={t('Rue, Cité, Code postal', 'الشارع، الحي، الرمز البريدي')} required />
        </div>

        <div className="rf-field">
          <label className="rf-label">{t('Note (optionnel)', 'ملاحظة (اختياري)')}</label>
          <textarea name="note" className="rf-input" rows="2" value={form.note} onChange={handleChange} />
        </div>

        {/* Récapitulatif frais */}
        <div className="rf-summary">
          <div className="rf-summary__row"><span>{t('Sous-total','المجموع الجزئي')}</span><span>{total.toFixed(2)} TND</span></div>
          <div className="rf-summary__row">
            <span>{t('Livraison','التوصيل')}</span>
            <span className={!form.city ? 'rf-summary__placeholder' : ''}>{form.city ? `${shippingCost} TND` : '—'}</span>
          </div>
          <div className="rf-summary__row rf-summary__total">
            <span>Total</span>
            <span>{form.city ? `${grandTotal.toFixed(2)} TND` : '—'}</span>
          </div>
        </div>

        {error && <p className="rf-error">⚠ {error}</p>}

        <button type="submit" className="rf-btn rf-btn--primary" disabled={loading || !form.city || !cart.length}>
          {loading ? t('Envoi…', 'جارٍ الإرسال…') : t('Confirmer la commande →', 'تأكيد الطلب →')}
        </button>
      </form>

      <div className="rf-trust">
        <span>🔒 {t('Paiement sécurisé','دفع آمن')}</span>
        <span>🚚 {t('Livraison rapide','توصيل سريع')}</span>
        <span>↩ {t('7 jours de retour','إرجاع 7 أيام')}</span>
      </div>
    </div>
  );
}
