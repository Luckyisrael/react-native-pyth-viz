import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePythDataFeed } from 'react-native-pyth-viz';

const ConnectionStatusExample: React.FC = () => {
  const { connectionStatus } = usePythDataFeed();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connection Status</Text>
      <Text style={[
        styles.status,
        { color: connectionStatus === 'connected' ? 'green' : 'red' }
      ]}>
        {connectionStatus}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  status: { fontSize: 18 },
});

export default ConnectionStatusExample;