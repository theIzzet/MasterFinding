import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import PublicNavbar from "../../components/layout/PublicNavbar";
import { lookupsService } from "../../services/lookupsService";
import "../../css/MasterPublicProfile.css";

/** --- Backend base URL --- */
const DEV_API_BASE_URL = "https://localhost:7054";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? DEV_API_BASE_URL : DEV_API_BASE_URL);


function buildAssetUrl(pathOrUrl) {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl; // zaten absolute
  if (pathOrUrl.startsWith("/")) return `${API_BASE_URL}${pathOrUrl}`;
  return `${API_BASE_URL}/${pathOrUrl}`;
}

/** Bazı servisler .data döndürür, bazıları doğrudan obje döndürebilir */
const unwrap = (v) => (v && typeof v === "object" && "data" in v ? v.data : v);

/** Gelen kaydın appUserId'si route param id ile eşleşiyor mu? */
const isSameUser = (obj, id) =>
  obj && obj.appUserId && String(obj.appUserId) === String(id);

const MasterPublicProfile = () => {
  const { id } = useParams(); // appUserId (GUID)
  const { state } = useLocation(); // state?.master varsa hızlı render
  const navigate = useNavigate();

  const initialMaster =
    state?.master && isSameUser(state.master, id) ? state.master : null;

  const [master, setMaster] = useState(initialMaster);
  const [loading, setLoading] = useState(!initialMaster);
  const [error, setError] = useState("");

  // ---- LIGHTBOX STATE ----
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxList, setLightboxList] = useState([]); // string[] (absolute img urls)
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // ---- PORTFÖY FİLTRE STATE ----
  const [activeFilter, setActiveFilter] = useState("Hepsi");

  /** 0) location.state veya id değiştiğinde master state'ini senkronize et */
  useEffect(() => {
    if (state?.master && isSameUser(state.master, id)) {
      setMaster(state.master);
      setLoading(false);
      setError("");
    } else {
      setMaster(null);
      setLoading(true);
      setError("");
    }
  }, [state, id]);

  /** 1) Temel profil: GUID ile çek (fallback: /lookups/search listesinden bul) */
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (state?.master && isSameUser(state.master, id)) return;

      try {
        setLoading(true);
        setError("");

        let m = null;

        // 1. Doğrudan GUID ile
        if (typeof lookupsService.getMasterByAppUserId === "function") {
          try {
            const r = await lookupsService.getMasterByAppUserId(id);
            const candidate = unwrap(r) || null;
            if (isSameUser(candidate, id)) m = candidate;
          } catch { /* fallback */ }
        }

        // 2. Fallback: search ile bul
        if (!m && typeof lookupsService.searchMasters === "function") {
          try {
            const res = await lookupsService.searchMasters({});
            const list = Array.isArray(unwrap(res)) ? unwrap(res) : [];
            const candidate = list.find((row) => isSameUser(row, id)) || null;
            if (candidate) m = candidate;
          } catch { /* yut */ }
        }

        if (!cancelled) {
          if (!m) {
            setError("Usta profili bulunamadı.");
            setMaster(null);
          } else {
            setMaster(m);
          }
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setError("Usta profili alınırken bir hata oluştu.");
          setMaster(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [id, state?.master]);

  /** 2) Tam profil (portföy vb.) – temel profil geldikten sonra (opsiyonel endpoint desteği) */
  useEffect(() => {
    let cancelled = false;

    const fetchFull = async () => {
      if (!master?.appUserId) return;
      if (typeof lookupsService.getFullProfileByAppUserId !== "function") return;

      try {
        const fullRaw = await lookupsService.getFullProfileByAppUserId(master.appUserId);
        const full = unwrap(fullRaw);
        if (!full || !isSameUser(full, master.appUserId) || cancelled) return;

        const merged = {
          ...master,
          ...full,
          portfolioItems: Array.isArray(full.portfolioItems)
            ? full.portfolioItems
            : master.portfolioItems || [],
        };
        if (!cancelled) setMaster(merged);
      } catch (e) {
        console.warn("Tam profil çekilemedi, portföy boş kalabilir.", e);
      }
    };

    fetchFull();
    return () => {
      cancelled = true;
    };
  }, [master?.appUserId]);

  // Portföy öğelerini normalize et (imageUrls’ı absolute yap)
  const normalizedPortfolio = useMemo(() => {
    if (!master?.portfolioItems?.length) return [];
    return master.portfolioItems.map((pi) => ({
      id: pi.id,
      serviceName: pi.serviceName,
      description: pi.description,
      imageUrls: (pi.imageUrls || []).map(buildAssetUrl),
    }));
  }, [master]);

  // Filtre chip’leri (benzersiz servisler)
  const portfolioServices = useMemo(() => {
    const s = new Set(normalizedPortfolio.map((p) => p.serviceName).filter(Boolean));
    return ["Hepsi", ...Array.from(s)];
  }, [normalizedPortfolio]);

  const filteredPortfolio = useMemo(() => {
    if (activeFilter === "Hepsi") return normalizedPortfolio;
    return normalizedPortfolio.filter((p) => p.serviceName === activeFilter);
  }, [normalizedPortfolio, activeFilter]);

  // Lightbox yardımcıları
  const openLightbox = useCallback((images, startIndex = 0) => {
    setLightboxList(images);
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
  }, []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const prevImg = useCallback(() => {
    setLightboxIndex((i) => (i - 1 + lightboxList.length) % lightboxList.length);
  }, [lightboxList.length]);
  const nextImg = useCallback(() => {
    setLightboxIndex((i) => (i + 1) % lightboxList.length);
  }, [lightboxList.length]);

  // Lightbox klavye kısayolları
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImg();
      if (e.key === "ArrowRight") nextImg();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, closeLightbox, prevImg, nextImg]);

  if (loading) {
    return (
      <div className="pp" key={id}>
        <PublicNavbar />
        <div className="cover">
          <div className="container" style={{ paddingBottom: 40 }}>
            <div className="breadcrumbs">Yükleniyor...</div>
            <div className="profile-card" style={{ transform: "translateY(50px)", opacity: 0.7 }}>
              <div className="avatar-wrap">
                <div className="avatar" style={{ width: 128, height: 128, background: "#e5e7eb", borderRadius: 18 }} />
              </div>
              <div>
                <div className="mini-stats">
                  <span className="mini">⏳ Yükleniyor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!master) {
    return (
      <div className="pp" key={id}>
        <PublicNavbar />
        <div className="cover">
          <div className="container" style={{ paddingBottom: 40 }}>
            <div className="breadcrumbs">
              <Link to="/" className="back-link">⟵ Ana sayfa</Link>
            </div>
            <div className="alert error" style={{ marginTop: 18 }}>
              {error || "Profil yüklenemedi."}
            </div>
            <div style={{ marginTop: 12 }}>
              <button className="btn" onClick={() => navigate(-1)}>Geri dön</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const avatarSrc = buildAssetUrl(master.profileImageUrl);
  const safeTel = (master.phoneNumber || "").replace(/\s|\./g, "");

  return (
    <div className="pp" key={id}>
      <PublicNavbar />

      {/* KAPAK */}
      <div className="cover">
        <div className="container" style={{ paddingBottom: 40 }}>
          <div className="breadcrumbs">
            <Link to="/" className="back-link">⟵ Ana sayfa</Link>
          </div>

          {/* PROFİL KARTI */}
          <div className="profile-card">
            <div className="avatar-wrap">
              <img
                className="avatar"
                src={avatarSrc || "https://via.placeholder.com/240x240?text=Usta"}
                alt={`${master.name} ${master.surName} profil fotoğrafı`}
                onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/240x240?text=Usta")}
              />
            </div>

            <div>
              <h1 className="name">
                {master.name} {master.surName}
              </h1>
              {master.companyName && <div className="company">{master.companyName}</div>}
              {!!master.yearsOfExperience && (
                <div className="tag">{master.yearsOfExperience}+ yıl deneyim</div>
              )}

              {/* Hizmet rozetleri */}
              {master.services?.length > 0 && (
                <div className="meta">
                  {master.services.map((s) => (
                    <span key={s.id} className="badge">{s.name}</span>
                  ))}
                </div>
              )}

              {/* Lokasyonlar */}
              {master.locations?.length > 0 && (
                <div className="locs">
                  {master.locations.map((l) => (
                    <span key={l.id} className="loc-chip">📍 {l.il}/{l.ilce}</span>
                  ))}
                </div>
              )}

              {/* Aksiyonlar */}
              <div className="actions">
                {master.email && (
                  <a href={`mailto:${master.email}`} className="btn btn-primary">
                    <span className="btn-title">✉️ E-posta Adresi</span>
                    <span className="btn-sub">{master.email}</span>
                  </a>
                )}
                {safeTel && (
                  <a href={`tel:${safeTel}`} className="btn btn-success">
                    <span className="btn-title">Ara</span>
                    <span className="btn-sub">{master.phoneNumber}</span>
                  </a>
                )}
                {master.certificateUrl && (
                  <a
                    href={buildAssetUrl(master.certificateUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn"
                  >
                    <span className="btn-title">Ustalık Sertifikası</span>
                    <span className="btn-sub">Belgeyi görüntüle</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* SEKMELER */}
          <div className="tabs">
            <a href="#about" className="tab active">Hakkında</a>
            <a href="#portfolio" className="tab">İşlerim</a>
          </div>
        </div>
      </div>

      {/* İÇERİK */}
      <section className="section">
        <div className="container">
          <div className="grid grid--1">
            <div id="about" className="card">
              <h3>Hakkında</h3>
              <div className="divider" />
              <p className="sub" style={{ color: "#374151", lineHeight: 1.55 }}>
                {master.description || "Bu usta henüz bir açıklama eklememiş."}
              </p>
            </div>
          </div>

          {/* PORTFÖY */}
          <div id="portfolio" className="card card--glass" style={{ marginTop: 18 }}>
            <div className="port-header">
              <div>
                <h3>İşlerim</h3>
                <p className="sub">Ustanın tamamladığı işlerden seçmeler.</p>
              </div>

              {/* FİLTRE CHIP’LERİ */}
              {portfolioServices.length > 1 && (
                <div className="chips">
                  {portfolioServices.map((label) => {
                    const active = label === activeFilter;
                    return (
                      <button
                        key={label}
                        className={`chip ${active ? "chip--active" : ""}`}
                        onClick={() => setActiveFilter(label)}
                        aria-pressed={active}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="divider" />

            {!filteredPortfolio.length ? (
              <p className="sub">Bu kriterde çalışma bulunmuyor.</p>
            ) : (
              <div className="port-grid">
                {filteredPortfolio.map((pi) => {
                  const cover = pi.imageUrls?.[0];
                  const rest = (pi.imageUrls || []).slice(1, 4); // küçük şerit
                  const moreCount = (pi.imageUrls || []).length - 4;

                  return (
                    <article key={pi.id} className="port-card">
                      <div className="port-media">
                        <img
                          className="port-cover"
                          src={cover || "https://via.placeholder.com/800x600?text=Portfolio"}
                          alt={pi.serviceName ? `${pi.serviceName} çalışması` : "Portföy görseli"}
                          onError={(e) =>
                            (e.currentTarget.src =
                              "https://via.placeholder.com/800x600?text=Portfolio")
                          }
                          onClick={() => openLightbox(pi.imageUrls || [], 0)}
                        />

                        {/* Hover overlay */}
                        <div className="port-overlay">
                          <button
                            className="overlay-btn"
                            onClick={() => openLightbox(pi.imageUrls || [], 0)}
                            aria-label="Görselleri görüntüle"
                          >
                            Görselleri Aç
                          </button>
                        </div>

                        {/* Görsel sayısı rozeti */}
                        {!!pi.imageUrls?.length && (
                          <div className="port-badge">{pi.imageUrls.length}</div>
                        )}
                      </div>

                      <div className="port-body">
                        <div className="port-headline">
                          {pi.serviceName && <span className="pill">{pi.serviceName}</span>}
                          {pi.description && (
                            <span className="pill pill--muted" title={pi.description}>
                              Açıklama
                            </span>
                          )}
                        </div>

                        {pi.description && <p className="port-desc">{pi.description}</p>}

                        {/* Küçük önizleme şeridi */}
                        {rest.length > 0 && (
                          <div className="port-strip">
                            {rest.map((img, idx) => (
                              <img
                                key={idx}
                                className="strip-thumb"
                                src={img}
                                alt={`Önizleme ${idx + 2}`}
                                onError={(e) =>
                                  (e.currentTarget.src =
                                    "https://via.placeholder.com/300x200?text=Portfolio")
                                }
                                onClick={() => openLightbox(pi.imageUrls || [], idx + 1)}
                              />
                            ))}
                            {moreCount > 0 && (
                              <button
                                className="strip-more"
                                onClick={() => openLightbox(pi.imageUrls || [], 4)}
                              >
                                +{moreCount}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* LIGHTBOX */}
      {lightboxOpen && (
        <div className="lb" onClick={closeLightbox} role="dialog" aria-modal="true">
          <img
            src={lightboxList[lightboxIndex]}
            alt="Portföy büyük görsel"
            onClick={(e) => e.stopPropagation()}
            onError={(e) =>
              (e.currentTarget.src =
                "https://via.placeholder.com/1200x800?text=Gorsel+Yuklenemedi")
            }
          />
          <div className="controls" onClick={(e) => e.stopPropagation()}>
            <button className="btn-icon" onClick={prevImg} aria-label="Önceki">
              ‹
            </button>
            <button className="btn-icon" onClick={nextImg} aria-label="Sonraki">
              ›
            </button>
          </div>
          <button className="btn-icon close" onClick={closeLightbox} aria-label="Kapat">
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default MasterPublicProfile;
