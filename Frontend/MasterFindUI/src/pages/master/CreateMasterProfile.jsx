import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MasterProfileForm from '../../components/master/MasterProfileForm';
import { masterService } from '../../services/masterService';
import { lookupsService } from '../../services/lookupsService';

const CreateMasterProfile = () => {
  // Lookup data
  const [serviceCategories, setServiceCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  // UI state
  const [error, setError] = useState('');
  const [loadingLookups, setLoadingLookups] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [categoriesRes, locationsRes] = await Promise.all([
          lookupsService.getServiceCategoriesWithServices(),
          lookupsService.getAllLocations(),
        ]);
        setServiceCategories(categoriesRes.data);
        setLocations(locationsRes.data);
      } catch (err) {
        setError('Form verileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        console.error(err);
      } finally {
        setLoadingLookups(false);
      }
    };

    fetchLookups();
  }, []);

  // Submit
  const handleCreateProfile = async (formData) => {
    try {
      await masterService.createProfile(formData);
      navigate('/master/dashboard');
    } catch (err) {
      console.error('Profil oluşturma hatası:', err?.response || err);
      if (err?.response?.data?.errors) {
        setError(err.response.data.errors.join(', '));
      } else if (err?.message) {
        setError(`Bir ağ hatası oluştu: ${err.message}`);
      } else {
        setError('Profil oluşturulurken beklenmedik bir hata oluştu.');
      }
    }
  };

  return (
    <>
      {/* Inline CSS — No external files */}
      <style>{`
        :root{
          /* Core palette */
          --bg:#090d18;          /* page base */
          --bg-2:#0d1426;        /* depth */
          --panel:#0f172a;       /* panel base */
          --text:#eaf0ff;        /* main text */
          --muted:rgba(234,240,255,.78);
          --ring:rgba(168,187,255,.30);
          --accent:#7c83ff;      /* indigo */
          --accent-2:#22d3ee;    /* cyan */
          --accent-3:#d946ef;    /* fuchsia */
          --good:#10b981;        /* emerald */
          --warn:#f59e0b;
          --bad:#ef4444;
          --cardBorder:rgba(255,255,255,.12);
          --glassA:rgba(255,255,255,.07);
          --glassB:rgba(255,255,255,.045);
          --shadow:0 22px 70px rgba(0,0,0,.52);
        }
        *{box-sizing:border-box}
        html,body,#root{height:100%}
        body{ margin:0; }

        /* Page background with soft beams and noise-like gradients */
        .page{ min-height:100vh; color:var(--text); background:
          radial-gradient(90rem 38rem at 85% -12%, rgba(124,131,255,.22), transparent 60%),
          radial-gradient(70rem 30rem at 12% -16%, rgba(34,211,238,.16), transparent 60%),
          linear-gradient(180deg, var(--bg), var(--bg-2) 44%, var(--bg));
        }
        .container{ max-width:1140px; margin:0 auto; padding:40px 20px 120px; }

        /* ——— utility ——— */
        .sr{position:absolute !important; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0}

        /* ——— gradient-border helper ——— */
        .aura{ position:relative; isolation:isolate; border-radius:28px; }
        .aura::before{
          content:""; position:absolute; inset:-1px; padding:1px; border-radius:inherit;
          background:conic-gradient(from 160deg, rgba(124,131,255,.7), rgba(217,70,239,.55), rgba(34,211,238,.55), rgba(124,131,255,.7));
          -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite:xor; mask-composite:exclude; opacity:.35; filter:blur(.4px); pointer-events:none;
        }
        @media (prefers-reduced-motion:no-preference){ .aura::before{ animation:spin 14s linear infinite } @keyframes spin{ to{ transform:rotate(360deg) } } }

        /* ——— HERO ——— */
        .hero{ overflow:hidden; border:1px solid var(--cardBorder); background:linear-gradient(180deg,var(--glassA),var(--glassB)); backdrop-filter:blur(8px); box-shadow:var(--shadow); }
        .heroTop{ height:170px; position:relative; background:
          radial-gradient(820px 240px at 18% 0%, rgba(255,255,255,.13), transparent 60%),
          linear-gradient(90deg, rgba(124,131,255,.35), rgba(217,70,239,.22), rgba(34,211,238,.22));
        }
        .heroBody{ display:grid; gap:20px; grid-template-columns:1fr auto; padding:0 26px 24px; transform:translateY(-48px); }
        .title{ margin:0; font-size:32px; line-height:1.12; font-weight:900; letter-spacing:.2px }
        .subtitle{ margin:8px 0 0; color:var(--muted) }
        .badgeRow{ display:flex; gap:8px; margin-top:12px; flex-wrap:wrap }
        .badge{ display:inline-flex; align-items:center; gap:8px; padding:7px 12px; border-radius:999px; font-size:12px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.16) }
        .cta{ display:inline-flex; align-items:center; gap:10px; border:none; border-radius:14px; padding:11px 16px; background:linear-gradient(135deg,#fff,#eef3ff); color:#0b1220; font-weight:800; cursor:pointer; text-decoration:none; box-shadow:0 10px 28px rgba(255,255,255,.16); transition:transform .14s ease, box-shadow .22s ease }
        .cta:hover{ transform:translateY(-1px); box-shadow:0 16px 38px rgba(255,255,255,.22) }

        /* ——— Progress / Stepper (visual only) ——— */
        .stepper{ display:flex; gap:14px; align-items:center; margin-top:14px; flex-wrap:wrap }
        .dot{ --c:var(--accent-2); display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:999px; font-size:12px; border:1px solid rgba(255,255,255,.16); background:rgba(255,255,255,.05) }
        .dot::before{ content:""; width:8px; height:8px; border-radius:999px; background:var(--c); box-shadow:0 0 0 4px rgba(34,211,238,.16) }
        .dot.muted{ --c:#94a3b8; opacity:.8 }

        /* ——— Content layout ——— */
        .grid{ margin-top:22px; display:grid; gap:18px; grid-template-columns: 1fr; }
        .panel{ position:relative; overflow:hidden; padding:22px; border-radius:22px; border:1px solid var(--cardBorder); background:linear-gradient(180deg,var(--glassA),var(--glassB)); box-shadow:0 14px 40px rgba(0,0,0,.4) }
        .panel h3{ margin:0 0 12px; font-size:16px; letter-spacing:.2px; display:flex; align-items:center; gap:8px }
        .divider{ height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.14),transparent); margin:12px 0 }

        /* ——— Error toast style ——— */
        .error{ border:1px solid rgba(239,68,68,.45); background:linear-gradient(180deg, rgba(239,68,68,.18), rgba(239,68,68,.12)); color:#ffe4e6; padding:12px 14px; border-radius:14px; display:flex; gap:10px; align-items:center }
        .error svg{ flex:0 0 18px }

        /* ——— Skeletons ——— */
        .skel{ background:linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,.16), rgba(255,255,255,.06)); border-radius:10px; height:14px; }
        .skel.big{ height:42px; border-radius:12px }
        .skel.box{ height:240px; border-radius:16px }
        @media (prefers-reduced-motion:no-preference){ .skel{ background-size:200% 100%; animation: shimmer 1.6s ease-in-out infinite } @keyframes shimmer{ 0%{background-position:0% 0} 100%{background-position:200% 0} } }

        /* ——— Sticky sub-header for form actions (visual, not interactive) ——— */
        .stickyBar{ position:sticky; top:12px; z-index:2; display:flex; gap:10px; justify-content:flex-end }
        .hint{ color:var(--muted); font-size:12px }

        /* ——— Responsive ——— */
        @media (max-width:820px){ .heroBody{ grid-template-columns:1fr; transform:translateY(-40px) } .stickyBar{ top:8px } }
      `}</style>

      <div className="page">
        <div className="container">
          {/* HERO */}
          <section className="hero aura" aria-label="Başlık">
            <div className="heroTop"/>
            <div className="heroBody">
              <div>
                <h1 className="title">Usta Profilinizi Oluşturun</h1>
                <p className="subtitle">Müşterilerin sizi kolayca bulabilmesi için profesyonel bilgilerinizi eksiksiz doldurun.</p>
                <div className="badgeRow">
                  <span className="badge" title="Zorunlu alanlar formda belirtilecek">Zorunlu alanlar</span>
                  <span className="badge">Profil ön izleme</span>
                  <span className="badge">Hızlı onay</span>
                </div>
                {/* Visual-only stepper */}
                <div className="stepper" aria-hidden>
                  <span className="dot">Genel Bilgiler</span>
                  <span className="dot">Hizmetler</span>
                  <span className="dot muted">Bölgeler</span>
                </div>
              </div>
              <div style={{display:'grid', gap:10, alignContent:'start'}}>
                <button type="button" className="cta" onClick={()=>window.scrollTo({top:document.body.scrollHeight, behavior:'smooth'})}>
                  Formu Doldurmaya Başla
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </section>

          {/* CONTENT */}
          <div className="grid">
            {/* Error banner */}
            {error && (
              <div className="panel error" role="alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 9v4M12 17h.01M12 3a9 9 0 100 18 9 9 0 000-18z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Loading state with skeletons */}
            {loadingLookups ? (
              <div className="panel aura" aria-busy="true" aria-live="polite">
                <h3>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Form Yükleniyor…
                </h3>
                <div className="divider"/>
                <div style={{display:'grid', gap:12}}>
                  <div className="skel big"/>
                  <div className="skel" style={{width:'72%'}}/>
                  <div className="skel" style={{width:'56%'}}/>
                  <div className="skel box"/>
                  <div className="skel big"/>
                </div>
              </div>
            ) : (
              <div className="panel aura" id="profile-form">
                <div className="stickyBar">
                  <span className="hint">Formu doldururken bilgilerinizi kaydetmeyi unutmayın.</span>
                </div>
                <h3>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Profil Formu
                </h3>
                <div className="divider"/>
                {/* Existing business form */}
                <MasterProfileForm
                  onSubmit={handleCreateProfile}
                  serviceCategories={serviceCategories}
                  locations={locations}
                  submitButtonText="Profili Oluştur"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateMasterProfile;
