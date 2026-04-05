import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const PublicNavbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        :root {
          --bg: rgba(255,255,255,0.7);
          --fg: #0f172a;            /* slate-900 */
          --muted: #475569;         /* slate-600 */
          --ring: rgba(59,130,246,.35);
          --brand: #0ea5e9;         /* sky-500 */
          --brand-600: #0284c7;
          --surface: rgba(255,255,255,.55);
          --btn-bg: #0f172a;
          --btn-fg: #ffffff;
          --shadow: 0 10px 30px rgba(2, 8, 23, .08);
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --bg: rgba(15,23,42,.55);
            --fg: #e2e8f0;          /* slate-200 */
            --muted: #94a3b8;       /* slate-400 */
            --ring: rgba(56,189,248,.35);
            --brand: #38bdf8;       /* sky-400 */
            --brand-600: #0ea5e9;
            --surface: rgba(2,6,23,.55);
            --btn-bg: #e2e8f0;
            --btn-fg: #0f172a;
            --shadow: 0 12px 36px rgba(0,0,0,.35);
          }
        }

        /* Reset-esque */
        .navbar * { box-sizing: border-box; }

        .navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: saturate(160%) blur(10px);
          -webkit-backdrop-filter: saturate(160%) blur(10px);
          background: var(--bg);
          border-bottom: 1px solid rgba(148,163,184,.15);
          transition: box-shadow .25s ease, transform .25s ease, background .25s ease;
        }
        .navbar.scrolled {
          box-shadow: var(--shadow);
          background: var(--surface);
          transform: translateZ(0);
        }

        .nav-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: .9rem 1.1rem;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: .75rem;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: .55rem;
          font-weight: 800;
          letter-spacing: .2px;
          text-decoration: none;
          color: var(--fg);
          font-size: clamp(1.05rem, 2vw, 1.25rem);
          line-height: 1;
          padding: .5rem .65rem;
          border-radius: 14px;
          transition: background .2s ease, transform .15s ease;
        }
        .brand:before{
          content: "";
          width: 10px; height: 10px;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 30%, var(--brand), var(--brand-600));
          box-shadow: 0 0 0 6px rgba(56,189,248,.15), 0 0 24px rgba(56,189,248,.45);
        }
        .brand:hover { background: rgba(148,163,184,.12); transform: translateY(-1px); }

        .nav-cta {
          display: inline-flex;
          align-items: center;
          gap: .55rem;
        }

        .btn {
          --btn-pad-x: .9rem;
          --btn-pad-y: .55rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: .5rem;
          height: 2.25rem;
          padding: var(--btn-pad-y) var(--btn-pad-x);
          border-radius: 12px;
          font-size: .95rem;
          font-weight: 600;
          line-height: 1;
          text-decoration: none;
          border: 1px solid rgba(148,163,184,.28);
          color: var(--fg);
          background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,.25));
          transition: transform .15s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;
        }
        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(2, 8, 23, .08);
          border-color: rgba(148,163,184,.45);
          background: linear-gradient(180deg, rgba(255,255,255,.65), rgba(255,255,255,.3));
        }
        .btn:active { transform: translateY(0); }

        .btn-sm { height: 2.2rem; font-size: .93rem; }

        .btn-primary {
          background: radial-gradient(120% 120% at 0% 0%, var(--brand), var(--brand-600));
          color: var(--btn-fg);
          border-color: transparent;
        }
        .btn-primary:hover {
          box-shadow: 0 10px 24px var(--ring);
          filter: saturate(110%);
        }

        /* Tiny screens: stack buttons */
        @media (max-width: 420px) {
          .nav-inner { grid-template-columns: 1fr; }
          .nav-cta { justify-content: flex-start; }
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .navbar, .btn, .brand { transition: none !important; }
          .brand:hover, .btn:hover { transform: none !important; }
        }
      `}</style>

      <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <Link to="/" className="brand" aria-label="UstaPort anasayfa">
            UstaPort
          </Link>

          <div className="nav-cta">
            <Link to="/login" className="btn btn-sm" aria-label="Giriş yap">
              Giriş Yap
            </Link>
            <Link to="/register" className="btn btn-sm btn-primary" aria-label="Kayıt ol">
              Hizmet Ver
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default PublicNavbar;
