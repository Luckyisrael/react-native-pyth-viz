import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePythDataFeed, type PythAssetSymbol, type PriceData } from 'react-native-pyth-viz';

const LiveUpdatesExample: React.FC = () => {
  const { subscribeToLiveUpdates } = usePythDataFeed();
  const [btcPrice, setBtcPrice] = useState<PriceData | null>(null);

  useEffect(() => {
    const asset: PythAssetSymbol = 'BTC/USD';
    const subscription = subscribeToLiveUpdates(asset, (priceData) => {
      setBtcPrice(priceData);
    });

    return () => subscription.unsubscribe();
  }, [subscribeToLiveUpdates]);

  if (!btcPrice) return <Text>Waiting for updates...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live BTC/USD Price</Text>
      <Text>Price: ${btcPrice.price.price.toFixed(2)}</Text>
      <Text>Confidence: ±${btcPrice.price.confidence.toFixed(2)}</Text>
      <Text>Last Updated: {new Date(btcPrice.price.publishTime * 1000).toLocaleString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});

export default LiveUpdatesExample;