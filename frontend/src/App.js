import React from 'react';
import './index.css';
import Navbar from './components/Navbar';
import Homepage from './components/Homepage';
import { AuthProvider } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TicketingPage from './components/TicketingPage';
import AccountPage from './pages/AccountPage';
import TrackPage from './pages/TrackPage';
import SchedulePage from './pages/SchedulePage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Navbar />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/track" element={<TrackPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/ticket" element={<TicketingPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Routes>
        </div>
        {/* Global auth modal */}
        <AuthModal />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

