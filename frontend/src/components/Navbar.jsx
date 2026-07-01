import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LangContext';
import './Navbar.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Navbar() {
  const { count, setIsOpen } = useCart();
  const { lang, setLang, t }  = useLang();
  const [searchQ, setSearchQ] = useState('');
  const [results, setResults] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const searchRef = useRef();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  useEffect(() => {
    if (!searchQ.trim()) { setResults([]); setShowDrop(false); return; }
    const timer = setTimeout(async () => {
      try {
        const res  = await fetch(`${API}/api/products?search=${encodeURIComponent(searchQ)}`);
        const data = await res.json();
        setResults(data.slice(0, 6));
        setShowDrop(true);
      } catch { setResults([]); }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQ]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQ.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(searchQ)}`);
    setShowDrop(false);
  };

  const pickResult = (id) => {
    setShowDrop(false);
    setSearchQ('');
    navigate(`/product/${id}`);
  };

  return (
    <header className="nav">
      <div className="nav__inner">

        {/* Logo */}
        <Link to="/" className="nav__logo" onClick={() => setMenuOpen(false)}>
          <img src="assets/logo.png" alt="Haji Cosmétique" className="nav__logo-img" />
        </Link>

        {/* Links desktop */}
        <nav className={`nav__links ${menuOpen ? 'open' : ''}`}>
          <Link to="/"          className={isActive('/')}          onClick={() => setMenuOpen(false)}>{t('Accueil','الرئيسية')}</Link>
          <Link to="/shop"      className={isActive('/shop')}      onClick={() => setMenuOpen(false)}>{t('Boutique','المتجر')}</Link>
          <Link to="/news"      className={isActive('/news')}      onClick={() => setMenuOpen(false)}>{t('Actualités','أخبار')}</Link>
          <Link to="/about"     className={isActive('/about')}     onClick={() => setMenuOpen(false)}>{t('À propos','عنا')}</Link>
          <Link to="/contact"   className={isActive('/contact')}   onClick={() => setMenuOpen(false)}>{t('Contact','اتصل بنا')}</Link>
        </nav>

        {/* Search */}
        <form className="nav__search" onSubmit={handleSearchSubmit} ref={searchRef}>
          <input
            type="text"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder={t('Rechercher…','ابحث عن منتج…')}
            onBlur={() => setTimeout(() => setShowDrop(false), 200)}
            onFocus={() => searchQ && setShowDrop(true)}
          />
          <button type="submit" aria-label="search">🔍</button>
          {showDrop && results.length > 0 && (
            <div className="nav__search-drop">
              {results.map(p => (
                <div key={p.id} className="nav__search-item" onMouseDown={() => pickResult(p.id)}>
                  <span className="nav__search-emoji">{p.emoji}</span>
                  <div>
                    <div className="nav__search-name">{lang === 'ar' ? p.name_ar : p.name_fr}</div>
                    <div className="nav__search-price">{p.price} TND</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Actions */}
        <div className="nav__actions">
          {/* Lang switch */}
          <div className="nav__lang">
            <button className={lang === 'fr' ? 'active' : ''} onClick={() => setLang('fr')}>FR</button>
            <button className={lang === 'ar' ? 'active' : ''} onClick={() => setLang('ar')}>AR</button>
          </div>

          {/* Cart */}
          <button className="nav__cart-btn" onClick={() => setIsOpen(true)} aria-label="panier">
            🛒
            {count > 0 && <span className="nav__cart-count">{count}</span>}
          </button>

          {/* Hamburger */}
          <button className="nav__hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="menu">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

      </div>
    </header>
  );
}
