import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Mic } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isLinkActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-dark-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-dark-800/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Mic size={18} className="animate-pulse-subtle" />
            </div>
            <span className="font-sans font-bold text-lg tracking-tight bg-gradient-to-r from-primary-700 to-accent-600 dark:from-primary-400 dark:to-accent-500 bg-clip-text text-transparent">
              Aura Pronunciation AI
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors ${
                isLinkActive('/')
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/compliance"
              className={`text-sm font-semibold transition-colors ${
                isLinkActive('/compliance')
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              DPDP Compliance
            </Link>
          </div>

          {/* Right Side Settings & Action */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-900 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-dark-800/60 transition-all active:scale-95"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm py-2 px-4 rounded-xl shadow-md transition-all active:scale-95"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="hidden sm:block text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors py-2 px-3"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm py-2 px-4 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
