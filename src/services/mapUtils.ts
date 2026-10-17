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
  destinationAddress: string;
}

export const VENUE_DESTINATION = {
  name: 'JSH Events Place',
  address: 'B5 L27 St John Subdivision, City of Santa Rosa, 4026 Laguna',
  fullAddress: 'JSH Events Place, B5 L27 St John Subdivision, City of Santa Rosa, 4026 Laguna',
  // Verified exact coordinates and official Google Place ID for JSH Events Place
  lat: 14.3152787,
  lon: 121.1187379,
  googlePlaceId: 'ChIJE41NbBXZlzMRdtuGqiWPE_s',
};

export function getDeviceNavigationMapUrl(): DeviceMapInfo {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const platformStr = typeof navigator !== 'undefined' ? navigator.platform || '' : '';
  const maxTouchPoints = typeof navigator !== 'undefined' ? navigator.maxTouchPoints || 0 : 0;

  const isIOS =
    /iPad|iPhone|iPod/.test(userAgent) ||
    (platformStr.includes('Mac') && maxTouchPoints > 1);

  const isAndroid = /Android/i.test(userAgent);

  const { lat, lon, name, address, googlePlaceId } = VENUE_DESTINATION;
  const destinationQuery = encodeURIComponent(`${name}, ${address}`);

  if (isIOS) {
    // Apple Maps URI protocol on iOS devices:
    // Pinpoints exact coordinates (14.3152787, 121.1187379) for JSH Events Place
    // with driving directions (dirflg=d) and branded venue pin label (q=...)
    return {
      url: `https://maps.apple.com/?daddr=${lat},${lon}&dirflg=d&q=${encodeURIComponent(name + ' - ' + address)}`,
      appName: 'Apple Maps',
      platform: 'ios',
      destinationAddress: address,
    };
  }

  // Google Maps Universal intent / navigation URL:
  // Using exact coordinates + verified Google Place ID (ChIJE41NbBXZlzMRdtuGqiWPE_s)
  // guarantees Google Maps opens directly to "JSH Events Place" instead of drifting to generic areas like Aplaya
  return {
    url: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&destination_place_id=${googlePlaceId}&query=${destinationQuery}`,
    appName: 'Google Maps',
    platform: isAndroid ? 'android' : 'desktop',
    destinationAddress: address,
  };
}
