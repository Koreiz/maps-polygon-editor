import type { LatLng } from 'react-native-maps';

import { getMidpointFromCoordinates } from './geospatials';
import type { MapPolygonExtendedProps } from './types';

export const addCoordinateToPolygon = (
  polygon: MapPolygonExtendedProps,
  coordinate: LatLng,
  coordIndex?: number
): MapPolygonExtendedProps => {
  const i = coordIndex ?? polygon.coordinates.length ?? -1;
  const coordinates = [...polygon.coordinates];
  coordinates.splice(i, 0, coordinate);
  return { ...polygon, coordinates };
};

export const getMiddleCoordinates = (coordinates: LatLng[]): LatLng[] => {
  const middleCoordinates = [
    getMidpointFromCoordinates(coordinates[0] as LatLng, coordinates[coordinates.length - 1] as LatLng)
  ];
  for (let i = 1; i < coordinates.length; i++) {
    const coordinate = getMidpointFromCoordinates(coordinates[i - 1] as LatLng, coordinates[i] as LatLng);
    middleCoordinates.push(coordinate);
  }
  return middleCoordinates;
};

let timeout: any = null;
export const debounce = (func: () => void, wait?: number): void => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    timeout = null;
    func();
  }, wait);
};

export function createRectangle(
  centerLat: number,
  centerLon: number,
  lengthKm: number,
  widthKm: number
) {
  // Convert lengths to meters
  const lengthM = lengthKm * 1000;
  const widthM = widthKm * 1000;

  // Earth's radius in meters
  const earthRadius = 6378137;

  // Offset in radians
  const offsetNorth = lengthM / earthRadius;
  const offsetEast = widthM / (earthRadius * Math.cos((Math.PI * centerLat) / 180));
  const offsetSouth = -offsetNorth;
  const offsetWest = -offsetEast;

  // Calculate new coordinates
  const north = {
    latitude: centerLat + offsetNorth * (180 / Math.PI),
    longitude: centerLon
  };
  const east = {
    latitude: centerLat,
    longitude: centerLon + offsetEast * (180 / Math.PI)
  };
  const south = {
    latitude: centerLat + offsetSouth * (180 / Math.PI),
    longitude: centerLon
  };
  const west = {
    latitude: centerLat,
    longitude: centerLon + offsetWest * (180 / Math.PI)
  };

  return { north, east, south, west };
}

export const generateRandomMarkers = (center: LatLng, radius: number, count: number): LatLng[] => {
  const markers: LatLng[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const randomRadius = Math.random() * radius;
    const latitude = center.latitude + randomRadius * Math.cos(angle);
    const longitude = center.longitude + randomRadius * Math.sin(angle);
    markers.push({ latitude, longitude });
  }
  return markers;
};
