import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

export default function Index() {
  const [rainStatus, setRainStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const getRainInfo = async () => {
    setLoading(true);
    setRainStatus('');

    // Step 1: Get location permission
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setRainStatus('Location permission denied');
      setLoading(false);
      return;
    }

    // Step 2: Get current location
    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    // Step 3: Build Visual Crossing API URL
    const apiKey = 'A6ZYEUZ5XNHWD6N5AGFWC9QM7'; // Replace with your actual API key
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}/last7days?unitGroup=metric&include=hours&key=${apiKey}&contentType=json`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      // Step 4: Loop through data to find last time it rained
      let lastRainTime: string | null = null;

      // Go through days, from most recent to oldest
      for (let i = data.days.length - 1; i >= 0; i--) {
        const day = data.days[i];
        const hours = day.hours;
      
        for (let j = hours.length - 1; j >= 0; j--) {
          const hour = hours[j];
          if (hour.precip > 0) {
            const rainTime = new Date(hour.datetimeEpoch * 1000); // Convert seconds to milliseconds
            const now = new Date();
            const hoursAgo = Math.floor((now.getTime() - rainTime.getTime()) / (1000 * 60 * 60));
      
            setRainStatus(`It rained ${hoursAgo} hour(s) ago at ${rainTime.toLocaleString()}.`);
            setLoading(false);
            return;
          }
        }
      }
      

      if (!lastRainTime) {
        setRainStatus("No rain in the last 7 days.");
      }

    } catch (error) {
      console.log("Error:", error);
      setRainStatus('Error fetching weather data');
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Button title="Check Last Rain" onPress={getRainInfo} />
      {loading ? <ActivityIndicator style={{ marginTop: 20 }} /> : <Text style={styles.status}>{rainStatus}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  status: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
  },
});
