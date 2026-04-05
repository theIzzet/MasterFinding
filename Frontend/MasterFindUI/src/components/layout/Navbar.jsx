import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../css/MasterLayout.css'; // Stil dosyası

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <header className="navbar-fixed">
            <nav className="navbar-content">
                <div className="navbar-section">
                    <NavLink to="/master/dashboard" className="navbar-brand">
                        UstaBul
                    </NavLink>
                    <div className="navbar-links">
                        <NavLink 
                            to="/master/dashboard" 
                            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                        >
                            Kontrol Paneli
                        </NavLink>
                        <NavLink 
                            to="/master/profile/create" 
                            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                        >
                            Profil Oluştur
                        </NavLink>
                        
                        <NavLink to="/master/portfolio"
                         className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                         >Portfolyom
                         </NavLink>

                    </div>
                </div>
                <div className="navbar-section">
                    <span className="navbar-user-email">
                        {user?.email}
                    </span>
                    <button onClick={logout} className="logout-button">
                        Çıkış Yap
                    </button>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;