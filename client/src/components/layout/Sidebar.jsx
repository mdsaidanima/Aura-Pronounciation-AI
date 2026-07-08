import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  LayoutDashboard, 
  Mic, 
  History, 
  BarChart3, 
  User, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X,
  Sun,
  Moon
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Assess Pronunciation', path: '/upload', icon: Mic },
    { label: 'History Logs', path: '/history', icon: History },
    { label: 'Performance Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'My Profile', path: '/profile', icon: User },
    { label: 'DPDP Privacy Policy', path: '/compliance', icon: ShieldCheck },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 dark:bg-dark-950 dark:border-r dark:border-dark-800/80">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800 dark:border-dark-900">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-500 to-accent-400 flex items-center justify-center text-white">
          <Mic size={18} />
        </div>
        <span className="font-sans font-bold text-lg tracking-tight bg-gradient-to-r from-primary-400 to-accent-300 bg-clip-text text-transparent">
          Aura Pronunciation AI
        </span>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                active
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white dark:hover:bg-dark-900/60'
              }`}
            >
              <Icon size={18} className={active ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle in Sidebar */}
      <div className="px-4 py-2">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3.5 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white dark:hover:bg-dark-900/60 transition-all"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      {/* Footer Info / Logout */}
      <div className="p-4 border-t border-slate-800 dark:border-dark-900 flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2">
          {/* Avatar (Initials fallback) */}
          <div className="w-10 h-10 rounded-xl bg-primary-900/50 border border-primary-500/20 flex items-center justify-center text-primary-400 font-bold text-sm uppercase">
            {user?.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate text-white">{user?.name || 'Loading...'}</p>
            <p className="text-xs truncate text-slate-500">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-all"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white px-4 py-4 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-500 to-accent-400 flex items-center justify-center">
            <Mic size={16} />
          </div>
          <span className="font-bold text-base tracking-tight bg-gradient-to-r from-primary-400 to-accent-300 bg-clip-text text-transparent">
            Aura Pronunciation AI
          </span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded-md hover:bg-slate-800 focus:outline-none"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Drawer backdrop for mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar container */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform md:translate-x-0 md:static md:h-screen shrink-0 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;
