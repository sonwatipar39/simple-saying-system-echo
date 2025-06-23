
import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import CryptoJS from 'crypto-js';

interface AdminTokenLoginProps {
  onTokenVerified: () => void;
}

const AdminTokenLogin: React.FC<AdminTokenLoginProps> = ({ onTokenVerified }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const SECRET_KEY = 'admin_panel_secret_2024';

  const verifyToken = () => {
    setLoading(true);
    setError('');

    try {
      // Check if there's a custom token stored
      const storedToken = localStorage.getItem('current_admin_token');
      let validToken = 'ADMIN_2024_SECURE_ACCESS_KEY'; // Default token
      
      if (storedToken) {
        validToken = storedToken;
      }
      
      // Hash the valid token with secret key
      const VALID_TOKEN_HASH = CryptoJS.SHA256(validToken + SECRET_KEY).toString();
      
      // Hash the entered token with secret key
      const hashedInput = CryptoJS.SHA256(token + SECRET_KEY).toString();
      
      console.log('Token entered:', token);
      console.log('Valid token:', validToken);
      console.log('Hash generated:', hashedInput);
      console.log('Expected hash:', VALID_TOKEN_HASH);
      
      if (hashedInput === VALID_TOKEN_HASH) {
        // Store encrypted session
        const sessionData = CryptoJS.AES.encrypt(
          JSON.stringify({ 
            authenticated: true, 
            timestamp: Date.now(),
            token: token 
          }), 
          SECRET_KEY
        ).toString();
        
        localStorage.setItem('admin_session', sessionData);
        onTokenVerified();
      } else {
        setError('Invalid token. Access denied.');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please enter a token');
      return;
    }
    verifyToken();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-4 sm:p-8 w-full max-w-md mx-2">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-sm sm:text-base text-gray-400">Enter your secure token to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-300 mb-2">
              Access Token
            </label>
            <Input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your secure token"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 text-sm sm:text-base"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 sm:py-3 text-sm sm:text-base"
          >
            {loading ? 'Verifying...' : 'Access Admin Panel'}
          </Button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs text-gray-500">
            Secure encrypted authentication • Unauthorized access prohibited
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminTokenLogin;
