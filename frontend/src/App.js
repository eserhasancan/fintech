import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Recommendation from './components/Recommendation';
import ProtectedRoute from './components/ProtectedRoute';

// 1) MarketDetail bileşenini import edin
import MarketDetail from './components/MarketDetail';

function App() {
  return (
    <Routes>
      {/* Ana sayfa */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 2) Dinamik Market rotası */}
      <Route path="/market/:symbol" element={<MarketDetail />} />

      {/* Giriş yapmış kullanıcılar için korumalı sayfalar */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recommendation"
        element={
          <ProtectedRoute>
            <Recommendation />
          </ProtectedRoute>
        }
      />

      {/* Tanımlanmayan rotalara yönlendirme */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
