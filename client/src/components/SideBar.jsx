import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: '📊', label: 'Dashboard', path: '/dashboard' },
  { icon: '👤', label: 'My Profile', path: '/profile' },
];

const comingSoon = [
  { icon: '🔬', label: 'Disease Detect' },
  { icon: '📈', label: 'Yield Predict' },
  { icon: '💰', label: 'Market Prices' },
  { icon: '🤖', label: 'AI Advisor' },
  { icon: '🗺️', label: 'Field Map' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dbUser, logout } = useAuth();

  const initials = dbUser?.name
    ? dbUser.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'F';

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🌾</div>
        <span className="sidebar-brand-text">Agri-Smart</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-label">Main</div>
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-item-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div className="nav-label" style={{ marginTop: 12 }}>Coming in Phase 2+</div>
        {comingSoon.map((item) => (
          <button
            key={item.label}
            className="nav-item"
            style={{ opacity: 0.4, cursor: 'not-allowed' }}
            disabled
          >
            <span className="nav-item-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer user */}
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={logout} title="Click to logout">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{dbUser?.name || 'Farmer'}</div>
            <div className="sidebar-user-role">Logout →</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
