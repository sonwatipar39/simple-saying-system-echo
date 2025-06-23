
import React from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import AdminTokenLogin from './AdminTokenLogin';
import MobileLayout from './MobileLayout';
import { useIsMobile } from '../hooks/use-mobile';
import AdminPanel from './AdminPanel';

const AdminPanelWrapper: React.FC = () => {
  const { isAuthenticated, loading, logout, checkAuthStatus } = useAdminAuth();
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminTokenLogin onTokenVerified={checkAuthStatus} />;
  }

  if (isMobile) {
    return (
      <MobileLayout onLogout={logout}>
        <div className="admin-panel-mobile">
          <AdminPanel />
        </div>
      </MobileLayout>
    );
  }

  // Desktop version - use existing AdminPanel
  return <AdminPanel />;
};

export default AdminPanelWrapper;
