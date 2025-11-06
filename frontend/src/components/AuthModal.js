import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiService';

const Backdrop = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/30" onClick={onClose} />
);

const Modal = ({ children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
      {children}
    </div>
  </div>
);

const TabButton = ({ active, children, ...props }) => (
  <button
    {...props}
    className={`w-1/2 py-3 text-center font-medium ${active ? 'text-primary border-b-2 border-primary' : 'text-textSecondary border-b'}`}
  >
    {children}
  </button>
);

const TextInput = (props) => (
  <input
    {...props}
    className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
  />
);

const SubmitButton = ({ children }) => (
  <button type="submit" className="w-full bg-secondary text-white rounded-md py-2.5 font-medium hover:opacity-95">
    {children}
  </button>
);

const AuthModal = () => {
  const { isAuthModalOpen, closeLogin, login } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login'); // 'login' | 'register'

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    setLoading(true);
    try {
      if (tab === 'login') {
        const res = await apiClient.post('/users/login', {
          identifier: loginEmailOrPhone.trim(),
          password: loginPassword,
        });
        if (res.data?.success) {
          // Simpan seluruh profil user (termasuk id) untuk dipakai TicketService
          login(res.data?.data || { name: 'Penumpang' });
          setFeedback({ type: 'success', message: 'Login berhasil' });
          setTimeout(() => {
            navigate('/');
          }, 300);
        } else {
          setFeedback({ type: 'error', message: res.data?.message || 'Login gagal' });
        }
      } else {
        if (regPassword.length < 8) {
          setFeedback({ type: 'error', message: 'Kata sandi minimal 8 karakter' });
          setLoading(false);
          return;
        }
        const res = await apiClient.post('/users/register', {
          name: regName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          password: regPassword,
        });
        if (res.data?.success) {
          // Berhasil daftar: arahkan user ke form login (tanpa auto-login)
          setFeedback({ type: 'success', message: 'Pendaftaran berhasil. Silakan masuk.' });
          // Reset field registrasi, pindah ke tab login dan arahkan ke Home
          setRegName('');
          setRegEmail('');
          setRegPhone('');
          setRegPassword('');
          setTab('login');
          closeLogin();
          navigate('/');
        } else {
          setFeedback({ type: 'error', message: res.data?.message || 'Pendaftaran gagal' });
        }
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Terjadi kesalahan';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Backdrop onClose={closeLogin} />
      <Modal>
        <div className="flex">
          <TabButton active={tab === 'login'} onClick={() => setTab('login')}>Masuk</TabButton>
          <TabButton active={tab === 'register'} onClick={() => setTab('register')}>Daftar</TabButton>
        </div>
        <div className="p-6">
          {feedback.message && (
            <div className={`mb-4 p-3 rounded-md ${feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {feedback.message}
            </div>
          )}
          {tab === 'login' ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Email</label>
                <TextInput
                  type="text"
                  placeholder="email atau nomor HP"
                  value={loginEmailOrPhone}
                  onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Kata Sandi</label>
                <TextInput
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <SubmitButton>{loading ? 'Memproses...' : 'Masuk'}</SubmitButton>
            </form>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Nama</label>
                <TextInput type="text" placeholder="Nama lengkap" value={regName} onChange={(e) => setRegName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Email</label>
                <TextInput type="email" placeholder="nama@contoh.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Nomor HP</label>
                <TextInput type="tel" placeholder="08xxxxxxxxxx" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Kata Sandi</label>
                <TextInput type="password" placeholder="Minimal 8 karakter" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
              </div>
              <SubmitButton>{loading ? 'Memproses...' : 'Daftar'}</SubmitButton>
            </form>
          )}
        </div>
      </Modal>
    </>
  );
};

export default AuthModal;


