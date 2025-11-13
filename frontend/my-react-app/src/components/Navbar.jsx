import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FiMoon, FiSun } from 'react-icons/fi';

export default function Navbar() {
  const { token, logout, user, ecoPoints ,refreshEcoPoints} = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = React.useState(true);

  // React.useEffect(() => {
  //     refreshEcoPoints();
  //   }, [refreshEcoPoints]);

  const authUser = React.useMemo(() => {
    const stored = localStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : null;
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [dark]);

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-brand-500 text-white' : 'text-white/80 hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-10 bg-black/70 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to={token ? '/' : '/login'} className="font-display text-2xl text-white">
            ZEDOVA
          </Link>
          {token && (
            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/" className={linkClass}>Home</NavLink>
              <NavLink to="/items" className={linkClass}>Items</NavLink>
              <NavLink to="/exchange" className={linkClass}>Exchange</NavLink>
              {/* <NavLink to="/donations" className={linkClass}>Donations</NavLink> */}
              <NavLink to="/eco-points" className={linkClass}>Points</NavLink>
              <NavLink to="/messages" className={linkClass}>Messages</NavLink>
              <NavLink to="/profile" className={linkClass}>Profile</NavLink>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-3">
          {token && (
            <div className="hidden sm:flex items-center gap-2 text-white/80 text-sm">
              <span>Eco-points:</span>
              <span className="px-2 py-1 rounded bg-white/10">{authUser?.eco_points ?? 0}</span>
            </div>
          )}
          <button
            aria-label="Toggle dark mode"
            className="p-2 rounded-md bg-white/10 hover:bg-white/20 text-white"
            onClick={() => setDark((v) => !v)}
          >
            {dark ? <FiMoon /> : <FiSun />}
          </button>
          {token ? (
            <button
              className="px-3 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Logout
            </button>
          ) : (
            <Link className="px-3 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white" to="/login">
              Login
            </Link>
          )}
        </div>
      </div>
      {token && (
        <div className="md:hidden px-4 pb-3 flex flex-wrap gap-2">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          <NavLink to="/items" className={linkClass}>Items</NavLink>
          <NavLink to="/exchange" className={linkClass}>Exchange</NavLink>
          <NavLink to="/donations" className={linkClass}>Donations</NavLink>
          <NavLink to="/eco-points" className={linkClass}>Points</NavLink>
          <NavLink to="/messages" className={linkClass}>Messages</NavLink>
          <NavLink to="/profile" className={linkClass}>Profile</NavLink>
        </div>
      )}
    </header>
  );
}

