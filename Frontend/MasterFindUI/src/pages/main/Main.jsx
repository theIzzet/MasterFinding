import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../../components/layout/PublicNavbar";
import { lookupsService } from "../../services/lookupsService";
import "../../css/Main2.css";

const DEV_API_BASE_URL = "https://localhost:7054";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? DEV_API_BASE_URL : DEV_API_BASE_URL);

function buildAssetUrl(pathOrUrl) {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;       
  if (pathOrUrl.startsWith("/")) return `${API_BASE_URL}${pathOrUrl}`;
  return `${API_BASE_URL}/${pathOrUrl}`;
}

function CategoryIcon({ name }) {
  const n = (name || "").toLowerCase();
  const k = {
    elektrik: n.includes("elektr"),
    tesisat: n.includes("tesisat") || n.includes("su") || n.includes("plumbing"),
    marangoz: n.includes("marangoz") || n.includes("ahşap") || n.includes("mobilya"),
    boyaci: n.includes("boya"),
    insaat: n.includes("inşaat") || n.includes("insaat") || n.includes("duvar"),
    tadilat: n.includes("tadilat") || n.includes("tamirat"),
    otomotiv: n.includes("oto") || n.includes("otomotiv") || n.includes("araç"),
    beyaz: n.includes("beyaz") || n.includes("eşya") || n.includes("beyaz eşya"),
  };

  const stroke = "currentColor";
  const common = { fill: "none", stroke, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };

  if (k.elektrik) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
        <path {...common} d="M13 2L3 14h7v8l11-14h-7V2z" />
      </svg>
    );
  }
  if (k.tesisat) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
        <path {...common} d="M3 9h6a4 4 0 0 1 4 4v8M9 3v6M13 13h8v-3a2 2 0 0 0-2-2h-4" />
      </svg>
    );
  }
  if (k.marangoz) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
        <path {...common} d="M3 21l7-7m0 0 4 4 7-7-4-4-7 7zM14 7l3 3" />
      </svg>
    );
  }
  if (k.boyaci) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
        <path {...common} d="M4 4h10v5H4zM9 9v11M14 6h4l2 3v5a4 4 0 0 1-4 4h-2" />
      </svg>
    );
  }
  if (k.insaat) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
        <path {...common} d="M3 20h18M3 16h18M5 12h6M13 12h6M7 8h4M13 8h4M3 20V6l4-2 10 2 4-2v16" />
      </svg>
    );
  }
  if (k.tadilat) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
        <path {...common} d="M21 3l-9 9-3-3-6 6v3h3l6-6 3 3 9-9z" />
      </svg>
    );
  }
  if (k.otomotiv) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
        <path {...common} d="M5 16h14l1-4-4-5H8L4 12l1 4zM7 16v2M17 16v2M6 20h12" />
      </svg>
    );
  }
  if (k.beyaz) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
        <rect {...common} x="6" y="3" width="12" height="18" rx="2" />
        <path {...common} d="M6 8h12M9 6h.01M12 6h.01" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path {...common} d="M12 2l2.4 4.8L20 8l-4 3.9.9 5.6L12 15.8 7.1 17.5 8 11.9 4 8l5.6-1.2L12 2z" />
    </svg>
  );
}

const Main2 = () => {
  // Lookups
  const [svcCats, setSvcCats] = useState([]);     
  const [locations, setLocations] = useState([]);  
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [error, setError] = useState("");

  // UI state
  const [selectedCatId, setSelectedCatId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedTown, setSelectedTown] = useState("");

  // Masters
  const [masters, setMasters] = useState([]);
  const [loadingMasters, setLoadingMasters] = useState(false);

  // Lookups fetch
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoadingLookups(true);
        setError("");
        const [catsRes, locsRes] = await Promise.all([
          lookupsService.getServiceCategoriesWithServices(),
          lookupsService.getAllLocations(),
        ]);
        setSvcCats(catsRes.data || []);
        setLocations(locsRes.data || []);
      } catch (e) {
        console.error(e);
        setError("Başlangıç verileri alınamadı.");
      } finally {
        setLoadingLookups(false);
      }
    };
    fetchAll();
  }, []);

  // Aktif servis listesi (kategoriye göre)
  const activeServices = useMemo(() => {
    if (!selectedCatId) return [];
    const cat = svcCats.find((c) => String(c.id) === String(selectedCatId));
    return cat?.services || [];
  }, [selectedCatId, svcCats]);

  // Şehir listesi (unique)
  const cities = useMemo(() => {
    const set = new Set(locations.map((l) => l.il));
    return Array.from(set);
  }, [locations]);

  // İlçeler (seçili şehre göre)
  const townsForCity = useMemo(() => {
    if (!selectedCity) return [];
    return locations.filter((l) => l.il === selectedCity);
  }, [selectedCity, locations]);

  // --- güvenli istemci filtresi ---
  const filterClientSide = (rows) => {
    const data = Array.isArray(rows) ? rows : [];
    const catServiceIds = selectedCatId
      ? new Set(
          (svcCats.find((c) => String(c.id) === String(selectedCatId))?.services || [])
            .map((s) => s.id)
        )
      : null;

    return data.filter((m) => {
      if (catServiceIds) {
        const ok = (m.services || []).some((s) => catServiceIds.has(s.id));
        if (!ok) return false;
      }
      if (selectedServiceId) {
        const has = (m.services || []).some((s) => String(s.id) === String(selectedServiceId));
        if (!has) return false;
      }
      if (selectedCity) {
        const inCity = (m.locations || []).some((l) => l.il === selectedCity);
        if (!inCity) return false;
      }
      if (selectedTown) {
        const inTown = (m.locations || []).some((l) => l.ilce === selectedTown);
        if (!inTown) return false;
      }
      return true;
    });
  };

  // Arama
  const handleSearch = async () => {
    try {
      setLoadingMasters(true);
      setError("");
      setMasters([]); // skeleton

      const params = {
        serviceCategoryId: selectedCatId || undefined,
        serviceId: selectedServiceId || undefined,
        il: selectedCity || undefined,
        ilce: selectedTown || undefined,
      };

      const res = await lookupsService.searchMasters(params);
      const data = Array.isArray(res.data) ? res.data : [];
      setMasters(filterClientSide(data));
      document.getElementById("masters-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      console.error(e);
      setError("Ustalar getirilemedi.");
    } finally {
      setLoadingMasters(false);
    }
  };

  return (
    <div className="lx">
      <PublicNavbar />

      {/* HERO */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-inner">
          <h1 id="hero-title" className="hero-title">
            İşinizi <span className="hero-underline">usta</span>sına emanet edin
          </h1>
          <p className="hero-sub">
            Elektrik, tesisat, marangoz, boyacı… En güvenilir ustaları tek yerde keşfedin.
            Bölgenize hizmet veren profilleri ve portföyleri görün.
          </p>

          {/* SEARCH */}
          <div className="search-wrap">
            <div className="search-box" role="search" aria-label="Usta arama formu">
              {/* Kategori */}
              <div className="field">
                <label>Kategori</label>
                <select
                  value={selectedCatId}
                  onChange={(e) => {
                    setSelectedCatId(e.target.value);
                    setSelectedServiceId("");
                  }}
                  aria-label="Kategori seçin"
                >
                  <option value="">Tümü</option>
                  {svcCats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hizmet */}
              <div className="field">
                <label>Hizmet</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  disabled={!selectedCatId}
                  aria-label="Hizmet seçin"
                >
                  <option value="">Tümü</option>
                  {activeServices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Şehir */}
              <div className="field">
                <label>Şehir</label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSelectedTown("");
                  }}
                  aria-label="Şehir seçin"
                >
                  <option value="">Tümü</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* İlçe */}
              <div className="field">
                <label>İlçe</label>
                <select
                  value={selectedTown}
                  onChange={(e) => setSelectedTown(e.target.value)}
                  disabled={!selectedCity}
                  aria-label="İlçe seçin"
                >
                  <option value="">Tümü</option>
                  {townsForCity.map((t) => (
                    <option key={t.id} value={t.ilce}>
                      {t.ilce}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="btn btn-primary btn-search"
                onClick={handleSearch}
                disabled={loadingLookups}
                aria-label="Usta Bul"
              >
                {loadingMasters ? "Aranıyor..." : "Usta Bul"}
              </button>
            </div>
          </div>

          {/* CTA’lar */}
          <div className="cta-row">
            <Link to="/search/advanced" className="btn btn-cta" aria-label="Detaylı Arama">
              Detaylı Arama
            </Link>

          </div>
        </div>
      </section>

      {/* SİSTEMDEKİ HİZMETLER — estetik, statik bilgilendirme */}
      <section className="section" aria-labelledby="popular-cats">
        <div className="container">
          <div className="section-head">
            <h2 id="popular-cats">Sistemde Bulunan Usta Hizmetleri</h2>
            <p className="muted">Aşağıdaki liste bilgi amaçlıdır; kategori kartları seçilebilir değildir.</p>
          </div>

          <div className="svc-cloud" role="list">
            {(svcCats.length
              ? svcCats
              : [
                  { id: 1, name: "Elektrikçi", services: [] },
                  { id: 2, name: "Tesisatçı", services: [] },
                  { id: 3, name: "Marangoz", services: [] },
                  { id: 4, name: "Boyacı", services: [] },
                  { id: 5, name: "İnşaat Ustası", services: [] },
                  { id: 6, name: "Tadilat Ustası", services: [] },
                  { id: 7, name: "Otomotiv Ustası", services: [] },
                  { id: 8, name: "Beyaz Eşya Tamircisi", services: [] },
                ]
            ).map((c) => (
              <div key={c.id} className="svc-item" role="listitem" aria-label={`${c.name} kategorisi`}>
                <div className="svc-ring" aria-hidden />
                <div className="svc-inner">
                  <div className="svc-icon">
                    <CategoryIcon name={c.name} />
                  </div>
                  <div className="svc-texts">
                    <div className="svc-title">{c.name}</div>
                    <div className="svc-sub">
                      {(c.services?.length ?? 0) > 0
                        ? `${c.services.length} alt hizmet`
                        : "Alt hizmet bilgisi yakında"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="svc-footnote">
            Daha ince filtreler için <Link to="/search/advanced">Detaylı Arama</Link> sayfasını kullanın.
          </div>
        </div>
      </section>

      {/* Ustalar */}
      <section className="section" id="masters-anchor" aria-labelledby="featured-masters">
        <div className="container">
          <div className="section-head">
            <h2 id="featured-masters">Öne Çıkan Ustalar</h2>
            <p className="muted">
              Deneyim, hizmet kapsamı ve lokasyona göre en uygun ustaları görün.
            </p>
          </div>

          {error && <div className="alert error" role="alert">{error}</div>}

          {loadingMasters ? (
            <div className="grid grid--3" aria-busy="true" aria-live="polite">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card skeleton" style={{ height: 170 }} />
              ))}
            </div>
          ) : masters.length === 0 ? (
            <div className="alert" style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#94a3b8" d="M11 7h2v6h-2V7zm1 10a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5ZM12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Z"/>
              </svg>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Henüz sonuç yok</div>
                <div className="muted">
                  Filtreleri doldurup <b>Usta Bul</b>’a tıklayın veya Detaylı Arama’yı deneyin.
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid--3">
              {masters.map((m) => (
                <article key={m.appUserId} className="card" aria-label={`${m.name} ${m.surName} kartı`}>
                  <div className="master-top">
                    <img
                      className="avatar"
                      src={
                        m.profileImageUrl
                          ? buildAssetUrl(m.profileImageUrl)
                          : "https://via.placeholder.com/120x120?text=Usta"
                      }
                      alt={`${m.name} ${m.surName} profil fotoğrafı`}
                      onError={(e) =>
                        (e.currentTarget.src =
                          "https://via.placeholder.com/120x120?text=Usta")
                      }
                      loading="lazy"
                    />
                    <div>
                      <h3 className="master-name">
                        {m.name} {m.surName}
                      </h3>
                      {m.companyName && <div className="muted">{m.companyName}</div>}
                      {!!m.yearsOfExperience && (
                        <div className="tag">{m.yearsOfExperience}+ yıl deneyim</div>
                      )}
                    </div>
                  </div>

                  {m.description && <p className="desc">{m.description}</p>}

                  {m.services?.length > 0 && (
                    <div className="badges" aria-label="Hizmetler">
                      {m.services.slice(0, 4).map((s) => (
                        <span className="badge" key={s.id}>
                          {s.name}
                        </span>
                      ))}
                      {m.services.length > 4 && (
                        <span className="badge more" title="Daha fazla hizmet">
                          +{m.services.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {m.locations?.length > 0 && (
                    <div className="loc" aria-label="Lokasyonlar">
                      {m.locations.slice(0, 2).map((l) => (
                        <span key={`${l.id}`} className="muted">
                          {l.il}/{l.ilce}
                        </span>
                      ))}
                      {m.locations.length > 2 && (
                        <span className="muted">+{m.locations.length - 2} bölge</span>
                      )}
                    </div>
                  )}

                  <div className="actions">
                    <Link
                      to={`/masters/${m.appUserId}`}
                      state={{ master: m }}
                      className="btn btn-sm"
                      aria-label={`${m.name} ${m.surName} profili`}
                    >
                      Profili incele
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Main2;
