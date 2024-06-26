import { type Dispatch, type SetStateAction, useState } from 'react';

export const useSelectedMarker = (): {
    selectedMarkerIndex: number | null;
    setSelectedMarkerIndex: Dispatch<SetStateAction<number | null>>;
    isSelectedMarker: (coordIndex: number | null) => boolean;
} => {
    const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<
        number | null
    >(null);

    const isSelectedMarker = (coordIndex: number | null): boolean => {
        return selectedMarkerIndex === coordIndex;
    };

    return {
        selectedMarkerIndex,
        setSelectedMarkerIndex,
        isSelectedMarker,
    };
};
