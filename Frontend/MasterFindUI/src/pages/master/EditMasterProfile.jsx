import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MasterProfileForm from "../../components/master/MasterProfileForm";
import { masterService } from "../../services/masterService";
import { lookupsService } from "../../services/lookupsService";

const EditMasterProfile = () => {
  const [initialData, setInitialData] = useState(null);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showTopHint, setShowTopHint] = useState(true);

  const navigate = useNavigate();
  const errorRef = useRef(null);

  useEffect(() => {
    const fetchDataForEdit = async () => {
      try {
        const [profileRes, categoriesRes, locationsRes] = await Promise.all([
          masterService.getMyProfile(),
          lookupsService.getServiceCategoriesWithServices(),
          lookupsService.getAllLocations(),
        ]);
        setInitialData(profileRes.data);
        setServiceCategories(categoriesRes.data);
        setLocations(locationsRes.data);
      } catch (err) {
        if (err?.response && err.response.status === 404) {
          setError("Düzenlenecek bir profil bulunamadı. Lütfen önce bir profil oluşturun.");
        } else {
          setError("Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.");
        }
        console.error("Veri çekme hatası:", err?.response || err);
      } finally {
        setLoading(false);
      }
    };

    fetchDataForEdit();
  }, []);

  // Keyboard shortcuts: F = focus form, S = scroll bottom
  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key?.toLowerCase();
      if (k === "f") {
        document.getElementById("profile-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (k === "s") {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  const handleUpdateProfile = async (formData) => {
    setSubmitting(true);
    setError("");
    try {
      await masterService.updateProfile(formData);
      navigate("/master/dashboard");
    } catch (err) {
      console.error("Profil güncelleme hatası:", err?.response || err);
      if (err?.response) {
        const status = err.response.status;
        const serverErrors = err.response.data?.errors?.join(", ");
        setError(
          `Sunucu Hatası (${status}): ${serverErrors || "İstek işlenemedi. Lütfen alanları kontrol edip tekrar deneyin."}`
        );
      } else if (err?.request) {
        setError("Ağ hatası. Sunucuya ulaşılamıyor, lütfen internet bağlantınızı veya sunucu durumunu kontrol edin.");
      } else {
        setError("İstek gönderilirken beklenmedik bir hata oluştu.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const GradientText = ({ children }) => <span className="gtxt">{children}</span>;

  const subBadges = useMemo(
    () => [
      { label: "Mevcut profil" },
      { label: "Hızlı kaydet" },
      { label: "Versiyonlama yok" },
    ],
    []
  );

  return (
    <>
      <style>{`
        :root{
          /* Palette */
          --page:#ffffff;
          --page-2:#f6f7fb;
          --text:#0f172a;
          --muted:#5b667a;
          --border:#e6e8ef;
          --card:#ffffff;
          --ring:rgba(60,80,220,.32);

          --accent:#4f46e5;    /* indigo-600 */
          --accent-2:#22d3ee;  /* cyan-400 */
          --accent-3:#d946ef;  /* fuchsia-500 */

          --good:#10b981; --warn:#f59e0b; --bad:#ef4444;

          --shadow-lg:0 20px 60px rgba(10,20,60,.10);
          --shadow-md:0 10px 28px rgba(10,20,60,.08);
          --radius:22px; --radius-sm:14px;
          --container:1120px;
        }
        *{box-sizing:border-box}
        html,body,#root{height:100%}
        body{margin:0;background:var(--page);color:var(--text);
          font-family:ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial}

        /* Page center */
        .page{min-height:100vh;display:flex;justify-content:center;align-items:stretch;
          padding:28px clamp(12px,4vw,24px) 96px;background:var(--page)}
        .container{width:min(100%,var(--container));margin-inline:auto}

        /* Hero */
        .hero{overflow:hidden;border:1px solid var(--border);border-radius:28px;background:
          linear-gradient(180deg,rgba(255,255,255,.92),rgba(255,255,255,.75));backdrop-filter:saturate(1.2) blur(4px);
          box-shadow:var(--shadow-lg)}
        .heroTop{height:172px;background:
          radial-gradient(880px 260px at 18% 0%, rgba(255,255,255,.6), transparent 60%),
          linear-gradient(90deg, rgba(79,70,229,.55), rgba(217,70,239,.35), rgba(34,211,238,.40))}
        .heroBody{display:grid;gap:22px;grid-template-columns:1fr auto;padding:0 26px 26px;transform:translateY(-42px)}
        .title{margin:0;font-size:34px;font-weight:900;letter-spacing:.2px}
        .subtitle{margin:10px 0 0;color:var(--muted)}
        .badgeRow{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
        .badge{display:inline-flex;align-items:center;gap:8px;padding:7px 12px;border-radius:999px;font-size:12px;
          background:#edf2ff;color:#3843c9;border:1px solid #e3e8ff}
        .cta{display:inline-flex;align-items:center;gap:10px;border:none;border-radius:14px;padding:12px 16px;
          background:linear-gradient(135deg,#111827,#1f2937);color:#fff;font-weight:800;cursor:pointer;text-decoration:none;
          box-shadow:var(--shadow-md);transition:transform .14s ease, box-shadow .22s ease}
        .cta:hover{transform:translateY(-1px);box-shadow:0 16px 38px rgba(17,24,39,.18)}
        .keys{display:inline-flex;gap:6px;align-items:center;font-size:12px;color:var(--muted)}
        .key{border:1px solid var(--border);background:#f3f4f6;border-radius:6px;padding:2px 6px}

        /* Stepper */
        .stepper{display:flex;gap:14px;align-items:center;margin-top:14px;flex-wrap:wrap}
        .dot{--c:var(--accent-2);display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;font-size:12px;
          border:1px solid var(--border);background:#f8fafc}
        .dot::before{content:"";width:8px;height:8px;border-radius:999px;background:var(--c);box-shadow:0 0 0 4px rgba(34,211,238,.18)}
        .dot.muted{--c:#cbd5e1;opacity:.9}

        /* Gradient text */
        .gtxt{background:linear-gradient(90deg,var(--accent),var(--accent-3),var(--accent-2));
          -webkit-background-clip:text;background-clip:text;color:transparent}

        /* Content grid */
        .grid{margin-top:22px;display:grid;gap:18px;grid-template-columns:1fr}
        .panel{position:relative;overflow:hidden;padding:22px;border-radius:var(--radius);border:1px solid var(--border);
          background:var(--card);box-shadow:var(--shadow-md)}
        .panel h3{margin:0 0 12px;font-size:16px;letter-spacing:.2px;display:flex;align-items:center;gap:8px}
        .divider{height:1px;background:linear-gradient(90deg,transparent,var(--border),transparent);margin:12px 0}

        /* Sticky sub-header */
        .stickyBar{position:sticky;top:12px;z-index:2;display:flex;gap:10px;justify-content:space-between;align-items:center}
        .hint{color:var(--muted);font-size:12px}
        .actions{display:flex;gap:8px}
        .ghost{border:1px solid var(--border);background:#f8fafc;color:var(--text);border-radius:10px;padding:8px 12px;cursor:pointer}
        .ghost:hover{background:#eef2f7}

        /* Error toast */
        .error{border:1px solid rgba(239,68,68,.35);background:#fff5f5;color:#7f1d1d;padding:12px 14px;border-radius:14px;
          display:flex;gap:10px;align-items:center}
        .error svg{flex:0 0 18px}

        /* Skeletons */
        .skel{background:linear-gradient(90deg,#eef1f7,#f5f7fb,#eef1f7);border-radius:10px;height:14px}
        .skel.big{height:42px;border-radius:12px}
        .skel.box{height:240px;border-radius:16px}
        @media (prefers-reduced-motion:no-preference){
          .skel{background-size:200% 100%;animation:shimmer 1.6s ease-in-out infinite}
          @keyframes shimmer{0%{background-position:0% 0}100%{background-position:200% 0}}
        }

        /* Submitting overlay */
        .overlay{position:fixed;inset:0;background:rgba(255,255,255,.68);backdrop-filter:blur(3px);
          display:grid;place-items:center;z-index:20}
        .spinner{width:58px;height:58px;border-radius:50%;border:4px solid rgba(17,24,39,.12);
          border-top-color:#111827;animation:spin 1s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* Responsive */
        @media (max-width:820px){
          .heroBody{grid-template-columns:1fr;transform:translateY(-36px)}
          .stickyBar{top:8px}
        }
      `}</style>

      <main className="page" role="main">
        <div className="container">
          {/* HERO */}
          <section className="hero" aria-label="Başlık">
            <div className="heroTop" aria-hidden />
            <div className="heroBody">
              <header>
                <h1 className="title"><GradientText>Profilinizi Düzenleyin</GradientText></h1>
                <p className="subtitle">Bilgilerinizi güncelleyerek potansiyel müşteriler için güncel kalın.</p>

                <div className="badgeRow" aria-label="Durum rozetleri">
                  {subBadges.map((b, i) => (
                    <span className="badge" key={i} title={b.title || b.label}>{b.label}</span>
                  ))}
                </div>

                <div className="stepper" aria-hidden>
                  <span className="dot">Genel Bilgiler</span>
                  <span className="dot">Hizmetler</span>
                  <span className="dot muted">Bölgeler</span>
                </div>
              </header>

              <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
                <button
                  type="button"
                  className="cta"
                  onClick={() => document.getElementById("profile-form")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                >
                  Düzenlemeye Başla
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                <span className="keys" aria-hidden>
                  <span className="key">F</span> formu odakla · <span className="key">S</span> alta kaydır
                </span>
              </div>
            </div>
          </section>

          {/* Optional info banner */}
          {showTopHint && (
            <div className="panel" style={{ marginTop: 16, padding: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 9v4M12 17h.01M12 3a9 9 0 100 18 9 9 0 000-18z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="hint">Değişikliklerinizi kaydetmeyi unutmayın.</span>
                </div>
                <button className="ghost" onClick={() => setShowTopHint(false)}>Kapat</button>
              </div>
            </div>
          )}

          <div className="grid">
            {/* Critical error without data */}
            {error && !initialData && (
              <div
                className="panel error"
                role="alert"
                aria-live="assertive"
                tabIndex={-1}
                ref={errorRef}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 9v4M12 17h.01M12 3a9 9 0 100 18 9 9 0 000-18z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Loading skeletons */}
            {loading ? (
              <section className="panel" aria-busy="true" aria-live="polite">
                <h3>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Veriler Yükleniyor…
                </h3>
                <div className="divider" />
                <div style={{ display: "grid", gap: 12 }}>
                  <div className="skel big" />
                  <div className="skel" style={{ width: "72%" }} />
                  <div className="skel" style={{ width: "56%" }} />
                  <div className="skel box" />
                  <div className="skel big" />
                </div>
              </section>
            ) : (
              initialData && (
                <section className="panel" id="profile-form">
                  {error && (
                    <div className="error" style={{ marginBottom: 12 }} role="alert" aria-live="assertive">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M12 9v4M12 17h.01M12 3a9 9 0 100 18 9 9 0 000-18z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="stickyBar">
                    <span className="hint">Güncellemelerinizi kontrol edip kaydedin.</span>
                    <div className="actions">
                      <button className="ghost" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Yukarı</button>
                      <button className="ghost" onClick={() => window.location.reload()}>Yenile</button>
                    </div>
                  </div>

                  <h3>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Profil Düzenleme Formu
                  </h3>
                  <div className="divider" />

                  <MasterProfileForm
                    onSubmit={handleUpdateProfile}
                    initialData={initialData}
                    serviceCategories={serviceCategories}
                    locations={locations}
                    submitButtonText="Değişiklikleri Kaydet"
                  />
                </section>
              )
            )}
          </div>
        </div>
      </main>

      {submitting && (
        <div className="overlay" role="alert" aria-live="assertive">
          <div style={{ display: "grid", placeItems: "center", gap: 14 }}>
            <div className="spinner" aria-hidden />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 800 }}>Değişiklikler Kaydediliyor…</div>
              <div className="hint">Lütfen pencereyi kapatmayın.</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditMasterProfile;
