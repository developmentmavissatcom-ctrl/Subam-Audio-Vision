import React from 'react';
import { useApp } from '../context/AppContext';
import { User, Download, Heart, Receipt, Shield, Play, Music, LogOut } from 'lucide-react';
import { Song } from '../types';

export const UserAccount: React.FC = () => {
  const { 
    currentUser, 
    switchUserRole, 
    accountTab, 
    setAccountTab, 
    orders, 
    songs, 
    playSong,
    setCurrentView 
  } = useApp();

  const user = currentUser || {
    id: 'user-demo',
    name: 'Devotee Guest',
    email: 'devotee@subamaudiovision.com',
    role: 'USER' as const,
    purchasedSongIds: ['song-subam-1', 'song-subam-2'],
    favorites: ['song-subam-1', 'song-subam-3']
  };

  const purchasedSongs = songs.filter(s => user.purchasedSongIds?.includes(s.id));
  const favoriteSongs = songs.filter(s => user.favorites?.includes(s.id) || s.isFavorited);

  return (
    <div id="user-account-page" className="py-8 px-4 sm:px-6 md:px-8 lg:px-12 max-w-5xl mx-auto space-y-8">
      {/* Account Header */}
      <div className="rounded-2xl p-6 bg-[#120E0A] border border-[#D4AF37]/30 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#FF8C00] flex items-center justify-center text-black font-bold text-2xl shadow-lg">
            {user.name.charAt(0)}
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-white">{user.name}</h2>
            <p className="text-xs text-[#9E958B]">{user.email}</p>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-2 py-0.5 rounded-full bg-[#261E13] border border-[#D4AF37]/40 text-[#F0C75E] text-[10px] font-bold uppercase tracking-wider">
                {user.role} DEVOTEE
              </span>
              <button
                onClick={() => switchUserRole(user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                className="text-[11px] text-[#D4AF37] hover:underline font-semibold"
              >
                Switch to {user.role === 'ADMIN' ? 'User' : 'Admin'} View
              </button>
            </div>
          </div>
        </div>

        {user.role === 'ADMIN' && (
          <button
            onClick={() => setCurrentView('admin')}
            className="px-4 py-2 rounded-xl bg-[#D4AF37] text-black text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shadow-md"
          >
            <Shield className="w-4 h-4" />
            <span>Open Admin Dashboard</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {(['DOWNLOADS', 'FAVORITES', 'ORDERS', 'PROFILE'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setAccountTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              accountTab === tab
                ? 'bg-[#261E13] border border-[#D4AF37]/50 text-[#F0C75E]'
                : 'text-[#8C8379] hover:text-white'
            }`}
          >
            {tab === 'DOWNLOADS' && <Download className="w-3.5 h-3.5" />}
            {tab === 'FAVORITES' && <Heart className="w-3.5 h-3.5" />}
            {tab === 'ORDERS' && <Receipt className="w-3.5 h-3.5" />}
            {tab === 'PROFILE' && <User className="w-3.5 h-3.5" />}
            <span>{tab}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {accountTab === 'DOWNLOADS' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white font-cinzel">Your Purchased Master Tracks</h3>
          {purchasedSongs.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-[#120E0A] border border-white/5 text-[#8C8379] text-xs">
              You have not purchased any individual master tracks yet. Explore the catalogue and download sacred audio.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {purchasedSongs.map(song => (
                <div key={song.id} className="p-3.5 rounded-xl bg-[#120E0A] border border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={song.coverImage} alt={song.title} className="w-12 h-12 rounded-lg object-cover bg-black" />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{song.title}</h4>
                      <p className="text-xs text-[#8C8379] truncate">{song.credits?.singer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => playSong(song)}
                      className="p-2 rounded-full bg-[#D4AF37] text-black hover:scale-105"
                      title="Play"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {accountTab === 'FAVORITES' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white font-cinzel">Your Favorite Chants & Hymns</h3>
          {favoriteSongs.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-[#120E0A] border border-white/5 text-[#8C8379] text-xs">
              No favorites saved yet. Click the heart icon on any song to save it here.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favoriteSongs.map(song => (
                <div key={song.id} className="p-3.5 rounded-xl bg-[#120E0A] border border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={song.coverImage} alt={song.title} className="w-12 h-12 rounded-lg object-cover bg-black" />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{song.title}</h4>
                      <p className="text-xs text-[#8C8379] truncate">{song.credits?.singer}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => playSong(song)}
                    className="p-2 rounded-full bg-[#D4AF37] text-black hover:scale-105"
                    title="Play"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {accountTab === 'ORDERS' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white font-cinzel">Purchase History & Receipts</h3>
          {orders.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-[#120E0A] border border-white/5 text-[#8C8379] text-xs">
              No orders recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(ord => (
                <div key={ord.id} className="p-4 rounded-xl bg-[#120E0A] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono text-[#F0C75E]">{ord.id}</div>
                    <div className="text-sm font-bold text-white mt-0.5">{ord.songTitle}</div>
                    <div className="text-xs text-[#8C8379]">{new Date(ord.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">₹{ord.amount}</div>
                    <span className="text-[10px] font-bold text-green-400 uppercase">{ord.paymentStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {accountTab === 'PROFILE' && (
        <div className="p-6 rounded-2xl bg-[#120E0A] border border-white/10 space-y-4 max-w-lg">
          <h3 className="text-lg font-bold text-white font-cinzel">Devotee Profile Details</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-[#8C8379] block">Name</span>
              <span className="text-white font-medium">{user.name}</span>
            </div>
            <div>
              <span className="text-xs text-[#8C8379] block">Email</span>
              <span className="text-white font-medium">{user.email}</span>
            </div>
            <div>
              <span className="text-xs text-[#8C8379] block">Account Privileges</span>
              <span className="text-[#F0C75E] font-medium">{user.role} Access</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
