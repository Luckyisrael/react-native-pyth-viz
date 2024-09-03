// src/hooks/usePythDataFeed.ts

import { useState, useEffect, useCallback } from 'react';
import DataFeedModule from '../modules/DataFeedModule';
import { type Asset, type ConnectionStatus, type HistoricalDataPoint, type MarketData, type AssetMetadata } from '../types';

const dataFeedModule = new DataFeedModule();

export const usePythDataFeed = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(dataFeedModule.getConnectionStatus());
  const [realTimeData, setRealTimeData] = useState<Record<Asset, number>>({});
  const [historicalData, setHistoricalData] = useState<Record<Asset, HistoricalDataPoint[]>>({});

  useEffect(() => {
    dataFeedModule.setConnectionStatusChangeListener(setConnectionStatus);

    return () => {
      dataFeedModule.setConnectionStatusChangeListener(null);
    };
  }, []);

  const getRealTimePrice = useCallback(async (asset: Asset): Promise<number> => {
    try {
      const price = await dataFeedModule.getRealTimePrice(asset);
      setRealTimeData(prevData => ({ ...prevData, [asset]: price }));
      return price;
    } catch (error) {
      console.error('Error in getRealTimePrice:', error);
      throw error;
    }
  }, []);

  const getHistoricalData = useCallback(async (asset: Asset, startTime: Date, endTime: Date): Promise<HistoricalDataPoint[]> => {
    try {
      const data = await dataFeedModule.getHistoricalData(asset, startTime, endTime);
      setHistoricalData(prevData => ({ ...prevData, [asset]: data }));
      return data;
    } catch (error) {
      console.error('Error in getHistoricalData:', error);
      throw error;
    }
  }, []);

  const subscribeToLiveUpdates = useCallback((asset: Asset, callback: (price: number) => void) => {
    return dataFeedModule.subscribeToLiveUpdates(asset, (price) => {
      setRealTimeData(prevData => ({ ...prevData, [asset]: price }));
      callback(price);
    });
  }, []);

  const getMarketOverview = useCallback(async (): Promise<MarketData[]> => {
    try {
      return await dataFeedModule.getMarketOverview();
    } catch (error) {
      console.error('Error in getMarketOverview:', error);
      throw error;
    }
  }, []);

  const getAssetMetadata = useCallback(async (asset: Asset): Promise<AssetMetadata> => {
    try {
      return await dataFeedModule.getAssetMetadata(asset);
    } catch (error) {
      console.error('Error in getAssetMetadata:', error);
      throw error;
    }
  }, []);

  const getVolatility = useCallback(async (asset: Asset, period: '24h' | '7d' | '30d'): Promise<number> => {
    try {
      return await dataFeedModule.getVolatility(asset, period);
    } catch (error) {
      console.error('Error in getVolatility:', error);
      throw error;
    }
  }, []);

  const getCorrelation = useCallback(async (asset1: Asset, asset2: Asset, period: '24h' | '7d' | '30d'): Promise<number> => {
    try {
      return await dataFeedModule.getCorrelation(asset1, asset2, period);
    } catch (error) {
      console.error('Error in getCorrelation:', error);
      throw error;
    }
  }, []);

  return {
    connectionStatus,
    realTimeData,
    historicalData,
    getRealTimePrice,
    getHistoricalData,
    subscribeToLiveUpdates,
    getMarketOverview,
    getAssetMetadata,
    getVolatility,
    getCorrelation,
  };
};

export default usePythDataFeed;