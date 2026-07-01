import React, { useEffect, useState } from 'react';
import { useLang } from '../context/LangContext';
import './News.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function News() {
  const { lang, t } = useLang();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch(`${API}/api/news`)
      .then(r => r.json())
      .then(data => { setNews(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const cats = ['all', ...new Set(news.map(n => n.category))];
  const filtered = filter === 'all' ? news : news.filter(n => n.category === filter);

  return (
    <div className="news-page">
      <div className="news-page__hero">
        <div className="container">
          <h1 className="news-page__title">{t('Actualités &', 'أخبار')} <span>{t('Publications', 'ومنشورات')}</span></h1>
          <p>{t('Conseils beauté, nouveautés et offres exclusives', 'نصائح تجميل، منتجات جديدة وعروض حصرية')}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px 80px' }}>
        {/* Filters */}
        <div className="news-page__filters">
          {cats.map(c => (
            <button key={c} className={`shop__filter-btn ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
              {c === 'all' ? t('Tout', 'الكل') : c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="shop__loading">⌛ {t('Chargement…', 'جارٍ التحميل…')}</div>
        ) : (
          <div className="news-page__grid">
            {filtered.map(n => (
              <div key={n.id} className="news-card">
                <div className="news-card__img">{n.emoji}</div>
                <div className="news-card__body">
                  <div className="news-card__meta">
                    📅 {n.created_at?.split('T')[0]}
                    <span className="badge-forest">{n.category}</span>
                  </div>
                  <h3 className="news-card__title">{lang === 'ar' ? n.title_ar : n.title_fr}</h3>
                  <p className="news-card__excerpt">{lang === 'ar' ? n.excerpt_ar : n.excerpt_fr}</p>
                  <a href="#" className="news-card__read">{t('Lire la suite →', 'اقرأ المزيد →')}</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
