import { generateRandomMarkers } from '@koriz/maps-polygon-editor';
import * as React from 'react';

import { StyleSheet, View } from 'react-native';

export default function App() {

  React.useEffect(() => {
    generateRandomMarkers({
      longitude: 0,
      latitude: 0,
    }, 7,10)
  }, []);

  return (
    <View style={styles.container}/>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
