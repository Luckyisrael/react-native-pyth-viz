import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePythDataFeed, type PythAssetSymbol } from 'react-native-pyth-viz';

const LatestPriceExample: React.FC = () => {
  const { getLatestPriceUpdates } = usePythDataFeed();
  const [priceData, setPriceData] = useState<any>(null);

  useEffect(() => {
    const fetchLatestPrices = async () => {
      const assets: PythAssetSymbol[] = ['BTC/USD', 'ETH/USD'];
      const latestPrices = await getLatestPriceUpdates(assets);
      setPriceData(latestPrices);
    };

    fetchLatestPrices();
  }, [getLatestPriceUpdates]);

  if (!priceData) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      {priceData.map((data: any) => (
        <View key={data.symbol} style={styles.priceContainer}>
          <Text style={styles.symbol}>{data.symbol}</Text>
          <Text>Price: ${data.price.price.toFixed(2)}</Text>
          <Text>Confidence: ±${data.price.confidence.toFixed(2)}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  priceContainer: { marginBottom: 20 },
  symbol: { fontSize: 18, fontWeight: 'bold' },
});

export default LatestPriceExample;