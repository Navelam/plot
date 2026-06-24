import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MapPage } from './pages/MapPage';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';

const ProtectedAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = sessionStorage.getItem('adminToken');
  return token ? <>{children}</> : <Navigate to="/admin-login" replace />;
};

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<MapPage />} />
      <Route path="/admin-login" element={<div style={{position:'fixed',inset:0,overflow:'auto'}}><AdminLogin /></div>} />
      <Route path="/admin" element={
        <ProtectedAdmin>
          <div style={{position:'fixed',inset:0,overflow:'hidden'}}><AdminDashboard /></div>
        </ProtectedAdmin>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
