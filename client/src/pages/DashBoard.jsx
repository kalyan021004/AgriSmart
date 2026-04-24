import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import WeatherWidget from '../components/WeatherWidget';
import { useAuth } from '../context/AuthContext';

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '—';

export default function DashBoard() {
    const { dbUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const p = dbUser?.farmerProfile || {};

    const stats = [
        {
            label: 'Primary Crop',
            value: capitalize(p.cropType),
            icon: '🌾',
            sub: 'Current season',
            color: 'green',
        },
        {
            label: 'Land Area',
            value: p.landArea?.value ? `${p.landArea.value}` : '—',
            icon: '🗺️',
            sub: p.landArea?.unit || 'Not set',
            color: 'brown',
        },
        {
            label: 'Soil Type',
            value: capitalize(p.soilType),
            icon: '🪨',
            sub: p.irrigationType ? capitalize(p.irrigationType) + ' irrigation' : 'Irrigation not set',
            color: 'yellow',
        },
        {
            label: 'Location',
            value: p.district || '—',
            icon: '📍',
            sub: p.state || 'Set your location',
            color: 'blue',
        },
    ];

    return (
        <div className="app-shell">
            <Sidebar />
            <div className="main-content">
                <Topbar path={location.pathname} />
                <div className="page-content">

                    {/* Incomplete profile banner */}
                    {!dbUser?.isProfileComplete && (
                        <div className="incomplete-banner fade-in-up">
                            <div className="incomplete-banner-icon">⚠️</div>
                            <div className="incomplete-banner-text">
                                <h4>Complete your farmer profile</h4>
                                <p>Add your crop, land and location details to get personalized recommendations</p>
                            </div>
                            <button
                                className="btn btn-primary incomplete-banner-btn"
                                onClick={() => navigate('/profile')}
                            >
                                Complete Profile →
                            </button>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="stats-grid">
                        {stats.map((stat, i) => (
                            <div className={`stat-card ${stat.color} fade-in-up fade-in-up-delay-${i + 1}`} key={stat.label}>
                                <div className="stat-header">
                                    <span className="stat-label">{stat.label}</span>
                                    <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
                                </div>
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-sub">{stat.sub}</div>
                            </div>
                        ))}
                    </div>

                    {/* Main content grid */}
                    <div className="dashboard-grid">

                        {/* Weather Section */}
                        <div className="section-card fade-in-up fade-in-up-delay-1">
                            <div className="section-header">
                                <span className="section-title">🌤️ Live Weather</span>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    {p.district || 'Auto-detect'}
                                </span>
                            </div>
                            <div className="section-body">
                                <WeatherWidget />
                            </div>
                        </div>

                        {/* Farm Summary */}
                        <div className="section-card fade-in-up fade-in-up-delay-2">
                            <div className="section-header">
                                <span className="section-title">🌿 Farm Summary</span>
                                <button
                                    className="btn btn-ghost"
                                    style={{ fontSize: 12, padding: '4px 10px' }}
                                    onClick={() => navigate('/profile')}
                                >
                                    Edit ✏️
                                </button>
                            </div>
                            <div className="section-body">
                                <div className="profile-summary">
                                    {[
                                        { label: 'Farmer', value: dbUser?.name || '—' },
                                        { label: 'Email', value: dbUser?.email || '—' }, { label: 'Crop', value: capitalize(p.cropType) },
                                        { label: 'Land', value: p.landArea?.value ? `${p.landArea.value} ${p.landArea.unit}` : '—' },
                                        { label: 'Soil', value: capitalize(p.soilType) },
                                        { label: 'Irrigation', value: capitalize(p.irrigationType) },
                                        { label: 'District', value: p.district || '—' },
                                        { label: 'State', value: p.state || '—' },
                                        { label: 'Experience', value: p.farmingExperience ? `${p.farmingExperience} years` : '—' },
                                        { label: 'Language', value: capitalize(p.preferredLanguage) },
                                    ].map((item) => (
                                        <div className="profile-item" key={item.label}>
                                            <span className="profile-item-label">{item.label}</span>
                                            <span className="profile-item-value">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coming soon features */}
                    <div className="dashboard-grid-3 fade-in-up">
                        {[
                            { icon: '🔬', title: 'Disease Detection', desc: 'Upload a leaf photo to detect crop diseases using AI', phase: 'Phase 2' },
                            { icon: '📈', title: 'Yield Prediction', desc: 'Predict your expected harvest using ML models', phase: 'Phase 3' },
                            { icon: '🤖', title: 'AI Farming Advisor', desc: 'Get multilingual farming tips from GenAI', phase: 'Phase 4' },
                        ].map((feature) => (
                            <div className="section-card" key={feature.title} style={{ opacity: 0.7 }}>
                                <div className="section-body" style={{ padding: 24 }}>
                                    <div style={{ fontSize: 36, marginBottom: 12 }}>{feature.icon}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <h4 style={{ fontSize: 15, fontWeight: 700 }}>{feature.title}</h4>
                                        <span className="badge badge-yellow">{feature.phase}</span>
                                    </div>
                                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{feature.desc}</p>
                                    <button className="btn btn-outline" disabled style={{ marginTop: 16, fontSize: 13, padding: '8px 16px', cursor: 'not-allowed' }}>
                                        Coming Soon
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}
