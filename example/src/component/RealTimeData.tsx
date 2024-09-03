import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePythDataFeed, type PythAssetSymbol } from 'react-native-pyth-viz';

const ASSETS: PythAssetSymbol[] = ['BTC/USD', 'ETH/USD'];

const RealTimeDataExample: React.FC = () => {
  const { realTimeData, getLatestPriceUpdates, subscribeToLiveUpdates } = usePythDataFeed();

  useEffect(() => {
    const initializeData = async () => {
      await getLatestPriceUpdates(ASSETS);
    };

    initializeData();

    const subscriptions = ASSETS.map(asset => 
      subscribeToLiveUpdates(asset, () => {
        // This callback is empty because realTimeData will update automatically
      })
    );

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [getLatestPriceUpdates, subscribeToLiveUpdates]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Real-Time Crypto Prices</Text>
      {ASSETS.map(asset => (
        <View key={asset} style={styles.assetContainer}>
          <Text style={styles.assetName}>{asset}</Text>
          {realTimeData[asset] ? (
            <>
              <Text>Price: ${realTimeData[asset].price.price.toFixed(2)}</Text>
              <Text>Confidence: ±${realTimeData[asset].price.confidence.toFixed(2)}</Text>
              <Text>Updated: {new Date(realTimeData[asset].price.publishTime * 1000).toLocaleTimeString()}</Text>
            </>
          ) : (
            <Text>Loading...</Text>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  assetContainer: { marginBottom: 20 },
  assetName: { fontSize: 18, fontWeight: 'bold' },
});

export default RealTimeDataExample;