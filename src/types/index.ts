// src/types/index.ts

export type Asset = string;

export type ConnectionStatus = 'connected' | 'disconnected';

export interface HistoricalDataPoint {
  timestamp: number;
  price: number;
  confidence: number;
}

export interface PythUpdate {
  asset: Asset;
  price: number;
  confidence: number;
  timestamp: number;
}

export interface MarketData {
  asset: Asset;
  price: number;
  change24h: number;
  volume24h: number;
}

export interface AssetMetadata {
  asset: Asset;
  fullName: string;
  description: string;
  category: string;
  lastUpdated: number;
}