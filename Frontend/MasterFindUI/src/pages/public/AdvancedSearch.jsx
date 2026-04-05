import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../../components/layout/PublicNavbar";
import { lookupsService } from "../../services/lookupsService";
import "../../css/AdvancedSearch.css";

/** --- Backend base URL (ENV > DEV fallback) --- */
const DEV_API_BASE_URL = "https://localhost:7054";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? DEV_API_BASE_URL : DEV_API_BASE_URL);

function buildAssetUrl(pathOrUrl) {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (pathOrUrl.startsWith("/")) return `${API_BASE_URL}${pathOrUrl}`;
  return `${API_BASE_URL}/${pathOrUrl}`;
}

export default function AdvancedSearch() {
  const [svcCats, setSvcCats] = useState([]);     
  const [locations, setLocations] = useState([]); 
  const [error, setError] = useState("");

  // selections (çoklu)
  const [selectedCities, setSelectedCities] = useState(new Set());
  const [selectedTowns, setSelectedTowns] = useState(new Set());
  const [selectedCats, setSelectedCats] = useState(new Set());
  const [selectedServices, setSelectedServices] = useState(new Set());

  // collapsible durumları
  const [openLoc, setOpenLoc] = useState(true);
  const [openCats, setOpenCats] = useState(true);
  const [openSubs, setOpenSubs] = useState(true);

  // arama inputları
  const [cityQuery, setCityQuery] = useState("");
  const [serviceQuery, setServiceQuery] = useState("");

  // results
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
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
      }
    })();
  }, []);

  // şehir listesi
  const cityList = useMemo(() => {
    const set = new Set(locations.map(l => l.il));
    const arr = Array.from(set).sort();
    if (!cityQuery.trim()) return arr;
    return arr.filter(x => x.toLowerCase().includes(cityQuery.toLowerCase()));
  }, [locations, cityQuery]);

  // seçili şehirlere göre ilçeler
  const townList = useMemo(() => {
    if (!selectedCities.size) return [];
    return locations
      .filter(l => selectedCities.has(l.il))
      .map(l => ({ key: `${l.il}|${l.ilce}|${l.id}`, il: l.il, ilce: l.ilce, id: l.id }));
  }, [locations, selectedCities]);

  // seçili kategorilere göre hizmet id havuzu
  const serviceIdsFromSelectedCats = useMemo(() => {
    if (!selectedCats.size) return new Set();
    const ids = new Set();
    svcCats.forEach(c => {
      if (selectedCats.has(String(c.id))) {
        (c.services || []).forEach(s => ids.add(String(s.id)));
      }
    });
    return ids;
  }, [selectedCats, svcCats]);

  // tüm alt hizmet listesi (arama ile filtreli)
  const allServices = useMemo(() => {
    const arr = svcCats.flatMap(c => c.services || []);
    if (!serviceQuery.trim()) return arr;
    return arr.filter(s => s.name.toLowerCase().includes(serviceQuery.toLowerCase()));
  }, [svcCats, serviceQuery]);

  const toggleSet = (setState) => (value, asString = true) => {
    setState((prev) => {
      const clone = new Set(prev);
      const key = asString ? String(value) : value;
      if (clone.has(key)) clone.delete(key);
      else clone.add(key);
      return clone;
    });
  };

  const toggleCity = toggleSet(setSelectedCities);
  const toggleTown = toggleSet(setSelectedTowns);
  const toggleCat = toggleSet(setSelectedCats);
  const toggleService = toggleSet(setSelectedServices);

  const clearAll = () => {
    setSelectedCities(new Set());
    setSelectedTowns(new Set());
    setSelectedCats(new Set());
    setSelectedServices(new Set());
    setCityQuery("");
    setServiceQuery("");
    setMasters([]);
    setError("");
  };

  // filtre (istemci tarafı)
  const applyFilters = (rows) => {
    const data = Array.isArray(rows) ? rows : [];

    // hizmet id hedef seti (seçili hizmetler + seçili kategorilerden türeyenler)
    const effectiveServiceIds = new Set([
      ...Array.from(selectedServices),
      ...Array.from(serviceIdsFromSelectedCats),
    ]);

    return data.filter(m => {
      // şehir
      if (selectedCities.size) {
        const inAnyCity = (m.locations || []).some(l => selectedCities.has(l.il));
        if (!inAnyCity) return false;
      }
      // ilçe
      if (selectedTowns.size) {
        const inAnyTown = (m.locations || []).some(l =>
          selectedTowns.has(String(l.id)) || selectedTowns.has(`${l.il}|${l.ilce}|${l.id}`)
        );
        if (!inAnyTown) return false;
      }
      // hizmet/kategori
      if (effectiveServiceIds.size) {
        const hasService = (m.services || []).some(s => effectiveServiceIds.has(String(s.id)));
        if (!hasService) return false;
      }
      return true;
    });
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError("");
      setMasters([]);
      const res = await lookupsService.searchMasters({});
      const data = Array.isArray(res.data) ? res.data : [];
      setMasters(applyFilters(data));
      // sonuçlara kaydır
      setTimeout(() => {
        document.getElementById("results-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (e) {
      console.error(e);
      setError("Arama sırasında bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // seçili filtreleri chip olarak topla
  const chips = useMemo(() => {
    const arr = [];
    selectedCities.forEach(v => arr.push({ type: "city", label: v, key: v }));
    selectedTowns.forEach(v => {
      const found = locations.find(l => String(l.id) === String(v));
      const label = found ? `${found.il}/${found.ilce}` : (String(v).includes("|") ? v.split("|")[1] : v);
      arr.push({ type: "town", label, key: v });
    });
    selectedCats.forEach(v => {
      const c = svcCats.find(x => String(x.id) === String(v));
      arr.push({ type: "cat", label: c?.name || v, key: v });
    });
    selectedServices.forEach(v => {
      const s = svcCats.flatMap(c => c.services || []).find(x => String(x.id) === String(v));
      arr.push({ type: "svc", label: s?.name || v, key: v });
    });
    return arr;
  }, [selectedCities, selectedTowns, selectedCats, selectedServices, locations, svcCats]);

  const removeChip = (chip) => {
    if (chip.type === "city") {
      // şehri ve alt ilçelerini kaldır
      setSelectedCities(prev => {
        const n = new Set(prev); n.delete(chip.key); return n;
      });
      setSelectedTowns(prev => {
        const n = new Set(prev);
        locations
          .filter(l => l.il === chip.key)
          .forEach(l => {
            n.delete(String(l.id));
            n.delete(`${l.il}|${l.ilce}|${l.id}`);
          });
        return n;
      });
    } else if (chip.type === "town") {
      setSelectedTowns(prev => { const n = new Set(prev); n.delete(chip.key); return n; });
    } else if (chip.type === "cat") {
      setSelectedCats(prev => { const n = new Set(prev); n.delete(chip.key); return n; });
    } else if (chip.type === "svc") {
      setSelectedServices(prev => { const n = new Set(prev); n.delete(chip.key); return n; });
    }
  };

  return (
    <div className="adv">
      <PublicNavbar />
      <section className="adv-hero">
        <div className="adv-container">
          <h1 className="adv-title">Detaylı Arama</h1>
          <p className="muted">Şehir/ilçe ve hizmetleri çoklu seçerek ustaları filtreleyin.</p>

          {/* Seçili filtre chip bar */}
          {!!chips.length && (
            <div className="chipbar" role="list">
              {chips.map(ch => (
                <button key={`${ch.type}-${ch.key}`} className="chip" role="listitem" onClick={() => removeChip(ch)}>
                  <span className="chip-label">{ch.label}</span>
                  <span className="chip-x" aria-hidden>×</span>
                </button>
              ))}
              <button className="chip clear" onClick={clearAll}>Tümünü temizle</button>
            </div>
          )}
        </div>
      </section>

      <section className="adv-container adv-grid">
        {/* SOL PANEL (FİLTRELER) */}
        <aside className="adv-left">
          {/* Konum */}
          <div className="adv-card sticky">
            <button className="adv-collapser" onClick={() => setOpenLoc(v => !v)} aria-expanded={openLoc}>
              <span>Konum</span>
              <span className={`chev ${openLoc ? "open" : ""}`}>⌄</span>
            </button>

            {openLoc && (
              <>
                <div className="adv-section">
                  <div className="adv-subhead with-count">
                    Şehirler <span className="count">{selectedCities.size}</span>
                  </div>
                  <div className="search-in">
                    <input
                      placeholder="Şehir ara..."
                      value={cityQuery}
                      onChange={(e) => setCityQuery(e.target.value)}
                    />
                  </div>
                  <div className="adv-list">
                    {cityList.map((il) => (
                      <label key={il} className="adv-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedCities.has(il)}
                          onChange={() => {
                            toggleCity(il);
                            // şehir kaldırılırsa o şehre ait ilçeleri de kaldır
                            setSelectedTowns(prev => {
                              const n = new Set(prev);
                              locations
                                .filter(l => l.il === il)
                                .forEach(l => {
                                  n.delete(String(l.id));
                                  n.delete(`${l.il}|${l.ilce}|${l.id}`);
                                });
                              return n;
                            });
                          }}
                        />
                        <span>{il}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="adv-section">
                  <div className="adv-subhead with-count">
                    İlçeler <span className="count">{selectedTowns.size}</span>
                  </div>
                  {!selectedCities.size ? (
                    <div className="adv-hint">İlçe seçmek için önce şehir seçin.</div>
                  ) : (
                    <div className="adv-list">
                      {townList.map((t) => (
                        <label key={t.key} className="adv-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedTowns.has(String(t.id)) || selectedTowns.has(t.key)}
                            onChange={() => toggleTown(String(t.id))}
                          />
                          <span>{t.il} / {t.ilce}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Hizmetler */}
          <div className="adv-card">
            <button className="adv-collapser" onClick={() => setOpenCats(v => !v)} aria-expanded={openCats}>
              <span>Kategoriler</span>
              <span className={`chev ${openCats ? "open" : ""}`}>⌄</span>
            </button>

            {openCats && (
              <div className="adv-section">
                <div className="adv-subhead with-count">
                  Kategoriler <span className="count">{selectedCats.size}</span>
                </div>
                <div className="adv-list">
                  {svcCats.map((c) => (
                    <label key={c.id} className="adv-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedCats.has(String(c.id))}
                        onChange={() => toggleCat(String(c.id))}
                      />
                      <span>{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="adv-card">
            <button className="adv-collapser" onClick={() => setOpenSubs(v => !v)} aria-expanded={openSubs}>
              <span>Alt Hizmetler</span>
              <span className={`chev ${openSubs ? "open" : ""}`}>⌄</span>
            </button>

            {openSubs && (
              <div className="adv-section">
                <div className="adv-subhead with-count">
                  Alt Hizmetler <span className="count">{selectedServices.size}</span>
                </div>
                <div className="search-in">
                  <input
                    placeholder="Hizmet ara..."
                    value={serviceQuery}
                    onChange={(e) => setServiceQuery(e.target.value)}
                  />
                </div>
                <div className="adv-list">
                  {allServices.map((s) => (
                    <label key={s.id} className="adv-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedServices.has(String(s.id))}
                        onChange={() => toggleService(String(s.id))}
                      />
                      <span>{s.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="adv-actions">
              <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
                {loading ? "Aranıyor..." : "Ara"}
              </button>
              <button className="btn" onClick={clearAll} disabled={loading}>
                Temizle
              </button>
              <Link to="/" className="btn btn-ghost">Ana sayfa</Link>
            </div>
          </div>

          {/* Mobil sabit CTA */}
          <div className="mobile-cta">
            <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
              {loading ? "Aranıyor..." : "Ara"}
            </button>
            <button className="btn" onClick={clearAll} disabled={loading}>Temizle</button>
          </div>
        </aside>

        {/* SAĞ PANEL (SONUÇLAR) */}
        <main className="adv-right">
          <div id="results-top" className="adv-right-head">
            <h2>Sonuçlar</h2>
            <p className="muted">
              {loading ? "Aranıyor..." : masters.length ? `${masters.length} usta bulundu` : "Sonuç yok"}
            </p>
            {error && <div className="alert error" role="alert" style={{marginTop:8}}>{error}</div>}
          </div>

          {loading ? (
            <div className="grid grid--3">
              {[...Array(6)].map((_,i)=>(<div key={i} className="card skeleton" style={{height:170}}/>))}
            </div>
          ) : masters.length === 0 ? (
            <div className="empty">
              <div className="empty-ill" aria-hidden>🔎</div>
              <div className="empty-title">Henüz sonuç yok</div>
              <div className="empty-sub">Filtreleri seçip <b>Ara</b>’ya tıklayın.</div>
            </div>
          ) : (
            <div className="grid grid--3">
              {masters.map((m) => (
                <article key={m.appUserId} className="card master-card">
                  <div className="master-top">
                    <img
                      className="avatar"
                      src={
                        m.profileImageUrl
                          ? buildAssetUrl(m.profileImageUrl)
                          : "https://via.placeholder.com/120x120?text=Usta"
                      }
                      alt={`${m.name} ${m.surName} profil fotoğrafı`}
                      onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/120x120?text=Usta")}
                      loading="lazy"
                    />
                    <div>
                      <h3 className="master-name">{m.name} {m.surName}</h3>
                      {m.companyName && <div className="muted">{m.companyName}</div>}
                      {!!m.yearsOfExperience && <div className="tag">{m.yearsOfExperience}+ yıl deneyim</div>}
                    </div>
                  </div>

                  {m.description && <p className="desc">{m.description}</p>}

                  {m.services?.length > 0 && (
                    <div className="badges">
                      {m.services.slice(0,4).map(s => <span key={s.id} className="badge">{s.name}</span>)}
                      {m.services.length > 4 && <span className="badge more">+{m.services.length - 4}</span>}
                    </div>
                  )}

                  {m.locations?.length > 0 && (
                    <div className="loc">
                      {m.locations.slice(0,2).map(l => (
                        <span key={l.id} className="muted">{l.il}/{l.ilce}</span>
                      ))}
                      {m.locations.length > 2 && <span className="muted">+{m.locations.length - 2} bölge</span>}
                    </div>
                  )}

                  <div className="actions">
                    <Link
                      to={`/masters/${m.appUserId}`}
                      state={{ master: m }}
                      className="btn btn-sm"
                    >
                      Profili incele
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </section>
    </div>
  );
}
