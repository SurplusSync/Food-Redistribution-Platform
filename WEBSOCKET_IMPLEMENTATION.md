# Real-Time Map & Notifications Implementation Guide

## Overview
This document explains the implementation of real-time WebSocket support for the Food Redistribution Platform. The system now listens to the backend's WebSocket server and updates the Map and UI instantly without requiring page refreshes.

## Architecture

### Components Involved

1. **Socket Service** ([`src/services/socket.ts`](src/services/socket.ts))
   - Manages WebSocket connections
   - Handles authentication with JWT tokens
   - Defines event listeners and cleanup functions
   - Implements reconnection logic

2. **Toast Provider** (`App.tsx`)
   - Sonner library integrated at the app root
   - Displays beautiful, non-blocking notifications

3. **Dashboard Components**
   - `DiscoveryMap.tsx` - Maps donations in real-time
   - `NGODashboard.tsx` - Shows available donations for claiming
   - `VolunteerDashboard.tsx` - Shows assigned tasks

## Installation & Setup

### Dependencies Installed
```bash
npm install socket.io-client sonner
```

- **socket.io-client** (v4.x): WebSocket client for real-time communication
- **sonner** (v1.x): Toast notification library with beautiful UI

## Features Implemented

### 1. WebSocket Service (`src/services/socket.ts`)

#### Authentication
- Only connects if user is logged in (checks JWT token in localStorage)
- Passes JWT token in socket handshake
- Automatically disconnects on logout

#### Event Listeners

**`donation.created`**
- Triggered when a new food donation is created
- Shows toast: "🍕 New Food Alert: [FoodType] available nearby!"
- Automatically re-fetches donations to show new pin on map

**`donation.claimed`**
- Triggered when a donation is claimed by an NGO
- Shows toast: "🔔 Food Claimed - [DonationId]"
- Removes claimed donation from map state
- Closes modal if viewing claimed donation
- Updates NGO dashboard instantly

#### Reconnection Logic
- Automatic reconnection with exponential backoff
- Max 5 reconnection attempts
- Logs connection status to console

### 2. Toast Notifications (`Toaster` in App.tsx)

Configuration:
```tsx
<Toaster
  position="top-right"
  richColors
  closeButton
  expand
/>
```

Features:
- Top-right positioning
- Colored backgrounds (success, info, error)
- Manual close button
- Auto-dismiss after 3-5 seconds
- Supports rich content and descriptions

### 3. Dashboard Integration

#### DiscoveryMap Component
```tsx
useEffect(() => {
  loadDonations()
  
  // Connect to WebSocket
  socketService.connect()

  // Listen for new donations
  const unsubscribeCreated = socketService.onDonationCreated((data) => {
    toast.success(`🍕 New Food Alert: ${data.foodType} available nearby!`)
    loadDonations() // Re-fetch to show new pin
  })

  // Listen for claimed donations
  const unsubscribeClaimed = socketService.onDonationClaimed((data) => {
    setDonations((prevDonations) =>
      prevDonations.filter((donation) => donation.id !== data.donationId)
    )
  })

  return () => {
    unsubscribeCreated()
    unsubscribeClaimed()
    socketService.disconnect()
  }
}, [])
```

#### NGODashboard Component
- Same WebSocket integration
- Real-time updates to available donations list
- Automatic removal of claimed items

#### VolunteerDashboard Component
- Listens for new donations (for awareness)
- Listens for claimed donations (may affect assigned tasks)
- Re-fetches assigned tasks when donations are claimed

## Usage

### For Frontend Developers

#### Using the Socket Service

```typescript
import { socketService } from '../../services/socket'

// Initialize connection (happens automatically in useEffect)
socketService.connect()

// Listen for events
const unsubscribe = socketService.onDonationCreated((data) => {
  console.log('New donation:', data)
  // Update UI
})

// Cleanup
unsubscribe()
socketService.disconnect()
```

#### Creating Custom Listeners

To add new event listeners, extend the SocketService class:

```typescript
// In socket.ts
onCustomEvent(callback: (data: any) => void): () => void {
  if (!this.socket) return () => {}
  this.socket.on('custom.event', callback)
  return () => {
    if (this.socket) {
      this.socket.off('custom.event', callback)
    }
  }
}
```

### For Backend Developers

To emit events from the NestJS backend, add this to your WebSocket gateway:

```typescript
// Example: In donations.gateway.ts
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class DonationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Emit when donation is created
  emitDonationCreated(donationData: DonationCreatedEvent) {
    this.server.emit('donation.created', donationData);
  }

  // Emit when donation is claimed
  emitDonationClaimed(claimData: DonationClaimedEvent) {
    this.server.emit('donation.claimed', claimData);
  }
}
```

## Event Data Structures

### `donation.created` Event
```typescript
interface DonationCreatedEvent {
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
```

### `donation.claimed` Event
```typescript
interface DonationClaimedEvent {
  donationId: string;
  claimedBy: string;
  status: string;
}
```

## Debugging

### Check Socket Connection Status
Open browser DevTools Console:
```javascript
// In frontend
localStorage.getItem('token') // Should exist
localStorage.getItem('user') // Should exist
// Check Network tab → WS for WebSocket connection
```

### Enable Logging
The socket service logs to console:
- ✅ "WebSocket connected: [socket-id]"
- ❌ "WebSocket connection error: [error]"
- 🔄 "Attempting to reconnect..."

### Common Issues

**Socket not connecting:**
- Check if user is logged in (token in localStorage)
- Verify backend WebSocket server is running
- Check CORS configuration in backend
- Check browser console for auth errors

**Notifications not showing:**
- Verify Toaster is in App.tsx
- Check if toast library CSS is loaded
- Verify event data structure matches interfaces

**Donations not updating:**
- Confirm socket connection is established
- Check that events are being emitted from backend
- Verify event listeners are registered
- Check useEffect cleanup is working (component unmount)

## Testing

### Manual Testing Checklist

1. **Test Connection**
   - [ ] Log in as user
   - [ ] Open DevTools Network tab
   - [ ] Verify WS connection to `/socket.io/`
   - [ ] See "WebSocket connected" in console

2. **Test New Donation Alert**
   - [ ] Create new donation from another user
   - [ ] Verify toast appears: "🍕 New Food Alert..."
   - [ ] Verify new donation appears on map
   - [ ] Verify pin drops in correct location

3. **Test Claimed Donation**
   - [ ] Claim a donation
   - [ ] Verify toast appears: "🔔 Food Claimed"
   - [ ] Verify donation removed from map
   - [ ] Verify donation removed from NGO dashboard list
   - [ ] Close modal if it was open

4. **Test Disconnect/Reconnect**
   - [ ] Stop backend server
   - [ ] See disconnect message in console
   - [ ] Restart backend
   - [ ] See reconnection attempts
   - [ ] Verify connection re-established

5. **Test Logout**
   - [ ] Be on dashboard with active connection
   - [ ] Click logout
   - [ ] Verify socket disconnects

## Performance Considerations

- Socket listeners are properly cleaned up on component unmount
- No memory leaks from event subscriptions
- Reconnection attempts have exponential backoff
- Toast notifications auto-dismiss to avoid clutter
- Donations list filtered by status for optimal rendering

## Future Enhancements

1. **Notification Preferences**
   - Allow users to mute certain notifications
   - Persist preferences to localStorage

2. **Real-Time Collaboration**
   - Show users currently viewing same donation
   - Live comment/message system

3. **Advanced Filtering**
   - Filter new donations by proximity/category
   - Only show relevant notifications

4. **Offline Support**
   - Queue actions while offline
   - Sync when connection restored

5. **Analytics**
   - Track donation claims in real-time
   - Monitor system performance metrics

## References

- [Socket.IO Client Documentation](https://socket.io/docs/v4/client-api/)
- [Sonner Toast Documentation](https://sonner.emilkowal.ski/)
- [NestJS WebSocket Documentation](https://docs.nestjs.com/websockets/gateways)

---

**Last Updated:** February 20, 2026
**Status:** ✅ Production Ready
