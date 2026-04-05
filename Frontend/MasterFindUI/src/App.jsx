import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './router/ProtectedRoute';
import MasterLayout from './components/layout/MasterLayout';
import MasterDashboard from './pages/master/MasterDashboard';
import CreateMasterProfile from './pages/master/CreateMasterProfile';
import EditMasterProfile from './pages/master/EditMasterProfile';
import MyPortfolio from './pages/master/MyPortfolio';
import AdvancedSearch from './pages/public/AdvancedSearch';
import Main from './pages/main/Main';
import MasterPublicProfile from './pages/public/MasterPublicProfile';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Yükleniyor...
      </div>
    );
  }

  return (
    <Routes>
      {/* Everybody */}
      <Route path="/" element={<Main />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/adminlogin" element={<AdminLogin />} />

      <Route path="/unauthorized" element={<div>Yetkiniz Yok</div>} />
      <Route path="/masters/:id" element={<MasterPublicProfile />} />
      <Route path="/search/advanced" element={<AdvancedSearch />} />

      {/* ===== MASTER PANEL ===== */}
      <Route
        path="/master/*"
        element={
          <ProtectedRoute requiredRoles={['User']}>
            <MasterLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<MasterDashboard />} />
        <Route path="profile/create" element={<CreateMasterProfile />} />
        <Route path="profile/edit" element={<EditMasterProfile />} />
        <Route path="portfolio" element={<MyPortfolio />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* ===== ADMIN PANEL ===== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRoles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ===== FALLBACK ===== */}
      <Route path="*" element={<div>Sayfa Bulunamadı</div>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}
