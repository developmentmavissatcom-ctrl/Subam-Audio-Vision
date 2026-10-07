import React, { useState } from 'react';
import { useApp, AdminTab } from '../context/AppContext';
import { 
  Shield, 
  Music2, 
  Mic2, 
  Youtube, 
  Receipt, 
  Settings, 
  BarChart3, 
  RefreshCw, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Song, Artist } from '../types';

export const AdminDashboard: React.FC = () => {
  const { 
    adminTab, 
    setAdminTab, 
    songs, 
    artists, 
    orders, 
    siteSettings, 
    updateSiteSettings, 
    syncYouTubeChannel, 
    isSyncingYouTube, 
    youtubeSyncStatus, 
    deleteSong,
    showToast,
    setCurrentView 
  } = useApp();

  const [brandNameInput, setBrandNameInput] = useState(siteSettings.brandName);
  const [announcementInput, setAnnouncementInput] = useState(siteSettings.announcementText || '');
  const [youtubeApiKeyInput, setYoutubeApiKeyInput] = useState('');
  const [channelHandleInput, setChannelHandleInput] = useState(siteSettings.youtubeChannelHandle || '@subamaudiovision');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await updateSiteSettings({
        brandName: brandNameInput,
        announcementText: announcementInput,
        youtubeChannelHandle: channelHandleInput
      });
      showToast('Settings saved successfully', 'success');
    } catch {
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSyncYouTube = async () => {
    try {
      const res = await syncYouTubeChannel(youtubeApiKeyInput || undefined, channelHandleInput);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('YouTube sync failed', 'error');
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

  return (
    <div id="admin-dashboard-page" className="py-8 px-4 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#120E0A] border border-[#D4AF37]/30">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#D4AF37]/20 text-[#F0C75E]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-cinzel text-white">Subam Master Console</h1>
            <p className="text-xs text-[#9E958B]">Catalogue Management, YouTube Sync & Devotional Store Analytics</p>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('home')}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          Exit to Public Store
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {(['overview', 'songs', 'artists', 'youtube', 'orders', 'settings'] as AdminTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setAdminTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize flex items-center gap-2 whitespace-nowrap ${
              adminTab === tab
                ? 'bg-[#261E13] border border-[#D4AF37]/50 text-[#F0C75E]'
                : 'text-[#8C8379] hover:text-white'
            }`}
          >
            {tab === 'overview' && <BarChart3 className="w-3.5 h-3.5" />}
            {tab === 'songs' && <Music2 className="w-3.5 h-3.5" />}
            {tab === 'artists' && <Mic2 className="w-3.5 h-3.5" />}
            {tab === 'youtube' && <Youtube className="w-3.5 h-3.5" />}
            {tab === 'orders' && <Receipt className="w-3.5 h-3.5" />}
            {tab === 'settings' && <Settings className="w-3.5 h-3.5" />}
            <span>{tab}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#120E0A] border border-white/10 space-y-2">
              <span className="text-xs text-[#8C8379]">Catalog Master Tracks</span>
              <div className="text-3xl font-bold font-cinzel text-white">{songs.length}</div>
              <span className="text-[11px] text-[#F0C75E]">Lossless Cloud & Local Masters</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#120E0A] border border-white/10 space-y-2">
              <span className="text-xs text-[#8C8379]">Featured Maestros</span>
              <div className="text-3xl font-bold font-cinzel text-white">{artists.length}</div>
              <span className="text-[11px] text-[#8C8379]">S.P.B., Veeramanidasan & more</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#120E0A] border border-white/10 space-y-2">
              <span className="text-xs text-[#8C8379]">Total Orders</span>
              <div className="text-3xl font-bold font-cinzel text-white">{orders.length}</div>
              <span className="text-[11px] text-green-400">Master Downloads</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#120E0A] border border-white/10 space-y-2">
              <span className="text-xs text-[#8C8379]">Devotional Revenue</span>
              <div className="text-3xl font-bold font-cinzel text-[#F0C75E]">₹{totalRevenue}</div>
              <span className="text-[11px] text-[#8C8379]">Direct downloads support</span>
            </div>
          </div>
        </div>
      )}

      {/* Songs Tab */}
      {adminTab === 'songs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-cinzel text-white">Tracks in Catalog ({songs.length})</h3>
          </div>

          <div className="rounded-2xl bg-[#120E0A] border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#C2B7AC]">
                <thead className="bg-[#1A140D] text-[#8C8379] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Track</th>
                    <th className="p-3">Singer / Deity</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {songs.slice(0, 30).map((song) => (
                    <tr key={song.id} className="hover:bg-white/[0.02]">
                      <td className="p-3 flex items-center gap-3">
                        <img src={song.coverImage} alt={song.title} className="w-8 h-8 rounded object-cover bg-black" />
                        <div>
                          <div className="font-bold text-white line-clamp-1">{song.title}</div>
                          <div className="text-[10px] text-[#8C8379]">{song.duration}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>{song.credits?.singer || 'Subam Artist'}</div>
                        <div className="text-[10px] text-[#D4AF37]">{song.deity || 'Universal'}</div>
                      </td>
                      <td className="p-3">{song.categoryName}</td>
                      <td className="p-3 font-semibold text-white">₹{song.price}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Remove track "${song.title}"?`)) {
                              deleteSong(song.id);
                            }
                          }}
                          className="p-1.5 rounded text-red-400 hover:bg-red-400/10 transition-colors"
                          title="Delete song"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Artists Tab */}
      {adminTab === 'artists' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-cinzel text-white">Sacred Vocalists & Composers ({artists.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {artists.map((artist) => (
              <div key={artist.id} className="p-4 rounded-xl bg-[#120E0A] border border-white/10 flex items-center gap-4">
                <img src={artist.photoUrl} alt={artist.name} className="w-14 h-14 rounded-full object-cover bg-black ring-2 ring-[#D4AF37]/30" />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{artist.name}</h4>
                  <p className="text-xs text-[#D4AF37]">{artist.role}</p>
                  <p className="text-[11px] text-[#8C8379] mt-0.5 truncate">{artist.famousFor}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* YouTube Sync Tab */}
      {adminTab === 'youtube' && (
        <div className="p-6 rounded-2xl bg-[#120E0A] border border-white/10 space-y-6 max-w-2xl">
          <div>
            <h3 className="text-lg font-bold font-cinzel text-white">Subam Audio Vision YouTube Sync</h3>
            <p className="text-xs text-[#8C8379] mt-1">
              Synchronize live streams, playlists, and video broadcasts directly from the official channel.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#C2B7AC] mb-1">Channel Handle / URL</label>
              <input
                type="text"
                value={channelHandleInput}
                onChange={(e) => setChannelHandleInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A140D] border border-white/10 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C2B7AC] mb-1">YouTube Data API Key (Optional)</label>
              <input
                type="password"
                value={youtubeApiKeyInput}
                onChange={(e) => setYoutubeApiKeyInput(e.target.value)}
                placeholder="Leave blank to use server environment key"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A140D] border border-white/10 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              onClick={handleSyncYouTube}
              disabled={isSyncingYouTube}
              className="px-6 py-2.5 rounded-xl bg-[#CC0000] hover:bg-[#E60000] text-white font-bold text-xs flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingYouTube ? 'animate-spin' : ''}`} />
              <span>{isSyncingYouTube ? 'Syncing...' : 'Sync Channel Now'}</span>
            </button>

            {youtubeSyncStatus && (
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs space-y-1">
                <div className="font-semibold text-[#F0C75E]">Sync Status</div>
                <div className="text-[#C2B7AC]">{youtubeSyncStatus.message || 'Updated'}</div>
                {youtubeSyncStatus.subscriberCount && (
                  <div className="text-[11px] text-[#8C8379]">Devotees: {youtubeSyncStatus.subscriberCount}</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {adminTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-cinzel text-white">Master Track Orders ({orders.length})</h3>
          <div className="rounded-2xl bg-[#120E0A] border border-white/10 overflow-hidden">
            <table className="w-full text-left text-xs text-[#C2B7AC]">
              <thead className="bg-[#1A140D] text-[#8C8379] uppercase text-[10px]">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Track</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-mono text-[#F0C75E]">{ord.id}</td>
                    <td className="p-3 font-bold text-white">{ord.songTitle}</td>
                    <td className="p-3">{ord.userEmail}</td>
                    <td className="p-3 font-semibold text-white">₹{ord.amount}</td>
                    <td className="p-3"><span className="text-green-400 font-bold text-[10px] uppercase">{ord.paymentStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {adminTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-[#120E0A] border border-white/10 space-y-4 max-w-xl">
          <h3 className="text-lg font-bold font-cinzel text-white">Platform Settings</h3>

          <div>
            <label className="block text-xs font-semibold text-[#C2B7AC] mb-1">Brand Name</label>
            <input
              type="text"
              value={brandNameInput}
              onChange={(e) => setBrandNameInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A140D] border border-white/10 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#C2B7AC] mb-1">Header Announcement Banner</label>
            <input
              type="text"
              value={announcementInput}
              onChange={(e) => setAnnouncementInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A140D] border border-white/10 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingSettings}
            className="px-6 py-2.5 rounded-xl bg-[#D4AF37] text-black font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md"
          >
            {isSavingSettings ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      )}
    </div>
  );
};
