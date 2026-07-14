import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import './Home.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CATEGORIES = [
  { id:'Visage',    emoji:'🧴', fr:'Visage',    ar:'الوجه',   count:120 },
  { id:'Corps',     emoji:'🛁', fr:'Corps',     ar:'الجسم',   count:85  },
  { id:'Cheveux',   emoji:'💆‍♀️', fr:'Cheveux',   ar:'الشعر',  count:64  },
  { id:'Maquillage',emoji:'💄', fr:'Maquillage',ar:'المكياج', count:98  },
  { id:'Parfum',    emoji:'🌸', fr:'Parfum',    ar:'العطور',  count:42  },
  { id:'Soins',     emoji:'✨', fr:'Soins',     ar:'العناية', count:55  },
  { id:'accessoire', emoji:'🎀', fr:'Accessoires', ar:'الإكسسوارات', count:30 }
];


export default function Home() {
  const { t, lang }   = useLang();
  const { addToCart, setIsOpen } = useCart();
  const navigate       = useNavigate();
  const [products, setProducts] = useState([]);
  const [news,     setNews]     = useState([]);
  const [videos,   setVideos]   = useState([]);
  const [email,    setEmail]    = useState('');
  const [subMsg,   setSubMsg]   = useState('');

  useEffect(() => {
    fetch(`${API}/api/products`).then(r=>r.json()).then(setProducts).catch(()=>{});
    fetch(`${API}/api/news`).then(r=>r.json()).then(setNews).catch(()=>{});
    fetch(`${API}/api/videos`).then(r=>r.json()).then(setVideos).catch(()=>{});
  }, []);

  const handleSubscribe = async () => {
    if (!email) return;
    try {
      await fetch(`${API}/api/newsletter`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email}) });
      setSubMsg(t('✅ Abonnement confirmé !','✅ تم اشتراكك بنجاح!'));
      setEmail('');
    } catch { setSubMsg(t('Erreur. Réessayez.','صار خطأ، عاود جرب.')); }
  };

  const newArrivals  = products.slice(0, 4);
  const bestSellers  = products.filter(p => p.badge === 'Best-seller').slice(0, 4);

  return (
    <div className="home">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero__bg" />
        <div className="hero__leaf hero__leaf--l1">🌿</div>
        <div className="hero__leaf hero__leaf--l2">🌿</div>
        <div className="container hero__grid">
          <div className="hero__text">
            <div className="hero__eyebrow">✨ {t('Nouvelle Collection Printemps 2025','مجموعتنا الجديدة لربيع 2025')}</div>
            <h1 className="hero__headline">
              {t('Beauté Naturelle.','جمال طبيعي.')}<br/>
              <em>{t('Authenticité Tunisienne.','أصالة تونسية.')}</em>
            </h1>
            <p className="hero__sub">{t('Des soins cosmétiques inspirés des traditions tunisiennes. Qualité premium, ingrédients naturels, livrés partout en Tunisie.','منتوجات تجميل تونسية أصيلة، بمكونات طبيعية 100% وجودة عالية. نوصّلولك فين ما كنت في تونس.')}</p>
            <div className="hero__actions">
              <Link to="/shop" className="btn btn--primary">{t('Découvrir la boutique →','اكتشف المتجر →')}</Link>
              <Link to="/news" className="btn btn--outline">{t('Nos actualités','آخر أخبارنا')}</Link>
            </div>
            <div className="hero__trust">
              <div><span className="hero__trust-num">500+</span><span className="hero__trust-label">{t('Produits','منتج')}</span></div>
              <div><span className="hero__trust-num">1k+</span><span className="hero__trust-label">{t('Clientes','عميلة')}</span></div>
              <div><span className="hero__trust-num">24</span><span className="hero__trust-label">{t('Gouvernorats','ولاية')}</span></div>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__img-wrap"><span style={{fontSize:'9rem'}}>💄</span></div>
            <div className="hero__floating-badge">🌿 {t('100% Naturel','مكونات طبيعية 100%')}</div>
            {products[0] && (
              <div className="hero__product-card">
                <span style={{fontSize:'2.5rem',display:'block',textAlign:'center',padding:'12px 0'}}>{products[0].emoji}</span>
                <div className="hero__pc-name">{lang==='ar'?products[0].name_ar:products[0].name_fr}</div>
                <div className="hero__pc-price">{products[0].price} TND</div>
                <button onClick={()=>{addToCart(products[0]);setIsOpen(true)}} className="btn btn--primary" style={{width:'100%',justifyContent:'center',fontSize:'.82rem',padding:'8px'}}>
                  {t('Ajouter →','أضف →')}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div className="trust-bar">
        <div className="container trust-bar__inner">
          {[
            {icon:'🚚', fr:'Livraison rapide',     ar:'توصيل سريع',      sfr:'Partout en Tunisie',   sar:'لكل ولايات تونس'},
            {icon:'🛡️', fr:'Paiement sécurisé',    ar:'خلاص آمن',        sfr:'100% protégé',         sar:'مضمون 100%'},
            {icon:'🔄', fr:'Retour facile',         ar:'إرجاع سهل',       sfr:'7 jours',              sar:'خلال 7 أيام'},
            {icon:'🌿', fr:'100% Naturel',          ar:'مكونات طبيعية',   sfr:'Certifié',             sar:'جودة معتمدة'},
          ].map((item, i) => (
            <div key={i} className="trust-bar__item">
              <div className="trust-bar__icon">{item.icon}</div>
              <div>
                <strong>{t(item.fr, item.ar)}</strong>
                <span>{t(item.sfr, item.sar)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">{t('Nos','تصفح')} <span>{t('Catégories','فئاتنا')}</span></h2>
            <Link to="/shop" className="view-all">{t('Voir tout →','شوف الكل →')}</Link>
          </div>
          <div className="cats">
            {CATEGORIES.map(c => (
              <div key={c.id} className="cat-card" onClick={()=>navigate(`/shop?category=${c.id}`)}>
                <div className="cat-card__img">{c.emoji}</div>
                <div className="cat-card__name">{lang==='ar'?c.ar:c.fr}</div>
                <div className="cat-card__count">{c.count}+ {t('items','منتوج')}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="section section--card">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">{t('Nouvelles','أحدث')} <span>{t('Arrivées','المنتوجات')}</span></h2>
            <Link to="/shop" className="view-all">{t('Voir tout →','شوف الكل →')}</Link>
          </div>
          <div className="grid-4">
            {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ── PROMO BANNER ── */}
      <div className="container">
        <div className="promo-banner">
          <div className="promo-banner__text">
            <div className="promo-banner__eyebrow">✦ {t('Offre Limitée','عرض محدود الوقت')}</div>
            <h2 className="promo-banner__headline">{t('Ventes de Printemps en cours !','تخفيضات الربيع، ما تفوتهاش!')}</h2>
            <p className="promo-banner__sub">{t('Jusqu\'à 40% sur une sélection de crèmes, sérums et soins naturels.','تخفيض يوصل لـ40% على مجموعة مختارة من الكريمات والسيرومات والمنتوجات الطبيعية.')}</p>
            <Link to="/shop?badge=Promo" className="btn btn--rose">{t('Explorer les offres →','اكتشف العروض →')}</Link>
          </div>
          <div className="promo-banner__disc">
            <span className="promo-banner__pct">40%</span>
            <span className="promo-banner__label">{t('DE REMISE','خصم')}</span>
          </div>
        </div>
      </div>

      {/* ── BEST SELLERS ── */}
      {bestSellers.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section__header">
              <h2 className="section__title">{t('Best','الأكثر')} <span>{t('Sellers','مبيعًا')}</span></h2>
              <Link to="/shop?badge=Best-seller" className="view-all">{t('Voir tout →','شوف الكل →')}</Link>
            </div>
            <div className="grid-4">
              {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── VIDEOS ── */}
      {videos.length > 0 && (
        <section className="section section--dark">
          <div className="container">
            <div className="section__header">
              <h2 className="section__title" style={{color:'#fff'}}>{t('Nos','دروس')} <span style={{color:'var(--gold)'}}>{t('Tutoriels Beauté','التجميل')}</span></h2>
            </div>
            <div className="grid-3">
              {videos.slice(0,3).map(v => (
                <div key={v.id} className="video-card">
                  {v.url ? (
                    <iframe src={v.url} title={v.title} frameBorder="0" allowFullScreen />
                  ) : (
                    <div className="video-card__placeholder">{v.emoji}</div>
                  )}
                  <div className="video-card__label">{v.title}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── NEWS ── */}
      {news.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section__header">
              <h2 className="section__title">{t('Actualités &','أخبار')} <span>{t('Publications','ومنشورات')}</span></h2>
              <Link to="/news" className="view-all">{t('Voir tout →','شوف الكل →')}</Link>
            </div>
            <div className="grid-3">
              {news.slice(0,3).map(n => (
                <div key={n.id} className="news-card">
                  <div className="news-card__img">{n.emoji}</div>
                  <div className="news-card__body">
                    <div className="news-card__meta">📅 {n.created_at?.split('T')[0]} · <span className="badge-forest">{n.category}</span></div>
                    <h3 className="news-card__title">{lang==='ar'?n.title_ar:n.title_fr}</h3>
                    <p className="news-card__excerpt">{lang==='ar'?n.excerpt_ar:n.excerpt_fr}</p>
                    <Link to="/news" className="news-card__read">{t('Lire la suite →','اقرأ الكل →')}</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── NEWSLETTER ── */}
      <div className="newsletter">
        <div className="newsletter__inner">
          <div>
            <h3>{t('Reste au courant de nos offres','ابقى قريب من عروضنا')}</h3>
            <p>{t('Inscris-toi et reçois nos nouveautés et promos en avant-première.','سجّل بريدك الإلكتروني وكن أول من يعرف بالمنتوجات الجديدة والتخفيضات.')}</p>
          </div>
          <div className="newsletter__form">
            <input
              type="email"
              placeholder={t('Votre email','بريدك الإلكتروني')}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button className="btn btn--primary" onClick={handleSubscribe}>{t('S\'abonner','اشترك الآن')}</button>
          </div>
          {subMsg && <p style={{width:'100%',marginTop:'10px',fontSize:'.85rem',color:'var(--forest)'}}>{subMsg}</p>}
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section className="section section--blush" id="about">
  <div className="container about-grid">
    <div>
      <div className="hero__eyebrow" style={{marginBottom:'16px'}}>🌿 {t('Notre Histoire','قصتنا')}</div>
      <h2 className="section__title" style={{marginBottom:'16px'}}>{t('Haji Cosmétique,','حاجي كوزمتيك،')}<br/><span>{t('la beauté tunisienne','جمال تونسي أصيل')}</span></h2>
      <p style={{color:'var(--mid)',lineHeight:1.8,marginBottom:'14px'}}>{t('Fondée à Mareth, Haji Cosmétique est née de la passion pour les ingrédients naturels tunisiens — argile, huile d\'olive, rosa damascena.','حاجي كوزمتيك تولدت في مارث، من عشقنا للمكونات الطبيعية التونسية — الطين، زيت الزيتون، وورد الجوري.')}</p>
      <p style={{color:'var(--mid)',lineHeight:1.8,marginBottom:'28px'}}>{t('Nous livrons dans les 24 gouvernorats tunisiens avec des produits testés dermatologiquement.','نوصّلو لكل ولايات تونس الـ24، ومنتوجاتنا كلها مجربة ومتحقق منها طبيًا.')}</p>
      <Link to="/about" className="btn btn--primary">{t('En savoir plus →','اعرف أكثر →')}</Link>
    </div>
    <div className="about-grid__visual">
      <img 
        src="../assets/logo.png" 
        alt="Haji Cosmétique - Logo" 
        style={{ width: '100%', maxWidth: '300px', height: 'auto' }}
      />
    </div>
  </div>
</section>

    </div>
  );
}
