import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar = ({ showSearch = true, cursos = [] }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCursos, setFilteredCursos] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/registro');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Buscando:', searchTerm);
    setShowSuggestions(false);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim().length > 0 && cursos.length > 0) {
      const filtered = cursos.filter(curso =>
        curso.nombre.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCursos(filtered.slice(0, 5)); // Mostrar máximo 5 sugerencias
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setFilteredCursos([]);
    }
  };

  const handleSuggestionClick = (curso) => {
    setSearchTerm(curso.nombre);
    setShowSuggestions(false);
    navigate(`/curso/${curso.id}`);
  };

  const handleInputFocus = () => {
    if (searchTerm.trim().length > 0 && filteredCursos.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (mobileSearchOpen) setMobileSearchOpen(false);
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-public-header">
      {/* Desktop Navbar */}
      <div className="navbar-header-content navbar-desktop">
        <div className="navbar-logo" onClick={handleLogoClick}>
          <img src="/images/trilce_peru.png" alt="Trilce Perú" className="navbar-logo-image" />
        </div>
        
        {/* Search Bar - Only show if showSearch is true */}
        {showSearch && (
          <div className="navbar-search-container-cursos">
            <form onSubmit={handleSearch} className="navbar-search-form-cursos">
              <div className="navbar-search-input-wrapper-cursos">
                <input
                  type="text"
                  placeholder="Buscar cursos..."
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className="navbar-search-input-cursos"
                />
                <button type="submit" className="navbar-search-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              
              {/* Autocomplete Suggestions */}
              {showSuggestions && filteredCursos.length > 0 && (
                <div className="navbar-search-suggestions">
                  {filteredCursos.map((curso) => (
                    <div
                      key={curso.id}
                      className="navbar-suggestion-item"
                      onClick={() => handleSuggestionClick(curso)}
                    >
                      <div className="navbar-suggestion-image">
                        <img 
                          src={curso.imagen_url ? `${API_URL.replace('/api', '')}${curso.imagen_url}` : '/images/default-course.svg'} 
                          alt={curso.nombre}
                          onError={(e) => {
                            e.target.src = '/images/default-course.svg';
                          }}
                        />
                      </div>
                      <div className="navbar-suggestion-content">
                        <div className="navbar-suggestion-title">{curso.nombre}</div>
                        <div className="navbar-suggestion-category">{curso.categoria || 'Sin categoría'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>
        )}

        <nav className="navbar-header-nav">
          {isAuthenticated ? (
            <>
              <span className="navbar-user-greeting">
                Hola, {user?.nombres?.split(' ')[0] || 'Usuario'}
              </span>
              <button onClick={handleDashboard} className="navbar-dashboard-btn">
                <i className='bx bx-tachometer'></i>
                Dashboard
              </button>
              <button onClick={handleLogout} className="navbar-logout-btn">
                <i className='bx bx-log-out'></i>
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <button onClick={handleLogin} className="navbar-login-btn">Iniciar Sesión</button>
              <button onClick={handleRegister} className="navbar-register-btn">Registrarse</button>
            </>
          )}
        </nav>
      </div>

      {/* Mobile Navbar */}
      <div className="navbar-header-content navbar-mobile">
        <div className="navbar-logo" onClick={handleLogoClick}>
          <img src="/images/trilce_peru.png" alt="Trilce Perú" className="navbar-logo-image" />
        </div>

        <div className="navbar-mobile-actions">
          {/* Botón de búsqueda móvil */}
          {showSearch && (
            <button className="navbar-mobile-search-btn" onClick={toggleMobileSearch}>
              <i className='bx bx-search'></i>
            </button>
          )}

          {/* Menú hamburguesa */}
          <button className="navbar-hamburger-btn" onClick={toggleMobileMenu}>
            <i className={`bx ${mobileMenuOpen ? 'bx-x' : 'bx-menu'}`}></i>
          </button>
        </div>
      </div>

      {/* Barra de búsqueda móvil expandible */}
      {mobileSearchOpen && (
        <div className="navbar-mobile-search-expanded">
          <form onSubmit={handleSearch} className="navbar-mobile-search-form">
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className="navbar-mobile-search-input"
              autoFocus
            />
            <button type="submit" className="navbar-mobile-search-submit">
              <i className='bx bx-search'></i>
            </button>
          </form>
          
          {/* Sugerencias en móvil */}
          {showSuggestions && filteredCursos.length > 0 && (
            <div className="navbar-mobile-suggestions">
              {filteredCursos.map((curso) => (
                <div
                  key={curso.id}
                  className="navbar-suggestion-item"
                  onClick={() => handleSuggestionClick(curso)}
                >
                  <div className="navbar-suggestion-image">
                    <img 
                      src={curso.imagen_url ? `${API_URL.replace('/api', '')}${curso.imagen_url}` : '/images/default-course.svg'} 
                      alt={curso.nombre}
                      onError={(e) => {
                        e.target.src = '/images/default-course.svg';
                      }}
                    />
                  </div>
                  <div className="navbar-suggestion-content">
                    <div className="navbar-suggestion-title">{curso.nombre}</div>
                    <div className="navbar-suggestion-category">{curso.categoria || 'Sin categoría'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Menú móvil desplegable */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-menu">
          {isAuthenticated ? (
            <>
              <div className="navbar-mobile-greeting">
                <i className='bx bx-user-circle'></i>
                Hola, {user?.nombres?.split(' ')[0] || 'Usuario'}
              </div>
              <button onClick={() => { handleDashboard(); closeMobileMenu(); }} className="navbar-mobile-menu-item">
                <i className='bx bx-tachometer'></i>
                Dashboard
              </button>
              <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="navbar-mobile-menu-item logout">
                <i className='bx bx-log-out'></i>
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { handleLogin(); closeMobileMenu(); }} className="navbar-mobile-menu-item">
                <i className='bx bx-log-in'></i>
                Iniciar Sesión
              </button>
              <button onClick={() => { handleRegister(); closeMobileMenu(); }} className="navbar-mobile-menu-item register">
                <i className='bx bx-user-plus'></i>
                Registrarse
              </button>
            </>
          )}
        </div>
      )}

      {/* Overlay para cerrar menú */}
      {(mobileMenuOpen || mobileSearchOpen) && (
        <div className="navbar-mobile-overlay" onClick={() => { setMobileMenuOpen(false); setMobileSearchOpen(false); }}></div>
      )}
    </header>
  );
};

export default Navbar;