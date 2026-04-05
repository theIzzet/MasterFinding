import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { masterService } from "../../services/masterService";

// ---- ENV & URL HELPERS ----
const DEV_API_BASE_URL = "https://localhost:7054";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? DEV_API_BASE_URL : "");

// ---- COMPONENT ----
const MasterDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await masterService.getMyProfile();
        setProfile(response.data);
      } catch (err) {
        if (!(err?.response && err.response.status === 404)) {
          setError("Profil bilgileri yüklenirken bir sorun oluştu.");
          console.error("Dashboard fetch error:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const fullProfileImageUrl = profile?.profileImageUrl
    ? `${API_BASE_URL}${profile.profileImageUrl}`
    : "https://placehold.co/160x160/png?text=Usta";

  const fullCertificateUrl = profile?.certificateUrl
    ? `${API_BASE_URL}${profile.certificateUrl}`
    : null;

  return (
    <>
      {/* INLINE STYLES */}
      <style>{`
        :root{
          --bg:#0b0f1a;
          --bg-2:#0e1525;
          --text:#eaf0ff;
          --muted:rgba(234,240,255,.7);
          --soft:rgba(234,240,255,.55);
          --card:rgba(255,255,255,.06);
          --cardBorder:rgba(255,255,255,.10);
          --ring:rgba(180,200,255,.32);
          --white:#fff;
          --indigo:#6366f1;
          --fuchsia:#d946ef;
          --cyan:#22d3ee;
          --emerald:#10b981;
        }
        *{box-sizing:border-box}
        .page{
          min-height:100vh;
          color:var(--text);
          background:
            radial-gradient(60rem 30rem at 70% -5%, rgba(99,102,241,.22), transparent),
            radial-gradient(50rem 26rem at 10% -10%, rgba(34,211,238,.16), transparent),
            linear-gradient(180deg, var(--bg), var(--bg-2) 40%, var(--bg));
        }
        .container{
          /* daha geniş görünüm */
          max-width:1440px; 
          margin:0 auto;
          padding:32px 20px 80px;
        }

        /* -------- HERO -------- */
        .heroWrap{
          position:relative;
          margin-inline:auto;
          border-radius:28px;
          overflow:hidden;
          border:1px solid var(--cardBorder);
          backdrop-filter:blur(8px);
          background:linear-gradient(90deg, rgba(99,102,241,.25), rgba(217,70,239,.18), rgba(34,211,238,.18));
          box-shadow:0 24px 60px rgba(0,0,0,.45);
          isolation:isolate;
        }
        .heroWrap::before{
          content:"";
          position:absolute; inset:-1px;
          border-radius:28px;
          padding:1px; 
          background:linear-gradient(120deg, rgba(99,102,241,.7), rgba(217,70,239,.65), rgba(34,211,238,.6));
          -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite:xor; mask-composite:exclude;
          pointer-events:none;
          opacity:.35;
        }
        .heroTop{
          height:180px;
          background:
            radial-gradient(800px 240px at 20% 0%, rgba(255,255,255,.12), transparent 60%),
            linear-gradient(90deg, rgba(99,102,241,.35), rgba(217,70,239,.26), rgba(34,211,238,.26));
        }
        .heroBody{
          display:grid; gap:24px;
          grid-template-columns: auto 1fr auto;
          padding: 0 28px 26px;
          transform: translateY(-46px);
        }
        .avatar{
          width:132px;height:132px;object-fit:cover;border-radius:20px;
          border:4px solid var(--bg-2);
          box-shadow:0 16px 40px rgba(0,0,0,.55), 0 0 0 2px var(--ring) inset;
          background:#1f2940;
        }
        .title{margin:0;font-size:32px;line-height:1.15;font-weight:800;letter-spacing:.2px}
        .company{margin:6px 0 0;color:var(--muted)}
        .xp{
          display:inline-flex;align-items:center;gap:8px;
          margin-top:12px;
          font-size:13px;color:#bdfbe0;
          background:rgba(16,185,129,.14);
          border:1px solid rgba(16,185,129,.36);
          padding:7px 12px;border-radius:999px;
          box-shadow:inset 0 0 20px rgba(16,185,129,.12);
        }
        .editBtn, .cta{
          display:inline-flex;align-items:center;gap:10px;
          border:none;border-radius:14px;padding:11px 16px;
          background:linear-gradient(135deg,#fff,#f1f5ff);
          color:#0b1220;font-weight:700;cursor:pointer;
          box-shadow:0 10px 28px rgba(255,255,255,.15);
          transition:transform .12s ease, box-shadow .2s ease, opacity .12s ease;
          text-decoration:none;
        }
        .editBtn:hover, .cta:hover{transform:translateY(-1px);box-shadow:0 16px 34px rgba(255,255,255,.18)}
        .heroStats{
          display:flex; gap:10px; margin-top:12px; flex-wrap:wrap;
        }
        .pill{
          display:inline-flex;align-items:center;gap:8px;
          padding:6px 12px;border-radius:999px;font-size:12px;
          border:1px solid rgba(255,255,255,.16); background:rgba(255,255,255,.06);
        }

        /* -------- GRID -------- */
        .grid{
          margin-top:18px;
          display:grid; gap:18px;
          grid-template-columns: repeat(3, minmax(0,1fr));
        }
        .card{
          border:1px solid var(--cardBorder);
          background:rgba(255,255,255,.05);
          border-radius:20px; padding:20px;
          box-shadow:0 10px 30px rgba(0,0,0,.35);
          position:relative; overflow:hidden;
        }
        .card::after{
          content:""; position:absolute; inset:0;
          background:radial-gradient(240px 120px at 100% 0%, rgba(255,255,255,.06), transparent 60%);
          pointer-events:none;
        }
        .card h3{margin:0 0 12px; font-size:16px; letter-spacing:.2px}
        .desc{color:rgba(234,240,255,.86); line-height:1.6}
        .tags{display:flex;flex-wrap:wrap; gap:8px}
        .tag{
          display:inline-flex;align-items:center;gap:6px;
          border-radius:999px; padding:7px 12px; font-size:13px;
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.16);
          transition: filter .15s ease, transform .15s ease;
        }
        .tag:hover{filter:brightness(1.15); transform:translateY(-1px)}
        .tag.indigo{ color:#d7dbff; border-color:rgba(99,102,241,.45); background:rgba(99,102,241,.14); box-shadow:inset 0 0 24px rgba(99,102,241,.12)}
        .tag.cyan{ color:#c9fbff; border-color:rgba(34,211,238,.45); background:rgba(34,211,238,.16); box-shadow:inset 0 0 24px rgba(34,211,238,.12)}

        .wide{ grid-column: 1 / -1; background:linear-gradient(90deg, rgba(255,255,255,.04), rgba(255,255,255,.08)); }

        .linkBtn{
          display:inline-flex;align-items:center;gap:8px;
          padding:10px 14px;border-radius:12px;
          background:linear-gradient(135deg,#fff,#eef3ff);
          color:#0b1220;font-weight:700;text-decoration:none;
          box-shadow:0 10px 26px rgba(255,255,255,.14);
          transition:transform .12s ease, box-shadow .2s ease;
        }
        .linkBtn:hover{transform:translateY(-1px); box-shadow:0 16px 34px rgba(255,255,255,.18)}

        /* ---- states ---- */
        .centerWrap{max-width:920px;margin:60px auto;padding:0 16px}
        .stateCard{
          text-align:center;padding:28px;border:1px solid var(--cardBorder);
          background:var(--card); border-radius:24px;
          box-shadow:0 20px 60px rgba(0,0,0,.45);
        }
        .muted{color:var(--muted)}
        .loading, .error{max-width:760px;margin:24px auto}
        
        /* ---- responsive ---- */
        @media (max-width:1200px){ .grid{grid-template-columns: repeat(2, minmax(0,1fr));} }
        @media (max-width:820px){
          .heroBody{ grid-template-columns:1fr; transform:translateY(-36px); padding:0 20px 22px; }
          .grid{ grid-template-columns:1fr; }
        }
      `}</style>

      <div className="page">
        <div className="container">
          {/* LOADING */}
          {loading && (
            <div className="stateCard loading">
              Yükleniyor...
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="stateCard error">
              {error}
            </div>
          )}

          {/* EMPTY */}
          {!loading && !error && !profile && (
            <div className="centerWrap">
              <div className="stateCard">
                <h2 style={{margin:"0 0 8px"}}>Usta Paneline Hoş Geldiniz!</h2>
                <p className="muted" style={{margin:"0 0 16px"}}>
                  Müşterilerinize ulaşmak için ilk adımı atın. Henüz bir usta profiliniz bulunmuyor.
                </p>
                <Link to="/master/profile/create" className="cta">
                  Profil Oluştur
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M7 17L17 7M10 7h7v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </Link>
              </div>
            </div>
          )}

          {/* PROFILE */}
          {!loading && !error && profile && (
            <>
              {/* HERO */}
              <div className="heroWrap">
                <div className="heroTop" />
                <div className="heroBody">
                  <img className="avatar" src={fullProfileImageUrl} alt={`${profile.name} ${profile.surName}`}
                       onError={(e)=> e.currentTarget.src="https://placehold.co/160x160/png?text=Usta"} />

                  <div>
                    <h1 className="title">
                      {profile.name} {profile.surName}
                    </h1>
                    {profile.companyName && <p className="company">{profile.companyName}</p>}
                    <div className="xp">
                      {/* star */}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                      </svg>
                      {profile.yearsOfExperience} yıllık tecrübe
                    </div>

                    {/* küçük istatistik pills */}
                    <div className="heroStats">
                      <span className="pill">
                        {/* wrench */}<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 19l-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                        {profile?.services?.length || 0} hizmet
                      </span>
                      <span className="pill">
                        {/* pin */}<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 22s7-7 7-12a7 7 0 10-14 0c0 5 7 12 7 12z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                        {profile?.locations?.length || 0} bölge
                      </span>
                    </div>
                  </div>

                  <div>
                    <button onClick={()=> navigate("/master/profile/edit")} className="editBtn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
                      </svg>
                      Profili Düzenle
                    </button>
                  </div>
                </div>
              </div>

              {/* GRID */}
              <div className="grid">
                <section className="card">
                  <h3>Hakkında</h3>
                  <p className="desc">{profile.description}</p>
                </section>

                <section className="card">
                  <h3>Uzmanlık Alanları (Hizmetler)</h3>
                  <div className="tags">
                    {profile?.services?.length ? (
                      profile.services.map((s)=>(
                        <span key={s.id} className="tag indigo">{s.name}</span>
                      ))
                    ):(
                      <span className="muted">Henüz hizmet bilgisi eklenmemiş.</span>
                    )}
                  </div>
                </section>

                <section className="card">
                  <h3>Hizmet Verilen Bölgeler</h3>
                  <div className="tags">
                    {profile?.locations?.length ? (
                      profile.locations.map((l)=>(
                        <span key={l.id} className="tag cyan">{l.ilce}, {l.il}</span>
                      ))
                    ):(
                      <span className="muted">Bölge bilgisi bulunmuyor.</span>
                    )}
                  </div>
                </section>

                {fullCertificateUrl && (
                  <section className="card wide">
                    <h3>Belgeler</h3>
                    <a className="linkBtn" href={fullCertificateUrl} target="_blank" rel="noopener noreferrer">
                      Ustalık Belgesini Görüntüle
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="ml">
                        <path d="M7 17L17 7M10 7h7v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </a>
                  </section>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MasterDashboard;
