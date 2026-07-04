import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import './Footer.css';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">Haji Cosmétique</div>
          <p className="footer__about">{t('Beauté naturelle inspirée des traditions tunisiennes. Formulé à Mareth, livré dans toute la Tunisie.','جمال طبيعي مستوحى من التقاليد التونسية. مُركَّب في مارث، يصل لجميع ولايات تونس.')}</p>
         <div className="footer__social">
            <a href="https://www.facebook.com/haji.cosmetique" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook-f" style={{ fontSize: '24px' }}></i>
            </a>
            <a href="#" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram" style={{ fontSize: '24px' }}></i>
            </a>
            <a href="#" aria-label="TikTok" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-tiktok" style={{ fontSize: '24px' }}></i>
            </a>
            <a href="#" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-whatsapp" style={{ fontSize: '24px' }}></i>
            </a>
          </div>
        </div>
        <div>
          <div className="footer__heading">{t('Boutique','المتجر')}</div>
          <ul className="footer__links">
            <li><Link to="/shop">{t('Tous les produits','كل المنتجات')}</Link></li>
            <li><Link to="/shop?sort=new">{t('Nouveautés','الجديد')}</Link></li>
            <li><Link to="/shop?badge=Promo">{t('Promotions','العروض')}</Link></li>
            <li><Link to="/shop?badge=Best-seller">{t('Best Sellers','الأكثر مبيعًا')}</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer__heading">{t('Informations','معلومات')}</div>
          <ul className="footer__links">
            <li><Link to="/about">{t('À propos','عنا')}</Link></li>
            <li><Link to="/news">{t('Actualités','أخبار')}</Link></li>
            <li><Link to="/contact">{t('Contact','اتصل بنا')}</Link></li>
            <li><a href="#">{t('Livraison & Retours','التوصيل والإرجاع')}</a></li>
          </ul>
        </div>
        <div>
          <div className="footer__heading">{t('Contact','تواصل معنا')}</div>
          <ul className="footer__links">
            <li><a>📍 Mareth, Tunisie</a></li>
            <li><a href="tel:+21612345678"> +216 12 345 678</a></li>
            <li><a href="mailto:contact@haji-cosmetique.tn">ahlemharres@gmail.com</a></li>
            <li><a>🕐 {t('Lun–Sam 9h–18h','الاثنين–السبت 9–18')}</a></li>
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        <span>© 2026 Haji Cosmétique. {t('Tous droits réservés.Mareth, Tunisie.','جميع الحقوق محفوظة. صفاقس، تونس.')}</span>
        <span>{t('Fait en Tunisie','صُنع في تونس')}</span>
      </div>
    </footer>
  );
}
