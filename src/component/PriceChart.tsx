import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { usePythDataFeed } from '../hooks/usePythDataFeed';
import { type PriceData } from '../types';
import { type PythAssetSymbol } from '../utils/pythAssests';


interface PriceChartProps {
  asset: PythAssetSymbol;
  timeWindow: number; // in milliseconds
}

export const PriceChart: React.FC<PriceChartProps> = ({ asset, timeWindow }) => {
  const { subscribeToLiveUpdates, getLatestPriceUpdates } = usePythDataFeed();
  const [priceHistory, setPriceHistory] = useState<{ value: number, date: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`PriceChart: Initializing for ${asset}`);
    
    const fetchInitialData = async () => {
      try {
        console.log(`PriceChart: Fetching initial data for ${asset}`);
        const initialData = await getLatestPriceUpdates([asset]);
        console.log(`PriceChart: Received initial data:`, initialData);
        if (initialData.length > 0) {
          const point = {
            value: initialData[0].price.price,
            date: new Date(initialData[0].price.publishTime * 1000).toLocaleTimeString()
          };
          setPriceHistory([point]);
        }
      } catch (err) {
        console.error(`PriceChart: Error fetching initial data:`, err);
        setError('Failed to fetch initial data');
      }
    };

    fetchInitialData();

    console.log(`PriceChart: Setting up live updates subscription for ${asset}`);
    const subscription = subscribeToLiveUpdates(asset, (priceData: PriceData) => {
      console.log(`PriceChart: Received update for ${asset}:`, priceData);
      setPriceHistory(prev => {
        const newPoint = {
          value: priceData.price.price,
          date: new Date(priceData.price.publishTime * 1000).toLocaleTimeString()
        };
        const newHistory = [...prev, newPoint].slice(-50); // Keep last 50 points
        console.log(`PriceChart: Updated price history. Length: ${newHistory.length}`);
        return newHistory;
      });
    });

    return () => {
      console.log(`PriceChart: Cleaning up subscription for ${asset}`);
      subscription.unsubscribe();
    };
  }, [asset, timeWindow, subscribeToLiveUpdates, getLatestPriceUpdates]);

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  if (priceHistory.length === 0) {
    return <Text style={styles.waitingText}>Waiting for price data...</Text>;
  }

  console.log(`PriceChart: Rendering chart with ${priceHistory.length} data points`);

  return (
    <View style={styles.container}>
      <LineChart
        data={priceHistory}
        width={Dimensions.get('window').width - 40}
        height={220}
        yAxisLabelSuffix=" $"
        xAxisLabelTextStyle={styles.axisLabel}
        yAxisTextStyle={styles.axisLabel}
        showDataPoints
        curved
        formatYLabel={(value) => value}
        spacing={50}
        initialSpacing={20}
        color="red"
        thickness={2}
        maxValue={Math.max(...priceHistory.map(d => d.value)) * 1.1}
        minValue={Math.min(...priceHistory.map(d => d.value)) * 0.9}
        noOfSections={5}
        yAxisLabelWidth={60}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 250,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  axisLabel: {
    color: '#333',
    fontSize: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  waitingText: {
    fontSize: 16,
    textAlign: 'center',
  },
});