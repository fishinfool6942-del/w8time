import { createServerFn } from '@tanstack/react-start';
import { deviceDataRoute } from './routes/device-data';
import { getRestaurantsNearby } from './routes/restaurants';
import { triggerGoogleSync } from './routes/google-places-sync';

// Server function to receive device data
export const handleDeviceData = createServerFn()
  .method('POST')
  .handler(deviceDataRoute);

// Server function to fetch nearby restaurants
export const fetchRestaurantsNearby = createServerFn()
  .method('GET')
  .handler(getRestaurantsNearby);

// Server function to trigger Google Places sync
export const triggerGooglePlacesSyncFn = createServerFn()
  .method('GET')
  .handler(triggerGoogleSync);
