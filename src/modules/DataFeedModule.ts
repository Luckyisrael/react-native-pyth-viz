// src/modules/DataFeedModule.ts

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import {type Asset, type HistoricalDataPoint, type PythUpdate, type ConnectionStatus, type MarketData, type AssetMetadata } from '../types';
import { PYTH_API_ENDPOINT } from '../constants';

export class DataFeedModule {
  private subscriptions: Map<Asset, Set<(price: number) => void>>;
  private connectionStatus: ConnectionStatus;
  private pythListener: any;
  private unsubscribeNetInfo: (() => void) | undefined;
  private onConnectionStatusChange: ((status: ConnectionStatus) => void) | null;

  constructor() {
    this.subscriptions = new Map();
    this.connectionStatus = 'disconnected';
    this.onConnectionStatusChange = null;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (Platform.OS === 'ios') {
      const pythEmitter = new NativeEventEmitter(NativeModules.PythModule);
      this.pythListener = pythEmitter.addListener('PythUpdate', this.handlePythUpdate);
    } else {
      // Android Event listener
      const PythModule = NativeModules.PythModule;
      PythModule.startListening();
      this.pythListener = DeviceEventEmitter.addListener('PythUpdate', this.handlePythUpdate);
    }

    this.unsubscribeNetInfo = NetInfo.addEventListener(this.handleConnectivityChange);
  }

  private handlePythUpdate = (update: PythUpdate): void => {
    const { asset, price } = update;
    const callbacks = this.subscriptions.get(asset);
    if (callbacks) {
      callbacks.forEach(callback => callback(price));
    }
  }

  private handleConnectivityChange = (state: NetInfoState): void => {
    this.connectionStatus = state.isConnected ? 'connected' : 'disconnected';
    if (this.onConnectionStatusChange) {
      this.onConnectionStatusChange(this.connectionStatus);
    }
  }

  public async getRealTimePrice(asset: Asset): Promise<number> {
    try {
      const response = await fetch(`${PYTH_API_ENDPOINT}/realtime/${asset}`);
      if (!response.ok) throw new Error('Failed to fetch real-time price');
      const data = await response.json();
      return data.price;
    } catch (error) {
      console.error('Error fetching real-time price:', error);
      throw error;
    }
  }

  public async getHistoricalData(asset: Asset, startTime: Date, endTime: Date): Promise<HistoricalDataPoint[]> {
    try {
      const response = await fetch(`${PYTH_API_ENDPOINT}/historical/${asset}?start=${startTime.toISOString()}&end=${endTime.toISOString()}`);
      if (!response.ok) throw new Error('Failed to fetch historical data');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }

  public async getMarketOverview(): Promise<MarketData[]> {
    try {
      const response = await fetch(`${PYTH_API_ENDPOINT}/market-overview`);
      if (!response.ok) throw new Error('Failed to fetch market overview');
      return await response.json();
    } catch (error) {
      console.error('Error fetching market overview:', error);
      throw error;
    }
  }

  public async getAssetMetadata(asset: Asset): Promise<AssetMetadata> {
    try {
      const response = await fetch(`${PYTH_API_ENDPOINT}/asset-metadata/${asset}`);
      if (!response.ok) throw new Error('Failed to fetch asset metadata');
      return await response.json();
    } catch (error) {
      console.error('Error fetching asset metadata:', error);
      throw error;
    }
  }

  public async getVolatility(asset: Asset, period: '24h' | '7d' | '30d'): Promise<number> {
    try {
      const response = await fetch(`${PYTH_API_ENDPOINT}/volatility/${asset}?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch volatility data');
      const data = await response.json();
      return data.volatility;
    } catch (error) {
      console.error('Error fetching volatility data:', error);
      throw error;
    }
  }

  public async getCorrelation(asset1: Asset, asset2: Asset, period: '24h' | '7d' | '30d'): Promise<number> {
    try {
      const response = await fetch(`${PYTH_API_ENDPOINT}/correlation?asset1=${asset1}&asset2=${asset2}&period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch correlation data');
      const data = await response.json();
      return data.correlation;
    } catch (error) {
      console.error('Error fetching correlation data:', error);
      throw error;
    }
  }

  public subscribeToLiveUpdates(asset: Asset, callback: (price: number) => void): { unsubscribe: () => void } {
    if (!this.subscriptions.has(asset)) {
      this.subscriptions.set(asset, new Set());
    }
    this.subscriptions.get(asset)!.add(callback);

    // Start listening for updates (implementation depends on Pyth's API)
    NativeModules.PythModule.subscribeToAsset(asset);

    return {
      unsubscribe: () => {
        const callbacks = this.subscriptions.get(asset);
        if (callbacks) {
          callbacks.delete(callback);
          if (callbacks.size === 0) {
            this.subscriptions.delete(asset);
            NativeModules.PythModule.unsubscribeFromAsset(asset);
          }
        }
      }
    };
  }

  public setConnectionStatusChangeListener(callback: (status: ConnectionStatus) => void): void {
    this.onConnectionStatusChange = callback;
  }

  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  public cleanup(): void {
    if (this.pythListener) {
      this.pythListener.remove();
    }
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
    }
    // Clean up any other resources
  }
}

export default DataFeedModule;