import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Marker,
  type MarkerDragEvent,
  type MarkerDragStartEndEvent,
} from 'react-native-maps';
import { type MapPolygonExtendedProps } from '../helper/types';
import { getMiddleCoordinates } from '../helper/helpers';

export const SubCircleMarkers = (props: {
  polygon: MapPolygonExtendedProps;
  onDragStart: (index: number) => (e: MarkerDragStartEndEvent) => void;
  onDrag: (index: number) => (e: MarkerDragEvent) => void;
  onDragEnd: (index: number) => (e: MarkerDragStartEndEvent) => void;
}) => {
  const middleCoordinates = getMiddleCoordinates(props.polygon.coordinates);
  return (
    <>
      {middleCoordinates.map((coordinate, coordIndex) => (
        <Marker
          key={coordIndex}
          identifier={coordIndex.toString()}
          coordinate={coordinate}
          anchor={{ x: 0.5, y: 0.5 }}
          draggable={true}
          onDragStart={props.onDragStart(coordIndex)}
          onDrag={props.onDrag(coordIndex)}
          onDragEnd={props.onDragEnd(coordIndex)}
          tracksViewChanges={true}
        >
          <View
            style={[
              styles.subCircleMarker,
              {
                borderColor: props.polygon.strokeColor,
              },
            ]}
          />
        </Marker>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  subCircleMarker: {
    backgroundColor: 'rgba(255, 255, 255, .3)',
    borderRadius: 100,
    borderWidth: 1,
    borderStyle: 'dotted',
    padding: 8,
  },
});
