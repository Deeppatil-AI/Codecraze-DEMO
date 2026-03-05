import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/book', label: 'Book Slot' },
  { to: '/availability', label: 'Availability' },
  { to: '/payment', label: 'Payment' },
  { to: '/bookings', label: 'My Bookings' },
  { to: '/contact', label: 'Contact' },
];

const Navbar = ({ onLoginClick }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });

    // Check customer auth
    const storedUser = localStorage.getItem('parkmate_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from localStorage');
      }
    }

    // Check admin auth separately
    const storedAdmin = localStorage.getItem('parkmate_admin_user');
    if (storedAdmin) {
      try {
        setAdminUser(JSON.parse(storedAdmin));
      } catch (e) {
        console.error('Failed to parse admin user from localStorage');
      }
    }

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    if (isAdminRoute) {
      localStorage.removeItem('parkmate_admin_user');
      localStorage.removeItem('parkmate_admin_token');
      setAdminUser(null);
    } else {
      localStorage.removeItem('parkmate_user');
      localStorage.removeItem('parkmate_token');
      setUser(null);
    }
    window.location.reload();
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/98 backdrop-blur-xl border-b border-gray-200/80 shadow-sm'
          : 'bg-white/90 backdrop-blur-md border-b border-transparent'
        }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-[60px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-8 h-8 rounded-[9px] icon-purple flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
              <span className="text-sm">🚗</span>
            </div>
            <span className="text-[17px] font-bold tracking-tight gradient-text">ParkMate</span>
          </Link>

          {/* Desktop Nav — hide customer tabs on admin routes */}
          {!isAdminRoute && (
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 rounded-lg text-[13.5px] font-medium transition-all duration-150 ${
                      isActive
                        ? 'text-violet-700 bg-violet-50'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          )}

          {/* Right */}
          <div className="hidden md:flex items-center gap-3">
            {/* Admin entry only on non-admin routes */}
            {!isAdminRoute && (
              <Link
                to="/admin/login"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-semibold text-gray-400 hover:text-violet-600 transition"
              >
                Admin
              </Link>
            )}

            {isAdminRoute ? (
              adminUser && (
                <span className="text-[13.5px] font-medium text-gray-700">
                  ParkMate <span className="text-violet-600 font-semibold">Admin Panel</span>
                </span>
              )
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-[13.5px] font-medium text-gray-700">
                  Hi, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-primary text-[13.5px] px-4 py-2 !bg-red-500 hover:!bg-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                id="navbar-login-btn"
                className="btn-primary text-[13.5px] px-4 py-2"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition"
          >
            {menuOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
          </button>
        </div>
      </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 animate-fade-up">
              <div className="px-5 py-3 space-y-0.5">
                {!isAdminRoute && user?.role !== 'admin' &&
                  navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to === '/'}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `block px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? 'text-violet-700 bg-violet-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                <div className="pt-2 pb-1 space-y-2">
                  {!isAdminRoute && (
                    <Link
                      to="/admin/login"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full text-center text-[12px] font-semibold text-gray-400 hover:text-violet-600"
                    >
                      Admin
                    </Link>
                  )}

                  {isAdminRoute ? (
                    adminUser ? (
                      <div className="px-3.5 py-2 text-sm text-gray-700 font-medium text-center">
                        ParkMate <span className="text-violet-600 font-semibold">Admin Panel</span>
                      </div>
                    ) : (
                      null
                    )
                  ) : user ? (
                    <>
                      <div className="px-3.5 py-2 text-sm text-gray-700 font-medium">
                        Logged in as {user.name}
                      </div>
                      <button
                        onClick={() => { handleLogout(); setMenuOpen(false); }}
                        className="w-full btn-primary !bg-red-500 hover:!bg-red-600 py-2.5 mt-2"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { onLoginClick(); setMenuOpen(false); }}
                      className="w-full btn-primary py-2.5"
                    >
                      Login
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
    </nav>
  );
};

export default Navbar;
