import React from 'react';
import { Polygon } from 'react-native-maps';
import { type  MapPolygonExtendedProps } from '../helper/types';

export const Polyline = (props: {
  polygon: MapPolygonExtendedProps | null;
}) => {
  if (props.polygon === null) {
    return null;
  }
  return <Polygon {...props.polygon} fillColor="transparent" />;
};
