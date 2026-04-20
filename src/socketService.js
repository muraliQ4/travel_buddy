// Socket.IO service for real-time updates
import { io } from 'socket.io-client';

const BACKEND_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api\/?$/, '').replace(/\/+$/, '');
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || BACKEND_BASE_URL;

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentUserId = null;
  }

  connect(userId) {
    this.currentUserId = userId || this.currentUserId;

    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      this.socket.on('connect', () => {
        console.log('🔗 Connected to server');
        this.isConnected = true;
        
        if (this.currentUserId) {
          this.joinUserRoom(this.currentUserId);
        }
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Disconnected from server');
        this.isConnected = false;
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconnected after', attemptNumber, 'attempts');
        this.isConnected = true;
        
        if (this.currentUserId) {
          this.joinUserRoom(this.currentUserId);
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
      });
    } else if (this.socket.connected && this.currentUserId) {
      // Existing connected socket: ensure user room is joined (important after login/profile refresh).
      this.joinUserRoom(this.currentUserId);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentUserId = null;
    }
  }

  joinUserRoom(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-user', userId);
      console.log(`📍 Joined user room: ${userId}`);
    }
  }

  joinTripRoom(tripId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-trip', tripId);
      console.log(`📍 Joined trip room: ${tripId}`);
    } else {
      console.log(`❌ Cannot join trip room ${tripId} - Socket not connected:`, {
        hasSocket: !!this.socket,
        isConnected: this.isConnected
      });
    }
  }

  joinRideRoom(rideId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-ride', rideId);
      console.log(`📍 Joined ride room: ${rideId}`);
    } else {
      console.log(`❌ Cannot join ride room ${rideId} - Socket not connected:`, {
        hasSocket: !!this.socket,
        isConnected: this.isConnected
      });
    }
  }

  // Request-related events
  onNewRequest(callback) {
    if (this.socket) {
      this.socket.on('new-request', callback);
    }
  }

  onRequestAccepted(callback) {
    if (this.socket) {
      this.socket.on('request-accepted', callback);
    }
  }

  onRequestRejected(callback) {
    if (this.socket) {
      this.socket.on('request-rejected', callback);
    }
  }

  // Trip-related events
  onTripUpdated(callback) {
    if (this.socket) {
      this.socket.on('trip-updated', callback);
    }
  }

  onMemberRemoved(callback) {
    if (this.socket) {
      this.socket.on('member-removed', callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Chat-related events
  onNewMessage(callback) {
    if (this.socket) {
      console.log('🔗 Setting up new-message listener');
      this.socket.on('new-message', callback);
    } else {
      console.log('❌ Cannot set up new-message listener - no socket');
    }
  }

  onMessageDeleted(callback) {
    if (this.socket) {
      this.socket.on('message-deleted', callback);
    }
  }

  // Ride chat-related events
  onNewRideMessage(callback) {
    if (this.socket) {
      console.log('🔗 Setting up new-ride-message listener');
      this.socket.on('new-ride-message', callback);
    } else {
      console.log('❌ Cannot set up new-ride-message listener - no socket');
    }
  }

  onRideMessageDeleted(callback) {
    if (this.socket) {
      this.socket.on('ride-message-deleted', callback);
    }
  }

  onRideUpdated(callback) {
    if (this.socket) {
      this.socket.on('ride-updated', callback);
    }
  }

  // Remove specific listener
  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  // Check if socket is connected
  getConnectionStatus() {
    return this.socket && this.socket.connected;
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;