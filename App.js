import 'expo-dev-client';
import React, { useEffect, useState } from 'react';
import { getCurrentPositionAsync, requestForegroundPermissionsAsync } from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import circle from '@turf/circle';

Mapbox.setAccessToken('pk.eyJ1IjoiZmlsaXBlbGVvbmVsYmF0aXN0YSIsImEiOiJjbDA5dWF5YXIwZ3oxM2tudDhsajBoY3M4In0.RYxLDG-hEGzrglaAPykBxw');

export default function App() {
  const [currentLocation, setCurrentLocation] = useState(null)

  var radius = 400 / 1000;
  var options = { steps: 100, units: 'kilometers', properties: { foo: 'bar' } };

  const { width } = useWindowDimensions();

  async function updateLocation() {

    let { status } = await requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Erro ao liberar as permissões", "Permissão para acessar a localização não foi concedida.");
      return;
    }

    const location = await getCurrentPositionAsync({})
    setCurrentLocation(location)
  }

  useEffect(() => {
    (async () => {
      let { status } = await requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Erro ao liberar as permissões", "Permissão para acessar a localização não foi concedida.");
        return;
      }

      await updateLocation();
    })();
  }, [])

  return (
    <View style={styles.container}>
      <Text>Meu mapa!</Text>
      <Text>Lat: {currentLocation?.coords?.latitude}</Text>
      <Text>Lng: {currentLocation?.coords?.longitude}</Text>
      <Text>Raio: {radius * 1000} metros</Text>
      {
        currentLocation !== null && (
          <Mapbox.MapView
            id="map"
            scaleBarEnabled={false}
            compassEnabled
            style={{
              height: width * 0.9,
              width: width * 0.9,
              marginVertical: 24,
            }}
            styleURL={Mapbox.StyleURL.Street}
          >
            <Mapbox.Camera
              animationMode="flyTo"
              animationDuration={2000}
              zoomLevel={13}
              centerCoordinate={[currentLocation?.coords?.longitude, currentLocation?.coords?.latitude]}
            />
            <Mapbox.PointAnnotation
              id="my_location"
              title="Your location"
              aboveLayerID="routeSource"
              coordinate={[currentLocation?.coords?.longitude, currentLocation?.coords?.latitude]}
            />
            <Mapbox.ShapeSource
              id='routeSource'
              shape={
                circle([currentLocation?.coords?.longitude, currentLocation?.coords?.latitude], radius, options)
              }
            >
              <Mapbox.FillLayer
                id="radiusFill"
                style={{ fillColor: 'rgba(0, 0, 0, 0.3)' }}
              />
              <Mapbox.LineLayer
                id="radiusOutline"
                style={{
                  lineColor: '#000000',
                  lineWidth: 3,
                }}
                aboveLayerID="radiusFill"
              />
            </Mapbox.ShapeSource>
          </Mapbox.MapView>
        )
      }
      <TouchableOpacity onPress={updateLocation} style={{ backgroundColor: '#CCC', paddingHorizontal: 8, paddingVertical: 16, margin: 8 }}>
        <Text>Atualizar localização</Text>
      </TouchableOpacity>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
