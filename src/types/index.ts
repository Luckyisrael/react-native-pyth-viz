import { type PythAssetSymbol } from '../utils/pythAssests';

export type ConnectionStatus = 'connected' | 'disconnected';

export interface Price {
  price: number;
  confidence: number;
  publishTime: number;
}

export interface PriceData {
  symbol: PythAssetSymbol;
  price: Price;
  emaPrice: Price;
}