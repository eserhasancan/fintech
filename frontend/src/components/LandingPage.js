// src/components/LandingPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './LandingPage.css';

const FINNHUB_KEY = 'cva1t91r01qpd9sa8bi0cva1t91r01qpd9sa8big';
const finnhub = axios.create({
  baseURL: '/finnhub',
  headers: { 'X-Finnhub-Token': FINNHUB_KEY }
});

export default function LandingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [nasdaqSymbols, setNasdaqSymbols] = useState([]);
  const navigate = useNavigate();

  /* yardımcı: ABCDEF  →  ABC/DEF */
  const insertSlash = t => {
    const term = t.trim().toUpperCase();
    return (term.length === 6 || term.length === 7)
      ? `${term.slice(0, 3)}/${term.slice(3)}`
      : term;
  };

  /* ─ Finansal sembol listesi (yalnızca 1 kez) ─ */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await finnhub.get('/stock/symbol', { params: { exchange: 'US' } });
        setNasdaqSymbols(data.filter(r => r.mic === 'XNAS').map(r => r.symbol));
      } catch (err) {
        console.error('Nasdaq sembolleri alınamadı:', err);
      }
    })();
  }, []);

  /* ─ Arama (debounce) ─ */
  useEffect(() => {
    if (searchTerm.trim().length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const term = searchTerm.trim().toUpperCase();
        const direct = (await finnhub.get('/search', { params: { q: term } })).data.result || [];
        const slashT = insertSlash(term);
        const slash = slashT !== term
          ? (await finnhub.get('/search', { params: { q: slashT } })).data.result || []
          : [];
        const uniq = new Map();
        [...direct, ...slash].forEach(r => uniq.set(r.symbol, r));
        setSearchResults([...uniq.values()].filter(r => nasdaqSymbols.includes(r.symbol)));
      } catch (err) {
        console.error('Arama hatası:', err);
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, nasdaqSymbols]);

  /* ───────────── JSX ───────────── */
  return (
    <div className="landing-container">
      {/* HEADER */}
      <header className="landing-header">
        <h2 className="logo-text">Finansal Analiz</h2>
        <nav className="navbar">
          <ul>
            <li><a href="#features">Özellikler</a></li>
            <li><a href="#technology">Teknolojiler</a></li>
            <li><a href="#about">Hakkımızda</a></li>
            <li><a href="#contact">İletişim</a></li>
            <li><Link to="/login">Giriş Yap</Link></li>
            <li><Link to="/register">Kayıt Ol</Link></li>
          </ul>
        </nav>
      </header>

      {/* HERO + PİYASALAR */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Bitirme Projesi: Finansal Analiz Uygulaması</h1>
          <p className="hero-subtitle">
            Gelir-gider takibi, bütçe yönetimi ve yatırım önerileri tek platformda.
            Makine öğrenmesi destekli analizlerle daha bilinçli finansal kararlar alın!
          </p>
          <button className="cta-button" onClick={() => navigate('/register')}>Hemen Başla</button>
        </div>

        <aside className="markets-sidebar">
          <h3>Piyasalar (Finnhub)</h3>

          {/* arama çubuğu */}
          <div className="search-bar">
            <input
              className="search-input"
              type="text"
              placeholder="Hisse sembolü ara…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* sonuçlar */}
          <ul className="market-list">
            {searchResults.length === 0 && searchTerm.trim().length >= 2
              ? <li className="market-item">Sonuç bulunamadı.</li>
              : searchResults.map(r => (
                  <li key={r.symbol} className="market-item">
                    <Link to={`/market/${r.symbol}`}>{r.symbol} – {r.description}</Link>
                  </li>
                ))
            }
          </ul>
        </aside>
      </section>

      {/* ÖZELLİKLER */}
      <section id="features" className="features-section">
        <h2>Özellikler</h2>
        <div className="features-container">
          <div className="feature-card">
            <h3>Gelir-Gider Takibi</h3>
            <p>Harcamalarınızı kategorilere ayırın, grafiklerle bütçenizi anında görün.</p>
          </div>
          <div className="feature-card">
            <h3>Gerçek-Zamanlı Piyasalar</h3>
            <p>Seçtiğiniz hisselerin fiyatlarını anlık olarak izleyin.</p>
          </div>
          <div className="feature-card">
            <h3>ML Yatırım Önerileri</h3>
            <p>Karar ağacı modeli, geçmiş fiyat ve haber duyarlılığını analiz edip tavsiye üretir.</p>
          </div>
          <div className="feature-card">
            <h3>Çoklu Cüzdan</h3>
            <p>Birden fazla portföy oluşturun, kâr/zarar durumunu ayrı ayrı yönetin.</p>
          </div>
        </div>
      </section>

      {/* TEKNOLOJİLER */}
      <section id="technology" className="technology-section">
        <h2>Kullandığımız Teknolojiler</h2>
        <div className="tech-grid">
          <div className="tech-item">
            <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="React" />
            <span>React JS</span>
          </div>
          <div className="tech-item">
            <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg" alt="Python" />
            <span>Python</span>
          </div>
          <div className="tech-item">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg" alt="Flask" />
            <span>Flask</span>
          </div>
          <div className="tech-item">
            <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" />
            <span>PostgreSQL</span>
          </div>
          <div className="tech-item">
            <img src="https://scikit-learn.org/stable/_static/scikit-learn-logo-small.png" alt="Scikit-learn" />
            <span>Scikit-Learn</span>
          </div>
        </div>
      </section>

      {/* HAKKIMIZDA */}
      <section id="about" className="about-section">
        <h2>Hakkımızda</h2>
        <p>
          Proje, Bandırma 17 Eylül Üniversitesi Bilgisayar Mühendisliği
          bitirme dersi kapsamında
          <strong> Hasancan Eser </strong> ve <strong> Davut Kırtak </strong>
          tarafından geliştirilmekte; danışmanlığını
          <strong> Doç. Dr. Mehmet Akif Çiftçi </strong> yürütmektedir.
        </p>
      </section>

      {/* İLETİŞİM */}
      <section id="contact" className="contact-section">
        <h2>İletişim</h2>
        <p>Görüş ve önerileriniz için bize ulaşın:</p>
        <ul>
          <li>E-posta: <a href="mailto:info@financialapp.dev">info@financialapp.dev</a></li>
        </ul>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} Finansal Analiz — Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
