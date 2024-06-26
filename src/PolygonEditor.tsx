import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';

import  type {
  LatLng,
  MarkerDragEvent,
  MarkerDragStartEndEvent,
  MarkerPressEvent
} from 'react-native-maps';

import { CircleMarkers, Polygons, Polyline, SubCircleMarkers } from './components';
import type { PolygonPressEvent } from './components/Polygons';
import {
  useDisabled,
  useNewPolygon,
  usePolygonFinder,
  usePolygons,
  useSelectedKey,
  useSelectedMarker
} from './hooks';
import { isPointInPolygon } from './helper/geospatials';
import { addCoordinateToPolygon, debounce } from './helper/helpers';
import type { MapPolygonExtendedProps, PolygonEditorRef } from './helper/types';

export const PolygonEditor = forwardRef(
  (
    props: {
      polygons: MapPolygonExtendedProps[];
      newPolygon?: MapPolygonExtendedProps;
      onPolygonCreate?: (polygon: MapPolygonExtendedProps) => void;
      onPolygonChange?: (index: number, polygon: MapPolygonExtendedProps) => void;
      onPolygonRemove?: (index: number) => void;
      onPolygonSelect?: (index: number, polygon: MapPolygonExtendedProps) => void;
      onPolygonUnselect?: (index: number, polygon: MapPolygonExtendedProps) => void;
      disabled?: boolean;
    },
    ref: any
  ) => {
    const [selectedPolygon, setSelectedPolygon] = useState<MapPolygonExtendedProps | null>(null);
    const [selectedPolyline, setSelectedPolyline] = useState<MapPolygonExtendedProps | null>(null);

    const { selectedMarkerIndex, setSelectedMarkerIndex, isSelectedMarker } = useSelectedMarker();

    const polygons = usePolygons(props.polygons);

    const disabled = useDisabled(() => {
      resetAll();
    }, props.disabled);

    const { getIndexByKey, getPolygonByKey } = usePolygonFinder(polygons);

    const [selectedKey, setSelectedKey, selectPolygonByKey, selectPolygonByIndex] =
      useSelectedKey(polygons);

    const [startNewPolygon, resetNewPolygon, buildNewPolygon] = useNewPolygon(
      props.newPolygon,
      polygon => {
        setSelectedKey(polygon.key);
        props.onPolygonCreate?.(polygon);
      }
    );

    const init = (): PolygonEditorRef => {
      return {
        setCoordinate,
        startPolygon,
        resetAll,
        selectPolygonByKey,
        selectPolygonByIndex
      };
    };

    const resetSelection = useCallback((): void => {
      setSelectedKey(null);
      setSelectedPolyline(null);
      setSelectedMarkerIndex(null);
    }, [setSelectedKey, setSelectedMarkerIndex]);

    const startPolygon = useCallback((): void => {
      resetSelection();
      startNewPolygon();
    }, [startNewPolygon, resetSelection]);

    const resetAll = useCallback((): void => {
      resetNewPolygon();
      resetSelection();
    }, [resetNewPolygon, resetSelection]);

    const unselectPolygon = (): void => {
      if (selectedKey && selectedPolygon) {
        const index = getIndexByKey(selectedKey);
        if (index != null) {
          props.onPolygonUnselect?.(index, selectedPolygon);
        }
      }
    };

    const setCoordinate = (coordinate: LatLng): void => {
      if (disabled) {
        return;
      }
      const coordinates = selectedPolygon?.coordinates ?? [];
      if (isPointInPolygon(coordinate, coordinates)) {
        // console.log('isPointInPolygon');
      } else if (selectedPolygon) {
        if (isSelectedMarker(null)) {
          addCoordinateToSelectedPolygon(coordinate);
        } else {
          unselectPolygon();
          resetSelection();
        }
      } else {
        buildNewPolygon(coordinate);
      }
    };

    const addCoordinateToSelectedPolygon = (coordinate: LatLng, coordIndex?: number): void => {
      if (!selectedPolygon) {
        return;
      }
      const changedPolygon = addCoordinateToPolygon(selectedPolygon, coordinate, coordIndex);
      setSelectedPolygon(changedPolygon);
      setSelectedPolyline(changedPolygon);
      const index = getIndexByKey(changedPolygon.key);
      if (index != null) {
        props.onPolygonChange?.(index, changedPolygon);
      }
    };

    const addCoordinateToSelectedPolyline = (coordinate: LatLng, coordIndex?: number): void => {
      if (!selectedPolygon) {
        return;
      }
      const changedPolygon = addCoordinateToPolygon(selectedPolygon, coordinate, coordIndex);
      setSelectedPolyline(changedPolygon);
    };

    const removeCoordinateFromSelectedPolygon = (coordIndex: number): void => {
      if (!selectedPolygon) {
        return;
      }
      const index = getIndexByKey(selectedPolygon.key);
      const coordinates = [...selectedPolygon.coordinates];
      coordinates.splice(coordIndex, 1);
      setSelectedMarkerIndex(null);
      if (coordinates.length < 4) {
        setSelectedKey(null);
        setSelectedPolyline(null);
        if (index != null) {
          props.onPolygonRemove?.(index);
        }
      } else if (selectedPolygon) {
        const changedPolygon = {
          ...selectedPolygon,
          coordinates
        };
        setSelectedPolygon(changedPolygon);
        setSelectedPolyline(changedPolygon);
        if (index != null) {
          props.onPolygonChange?.(index, changedPolygon);
        }
      }
    };

    const onPolygonClick = (index: number, polygon: MapPolygonExtendedProps) => {
      return (e: PolygonPressEvent) => {
        e.stopPropagation();
        if (disabled) {
          return;
        }
        if (selectedKey === polygon.key) {
          setSelectedKey(null);
          props.onPolygonSelect?.(index, polygon);
        } else {
          setSelectedKey(polygon.key);
        }
        setSelectedMarkerIndex(null);
      };
    };

    const changeSelectedPolylineCoordinate = (coordIndex: number, coordinate: LatLng): void => {
      if (!selectedPolyline) {
        return;
      }
      const coordinatesClone = [...selectedPolyline.coordinates];
      coordinatesClone[coordIndex] = coordinate;
      const changedPolygon = {
        ...selectedPolyline,
        coordinates: coordinatesClone
      };
      setSelectedPolyline(changedPolygon);
    };

    const synchronizePolylineToPolygon = (): void => {
      if (!selectedPolyline) {
        return;
      }
      setSelectedPolygon(selectedPolyline);
      setSelectedPolyline(null);
      const index = getIndexByKey(selectedPolyline.key);
      if (index != null) {
        props.onPolygonChange?.(index, selectedPolyline);
      }
    };

    const onSubMarkerDragStart = (coordIndex: number) => {
      return ({ nativeEvent: { coordinate } }: MarkerDragStartEndEvent) => {
        addCoordinateToSelectedPolyline(coordinate, coordIndex);
      };
    };

    const onMarkerDragStart = (_coordIndex: number) => {
      return (_e: MarkerDragStartEndEvent) => {
        setSelectedPolyline(selectedPolygon);
      };
    };

    const onMarkerDrag = (coordIndex: number) => {
      return ({ nativeEvent: { coordinate } }: MarkerDragEvent) => {
        debounce(() => {
          changeSelectedPolylineCoordinate(coordIndex, coordinate);
        }, 25);
      };
    };

    const onMarkerDragEnd = (_coordIndex: number) => {
      return (_e: MarkerDragStartEndEvent) => {
        debounce(() => {
          synchronizePolylineToPolygon();
        }, 25);
      };
    };

    const onMarkerPress = (coordIndex: number) => {
      return (e: MarkerPressEvent) => {
        e.stopPropagation();
        if (isSelectedMarker(coordIndex)) {
          removeCoordinateFromSelectedPolygon(coordIndex);
        } else {
          setSelectedMarkerIndex(coordIndex);
        }
      };
    };

    useImperativeHandle(ref, init);

    useEffect(() => {
      const polygon = selectedKey != null ? getPolygonByKey(selectedKey) : null;
      if (selectedPolygon?.key !== polygon?.key) {
        setSelectedPolygon(polygon);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [polygons, selectedKey]);

    useEffect(() => {
      const key = selectedPolygon?.key ?? null;
      if (selectedKey !== key) {
        setSelectedKey(key);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPolygon]);

    return (
      <>
        <Polygons polygons={polygons} onPolygonClick={onPolygonClick} />
        <Polyline polygon={selectedPolyline} />
        {selectedPolygon !== null && !disabled && (
          <>
            <SubCircleMarkers
              polygon={selectedPolygon}
              onDragStart={onSubMarkerDragStart}
              onDrag={onMarkerDrag}
              onDragEnd={onMarkerDragEnd}
            />
            <CircleMarkers
              selectedMarkerIndex={selectedMarkerIndex}
              polygon={selectedPolygon}
              onPolygonRemove={props.onPolygonRemove}
              onDragStart={onMarkerDragStart}
              onDrag={onMarkerDrag}
              onDragEnd={onMarkerDragEnd}
              onPress={onMarkerPress}
            />
          </>
        )}
      </>
    );
  }
);
