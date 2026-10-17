/**
 * Device-Aware Map Navigation Utility
 * Automatically redirects users to their phone's native map application:
 * - iOS / iPadOS: Apple Maps (native deep-link)
 * - Android / Desktop: Google Maps (native deep-link)
 */

export interface DeviceMapInfo {
  url: string;
  appName: 'Apple Maps' | 'Google Maps';
  platform: 'ios' | 'android' | 'desktop';
}

export const VENUE_COORDINATES = {
  lat: 14.3162,
  lon: 121.1215,
  name: 'JSH Events Place',
  address: 'Block 5, Lot 27, Saint John Subdivision, Barangay Ibaba, Santa Rosa, Laguna',
};

export function getDeviceNavigationMapUrl(): DeviceMapInfo {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const platformStr = typeof navigator !== 'undefined' ? navigator.platform || '' : '';
  const maxTouchPoints = typeof navigator !== 'undefined' ? navigator.maxTouchPoints || 0 : 0;

  const isIOS =
    /iPad|iPhone|iPod/.test(userAgent) ||
    (platformStr.includes('Mac') && maxTouchPoints > 1);

  const isAndroid = /Android/i.test(userAgent);

  const { lat, lon, name, address } = VENUE_COORDINATES;
  const query = encodeURIComponent(`${name}, ${address}`);

  if (isIOS) {
    // Apple Maps URI protocol on iOS devices automatically launches the native Maps app
    return {
      url: `https://maps.apple.com/?daddr=${lat},${lon}&dirflg=d&q=${query}`,
      appName: 'Apple Maps',
      platform: 'ios',
    };
  }

  // Google Maps Universal intent / navigation URL automatically opens the Google Maps app on Android
  return {
    url: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&query=${query}`,
    appName: 'Google Maps',
    platform: isAndroid ? 'android' : 'desktop',
  };
}
