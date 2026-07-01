-- ─────────────────────────────────────────────────
-- Haji Cosmétique – Schéma MySQL
-- Exécutez ce fichier une seule fois : mysql -u root -p < schema.sql
-- ─────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS haji_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE haji_db;

-- ── Admins ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Mot de passe par défaut : haji2025  (hash bcrypt de "haji2025")
INSERT INTO admins (username, password_hash) VALUES
  ('admin', '$2b$10$4i3z.pPIvoXVXNkMqj369.CBYRQqGGHZ7UI8/VzbjAalWQFkWFEt6')
ON DUPLICATE KEY UPDATE password_hash = '$2b$10$4i3z.pPIvoXVXNkMqj369.CBYRQqGGHZ7UI8/VzbjAalWQFkWFEt6';

-- ── Produits ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id           INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  name_fr      VARCHAR(255)  NOT NULL,
  name_ar      VARCHAR(255)  DEFAULT '',
  price        DECIMAL(10,2) NOT NULL,
  old_price    DECIMAL(10,2) DEFAULT NULL,
  category     VARCHAR(100)  DEFAULT 'Autre',
  stock        INT           DEFAULT 0,
  emoji        VARCHAR(10)   DEFAULT '🧴',
  badge        VARCHAR(50)   DEFAULT '',
  desc_fr      TEXT,
  desc_ar      TEXT,
  ingredients  TEXT,
  image        LONGTEXT      DEFAULT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO products (name_fr, name_ar, price, old_price, category, stock, emoji, badge, desc_fr, desc_ar, ingredients) VALUES
  ('Sérum Rose Musquée','سيروم ورد المسك',89.00,120.00,'Visage',45,'🌹','Best-seller','Sérum enrichi en huile de rose musquée. Illumine et régénère le teint.','سيروم بزيت ورد المسك. يُنير ويُجدد البشرة.','Huile de rose musquée, Vitamine C, Aloe vera'),
  ('Crème Argan Intense','كريم الأرقان المكثف',65.00,NULL,'Visage',30,'🥜','Nouveau','Formule nourrissante à base d\'huile d\'argan pure.','تركيبة مغذية بزيت الأرقان النقي.','Huile d\'argan, Beurre de karité, Acide hyaluronique'),
  ('Gel Douche Jasmin','جل الاستحمام بالياسمين',32.00,45.00,'Corps',80,'🌺','Promo','Gel douche délicat au jasmin tunisien.','جل استحمام بالياسمين التونسي.','Extrait de jasmin, Glycérine, Huile de coco'),
  ('Masque Ghassoul','ماسك الغاسول',48.00,NULL,'Visage',60,'🪨','','Argile ghassoul premium. Purifie les pores.','طين الغاسول الفاخر. ينقي المسام.','Argile Ghassoul, Eau de rose, Lavande'),
  ('Huile Cheveux Nigelle','زيت الحبة السوداء',55.00,70.00,'Cheveux',35,'🖤','Best-seller','Huile de nigelle enrichie en kératine.','زيت الحبة السوداء مع الكيراتين.','Huile de nigelle, Kératine, Argan'),
  ('Rouge à Lèvres Berbère','أحمر شفاه بربري',38.00,NULL,'Maquillage',90,'💋','Nouveau','Teinte corail longue tenue 8h, hydratant.','لون مرجاني يدوم 8 ساعات.','Cire de candelilla, Beurre de cacao, Pigments minéraux'),
  ('Eau de Parfum Carthage','عطر قرطاج',120.00,150.00,'Parfum',20,'🏺','Limité','Fragrance orientale aux notes de jasmin et bois de santal.','عطر شرقي بنوتات الياسمين وخشب الصندل.','Jasmin absolu, Santal, Ambre gris, Oud'),
  ('Lotion Corps Lait de Chèvre','لوشن الجسم بحليب الماعز',42.00,NULL,'Corps',55,'🥛','','Lait de chèvre tunisien + beurre de karité.','حليب الماعز التونسي مع زبدة الشيا.','Lait de chèvre, Beurre de karité, Vitamine E');

-- ── Commandes ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  phone         VARCHAR(50)  NOT NULL,
  email         VARCHAR(255) DEFAULT '',
  city          VARCHAR(100) NOT NULL,
  address       TEXT         NOT NULL,
  items         JSON         NOT NULL,
  note          TEXT,
  shipping_cost DECIMAL(10,2) NOT NULL,
  total         DECIMAL(10,2) NOT NULL,
  status        ENUM('pending','confirmed','shipped','delivered','cancelled') DEFAULT 'pending',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Actualités / Publications ──────────────────────
CREATE TABLE IF NOT EXISTS news (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title_fr   VARCHAR(255) NOT NULL,
  title_ar   VARCHAR(255) DEFAULT '',
  excerpt_fr TEXT,
  excerpt_ar TEXT,
  category   VARCHAR(100) DEFAULT 'Actualité',
  emoji      VARCHAR(10)  DEFAULT '📰',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO news (title_fr, title_ar, excerpt_fr, excerpt_ar, category, emoji) VALUES
  ('Nouvelle Gamme Visage Printemps 2025','مجموعة الوجه الربيعية 2025','Découvrez notre toute nouvelle collection de soins visage.','اكتشف مجموعتنا الجديدة من منتجات العناية بالوجه.','Nouveau produit','🌸'),
  ('Guide : Comment choisir votre soin idéal','دليل: كيف تختار منتج العناية المثالي','Peau sèche, mixte ou grasse ? Notre guide expert vous aide.','بشرة جافة أم مختلطة؟ دليلنا الخبير يساعدك.','Conseil beauté','📋'),
  ('Ventes de Printemps : jusqu\'à 40% de réduction','تخفيضات الربيع: خصومات تصل 40%','Profitez de réductions exceptionnelles sur plus de 50 produits.','استمتع بتخفيضات استثنائية على أكثر من 50 منتجًا.','Promotion','🏷️');

-- ── Vidéos ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS videos (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(255) NOT NULL,
  url        VARCHAR(500) DEFAULT '',
  emoji      VARCHAR(10)  DEFAULT '🎬',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO videos (title, url, emoji) VALUES
  ('Routine Soin Visage Naturelle','https://www.youtube.com/embed/dQw4w9WgXcQ','✨'),
  ('Tutoriel Masque Ghassoul','https://www.youtube.com/embed/dQw4w9WgXcQ','🪨'),
  ('Comment appliquer un sérum','https://www.youtube.com/embed/dQw4w9WgXcQ','🌹');

-- ── Newsletter ────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;