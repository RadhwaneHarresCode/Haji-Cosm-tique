import React from 'react';
import { useLang } from '../context/LangContext';
import { Link } from 'react-router-dom';
import './About.css';

export default function About() {
  const { t } = useLang();
  return (
    <div className="about-page">
      <div className="about-page__hero">
        <div className="container">
          <h1 className="about-page__title">{t('À propos de', 'عن')} <span>Haji Cosmétique</span></h1>
          <p>{t('Notre histoire, nos valeurs, notre mission', 'قصتنا، قيمنا، مهمتنا')}</p>
        </div>
      </div>
      <div className="container about-page__content">
        <div className="about-page__grid">
          <div className="about-page__visual"><img src="assets/logo.png" alt="Haji Cosmétique" className="about-page__logo" /></div>
          <div>
            <div className="hero__eyebrow" style={{marginBottom:'16px'}}>🌿 {t('Notre Histoire','قصتنا')}</div>
            <h2 className="section__title" style={{marginBottom:'18px'}}>{t('Beauté naturelle,','جمال طبيعي،')} <span>{t('tradition tunisienne','تقاليد تونسية')}</span></h2>
            <p style={{color:'var(--mid)',lineHeight:1.8,marginBottom:'14px'}}>{t('Fondée à Mareth en 2023, Haji Cosmétique est née de la passion pour les ingrédients naturels tunisiens — argile de Gafsa, huile d\'olive de Sfax, rosa damascena de Nabeul.','تأسست في مارث عام 2023، نشأت حاجي كوزمتيك من الشغف بالمكونات الطبيعية التونسية — طين قفصة، زيت زيتون صفاقس، ورد دمشق نابل.')}</p>
            <p style={{color:'var(--mid)',lineHeight:1.8,marginBottom:'28px'}}>{t('Chaque produit est formulé avec soin, testé dermatologiquement, et emballé de façon éco-responsable. Nous livrons dans les 24 gouvernorats tunisiens.','كل منتج يُصنع بعناية، يُختبر طبيًا، ويُغلف بطريقة صديقة للبيئة. نوصل لجميع الولايات الـ24 التونسية.')}</p>
          </div>
        </div>

        <div className="about-page__values">
          {[
            {emoji:'🌿', fr:'100% Naturel', ar:'طبيعي 100%', dfr:'Ingrédients certifiés naturels', dar:'مكونات طبيعية معتمدة'},
            {emoji:'🧪', fr:'Testé Dermato', ar:'مختبر طبيًا', dfr:'Tests dermatologiques rigoureux', dar:'اختبارات طبية صارمة'},
            {emoji:'♻️', fr:'Éco-Responsable', ar:'صديق للبيئة', dfr:'Emballages recyclables', dar:'عبوات قابلة للتدوير'},
            {emoji:'🇹🇳', fr:'Made in Tunisia', ar:'صُنع في تونس', dfr:'Fier de nos origines', dar:'نفخر بأصولنا التونسية'},
          ].map((v,i) => (
            <div key={i} className="about-page__value-card">
              <div className="about-page__value-icon">{v.emoji}</div>
              <h3>{t(v.fr, v.ar)}</h3>
              <p>{t(v.dfr, v.dar)}</p>
            </div>
          ))}
        </div>

        <div className="about-page__stats">
          {[
            {num:'2023', label:{fr:'Année de création',ar:'سنة التأسيس'}},
            {num:'500+', label:{fr:'Produits',ar:'منتج'}},
            {num:'5000+', label:{fr:'Clientes satisfaites',ar:'عميلة راضية'}},
            {num:'24', label:{fr:'Gouvernorats livrés',ar:'ولاية نغطيها'}},
          ].map((s,i) => (
            <div key={i} className="about-page__stat">
              <div className="about-page__stat-num">{s.num}</div>
              <div className="about-page__stat-label">{t(s.label.fr, s.label.ar)}</div>
            </div>
          ))}
        </div>

        <div style={{textAlign:'center',marginTop:'48px'}}>
          <Link to="/shop" className="btn btn--primary">{t('Découvrir nos produits →','اكتشف منتجاتنا →')}</Link>
        </div>
      </div>
    </div>
  );
}
