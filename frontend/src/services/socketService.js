/**
 * Service untuk koneksi WebSocket ke TrackingService
 * 
 * Menggunakan variabel REACT_APP_TRACKING_WEBSOCKET_URL dari .env.development
 * Default: ws://localhost:8001
 */

const WEBSOCKET_URL = process.env.REACT_APP_TRACKING_WEBSOCKET_URL || 'ws://localhost:8001';

class SocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.listeners = new Map();
  }

  /**
   * Menghubungkan ke WebSocket server
   */
  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      this.socket = new WebSocket(WEBSOCKET_URL);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected', { status: 'connected' });
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', { error });
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.emit('disconnected', { status: 'disconnected' });
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.attemptReconnect();
    }
  }

  /**
   * Memutuskan koneksi WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners.clear();
  }

  /**
   * Mencoba reconnect jika koneksi terputus
   */
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('reconnect_failed', { message: 'Max reconnection attempts reached' });
    }
  }

  /**
   * Mengirim pesan ke server
   */
  send(message) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      this.socket.send(messageStr);
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }

  /**
   * Subscribe ke event tertentu
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Unsubscribe dari event tertentu
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event ke semua listener
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Handle incoming message dari server
   */
  handleMessage(data) {
    // Handle berbagai jenis message dari server
    if (data.type) {
      this.emit(data.type, data);
    }
    
    // Emit generic message event
    this.emit('message', data);
  }

  /**
   * Subscribe ke tracking data untuk bus tertentu
   */
  subscribeToBusTracking(busId) {
    this.send({
      type: 'subscribe',
      busId: busId
    });
  }

  /**
   * Unsubscribe dari tracking data untuk bus tertentu
   */
  unsubscribeFromBusTracking(busId) {
    this.send({
      type: 'unsubscribe',
      busId: busId
    });
  }

  /**
   * Cek status koneksi
   */
  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
const socketService = new SocketService();

export default socketService;

/**
 * Contoh penggunaan:
 * 
 * import socketService from './services/socketService';
 * 
 * // Connect
 * socketService.connect();
 * 
 * // Subscribe ke event
 * socketService.on('tracking_update', (data) => {
 *   console.log('Tracking update:', data);
 * });
 * 
 * // Subscribe ke bus tertentu
 * socketService.subscribeToBusTracking('bus-123');
 * 
 * // Disconnect saat komponen unmount
 * socketService.disconnect();
 */

