import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', sub: 'Your farm at a glance' },
  '/profile': { title: 'Farmer Profile', sub: 'Manage your farm details' },
};

export default function Topbar({ path }) {
  const { dbUser } = useAuth();
  const page = pageTitles[path] || { title: 'Agri-Smart', sub: '' };

  const now = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2>{page.title}</h2>
        <p>{page.sub} &nbsp;·&nbsp; {now}</p>
      </div>
      <div className="topbar-right">
        <button className="topbar-icon-btn" title="Notifications">🔔</button>
        <button className="topbar-icon-btn" title="Settings">⚙️</button>
        <span
          style={{
            background: 'var(--green-faint)',
            color: 'var(--green-dark)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 14px',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {dbUser?.farmerProfile?.cropType
            ? `🌱 ${dbUser.farmerProfile.cropType.charAt(0).toUpperCase() + dbUser.farmerProfile.cropType.slice(1)}`
            : '🌱 No crop set'}
        </span>
      </div>
    </header>
  );
}
