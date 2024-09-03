import { useState, useEffect, useCallback } from 'react';
import DataFeedModule from '../modules/DataFeedModule';
import {type PythAssetSymbol } from '../utils/pythAssests';
import { type ConnectionStatus, type PriceData } from '../types';

const dataFeedModule = new DataFeedModule();

export const usePythDataFeed = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(dataFeedModule.getConnectionStatus());
  const [realTimeData, setRealTimeData] = useState<Record<PythAssetSymbol, PriceData>>({});

  useEffect(() => {
    dataFeedModule.setConnectionStatusChangeListener(setConnectionStatus);
    return () => {
      dataFeedModule.setConnectionStatusChangeListener(null);
      dataFeedModule.cleanup();
    };
  }, []);

  const getLatestPriceUpdates = useCallback(async (symbols: PythAssetSymbol[]): Promise<PriceData[]> => {
    const priceData = await dataFeedModule.getLatestPriceUpdates(symbols);
    setRealTimeData(prevData => {
      const newData = { ...prevData };
      priceData.forEach(data => {
        newData[data.symbol] = data;
      });
      return newData;
    });
    return priceData;
  }, []);

  const subscribeToLiveUpdates = useCallback((symbol: PythAssetSymbol, callback: (priceData: PriceData) => void) => {
    return dataFeedModule.subscribeToLiveUpdates(symbol, (priceData) => {
      setRealTimeData(prevData => ({ ...prevData, [symbol]: priceData }));
      callback(priceData);
    });
  }, []);

  return {
    connectionStatus,
    realTimeData,
    getLatestPriceUpdates,
    subscribeToLiveUpdates,
  };
};

export default usePythDataFeed;