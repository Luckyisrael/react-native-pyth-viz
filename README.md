# ReactNativePythViz

ReactNativePythViz is a powerful React Native library for integrating Pyth Network data feeds into your mobile applications. It provides real-time price updates, customizable alerts, and advanced visualization components for crypto asset prices.


## Current Features

- ✅ Real-time price updates from Pyth Network
- ✅ Support for multiple assets
- ✅ Customizable line chart component
- ✅ Easy-to-use React hooks for data fetching and management
- ✅ TypeScript support for improved developer experience

## Installation

```bash
npm install react-native-pyth-viz react-native-gifted-charts react-native-linear-gradient
```

or if you're using yarn:

```bash
yarn add react-native-pyth-viz react-native-gifted-charts react-native-linear-gradient
```

## Quick Start

Here's a basic example of how to use ReactNativePythViz in your React Native application:

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PriceChart, usePythDataFeed, PythAssetSymbol } from 'react-native-pyth-viz';

const ChartExample: React.FC = () => {
  const { connectionStatus } = usePythDataFeed();
  const assets: PythAssetSymbol[] = ['BTC/USD', 'ETH/USD', 'SOL/USD'];
  const timeWindow = 3600000; // 1 hour

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Multi-Asset Price Chart</Text>
      <Text>Connection Status: {connectionStatus}</Text>
      <PriceChart assets={assets} timeWindow={timeWindow} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default ChartExample;
```

## Main Components

### PriceChart

The `PriceChart` component displays a line chart for one or more assets.

Props:
- `assets`: An array of `PythAssetSymbol` to display on the chart.
- `timeWindow`: The time window for displayed data in milliseconds.

### usePythDataFeed Hook

The `usePythDataFeed` hook provides access to real-time price data and connection status.

Returns:
- `connectionStatus`: Current connection status to Pyth Network.
- `realTimeData`: Object containing the latest price data for subscribed assets.
- `getLatestPriceUpdates`: Function to fetch the latest price updates for given assets.
- `subscribeToLiveUpdates`: Function to subscribe to real-time updates for a specific asset.

## Supported Assets

Currently, the library supports the following assets:
- BTC/USD
- ETH/USD
- SOL/USD
- (Add more as they become available)

## API Reference

(Detailed API reference to be added as the library evolves)

## Acknowledgments

- Pyth Network for providing the price feed data
- react-native-gifted-charts for the charting capabilities

## Roadmap

- [ ] Add more chart types (candlestick, bar charts)
- [ ] Implement caching for improved performance
- [ ] Add more customization options for charts
- [ ] Develop comprehensive error handling
- [ ] Create a demo app showcasing all features

Stay tuned for updates and new features!


## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
