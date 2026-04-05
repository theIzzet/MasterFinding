import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../css/Auth.css';

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    phoneNumber: '',
    password: '',
    rememberMe: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      password: loginData.password,
      rememberMe: loginData.rememberMe,
    };

    if (loginData.email.trim()) payload.email = loginData.email;
    if (loginData.phoneNumber.trim()) payload.phoneNumber = loginData.phoneNumber;

    try {
      await login(payload);
      navigate('/master/dashboard', { replace: true });
    } catch (err) {
      if (err.response) {
        // Önce Rate Limit kontrolü 
        if (err.response.status === 429) {
          setError("Çok fazla hatalı giriş denemesi yaptınız. Lütfen 1 dakika bekleyin.");
        }

        else if (err.response.data?.Errors && Array.isArray(err.response.data.Errors)) {
          setError(err.response.data.Errors.join(', '));
        }

        else {
          setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
        }
      } else {
        setError('5 den fazla başarısız giriş işleminde bulundunuz. 1 dakika sonra tekrar deneyiniz.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page compact">
      <div className="auth-container">
        <form className="auth-card compact" onSubmit={handleSubmit} noValidate>
          <header className="auth-header compact">
            <div className="auth-logo small" aria-hidden="true">U</div>
            <h2 className="auth-title compact">Giriş Yap</h2>
          </header>

          {error && (
            <div className="auth-alert compact" role="alert">
              {error}
            </div>
          )}

          <div className="form-group compact">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={loginData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group compact">
            <label>Telefon</label>
            <input
              type="tel"
              name="phoneNumber"
              value={loginData.phoneNumber}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group compact">
            <label>Şifre</label>
            <div className="password-row">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={loginData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={loading}
              >
                👁
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button compact" disabled={loading}>
            {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>

          <footer className="auth-footer compact">
            <span>Hesabınız yok mu?</span>{' '}
            <Link to="/register">Kayıt Ol</Link>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default Login;
