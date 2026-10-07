import type { Coordinate } from './types';

// Approximate coordinates around Talatona, Luanda — illustrative only, not real
// geocoded addresses (this app has no geocoding/routing backend).
export const RESTAURANT_COORDINATE: Coordinate = { latitude: -8.92, longitude: 13.185 };
export const CUSTOMER_COORDINATE: Coordinate = { latitude: -8.908, longitude: 13.197 };
export const ROUTE_COORDINATES: Coordinate[] = [RESTAURANT_COORDINATE, CUSTOMER_COORDINATE];
