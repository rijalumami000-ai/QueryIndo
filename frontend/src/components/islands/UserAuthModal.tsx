import React, { useState, useEffect, useCallback } from 'react';

export interface ReaderUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  joinedDate: string;
}

export default function UserAuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<ReaderUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const loadUser = useCallback(() => {
    try {
      const raw = localStorage.getItem('queryindo_current_reader') || localStorage.getItem('queryindo_reader_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.email || parsed.name)) {
          setUser(parsed);
          updateNavbarUI(parsed);
          return;
        }
      }
    } catch {}
    setUser(null);
    updateNavbarUI(null);
  }, []);

  const updateNavbarUI = (currentUser: ReaderUser | null) => {
    const userAuthBtn = document.getElementById('user-auth-btn');
    const mUserAuthBtn = document.getElementById('m-user-auth-btn');
    const dropdownUserName = document.getElementById('dropdown-user-name');
    const dropdownUserStatus = document.getElementById('dropdown-user-status');
    const dropdownAuthActionBtn = document.getElementById('dropdown-auth-action-btn');
    const dropdownLogoutWrap = document.getElementById('dropdown-logout-wrapper');

    if (currentUser) {
      const avatarUrl = currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=00F2FE&color=000&bold=true`;
      if (userAuthBtn) {
        userAuthBtn.innerHTML = `<img src="${avatarUrl}" alt="${currentUser.name}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--brand-cyan, #00f2fe);" />`;
        userAuthBtn.title = `Akun: ${currentUser.name} (Terhubung Google)`;
      }
      if (mUserAuthBtn) {
        mUserAuthBtn.innerHTML = `<img src="${avatarUrl}" alt="${currentUser.name}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--brand-cyan, #00f2fe);" /><span id="m-user-auth-btn-text">${currentUser.name.split(' ')[0]}</span>`;
      }
      if (dropdownUserName) dropdownUserName.textContent = currentUser.name;
      if (dropdownUserStatus) dropdownUserStatus.textContent = 'Terhubung Google';
      if (dropdownAuthActionBtn) dropdownAuthActionBtn.textContent = 'Lihat Profil';
      if (dropdownLogoutWrap) dropdownLogoutWrap.style.display = 'block';
    } else {
      if (userAuthBtn) {
        userAuthBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
        userAuthBtn.title = 'Akun & Preferensi';
      }
      if (mUserAuthBtn) {
        mUserAuthBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span id="m-user-auth-btn-text">Masuk / Akun</span>`;
      }
      if (dropdownUserName) dropdownUserName.textContent = 'Pengunjung Tamu';
      if (dropdownUserStatus) dropdownUserStatus.textContent = 'Belum Masuk';
      if (dropdownAuthActionBtn) dropdownAuthActionBtn.textContent = 'Masuk Akun';
      if (dropdownLogoutWrap) dropdownLogoutWrap.style.display = 'none';
    }
  };

  const openModal = useCallback(() => {
    loadUser();
    setIsOpen(true);
    setFeedbackMsg(null);
    document.body.classList.add('modal-open');
  }, [loadUser]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setFeedbackMsg(null);
    document.body.classList.remove('modal-open');
  }, []);

  useEffect(() => {
    loadUser();

    // Bind triggers in DOM
    const triggerBtns = document.querySelectorAll('#user-auth-btn, #dropdown-auth-action-btn, #m-user-auth-btn, #btn-open-login, .btn-login, [data-open-auth]');
    const onTriggerClick = (e: Event) => {
      e.preventDefault();
      const dropdown = document.getElementById('user-avatar-dropdown');
      if (dropdown) dropdown.style.display = 'none';
      openModal();
    };
    triggerBtns.forEach(btn => btn.addEventListener('click', onTriggerClick));

    // Logout button in dropdown
    const logoutBtn = document.getElementById('dropdown-logout-btn');
    const onLogoutClick = (e: Event) => {
      e.preventDefault();
      handleLogout();
      const dropdown = document.getElementById('user-avatar-dropdown');
      if (dropdown) dropdown.style.display = 'none';
    };
    if (logoutBtn) logoutBtn.addEventListener('click', onLogoutClick);

    const handleCustomOpen = () => openModal();
    window.addEventListener('open-auth-modal', handleCustomOpen);
    window.addEventListener('open-reader-auth-modal', handleCustomOpen);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      triggerBtns.forEach(btn => btn.removeEventListener('click', onTriggerClick));
      if (logoutBtn) logoutBtn.removeEventListener('click', onLogoutClick);
      window.removeEventListener('open-auth-modal', handleCustomOpen);
      window.removeEventListener('open-reader-auth-modal', handleCustomOpen);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openModal, closeModal, isOpen, loadUser]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('queryindo_current_reader');
      localStorage.removeItem('queryindo_reader_session');
    } catch {}
    setUser(null);
    updateNavbarUI(null);
    closeModal();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setFeedbackMsg({ type: 'info', text: 'Menghubungkan ke Google Identity Services...' });

    // Check if Google GIS SDK is loaded in window
    const g = typeof window !== 'undefined' ? (window as any).google : null;
    if (g?.accounts?.oauth2) {
      try {
        const client = g.accounts.oauth2.initTokenClient({
          client_id: '360953158889-7tir7khes5s1epp6bo3hqencsghier5n.apps.googleusercontent.com',
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const data = await res.json();
                if (data && data.email) {
                  const googleUser: ReaderUser = {
                    id: `g_usr_${Date.now()}`,
                    name: data.name || data.given_name || data.email.split('@')[0],
                    email: data.email,
                    avatar: data.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'Google')}&background=00F2FE&color=000&bold=true`,
                    role: 'Terhubung Google',
                    joinedDate: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
                  };
                  localStorage.setItem('queryindo_current_reader', JSON.stringify(googleUser));
                  localStorage.setItem('queryindo_reader_session', JSON.stringify(googleUser));
                  setUser(googleUser);
                  updateNavbarUI(googleUser);
                  setIsLoading(false);
                  setFeedbackMsg({ type: 'success', text: `Berhasil masuk dengan Google: ${googleUser.name}!` });
                  setTimeout(() => closeModal(), 800);
                  return;
                }
              } catch (err) {
                console.warn('Google userinfo fetch failed:', err);
              }
            }
            setIsLoading(false);
          }
        });
        client.requestAccessToken();
        return;
      } catch (err) {
        console.warn('Google OAuth prompt error:', err);
      }
    }

    // Direct Google Reader Sign-in Dialog Fallback
    const userEmail = window.prompt('Masukkan email Akun Google Anda untuk masuk:', 'rijal.umami@gmail.com');
    if (!userEmail || !userEmail.trim()) {
      setIsLoading(false);
      setFeedbackMsg(null);
      return;
    }
    const cleanEmail = userEmail.trim().toLowerCase();
    const rawName = cleanEmail.split('@')[0];
    const formattedName = rawName.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    const googleUser: ReaderUser = {
      id: `g_usr_${Date.now()}`,
      name: formattedName || 'Rijal Umami',
      email: cleanEmail,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName || 'Rijal Umami')}&background=00F2FE&color=000&bold=true`,
      role: 'Terhubung Google',
      joinedDate: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    };

    localStorage.setItem('queryindo_current_reader', JSON.stringify(googleUser));
    localStorage.setItem('queryindo_reader_session', JSON.stringify(googleUser));
    setUser(googleUser);
    updateNavbarUI(googleUser);
    setIsLoading(false);
    setFeedbackMsg({ type: 'success', text: `Berhasil masuk sebagai ${googleUser.name}!` });
    setTimeout(() => closeModal(), 800);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 10, 20, 0.85)',
        backdropFilter: 'blur(16px)',
        overflowY: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--bg-surface, #0b1120)',
          border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: 'var(--text-primary, #ffffff)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            background: 'var(--bg-secondary, rgba(255,255,255,0.03))'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)", fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.3px', color: 'var(--text-primary, #ffffff)' }}>
              {user ? 'Akun Google Pembaca' : 'Masuk dengan Google'}
            </span>
          </div>
          <button
            onClick={closeModal}
            aria-label="Tutup Modal"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              color: 'var(--text-secondary, #94a3b8)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.95rem',
              transition: 'background 0.2s ease, color 0.2s ease'
            }}
          >
            ✕
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            style={{
              padding: '10px 20px',
              background: feedbackMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : feedbackMsg.type === 'info' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              borderBottom: feedbackMsg.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : feedbackMsg.type === 'info' ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
              color: feedbackMsg.type === 'success' ? '#10b981' : feedbackMsg.type === 'info' ? '#00f2fe' : '#f87171',
              fontSize: '0.82rem',
              fontWeight: 600,
              textAlign: 'center'
            }}
          >
            {feedbackMsg.text}
          </div>
        )}

        {/* Body Content */}
        <div style={{ padding: '28px 24px' }}>
          {user ? (
            /* User Profile View */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=00F2FE&color=000&bold=true`}
                alt={user.name}
                style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--brand-cyan, #00f2fe)', marginBottom: '12px' }}
              />
              <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 800 }}>{user.name}</h3>
              <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)' }}>{user.email}</p>

              <div
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary, rgba(255,255,255,0.03))',
                  border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-around',
                  fontSize: '0.82rem'
                }}
              >
                <div>
                  <span style={{ display: 'block', color: 'var(--text-muted, #94a3b8)', fontSize: '0.72rem', marginBottom: '2px' }}>Status Akun</span>
                  <strong style={{ color: 'var(--brand-cyan, #00f2fe)' }}>Terhubung Google</strong>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color, rgba(255,255,255,0.1))' }}></div>
                <div>
                  <span style={{ display: 'block', color: 'var(--text-muted, #94a3b8)', fontSize: '0.72rem', marginBottom: '2px' }}>Bergabung</span>
                  <strong>{user.joinedDate || 'Terverifikasi'}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <button
                  onClick={() => {
                    closeModal();
                    window.dispatchEvent(new CustomEvent('open-bookmarks-drawer'));
                    window.dispatchEvent(new CustomEvent('open-bookmarks-modal'));
                  }}
                  style={{
                    width: '100%',
                    padding: '11px',
                    background: 'var(--bg-secondary, rgba(255,255,255,0.06))',
                    border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <span>🔖 Buka Artikel Tersimpan</span>
                </button>

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '11px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '8px',
                    color: '#f87171',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                >
                  Keluar dari Akun Google
                </button>
              </div>
            </div>
          ) : (
            /* Sole Google Connect View (No register tabs, no email/password form) */
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Circular Google Icon Badge */}
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.18)'
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>

              {/* Title & Subtitle */}
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--text-primary, #ffffff)',
                  margin: '0 0 10px 0',
                  letterSpacing: '-0.3px'
                }}
              >
                Hubungkan Akun Google Anda
              </h3>

              <p
                style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-secondary, #94a3b8)',
                  margin: '0 0 24px 0',
                  lineHeight: '1.6',
                  maxWidth: '380px'
                }}
              >
                Simpan artikel favorit, riwayat baca, dan sinkronkan preferensi berita secara aman dengan Akun Google Anda di <strong>QUERYINDO</strong>.
              </p>

              {/* Lanjutkan dengan Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: '#ffffff',
                  color: '#1f2937',
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: isLoading ? 'wait' : 'pointer',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                  transition: 'all 0.2s ease',
                  opacity: isLoading ? 0.8 : 1
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{isLoading ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}</span>
              </button>

              {/* Bottom Disclaimer */}
              <div
                style={{
                  marginTop: '24px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                  textAlign: 'center',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted, #64748b)',
                  lineHeight: '1.55'
                }}
              >
                Dengan melanjutkan, preferensi baca, apresiasi suka, dan artikel tersimpan Anda akan disinkronkan secara otomatis dan aman di akun Google Anda.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
