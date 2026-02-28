import { io, Socket } from 'socket.io-client';

// WebSocket event types
export interface DonationCreatedEvent {
  id: string;
  name: string;
  foodType: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  donorName: string;
  expiryTime: string;
}

export interface DonationClaimedEvent {
  donationId: string;
  claimedBy?: string;
  status: string;
}

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Initialize socket connection
   * Only connects if user is logged in
   */
  connect(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    // Only connect if user is authenticated
    if (!token || !user) {
      console.log('User not logged in, skipping socket connection');
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Disconnect existing connection if any
    if (this.socket) {
      this.socket.disconnect();
    }

    // Create new socket connection
    this.socket = io(API_URL, {
      auth: {
        token,
      },
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      transports: ['websocket', 'polling'],
    });

    this.setupEventListeners();
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('WebSocket connection error:', error);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.reconnect();
      }
    });

    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });
  }

  /**
   * Listen for new donation created events
   */
  onDonationCreated(callback: (data: DonationCreatedEvent) => void): () => void {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return () => {};
    }

    const normalizedCallback = (rawData: any) => {
      const normalized: DonationCreatedEvent = {
        ...rawData,
        id: String(rawData?.id || ''),
        name: rawData?.name || 'New Donation',
        foodType: rawData?.foodType || 'Food',
        donorName: rawData?.donorName || 'Community Donor',
        expiryTime: rawData?.expiryTime || new Date().toISOString(),
        location: rawData?.location || {
          lat: Number(rawData?.latitude) || 0,
          lng: Number(rawData?.longitude) || 0,
          address: rawData?.address || 'Unknown Location',
        },
      };

      callback(normalized);
    };

    this.socket.on('donation.created', normalizedCallback);

    // Return unsubscribe function
    return () => {
      if (this.socket) {
        this.socket.off('donation.created', normalizedCallback);
      }
    };
  }

  /**
   * Listen for donation claimed events
   */
  onDonationClaimed(callback: (data: DonationClaimedEvent) => void): () => void {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return () => {};
    }

    const normalizedCallback = (rawData: any) => {
      const normalized: DonationClaimedEvent =
        typeof rawData === 'string'
          ? { donationId: rawData, status: 'CLAIMED' }
          : {
              donationId: String(rawData?.donationId || rawData?.id || ''),
              claimedBy: rawData?.claimedBy || rawData?.claimedById,
              status: rawData?.status || 'CLAIMED',
            };

      callback(normalized);
    };

    this.socket.on('donation.claimed', normalizedCallback);

    // Return unsubscribe function
    return () => {
      if (this.socket) {
        this.socket.off('donation.claimed', normalizedCallback);
      }
    };
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Attempt to reconnect
   */
  private reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => {
        this.connect();
      }, 2000);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  /**
   * Check if socket is currently connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const socketService = new SocketService();
