
import React, { useState } from 'react';
import { Copy, LogOut, Key, Users, MessageSquare, Settings } from 'lucide-react';
import { Button } from './ui/button';
import CryptoJS from 'crypto-js';
import AdminMobileStyles from './AdminMobileStyles';

interface MobileLayoutProps {
  onLogout: () => void;
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ onLogout, children }) => {
  const [newToken, setNewToken] = useState('');
  const [tokenCopied, setTokenCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const SECRET_KEY = 'admin_panel_secret_2024';

  const generateNewToken = () => {
    setIsGenerating(true);
    
    // Generate a new secure token
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const token = `ADMIN_${timestamp}_${randomString}`.toUpperCase();
    
    console.log('Generated new token:', token);
    
    // Store the new token as the current valid token
    localStorage.setItem('current_admin_token', token);
    setNewToken(token);
    setIsGenerating(false);
    
    // Reset copy status
    setTokenCopied(false);
  };

  const copyTokenToClipboard = async () => {
    if (!newToken) return;
    
    try {
      await navigator.clipboard.writeText(newToken);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy token:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = newToken;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminMobileStyles />
      
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
          </div>
          
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1 text-xs px-2 py-1 h-8"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
        
        {/* Token Generation Section */}
        <div className="px-3 pb-3 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              onClick={generateNewToken}
              disabled={isGenerating}
              size="sm"
              className="flex items-center space-x-1 text-xs px-2 py-1 h-8 bg-green-600 hover:bg-green-700"
            >
              <Key className="w-3 h-3" />
              <span>{isGenerating ? 'Generating...' : 'New Token'}</span>
            </Button>
            
            {newToken && (
              <div className="flex items-center space-x-2 flex-1">
                <div className="bg-gray-100 rounded px-2 py-1 text-xs font-mono text-gray-700 flex-1 truncate min-w-0">
                  {newToken}
                </div>
                <Button
                  onClick={copyTokenToClipboard}
                  size="sm"
                  variant="outline"
                  className={`flex items-center space-x-1 text-xs px-2 py-1 h-8 ${
                    tokenCopied ? 'bg-green-50 border-green-300 text-green-700' : ''
                  }`}
                >
                  <Copy className="w-3 h-3" />
                  <span className="hidden sm:inline">{tokenCopied ? 'Copied!' : 'Copy'}</span>
                </Button>
              </div>
            )}
          </div>
          
          {newToken && (
            <p className="text-xs text-orange-600 mt-2">
              ⚠️ Previous tokens are now invalid. Use this new token to login next time.
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 sm:p-4">
        {children}
      </div>
    </div>
  );
};

export default MobileLayout;
