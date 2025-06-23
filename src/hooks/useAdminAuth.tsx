
import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const SECRET_KEY = 'admin_panel_secret_2024';

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const sessionData = localStorage.getItem('admin_session');
      
      if (!sessionData) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Decrypt session data
      const bytes = CryptoJS.AES.decrypt(sessionData, SECRET_KEY);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      // Check if session is valid and not expired (24 hours)
      const isExpired = Date.now() - decryptedData.timestamp > 24 * 60 * 60 * 1000;
      
      if (decryptedData.authenticated && !isExpired) {
        setIsAuthenticated(true);
      } else {
        // Clear expired session
        localStorage.removeItem('admin_session');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('admin_session');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_session');
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    loading,
    logout,
    checkAuthStatus
  };
};
