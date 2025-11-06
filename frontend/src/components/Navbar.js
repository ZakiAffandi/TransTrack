import React from 'react';
import { FiTruck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Lacak Bus', to: '/track' },
  { label: 'Jadwal', to: '/schedule' },
  { label: 'Beli Tiket', to: '/ticket' }
];

const Navbar = () => {
  const { isAuthenticated, user, openLogin, logout } = useAuth();

  return (
    <nav className="w-full bg-white shadow-navbar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          {/* Brand */}
          <a href="/" className="flex items-center gap-2">
            <FiTruck className="text-primary" size={24} />
            <span className="font-semibold text-lg text-primary">TransTrack</span>
          </a>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => (
                  isActive ? 'text-secondary font-medium' : 'text-text hover:text-primary transition-colors'
                )}
                end={item.to === '/'}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center">
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={openLogin}
                className="border border-secondary text-secondary px-4 py-2 rounded-md hover:bg-secondary/10 transition-colors"
              >
                Masuk
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-textSecondary text-sm hidden md:inline">{user?.name}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="border border-primary text-primary px-3 py-2 rounded-md hover:bg-primary/10 transition-colors text-sm"
                >
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


