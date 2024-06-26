import { useState } from 'react';
import  type { LatLng } from 'react-native-maps';
import type { MapPolygonExtendedProps } from '../helper/types';

export const useNewPolygon = (
    newPolygon?: MapPolygonExtendedProps,
    onPolygonCreate?: (polygon: MapPolygonExtendedProps) => void,
): [() => void, () => void, (coordinate: LatLng) => void] => {
    const [polygon, setPolygon] = useState<MapPolygonExtendedProps | null>(
        null,
    );

    const [allowCreation, setAllowCreation] = useState<boolean>(false);

    const startPolygon = (): void => {
        setAllowCreation(true);
        setPolygon(null);
    };

    const resetPolygon = (): void => {
        setAllowCreation(false);
        setPolygon(null);
    };

    const buildPolygon = (coordinate: LatLng): void => {
        if (!allowCreation || !newPolygon) {
            return;
        }
        const starterPolygon = polygon ?? {
            ...newPolygon,
            coordinates: [],
        };
        const changedPolygon = {
            ...starterPolygon,
            coordinates: [...starterPolygon.coordinates, coordinate],
        };
        setPolygon(changedPolygon);
        if (changedPolygon.coordinates.length === 3) {
            setAllowCreation(false);
            onPolygonCreate?.(changedPolygon);
        }
    };

    return [startPolygon, resetPolygon, buildPolygon];
};
