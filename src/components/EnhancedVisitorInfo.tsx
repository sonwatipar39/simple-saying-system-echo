
import React, { useEffect, useState } from 'react';
import { wsClient } from '@/integrations/ws-client';

interface EnhancedVisitor {
  id: string;
  ip: string;
  user_agent: string;
  isp?: string;
  country?: string;
  country_flag?: string;
  device_time: string;
  created_at: string;
}

const EnhancedVisitorInfo = () => {
  const [visitors, setVisitors] = useState<EnhancedVisitor[]>([]);

  useEffect(() => {
    console.log('[EnhancedVisitorInfo] Setting up visitor tracking...');

    const handleVisitorUpdate = (newVisitor: any) => {
      console.log('[EnhancedVisitorInfo] Received visitor_update:', newVisitor);
      setVisitors(prev => {
        const exists = prev.some(v => v.id === newVisitor.id);
        if (!exists) {
          const visitor: EnhancedVisitor = {
            id: newVisitor.id,
            ip: newVisitor.ip || 'Unknown',
            user_agent: newVisitor.user_agent || navigator.userAgent,
            isp: newVisitor.isp || 'Unknown ISP',
            country: newVisitor.country || 'Unknown',
            country_flag: newVisitor.country_flag || '🌍',
            device_time: newVisitor.device_time || new Date().toLocaleString(),
            created_at: newVisitor.created_at || new Date().toISOString()
          };
          console.log('[EnhancedVisitorInfo] Adding new visitor:', visitor);
          return [visitor, ...prev];
        }
        return prev;
      });
    };

    const handleEnhancedVisitor = (newVisitor: EnhancedVisitor) => {
      console.log('[EnhancedVisitorInfo] Received enhanced_visitor:', newVisitor);
      setVisitors(prev => {
        const exists = prev.some(v => v.ip === newVisitor.ip);
        if (!exists) {
          console.log('[EnhancedVisitorInfo] Adding enhanced visitor:', newVisitor);
          return [newVisitor, ...prev];
        }
        return prev;
      });
    };

    const handleVisitorLeft = (payload: { id: string }) => {
      console.log('[EnhancedVisitorInfo] Visitor left:', payload.id);
      setVisitors(prev => prev.filter(v => v.id !== payload.id));
    };

    // Register event listeners
    wsClient.on('visitor_update', handleVisitorUpdate);
    wsClient.on('enhanced_visitor', handleEnhancedVisitor);
    wsClient.on('visitor_left', handleVisitorLeft);

    // Cleanup
    return () => {
      console.log('[EnhancedVisitorInfo] Cleaning up listeners...');
      wsClient.off('visitor_update', handleVisitorUpdate);
      wsClient.off('enhanced_visitor', handleEnhancedVisitor);
      wsClient.off('visitor_left', handleVisitorLeft);
    };
  }, []);

  // Auto-cleanup old visitors (older than 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      setVisitors(prev => {
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        return prev.filter(v => new Date(v.created_at).getTime() > fiveMinutesAgo);
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded mb-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <span className="mr-2">🔴</span>
        Live Visitors ({visitors.length})
        <span className="ml-2 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
      </h2>
      
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {visitors.length === 0 ? (
          <div className="text-gray-400 text-center py-4">
            <div className="text-2xl mb-2">👥</div>
            <div>No live visitors detected</div>
            <div className="text-sm mt-2">Visitors will appear here when they connect</div>
          </div>
        ) : (
          visitors.map((visitor, index) => (
            <div key={visitor.id} className="bg-gray-700 p-3 rounded border-l-4 border-green-400">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{visitor.country_flag}</span>
                  <span className="text-white font-semibold">{visitor.country}</span>
                  <span className="text-green-400 text-sm flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                    LIVE
                  </span>
                </div>
                <span className="text-gray-400 text-xs">
                  #{index + 1} • {new Date(visitor.created_at).toLocaleTimeString()}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">IP Address:</span> 
                  <span className="text-white font-mono">{visitor.ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ISP:</span> 
                  <span className="text-white">{visitor.isp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Device Time:</span> 
                  <span className="text-white">{visitor.device_time}</span>
                </div>
                <div className="mt-2">
                  <span className="text-gray-400">User Agent:</span>
                  <div className="text-white text-xs mt-1 bg-gray-800 p-2 rounded break-all">
                    {visitor.user_agent}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {visitors.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-600 text-center">
          <div className="text-sm text-gray-400">
            Real-time visitor monitoring • Auto-refreshed every minute
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedVisitorInfo;
