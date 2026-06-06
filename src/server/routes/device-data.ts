import { createRoute } from '@tanstack/react-router';
import { realtimeDb } from '../firebase';
import { DevicePayload, RestaurantRecord } from '../types';

// POST /api/device-data
// Receives wait time updates from devices (every 60 seconds)
export const deviceDataRoute = async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
    });
  }

  try {
    const payload: DevicePayload = await req.json();

    // Validate payload
    if (!payload.id || payload.wait === undefined || !payload.ts) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload. Required: id, wait, ts' }),
        { status: 400 }
      );
    }

    // Update Firebase Realtime Database with current wait time
    // Keep only the latest record per restaurant
    const restaurantRef = realtimeDb.ref(`restaurants/${payload.id}`);
    
    await restaurantRef.update({
      deviceId: payload.id,
      currentWait: payload.wait,
      lastUpdated: payload.ts,
      updatedAt: Date.now(), // Server timestamp
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Wait time recorded',
        restaurantId: payload.id,
        wait: payload.wait,
        timestamp: payload.ts
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Device data error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process device data' }),
      { status: 500 }
    );
  }
};
