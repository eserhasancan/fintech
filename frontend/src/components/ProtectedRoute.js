import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Kullanıcının giriş yapıp yapmadığını kontrol edin (örneğin token kontrolü)
  const token = localStorage.getItem('token');

  if (!token) {
    // Eğer token yoksa, kullanıcıyı giriş sayfasına yönlendir.
    return <Navigate to="/login" replace />;
  }

  // Token varsa, korunan sayfayı render et.
  return children;
};

export default ProtectedRoute;
