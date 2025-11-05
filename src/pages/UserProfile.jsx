import React, { useEffect, useState } from 'react';
import { authAPI, handleAPIError } from '../services/api';
import { billingAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [startingTrial, setStartingTrial] = useState(false);

  // Backend origin derived from API_BASE_URL (strip trailing /api)
  const backendOrigin = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');

  const resolveImage = (img) => {
    if (!img) return null;
    if (typeof img !== 'string') return null;
    if (img.startsWith('data:') || img.startsWith('blob:') || img.startsWith('http')) return img;
    // relative path like /uploads/profile-images/...
    if (img.startsWith('/')) return `${backendOrigin}${img}`;
    return `${backendOrigin}/${img}`;
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const p = await authAPI.getProfile();
        const s = await authAPI.getStats();
        // fetch subscription info
        try {
          const subResp = await billingAPI.getSubscription();
          if (mounted) setSubscription(subResp.subscription || null);
        } catch (e) {
          console.warn('Failed to load subscription', e);
        }
        if (!mounted) return;
        const userProfile = p.user || p;
        setProfile(userProfile);
  // initialize inputs
  setCityInput(userProfile?.city || '');
  setCompanyInput(userProfile?.company || '');
  setBioInput(userProfile?.bio || '');
  setProfileImagePreview(userProfile?.profileImage || null);
        setStats(s.stats || s);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-6 text-red-400">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-slate-900 rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col items-center text-center">
          <div className="w-28 h-28 bg-slate-800 rounded-full flex items-center justify-center overflow-hidden">
            {(() => {
              const avatarSrc = profileImagePreview ? resolveImage(profileImagePreview) : resolveImage(profile?.profileImage);
              return avatarSrc ? (
                <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-400">{(profile?.name || 'U').slice(0,1).toUpperCase()}</div>
              );
            })()}
          </div>
          <h2 className="mt-4 text-xl font-semibold text-white">{profile?.name}</h2>
          <p className="text-sm text-slate-400">{profile?.email}</p>
        </div>

        <div className="md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-800 rounded">
              <div className="text-xs text-slate-400">Properties</div>
              <div className="mt-2 text-2xl font-bold text-white">{stats?.properties ?? 0}</div>
            </div>
            <div className="p-4 bg-slate-800 rounded">
              <div className="text-xs text-slate-400">Bookings</div>
              <div className="mt-2 text-2xl font-bold text-white">{stats?.bookings ?? 0}</div>
            </div>
            <div className="p-4 bg-slate-800 rounded">
              <div className="text-xs text-slate-400">Messages</div>
              <div className="mt-2 text-2xl font-bold text-white">{stats?.messages ?? 0}</div>
            </div>
          </div>
          {profile?.role === 'realtor' && (
            <>
              <div className="mt-6 p-4 bg-slate-800 rounded">
                <div className="text-sm text-slate-400">AI Usage</div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <div className="text-lg text-white font-semibold">{stats?.aiUsage?.requests ?? 0} requests</div>
                    <div className="text-sm text-slate-400">{stats?.aiUsage?.tokens ?? 0} tokens</div>
                  </div>
                  <div>
                    <a href="/billing?intent=upgrade" className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded text-white">Upgrade</a>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-violet-900/30 to-purple-900/30 border border-violet-700/50 rounded">
                <div className="text-sm text-violet-300 font-medium">Current Plan & Billing</div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <div className="text-lg text-white font-semibold">
                      {subscription?.planId ? subscription.planId.charAt(0).toUpperCase() + subscription.planId.slice(1) : 'Free'} Plan
                    </div>
                    <div className="text-sm text-slate-400">Manage subscriptions and view usage</div>
                    {subscription ? (
                      <div className="text-sm text-green-400 mt-1 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        Active subscription
                      </div>
                    ) : (
                      <div className="text-sm text-yellow-400 mt-1">No active subscription — upgrade now</div>
                    )}
                  </div>
                  <div>
                    <a href="/billing" className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded text-white font-medium transition-colors">Manage Billing</a>
                    {!subscription && (
                      <button onClick={async () => {
                        if (!window.confirm('Start a 14-day free trial for your organization?')) return;
                        setStartingTrial(true);
                        try {
                          const res = await billingAPI.startTrial({ planId: 'starter' });
                          setSubscription(res.subscription || null);
                          toast.success('Trial started — 14 days free');
                        } catch (err) {
                          handleAPIError(err);
                        } finally {
                          setStartingTrial(false);
                        }
                      }} disabled={startingTrial} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-white">{startingTrial ? 'Starting...' : 'Start Trial'}</button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="mt-6 p-4 bg-slate-800 rounded">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Profile</h3>
              <div>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-sm bg-violet-600 hover:bg-violet-700 px-3 py-1 rounded text-white"
                  >
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={async () => {
                        // Save
                        setSaving(true);
                        try {
                          // If a new profile image file is selected, convert to base64 and include
                          let imageData = null;
                          if (profileImageFile) {
                            imageData = await new Promise((resolve, reject) => {
                              const reader = new FileReader();
                              reader.onload = () => resolve(reader.result);
                              reader.onerror = reject;
                              reader.readAsDataURL(profileImageFile);
                            });
                          }

                          const payload = { city: cityInput, company: companyInput, bio: bioInput };
                          if (imageData) payload.profileImage = imageData;
                          const res = await authAPI.updateProfile(payload);
                          if (res.success) {
                            setProfile(prev => ({ ...prev, ...res.user }));
                            toast.success('Profile updated');
                            setEditing(false);
                          } else {
                            const msg = res.error || res.message || 'Failed to update';
                            handleAPIError({ response: { data: { message: msg } } });
                          }
                        } catch (err) {
                          handleAPIError(err);
                        } finally {
                          setSaving(false);
                        }
                      }}
                      disabled={saving}
                      className="text-sm bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white mr-2"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        // Cancel edits, revert inputs to profile values
                        setCityInput(profile?.city || '');
                        setCompanyInput(profile?.company || '');
                        setBioInput(profile?.bio || '');
                        setProfileImageFile(null);
                        setProfileImagePreview(profile?.profileImage || null);
                        setEditing(false);
                      }}
                      className="text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-white"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-3 text-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400">City</label>
                  {!editing ? (
                    <div className="mt-1 text-white">{profile?.city || '-'}</div>
                  ) : (
                    <input
                      value={cityInput}
                      onChange={(e) => setCityInput(e.target.value)}
                      className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-white"
                      placeholder="e.g. Durban"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs text-slate-400">Company</label>
                  {!editing ? (
                    <div className="mt-1 text-white">{profile?.company || '-'}</div>
                  ) : (
                    <input
                      value={companyInput}
                      onChange={(e) => setCompanyInput(e.target.value)}
                      className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-white"
                      placeholder="Company name"
                    />
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-400">Bio</label>
                  {!editing ? (
                    <div className="mt-1 text-white">{profile?.bio || '-'}</div>
                  ) : (
                    <textarea
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                      className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-white"
                      rows={3}
                      placeholder="Tell clients about yourself"
                    />
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-400">Profile Picture</label>
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="w-20 h-20 bg-slate-800 rounded-full overflow-hidden flex items-center justify-center">
                      {(() => {
                        const src = resolveImage(profileImagePreview || profile?.profileImage);
                        return src ? (
                          <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-slate-400">{(profile?.name || 'U').slice(0,1).toUpperCase()}</div>
                        );
                      })()}
                    </div>
                    {editing && (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files && e.target.files[0];
                            if (f) {
                              setProfileImageFile(f);
                              setProfileImagePreview(URL.createObjectURL(f));
                            }
                          }}
                        />
                        <div className="text-xs text-slate-400 mt-1">Upload a square image for best results</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="mt-2 text-sm text-slate-400">{profile?.bio || 'No bio provided'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
