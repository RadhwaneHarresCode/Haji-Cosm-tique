import React, { useState } from 'react';
import { useLang } from '../context/LangContext';
import './Contact.css';

export default function Contact() {
  const { t } = useLang();
  const [form, setForm] = useState({ name:'', email:'', phone:'', message:'' });
  const [sent, setSent] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    // In production: POST to /api/contact
    setSent(true);
  };

  return (
    <div className="contact-page">
      <div className="contact-page__hero">
        <div className="container">
          <h1 className="contact-page__title">{t('Contactez-', 'تواصل')} <span>{t('nous', 'معنا')}</span></h1>
          <p>{t('Nous sommes là pour vous aider', 'نحن هنا لمساعدتك')}</p>
        </div>
      </div>

      <div className="container contact-page__content">
        <div className="contact-page__grid">
          {/* Info */}
          <div className="contact-page__info">
            <h2 style={{fontFamily:'var(--font-display)',fontSize:'1.5rem',marginBottom:'24px'}}>{t('Nos coordonnées','معلومات التواصل')}</h2>
            {[
              {icon:'📍', label:t('Adresse','العنوان'), val:'Mareth, Tunisie'},
              {icon:'📞', label:t('Téléphone','الهاتف'), val:'+216 12 345 678'},
              {icon:'📧', label:t('Email','البريد'), val:'contact@haji-cosmetique.tn'},
              {icon:'🕐', label:t('Horaires','ساعات العمل'), val:t('Lun–Sam 9h–18h','الاثنين–السبت 9–18')},
            ].map((item,i) => (
              <div key={i} className="contact-page__info-item">
                <div className="contact-page__info-icon">{item.icon}</div>
                <div>
                  <div className="contact-page__info-label">{item.label}</div>
                  <div className="contact-page__info-val">{item.val}</div>
                </div>
              </div>
            ))}
            <div className="contact-page__social">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Instagram">📸</a>
              <a href="#" aria-label="TikTok">🎵</a>
              <a href="#" aria-label="WhatsApp">💬</a>
            </div>
          </div>

          {/* Form */}
          <div className="contact-page__form-wrap">
            {sent ? (
              <div className="contact-page__success">
                <div style={{fontSize:'3rem',marginBottom:'16px'}}>✅</div>
                <h3>{t('Message envoyé !','تم إرسال رسالتك!')}</h3>
                <p>{t('Nous vous répondrons dans les 24h.','سنرد عليك خلال 24 ساعة.')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 style={{fontFamily:'var(--font-display)',fontSize:'1.5rem',marginBottom:'24px'}}>{t('Envoyer un message','إرسال رسالة')}</h2>
                {[
                  {name:'name',  type:'text',  label:t('Nom complet','الاسم الكامل'),       ph:'Mohammed Ben Ali'},
                  {name:'email', type:'email', label:t('Email','البريد الإلكتروني'),        ph:'email@example.com'},
                  {name:'phone', type:'tel',   label:t('Téléphone','الهاتف'),               ph:'+216 XX XXX XXX'},
                ].map(f => (
                  <div key={f.name} className="rf-field" style={{marginBottom:'16px'}}>
                    <label className="rf-label">{f.label}</label>
                    <input type={f.type} className="rf-input" placeholder={f.ph}
                      value={form[f.name]} onChange={e=>setForm(p=>({...p,[f.name]:e.target.value}))} />
                  </div>
                ))}
                <div className="rf-field" style={{marginBottom:'20px'}}>
                  <label className="rf-label">{t('Message','الرسالة')}</label>
                  <textarea className="rf-input" rows="5" value={form.message}
                    onChange={e=>setForm(p=>({...p,message:e.target.value}))} placeholder={t('Votre message…','رسالتك…')} />
                </div>
                <button type="submit" className="btn btn--primary" style={{width:'100%',justifyContent:'center'}}>
                  {t('Envoyer →','إرسال →')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
