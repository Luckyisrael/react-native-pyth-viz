import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { usePythDataFeed, type PythAssetSymbol, type PriceData } from 'react-native-pyth-viz';

const ASSETS: PythAssetSymbol[] = ['BTC/USD', 'ETH/USD'];

const ComprehensiveExample: React.FC = () => {
  const { connectionStatus, realTimeData, getLatestPriceUpdates, subscribeToLiveUpdates } = usePythDataFeed();
  const [selectedAsset, setSelectedAsset] = useState<PythAssetSymbol>('BTC/USD');

  useEffect(() => {
    const initializeData = async () => {
      await getLatestPriceUpdates(ASSETS);
    };

    initializeData();

    const subscriptions = ASSETS.map(asset => 
      subscribeToLiveUpdates(asset, (priceData) => {
        console.log(`Received update for ${asset}:`, priceData);
      })
    );

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [getLatestPriceUpdates, subscribeToLiveUpdates]);

  const handleRefresh = () => {
    getLatestPriceUpdates([selectedAsset]);
  };

  const renderPriceData = (data: PriceData) => (
    <View>
      <Text>Price: ${data.price.price.toFixed(2)}</Text>
      <Text>Confidence: ±${data.price.confidence.toFixed(2)}</Text>
      <Text>Updated: {new Date(data.price.publishTime * 1000).toLocaleTimeString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pyth Network Data</Text>
      <Text style={styles.connectionStatus}>Status: {connectionStatus}</Text>
      
      <View style={styles.assetSelector}>
        {ASSETS.map(asset => (
          <Button
            key={asset}
            title={asset}
            onPress={() => setSelectedAsset(asset)}
            color={asset === selectedAsset ? '#007AFF' : '#999'}
          />
        ))}
      </View>

      <View style={styles.selectedAsset}>
        <Text style={styles.assetName}>{selectedAsset}</Text>
        {realTimeData[selectedAsset] ? (
          renderPriceData(realTimeData[selectedAsset])
        ) : (
          <Text>Loading...</Text>
        )}
      </View>

      <Button title="Refresh Data" onPress={handleRefresh} />

      <Text style={styles.allPricesTitle}>All Prices:</Text>
      {ASSETS.map(asset => (
        <View key={asset} style={styles.assetContainer}>
          <Text style={styles.assetName}>{asset}</Text>
          {realTimeData[asset] ? (
            renderPriceData(realTimeData[asset])
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
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  connectionStatus: { fontSize: 16, marginBottom: 20 },
  assetSelector: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  selectedAsset: { marginBottom: 20, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 },
  assetName: { fontSize: 18, fontWeight: 'bold' },
  allPricesTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  assetContainer: { marginBottom: 15 },
});

export default ComprehensiveExample;