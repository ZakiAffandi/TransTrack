import React from 'react';
import { useAuth } from '../context/AuthContext';

const AccountPage = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-text">Akun</h1>
      {isAuthenticated ? (
        <p className="mt-2 text-textSecondary">Anda masuk sebagai <span className="text-text font-semibold">{user?.name}</span>.</p>
      ) : (
        <p className="mt-2 text-textSecondary">Anda belum masuk.</p>
      )}
    </div>
  );
};

export default AccountPage;


