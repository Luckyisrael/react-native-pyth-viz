# ReactNativePythViz

ReactNativePythViz is a powerful React Native library for integrating Pyth Network data feeds into your mobile applications. It provides real-time price updates, customizable alerts, and advanced visualization components for crypto asset prices.

## Features

- Real-time price updates from Pyth Network
- Price alerts
- Interactive Line and Candlestick charts
- Utility functions for price calculations
- TypeScript support

## Installation

```bash
npm install react-native-pyth-viz react-native-gifted-charts react-native-linear-gradient
```

## Usage

### Basic Usage

```jsx
import React from 'react';
import { View, Text } from 'react-native';
import { usePythDataFeed, PythAssetSymbol } from 'react-native-pyth-viz';

const BasicExample = () => {
  const { realTimeData } = usePythDataFeed();
  const asset: PythAssetSymbol = 'BTC/USD';

  return (
    <View>
      <Text>{asset} Price: ${realTimeData[asset]?.price.price.toFixed(2) || 'Loading...'}</Text>
    </View>
  );
};
```

### Advanced Usage

See the `EnhancedUsageExample.tsx` file for a comprehensive example including price alerts and interactive charts.

## API Reference

### Hooks

- `usePythDataFeed()`: Main hook for accessing Pyth Network data.

### Components

- `PriceAlert`: Component for setting price alerts.
- `PriceChart`: Component for displaying interactive line charts.
- `CandlestickChartComponent`: Component for displaying interactive candlestick charts.

### Utility Functions

- `calculatePercentageChange(oldPrice: number, newPrice: number): number`
- `formatPrice(price: number, decimals: number = 2): string`
- `getPercentageChangeColor(change: number): string`
- `getLatestPrice(priceData: PriceData): number`
- `getConfidenceInterval(priceData: PriceData): [number, number]`

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
