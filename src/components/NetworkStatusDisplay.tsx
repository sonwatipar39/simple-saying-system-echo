
import React, { useState, useEffect } from 'react';
import { Progress } from './ui/progress';
import { Wifi, Server, Zap, Activity } from 'lucide-react';
import { wsClient } from '@/integrations/ws-client';

interface NetworkMetrics {
  socketStrength: number;
  connectivity: number;
  serverResponse: number;
  latency: number;
}

const NetworkStatusDisplay: React.FC = () => {
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    socketStrength: 0,
    connectivity: 0,
    serverResponse: 0,
    latency: 0
  });

  const [isConnected, setIsConnected] = useState(false);
  const [pingStartTime, setPingStartTime] = useState<number>(0);

  // Real network monitoring
  useEffect(() => {
    const measureNetworkMetrics = () => {
      // Real socket connection strength
      const socketConnected = wsClient.isConnected();
      const socketStrength = socketConnected ? 100 : 0;
      
      // Real connectivity check
      const connectivity = navigator.onLine ? 100 : 0;
      
      // Real server response time measurement
      const startTime = Date.now();
      setPingStartTime(startTime);
      
      // Ping server for real latency
      if (socketConnected) {
        wsClient.send('ping', { timestamp: startTime });
      }
      
      setMetrics(prev => ({
        ...prev,
        socketStrength,
        connectivity,
        serverResponse: socketConnected ? 100 : 0
      }));
      
      setIsConnected(socketConnected && navigator.onLine);
    };

    // Handle pong response for real latency measurement
    const handlePong = (data: { timestamp: number }) => {
      const latency = Date.now() - data.timestamp;
      setMetrics(prev => ({
        ...prev,
        latency: Math.min(100, latency) // Cap at 100ms for display
      }));
    };

    // Handle connection events
    const handleConnect = () => {
      measureNetworkMetrics();
    };

    const handleDisconnect = () => {
      setMetrics({
        socketStrength: 0,
        connectivity: navigator.onLine ? 100 : 0,
        serverResponse: 0,
        latency: 100
      });
      setIsConnected(false);
    };

    // Real-time network monitoring
    const interval = setInterval(measureNetworkMetrics, 2000);

    // Listen for online/offline events
    const handleOnline = () => {
      setMetrics(prev => ({ ...prev, connectivity: 100 }));
      measureNetworkMetrics();
    };

    const handleOffline = () => {
      setMetrics(prev => ({ ...prev, connectivity: 0 }));
      setIsConnected(false);
    };

    // Register event listeners
    wsClient.on('pong', handlePong);
    wsClient.socket.on('connect', handleConnect);
    wsClient.socket.on('disconnect', handleDisconnect);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial measurement
    measureNetworkMetrics();

    return () => {
      clearInterval(interval);
      wsClient.off('pong', handlePong);
      wsClient.socket.off('connect', handleConnect);
      wsClient.socket.off('disconnect', handleDisconnect);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusColor = (value: number) => {
    if (value >= 80) return 'text-green-400';
    if (value >= 60) return 'text-yellow-400';
    if (value >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-yellow-500';
    if (value >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getLatencyColor = (value: number) => {
    if (value <= 20) return 'text-green-400';
    if (value <= 40) return 'text-yellow-400';
    if (value <= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getLatencyStatus = (value: number) => {
    if (value <= 20) return 'Excellent';
    if (value <= 40) return 'Good';
    if (value <= 60) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className={`w-5 h-5 ${isConnected ? 'text-green-400' : 'text-red-400'}`} />
          Network Status
        </h3>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          isConnected ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
        }`}>
          {isConnected ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Socket Strength */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className={`w-4 h-4 ${getStatusColor(metrics.socketStrength)}`} />
              <span className="text-sm text-gray-300">Socket Strength</span>
            </div>
            <span className={`text-sm font-bold ${getStatusColor(metrics.socketStrength)}`}>
              {Math.round(metrics.socketStrength)}%
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={metrics.socketStrength} 
              className="h-2 bg-gray-700"
            />
            <div 
              className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${getProgressColor(metrics.socketStrength)}`}
              style={{ width: `${metrics.socketStrength}%` }}
            />
          </div>
        </div>

        {/* Connectivity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className={`w-4 h-4 ${getStatusColor(metrics.connectivity)}`} />
              <span className="text-sm text-gray-300">Connectivity</span>
            </div>
            <span className={`text-sm font-bold ${getStatusColor(metrics.connectivity)}`}>
              {Math.round(metrics.connectivity)}%
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={metrics.connectivity} 
              className="h-2 bg-gray-700"
            />
            <div 
              className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${getProgressColor(metrics.connectivity)}`}
              style={{ width: `${metrics.connectivity}%` }}
            />
          </div>
        </div>

        {/* Server Response */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${getStatusColor(metrics.serverResponse)}`} />
              <span className="text-sm text-gray-300">Server Response</span>
            </div>
            <span className={`text-sm font-bold ${getStatusColor(metrics.serverResponse)}`}>
              {Math.round(metrics.serverResponse)}%
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={metrics.serverResponse} 
              className="h-2 bg-gray-700"
            />
            <div 
              className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${getProgressColor(metrics.serverResponse)}`}
              style={{ width: `${metrics.serverResponse}%` }}
            />
          </div>
        </div>

        {/* Latency */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className={`w-4 h-4 ${getLatencyColor(metrics.latency)}`} />
              <span className="text-sm text-gray-300">Latency</span>
            </div>
            <div className="text-right">
              <span className={`text-sm font-bold ${getLatencyColor(metrics.latency)}`}>
                {Math.round(metrics.latency)}ms
              </span>
              <div className={`text-xs ${getLatencyColor(metrics.latency)}`}>
                {getLatencyStatus(metrics.latency)}
              </div>
            </div>
          </div>
          <div className="relative">
            <Progress 
              value={100 - metrics.latency} 
              className="h-2 bg-gray-700"
            />
            <div 
              className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${getProgressColor(100 - metrics.latency)}`}
              style={{ width: `${100 - metrics.latency}%` }}
            />
          </div>
        </div>
      </div>

      {/* Overall Status */}
      <div className="pt-2 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Overall Network Health</span>
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => {
              const avgHealth = (metrics.socketStrength + metrics.connectivity + metrics.serverResponse) / 3;
              const isActive = i < Math.floor(avgHealth / 20);
              return (
                <div
                  key={i}
                  className={`w-2 h-4 rounded-sm transition-all duration-300 ${
                    isActive 
                      ? avgHealth >= 80 ? 'bg-green-500' 
                        : avgHealth >= 60 ? 'bg-yellow-500'
                        : 'bg-red-500'
                      : 'bg-gray-600'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatusDisplay;
