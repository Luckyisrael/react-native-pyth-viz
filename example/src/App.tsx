import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PriceChart, usePythDataFeed, type PythAssetSymbol } from 'react-native-pyth-viz';
import LatestPriceExample from './component/LatestPriceExample';
import ConnectionStatusExample from './component/ConnectedExample';
import RealTimeDataExample from './component/RealTimeData';
import ComprehensiveExample from './component/AllExamples';

const ASSETS: PythAssetSymbol[] = ['BTC/USD', 'ETH/USD', ];

export default function App() {
  const { connectionStatus, realTimeData, getLatestPriceUpdates, subscribeToLiveUpdates } = usePythDataFeed();
  const asset: PythAssetSymbol = 'BTC/USD';

  useEffect(() => {
    const fetchInitialData = async () => {
      await getLatestPriceUpdates(ASSETS);
    };

    fetchInitialData();

    const subscriptions = ASSETS.map(asset => 
      subscribeToLiveUpdates(asset, (priceData) => {
        console.log(`Received update for ${asset}:`, priceData);
      })
    );

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [getLatestPriceUpdates, subscribeToLiveUpdates]);

  return (
    <GestureHandlerRootView>
      <ScrollView>
        
    <View style={styles.container}>
      <Text style={styles.status}>Connection Status: {connectionStatus}</Text>
      {ASSETS.map(asset => (
        <View key={asset} style={styles.assetContainer}>
          <Text style={styles.assetName}>{asset}</Text>
          {realTimeData[asset] && (
            <>
              <Text>Price: ${realTimeData[asset].price.price.toFixed(2)}</Text>
              <Text>Confidence: ±${realTimeData[asset].price.confidence.toFixed(2)}</Text>
              <Text>Last Updated: {new Date(realTimeData[asset].price.publishTime * 1000).toLocaleString()}</Text>
            </>
          )}
        </View>
      ))}
      <View>
        <Text>Latest Price example</Text>
        <LatestPriceExample />
      </View>
      <View>
        <Text>Live Price example</Text>
        <LatestPriceExample />
      </View>
      <View>
        <Text>Connected Example</Text>
        <ConnectionStatusExample />
      </View>
      <View>
        <Text>Real Time Data</Text>
        <RealTimeDataExample />
      </View>
      <View>
        <Text>All Prices</Text>
        <ComprehensiveExample />
      </View>
      <View>
        <PriceChart asset={asset} timeWindow={3600000}  />
      </View>
    </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
   // backgroundColor: 'red',
    marginTop: 40
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  assetContainer: {
    marginBottom: 20,
  },
  assetName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
