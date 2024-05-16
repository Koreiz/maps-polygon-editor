import { useEffect, useState } from 'react';
import { type MapPolygonExtendedProps } from '../helper/types';

export const usePolygons = (
    oldPolygons: MapPolygonExtendedProps[],
): MapPolygonExtendedProps[] => {
    const [polygons, setPolygons] =
        useState<MapPolygonExtendedProps[]>(oldPolygons);

    useEffect(() => {
        setPolygons(oldPolygons);
    }, [oldPolygons]);

    return polygons;
};
