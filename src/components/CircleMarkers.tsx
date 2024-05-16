import React from 'react';

import {
  type LatLng,
  Marker,
  type MarkerDragEvent,
  type MarkerDragStartEndEvent,
  type MarkerPressEvent,
} from 'react-native-maps';

import { Circle } from './Circle';
import { RemoverCircle } from './RemoverCircle';
import { type MapPolygonExtendedProps } from '../helper/types';

export const CircleMarkers = (props: {
  selectedMarkerIndex: number | null;
  polygon: MapPolygonExtendedProps;
  onDragStart: (index: number) => (e: MarkerDragStartEndEvent) => void;
  onDrag: (index: number) => (e: MarkerDragEvent) => void;
  onDragEnd: (index: number) => (e: MarkerDragStartEndEvent) => void;
  onPress: (index: number) => (e: MarkerPressEvent) => void;
  onPolygonRemove?: (index: number) => void;
}) => {
  const isSelectedMarker = (coordIndex: number | null): boolean => {
    return props.selectedMarkerIndex === coordIndex;
  };

  return (
    <>
      {props.polygon.coordinates.map((coordinate: LatLng, coordIndex: number) => (
        <Marker
          key={coordIndex}
          identifier={coordIndex.toString()}
          coordinate={coordinate}
          anchor={{ x: 0.5, y: 0.5 }}
          draggable={!isSelectedMarker(coordIndex)}
          onDragStart={props.onDragStart(coordIndex)}
          onDrag={props.onDrag(coordIndex)}
          onDragEnd={props.onDragEnd(coordIndex)}
          onPress={props.onPress(coordIndex)}
          tracksViewChanges={true}>
          {isSelectedMarker(coordIndex) && props.onPolygonRemove && <RemoverCircle />}
          <Circle size={isSelectedMarker(coordIndex) ? 15 : 8} color={props.polygon.strokeColor} />
        </Marker>
      ))}
    </>
  );
};
