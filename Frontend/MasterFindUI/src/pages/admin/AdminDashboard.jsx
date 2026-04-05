import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { lookupsService } from '../../services/lookupsService';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState('');

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newServiceName, setNewServiceName] = useState('');
  const [il, setIl] = useState('');
  const [ilce, setIlce] = useState('');

  const loadDashboard = async () => {
    try {
      const res = await adminService.getDashboardStats();
      setStats(res.data);
    } catch {
      setError('Dashboard verileri alınamadı');
    }
  };

  const loadCategoriesWithServices = async () => {
    try {
      const res = await lookupsService.getServiceCategoriesWithServices();
      setCategories(res.data);
      if (!selectedCategory && res.data.length > 0) {
        setSelectedCategory(res.data[0]);
      }
    } catch {
      setError('Servis kategorileri yüklenemedi');
    }
  };

  useEffect(() => {
    loadDashboard();
    loadCategoriesWithServices();
  }, []);

  /* ================= ACTIONS ================= */

  const handleLogout = async () => {
    try {
      await logout(); // backend /auth/logout + context temizliği
    } finally {
      navigate('/admin/login', { replace: true });
    }
  };

  const createCategory = async () => {
    if (!newCategoryName) return;
    await adminService.createServiceCategory({ name: newCategoryName });
    setNewCategoryName('');
    loadCategoriesWithServices();
    loadDashboard();
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Kategori silinsin mi?')) return;
    await adminService.deleteServiceCategory(id);
    setSelectedCategory(null);
    loadCategoriesWithServices();
    loadDashboard();
  };

  const createService = async () => {
    if (!newServiceName || !selectedCategory) return;
    await adminService.createService({
      name: newServiceName,
      serviceCategoryId: selectedCategory.id,
    });
    setNewServiceName('');
    loadCategoriesWithServices();
    loadDashboard();
  };

  const deleteService = async (id) => {
    if (!window.confirm('Servis silinsin mi?')) return;
    await adminService.deleteService(id);
    loadCategoriesWithServices();
    loadDashboard();
  };

  const createLocation = async () => {
    if (!il || !ilce) return;
    await adminService.createLocation({ il, ilce });
    setIl('');
    setIlce('');
    alert('Konum eklendi');
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>Admin Panel</h1>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Çıkış Yap
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.mainGrid}>
        {/* KATEGORİLER */}
        <Panel title="Hizmet Kategorileri">
          {categories.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCategory(c)}
              style={{
                ...styles.categoryItem,
                ...(selectedCategory?.id === c.id && styles.categoryItemActive),
              }}
            >
              {c.name}
            </div>
          ))}

          <input
            style={styles.input}
            placeholder="Yeni kategori adı"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <button style={styles.primaryBtn} onClick={createCategory}>
            Kategori Ekle
          </button>

          {selectedCategory && (
            <button
              style={styles.dangerBtn}
              onClick={() => deleteCategory(selectedCategory.id)}
            >
              Kategoriyi Sil
            </button>
          )}
        </Panel>

        {/* SERVİSLER */}
        <Panel title="Servisler">
          {!selectedCategory && <p>Kategori seçiniz</p>}

          {selectedCategory && (
            <>
              <h3 style={{ marginBottom: 12 }}>{selectedCategory.name}</h3>

              {selectedCategory.services?.length === 0 && (
                <p style={{ color: '#666' }}>Bu kategoride servis yok</p>
              )}

              {selectedCategory.services?.map((s) => (
                <div key={s.id} style={styles.serviceRow}>
                  <span>{s.name}</span>
                  <button
                    style={styles.smallDangerBtn}
                    onClick={() => deleteService(s.id)}
                  >
                    Sil
                  </button>
                </div>
              ))}

              <input
                style={styles.input}
                placeholder="Yeni servis adı"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
              />
              <button style={styles.primaryBtn} onClick={createService}>
                Servis Ekle
              </button>
            </>
          )}
        </Panel>
      </div>

      {/* KONUM */}
      <Panel title="Konum Yönetimi">
        <div style={styles.row}>
          <input
            style={styles.input}
            placeholder="İl"
            value={il}
            onChange={(e) => setIl(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="İlçe"
            value={ilce}
            onChange={(e) => setIlce(e.target.value)}
          />
        </div>
        <button style={styles.primaryBtn} onClick={createLocation}>
          Konum Ekle
        </button>
      </Panel>
    </div>
  );
};



const styles = {
  page: {
    background: '#f4f6fb',
    minHeight: '100vh',
    padding: 32,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pageTitle: {},
  logoutBtn: {
    padding: '10px 16px',
    borderRadius: 10,
    border: 'none',
    background: '#111827',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginBottom: 12,
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: 24,
  },
  categoryItem: {
    padding: 12,
    borderRadius: 8,
    background: '#fff',
    marginBottom: 8,
    cursor: 'pointer',
  },
  categoryItemActive: {
    background: '#e0e7ff',
    fontWeight: 600,
  },
  serviceRow: {
    background: '#fff',
    padding: 12,
    borderRadius: 8,
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    border: '1px solid #ccc',
  },
  row: {
    display: 'flex',
    gap: 12,
  },
  primaryBtn: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
  dangerBtn: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    background: '#dc2626',
    color: '#fff',
    border: 'none',
    marginTop: 8,
  },
  smallDangerBtn: {
    background: '#fee2e2',
    border: 'none',
    color: '#b91c1c',
    padding: '6px 10px',
    borderRadius: 6,
    cursor: 'pointer',
  },
};

/* ================= COMPONENTS ================= */

const Panel = ({ title, children }) => (
  <div
    style={{
      background: '#f0f2ff',
      padding: 20,
      borderRadius: 16,
      boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
    }}
  >
    <h2 style={{ marginBottom: 16 }}>{title}</h2>
    {children}
  </div>
);

export default AdminDashboard;
