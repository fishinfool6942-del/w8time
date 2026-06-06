import { useEffect, useState } from "react";

export type LocationPermissionStatus = "prompt" | "granted" | "denied";

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

const LOCATION_PERMISSION_KEY = "w8time_location_permission";
const LOCATION_COORDS_KEY = "w8time_location_coords";

export function useLocationPermission() {
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>("prompt");
  const [coordinates, setCoordinates] = useState<LocationCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if permission was previously granted/denied
  useEffect(() => {
    const savedPermission = localStorage.getItem(LOCATION_PERMISSION_KEY) as LocationPermissionStatus | null;
    
    if (savedPermission) {
      setPermissionStatus(savedPermission);
      
      // If previously granted, try to restore coordinates
      if (savedPermission === "granted") {
        const savedCoords = localStorage.getItem(LOCATION_COORDS_KEY);
        if (savedCoords) {
          setCoordinates(JSON.parse(savedCoords));
        }
      }
    }
    
    setIsLoading(false);
  }, []);

  const requestLocationPermission = async () => {
    return new Promise<boolean>((resolve) => {
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser");
        setPermissionStatus("denied");
        localStorage.setItem(LOCATION_PERMISSION_KEY, "denied");
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          
          setCoordinates(coords);
          setPermissionStatus("granted");
          localStorage.setItem(LOCATION_PERMISSION_KEY, "granted");
          localStorage.setItem(LOCATION_COORDS_KEY, JSON.stringify(coords));
          resolve(true);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setPermissionStatus("denied");
          localStorage.setItem(LOCATION_PERMISSION_KEY, "denied");
          resolve(false);
        }
      );
    });
  };

  const denyLocationPermission = () => {
    setPermissionStatus("denied");
    localStorage.setItem(LOCATION_PERMISSION_KEY, "denied");
  };

  return {
    permissionStatus,
    coordinates,
    isLoading,
    requestLocationPermission,
    denyLocationPermission,
  };
}
