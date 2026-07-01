import React, { createContext, useContext, useState } from 'react';

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState('fr');
  const t = (fr, ar) => lang === 'ar' ? ar : fr;
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
        {children}
      </div>
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
