/**
 * Global location store using browser APIs
 * Stores user's coordinates for use throughout the app
 */

import { useState, useCallback, useEffect } from "react";

export interface UserLocation {
  lat: number;
  lon: number;
}

/**
 * Hook to get and set user's location
 * Persists location in sessionStorage so it doesn't change on page reloads
 */
export function useLocationStore() {
  const [userLocation, setUserLocationState] = useState<UserLocation | null>(
    null
  );
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Initialize from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("w8time_user_location");
    if (stored) {
      try {
        setUserLocationState(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored location:", e);
      }
    }
  }, []);

  const setUserLocation = useCallback((location: UserLocation | null) => {
    setUserLocationState(location);
    if (location) {
      sessionStorage.setItem("w8time_user_location", JSON.stringify(location));
    } else {
      sessionStorage.removeItem("w8time_user_location");
    }
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<UserLocation | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationError("Geolocation not supported");
        resolve(null);
        return;
      }

      setIsLocating(true);
      setLocationError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setUserLocation(location);
          setIsLocating(false);
          resolve(location);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError(error.message || "Failed to get location");
          setIsLocating(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, [setUserLocation]);

  return {
    userLocation,
    setUserLocation,
    getCurrentLocation,
    isLocating,
    locationError,
  };
}