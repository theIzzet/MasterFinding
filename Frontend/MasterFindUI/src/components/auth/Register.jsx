import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import '../../css/Auth.css';

const Register = () => {
  const [registerData, setRegisterData] = useState({
    name: '',
    surName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (registerData.password !== registerData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    const payload = {
      name: registerData.name,
      surName: registerData.surName,
      username: registerData.username,
      password: registerData.password,
      confirmPassword: registerData.confirmPassword,
    };

    if (registerData.email.trim()) payload.email = registerData.email;
    if (registerData.phoneNumber.trim()) payload.phoneNumber = registerData.phoneNumber;

    try {
      await authService.register(payload);
      await refreshUser();
      navigate('/master/dashboard', { replace: true });
    } catch (err) {
      if (err.response?.data?.Errors) {
        // Backend'den gelen detaylı hataları ekrana basar
        setError(err.response.data.Errors.join(', '));
      } else {
        setError('Kayıt başarısız oldu. Lütfen bilgilerinizi kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () =>
    registerData.name &&
    registerData.surName &&
    registerData.username &&
    registerData.password &&
    registerData.confirmPassword &&
    (registerData.email || registerData.phoneNumber);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <form className="auth-card auth-card-wide" onSubmit={handleSubmit} noValidate>
          <header className="auth-header">
            <div className="auth-logo">U</div>
            <h2 className="auth-title">Hesap Oluştur</h2>
            <p className="auth-subtitle">
              Hizmet vermeye başlamak için kayıt olun
            </p>
          </header>

          {error && (
            <div className="auth-alert">
              {error}
            </div>
          )}

          {/* Ad & Soyad */}
          <div className="form-row">
            <div className="form-group">
              <label>Ad</label>
              <input
                type="text"
                name="name"
                value={registerData.name}
                onChange={handleChange}
                placeholder="Adınız"
              />
            </div>

            <div className="form-group">
              <label>Soyad</label>
              <input
                type="text"
                name="surName"
                value={registerData.surName}
                onChange={handleChange}
                placeholder="Soyadınız"
              />
            </div>
          </div>

          {/* Kullanıcı adı */}
          <div className="form-group">
            <label>Kullanıcı Adı</label>
            <input
              type="text"
              name="username"
              value={registerData.username}
              onChange={handleChange}
              placeholder="kullanici_adi"
            />
          </div>

          {/* Email & Telefon */}
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleChange}
                placeholder="email@example.com"
              />
            </div>

            <div className="form-group">
              <label>Telefon</label>
              <input
                type="tel"
                name="phoneNumber"
                value={registerData.phoneNumber}
                onChange={handleChange}
                placeholder="05xx xxx xx xx"
              />
            </div>
          </div>

          {/* Şifre */}
          <div className="form-row">
            <div className="form-group">
              <label>Şifre</label>
              <input
                type="password"
                name="password"
                value={registerData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label>Şifre (Tekrar)</label>
              <input
                type="password"
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-button primary"
            disabled={loading || !isFormValid()}
          >
            {loading ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
          </button>

          <div className="auth-footer">
            Zaten hesabınız var mı?
            <Link to="/login" className="auth-link">
              Giriş Yap
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
