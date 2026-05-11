import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & pagination for users
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const USERS_PER_PAGE = 10;

  // Search & pagination for consultations
  const [consultSearch, setConsultSearch] = useState('');
  const [consultPage, setConsultPage] = useState(1);
  const CONSULTS_PER_PAGE = 8;

  // Selected consultation for modal
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAllData();
  }, [user, navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes, consultsRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users'),
        api.get('/api/admin/consultations')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setConsultations(consultsRes.data);
    } catch (err) {
      console.error('Admin fetch error:', err);
      setError(err.response?.data?.error || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  // --- Filtered & paginated users ---
  const filteredUsers = users.filter(u => {
    const term = userSearch.toLowerCase();
    return (u.name || '').toLowerCase().includes(term) ||
           (u.email || '').toLowerCase().includes(term) ||
           (u.role || '').toLowerCase().includes(term);
  });
  const userTotalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE) || 1;
  const pagedUsers = filteredUsers.slice((userPage - 1) * USERS_PER_PAGE, userPage * USERS_PER_PAGE);

  // --- Filtered & paginated consultations ---
  const filteredConsults = consultations.filter(c => {
    const term = consultSearch.toLowerCase();
    return (c.chief_complaint || '').toLowerCase().includes(term) ||
           (c.user_name || '').toLowerCase().includes(term) ||
           (c.user_email || '').toLowerCase().includes(term);
  });
  const consultTotalPages = Math.ceil(filteredConsults.length / CONSULTS_PER_PAGE) || 1;
  const pagedConsults = filteredConsults.slice((consultPage - 1) * CONSULTS_PER_PAGE, consultPage * CONSULTS_PER_PAGE);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow p-8 text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchAllData} className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 font-medium">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'consultations', label: 'Consultations', icon: '📋' }
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <span>🛡️</span> Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Manage users and consultations</p>
          </div>
          <button
            onClick={fetchAllData}
            className="self-start sm:self-auto px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
                ${activeTab === tab.id
                  ? 'bg-green-700 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* === OVERVIEW TAB === */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon="👥"
                color="blue"
              />
              <StatCard
                title="Total Consultations"
                value={stats.totalConsultations}
                icon="📋"
                color="green"
              />
              <StatCard
                title="Consultations Today"
                value={stats.consultationsToday}
                icon="📅"
                color="purple"
              />
            </div>

            {/* Users by Role */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Users by Role</h3>
              <div className="space-y-3">
                {stats.usersByRole.map(r => {
                  const pct = stats.totalUsers > 0 ? Math.round((r.count / stats.totalUsers) * 100) : 0;
                  return (
                    <div key={r.role} className="flex items-center gap-4">
                      <span className="w-20 text-sm font-medium text-gray-600 capitalize">{r.role}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full bg-green-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-16 text-sm text-gray-700 text-right font-medium">{r.count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Consultations Quick View */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Consultations</h3>
              {consultations.length === 0 ? (
                <p className="text-gray-500 text-sm">No consultations yet.</p>
              ) : (
                <div className="space-y-3">
                  {consultations.slice(0, 5).map(c => (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{c.chief_complaint}</p>
                        <p className="text-xs text-gray-500">{c.user_name} &middot; {new Date(c.created_at).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => { setSelectedConsultation(c); }}
                        className="ml-4 text-green-700 hover:text-green-800 text-sm font-medium shrink-0"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* === USERS TAB === */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-gray-600 text-sm">{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found</p>
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={userSearch}
                onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                className="w-full sm:w-72 px-4 py-2 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500 shadow-sm outline-none text-sm"
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Name</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Email</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Role</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Consultations</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No users match your search.</td>
                      </tr>
                    ) : pagedUsers.map(u => (
                      <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-800">{u.name}</td>
                        <td className="px-6 py-4 text-gray-600">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase
                            ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{u.consultation_count}</td>
                        <td className="px-6 py-4 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Users Pagination */}
              {userTotalPages > 1 && (
                <div className="flex justify-center items-center gap-4 py-4 border-t border-gray-100">
                  <button
                    onClick={() => setUserPage(p => Math.max(1, p - 1))}
                    disabled={userPage === 1}
                    className="px-4 py-1.5 border rounded text-sm font-medium disabled:opacity-50 hover:bg-gray-100 bg-white"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">Page {userPage} of {userTotalPages}</span>
                  <button
                    onClick={() => setUserPage(p => Math.min(userTotalPages, p + 1))}
                    disabled={userPage === userTotalPages}
                    className="px-4 py-1.5 border rounded text-sm font-medium disabled:opacity-50 hover:bg-gray-100 bg-white"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* === CONSULTATIONS TAB === */}
        {activeTab === 'consultations' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-gray-600 text-sm">{filteredConsults.length} consultation{filteredConsults.length !== 1 ? 's' : ''} found</p>
              <input
                type="text"
                placeholder="Search by complaint, patient name, or email..."
                value={consultSearch}
                onChange={(e) => { setConsultSearch(e.target.value); setConsultPage(1); }}
                className="w-full sm:w-80 px-4 py-2 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500 shadow-sm outline-none text-sm"
              />
            </div>

            <div className="space-y-3">
              {pagedConsults.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-200">
                  No consultations match your search.
                </div>
              ) : pagedConsults.map(c => (
                <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm text-gray-500">
                          {new Date(c.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {c.user_name} ({c.user_email})
                        </span>
                      </div>
                      <p className="text-base font-bold text-gray-800 truncate">
                        {c.chief_complaint}
                      </p>
                      {c.top_remedies && c.top_remedies.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {c.top_remedies.slice(0, 3).map((r, i) => (
                            <span key={i} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-medium">
                              {r.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedConsultation(c)}
                      className="shrink-0 px-5 py-2 bg-white border-2 border-green-600 text-green-700 font-bold rounded-lg hover:bg-green-50 transition text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}

              {/* Consultations Pagination */}
              {consultTotalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-4">
                  <button
                    onClick={() => setConsultPage(p => Math.max(1, p - 1))}
                    disabled={consultPage === 1}
                    className="px-4 py-2 border rounded font-medium disabled:opacity-50 hover:bg-gray-100 bg-white text-sm"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-gray-600 border px-4 py-2 rounded bg-white">
                    Page {consultPage} of {consultTotalPages}
                  </span>
                  <button
                    onClick={() => setConsultPage(p => Math.min(consultTotalPages, p + 1))}
                    disabled={consultPage === consultTotalPages}
                    className="px-4 py-2 border rounded font-medium disabled:opacity-50 hover:bg-gray-100 bg-white text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* === CONSULTATION DETAIL MODAL === */}
      {selectedConsultation && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

            <div className="bg-green-700 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold">Consultation Details</h2>
              <button
                onClick={() => setSelectedConsultation(null)}
                className="text-white hover:text-green-200 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 bg-gray-50 flex-grow">

              {/* Patient & Admin Info */}
              <div className="bg-white border-l-4 border-green-600 p-5 rounded shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500 block">Patient Name</span><span className="font-medium">{selectedConsultation.user_name}</span></div>
                  <div><span className="text-gray-500 block">Email</span><span className="font-medium">{selectedConsultation.user_email}</span></div>
                  <div><span className="text-gray-500 block">Date</span><span className="font-medium">{new Date(selectedConsultation.created_at).toLocaleString()}</span></div>
                  <div><span className="text-gray-500 block">Age & Gender</span><span className="font-medium">{selectedConsultation.form_data?.age} years, {selectedConsultation.form_data?.gender}</span></div>
                  <div className="col-span-2"><span className="text-gray-500 block">Chief Complaint</span><span className="font-medium text-gray-800">{selectedConsultation.chief_complaint}</span></div>
                </div>
              </div>

              {/* Constitutional Profile */}
              <div className="bg-white border-l-4 border-green-600 p-5 rounded shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Constitutional Profile</h3>
                <p className="text-gray-700 leading-relaxed text-sm">{selectedConsultation.constitutional_profile}</p>
              </div>

              {/* Remedies */}
              {selectedConsultation.top_remedies && selectedConsultation.top_remedies.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Recommended Remedies</h3>
                  <div className="space-y-3">
                    {selectedConsultation.top_remedies.map((remedy, idx) => (
                      <div key={idx} className="bg-white border rounded shadow-sm overflow-hidden">
                        <div className="bg-gray-100 px-4 py-3 flex justify-between items-center">
                          <h4 className="font-bold text-gray-800">{remedy.name}</h4>
                          <span className="text-xs font-bold px-2 py-1 rounded bg-green-200 text-green-800">{remedy.match_strength} Match</span>
                        </div>
                        <div className="p-4 space-y-3 text-sm">
                          <div>
                            <p className="font-bold text-gray-700">Mental & Emotional Match</p>
                            <p className="text-gray-600 mt-1">{remedy.mental_emotional_match}</p>
                          </div>
                          <div className="border-t pt-3">
                            <p className="font-bold text-gray-700">Physical Symptom Support</p>
                            <p className="text-gray-600 mt-1">{remedy.physical_support}</p>
                          </div>
                          <div className="border-t pt-3">
                            <p className="font-bold text-gray-700">Distinguishing Traits</p>
                            <p className="text-gray-600 mt-1">{remedy.distinguishing_traits}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white px-6 py-4 border-t flex justify-end shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] relative z-10">
              <button
                onClick={() => setSelectedConsultation(null)}
                className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Stat Card Component ---
const StatCard = ({ title, value, icon, color }) => {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.green} flex items-center justify-center text-2xl text-white shadow-sm`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
