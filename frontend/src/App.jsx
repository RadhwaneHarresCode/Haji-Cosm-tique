import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LangProvider } from './context/LangContext';
import { CartProvider } from './context/CartContext';
import Navbar       from './components/Navbar';
import Footer       from './components/Footer';
import CartDrawer   from './components/CartDrawer';
import Home         from './pages/Home';
import Shop         from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import News         from './pages/News';
import About        from './pages/About';
import Contact      from './pages/Contact';
import AdminLogin   from './pages/AdminLogin';
import Admin        from './pages/Admin';
import './styles/variables.css';
import './App.css';

// Layout avec nav + footer
function Layout({ children }) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main>{children}</main>
      <Footer />
    </>
  );
}

// Route admin protégée
function PrivateRoute({ children }) {
  return localStorage.getItem('haji_token')
    ? children
    : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <CartProvider>
          <Routes>
            {/* Pages publiques */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/shop" element={<Layout><Shop /></Layout>} />
            <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
            <Route path="/news" element={<Layout><News /></Layout>} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </LangProvider>
    </BrowserRouter>
  );
}
