import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CROP_OPTIONS = ['rice', 'wheat', 'cotton', 'sugarcane', 'maize', 'groundnut', 'soybean', 'tomato', 'onion', 'other'];
const SOIL_OPTIONS = ['clay', 'sandy', 'loamy', 'silty', 'black', 'red', 'alluvial'];
const IRRIGATION_OPTIONS = ['rainfed', 'canal', 'drip', 'sprinkler', 'borewell'];
const LANGUAGE_OPTIONS = ['english', 'tamil', 'hindi', 'telugu', 'kannada', 'marathi'];
const LAND_UNITS = ['acres', 'hectares', 'bigha'];
const STATES = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab',
    'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Other',
];

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function Profile() {
    const { dbUser, setDbUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState({
        name: '',
        email: '',
        cropType: 'rice',
        landValue: '',
        landUnit: 'acres',
        soilType: 'loamy',
        district: '',
        pincode: '',
        state: 'Tamil Nadu',
        irrigationType: 'rainfed',
        farmingExperience: '',
        preferredLanguage: 'english',
    });

    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Pre-fill form from existing dbUser data
    useEffect(() => {
        if (dbUser) {
            const p = dbUser.farmerProfile || {};
            setForm({
                name: dbUser.name || '',
                email: dbUser.email || '',

                cropType: p.cropType || 'rice',
                landValue: p.landArea?.value || '',
                landUnit: p.landArea?.unit || 'acres',
                soilType: p.soilType || 'loamy',
                district: p.district || '',
                pincode: p.pincode || '',
                state: p.state || 'Tamil Nadu',
                irrigationType: p.irrigationType || 'rainfed',
                farmingExperience: p.farmingExperience || '',
                preferredLanguage: p.preferredLanguage || 'english',
            });
        }
    }, [dbUser]);

    // Calculate completion %
    const completionFields = ['name', 'cropType', 'landValue', 'soilType', 'district', 'pincode', 'state'];
    const filledCount = completionFields.filter((f) => form[f] !== '' && form[f] !== undefined).length;
    const completionPct = Math.round((filledCount / completionFields.length) * 100);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setSuccess('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!form.name.trim()) return setError('Name is required');
        if (!form.district.trim()) return setError('District is required');
        if (!/^\d{6}$/.test(form.pincode)) return setError('Enter a valid 6-digit pincode');
        if (!form.landValue || isNaN(form.landValue) || Number(form.landValue) <= 0)
            return setError('Enter a valid land area');

        setSaving(true);
        try {
            const res = await api.put('/users/profile', {
                name: form.name,
                cropType: form.cropType,
                landArea: { value: Number(form.landValue), unit: form.landUnit },
                soilType: form.soilType,
                district: form.district,
                pincode: form.pincode,
                state: form.state,
                irrigationType: form.irrigationType,
                farmingExperience: Number(form.farmingExperience) || 0,
                preferredLanguage: form.preferredLanguage,
            });
            setDbUser(res.data.user);
            setSuccess('Profile saved successfully! ✅');
            setTimeout(() => navigate('/dashboard'), 1200);
        } catch (err) {
            setError(err.message || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="app-shell">
            <Sidebar />
            <div className="main-content">
                <Topbar path={location.pathname} />
                <div className="page-content">
                    <div className="profile-page fade-in-up">

                        <div className="profile-page-header">
                            <h2>🌾 Farmer Profile</h2>
                            <p>Fill in your farm details to get personalized recommendations</p>
                        </div>

                        {/* Completion progress */}
                        <div className="form-section" style={{ marginBottom: 24 }}>
                            <div className="profile-completion">
                                <span>Profile Completion</span>
                                <span style={{ fontWeight: 700, color: completionPct === 100 ? 'var(--green-mid)' : 'var(--earth-brown)' }}>
                                    {completionPct}%
                                </span>
                            </div>
                            <div className="progress-bar-wrap">
                                <div className="progress-bar" style={{ width: `${completionPct}%` }} />
                            </div>
                        </div>

                        {error && <div className="error-banner" style={{ marginBottom: 20 }}>⚠️ {error}</div>}
                        {success && (
                            <div style={{ background: 'var(--green-faint)', border: '1px solid var(--green-pale)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: 'var(--green-mid)', fontSize: 14, marginBottom: 20 }}>
                                {success}
                            </div>
                        )}

                        <form className="profile-form" onSubmit={handleSubmit}>

                            {/* Personal Info */}
                            <div className="form-section">
                                <div className="form-section-title">👤 Personal Info</div>
                                <div className="form-grid">
                                    <div className="input-group form-full">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div className="input-group form-full">
                                        <label>Email Address</label>

                                        <input
                                            type="email"
                                            value={form.email}
                                            
                                            style={{
                                                background: "#f5f5f5",
                                                
                                            }}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Preferred Language</label>
                                        <select value={form.preferredLanguage} onChange={(e) => handleChange('preferredLanguage', e.target.value)}>
                                            {LANGUAGE_OPTIONS.map((l) => (
                                                <option key={l} value={l}>{capitalize(l)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Farming Experience (years)</label>
                                        <input
                                            type="number"
                                            value={form.farmingExperience}
                                            onChange={(e) => handleChange('farmingExperience', e.target.value)}
                                            placeholder="e.g. 10"
                                            min={0}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="form-section">
                                <div className="form-section-title">📍 Farm Location</div>
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label>State</label>
                                        <select value={form.state} onChange={(e) => handleChange('state', e.target.value)}>
                                            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>District</label>
                                        <input
                                            type="text"
                                            value={form.district}
                                            onChange={(e) => handleChange('district', e.target.value)}
                                            placeholder="e.g. Coimbatore"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Pincode</label>
                                        <input
                                            type="text"
                                            value={form.pincode}
                                            onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="6-digit pincode"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Crop & Land */}
                            <div className="form-section">
                                <div className="form-section-title">🌱 Crop & Land Details</div>
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label>Primary Crop</label>
                                        <select value={form.cropType} onChange={(e) => handleChange('cropType', e.target.value)}>
                                            {CROP_OPTIONS.map((c) => (
                                                <option key={c} value={c}>{capitalize(c)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Land Area</label>
                                        <div className="land-area-row">
                                            <input
                                                type="number"
                                                value={form.landValue}
                                                onChange={(e) => handleChange('landValue', e.target.value)}
                                                placeholder="e.g. 5"
                                                min={0}
                                                step="0.1"
                                                style={{ flex: 2, border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '11px 14px', outline: 'none' }}
                                            />
                                            <select
                                                value={form.landUnit}
                                                onChange={(e) => handleChange('landUnit', e.target.value)}
                                                style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '11px 10px', outline: 'none' }}
                                            >
                                                {LAND_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label>Soil Type</label>
                                        <select value={form.soilType} onChange={(e) => handleChange('soilType', e.target.value)}>
                                            {SOIL_OPTIONS.map((s) => (
                                                <option key={s} value={s}>{capitalize(s)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Irrigation Type</label>
                                        <select value={form.irrigationType} onChange={(e) => handleChange('irrigationType', e.target.value)}>
                                            {IRRIGATION_OPTIONS.map((i) => (
                                                <option key={i} value={i}>{capitalize(i)}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: 160 }}>
                                    {saving ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</> : '💾 Save Profile'}
                                </button>
                                <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')}>
                                    Cancel
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
