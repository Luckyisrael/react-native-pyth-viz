import { type PriceData } from '../types';

export const calculatePercentageChange = (oldPrice: number, newPrice: number): number => {
  return ((newPrice - oldPrice) / oldPrice) * 100;
};

export const formatPrice = (price: number, decimals: number = 2): string => {
  return price.toFixed(decimals);
};

export const getPercentageChangeColor = (change: number): string => {
  return change >= 0 ? 'green' : 'red';
};

export const getLatestPrice = (priceData: PriceData): number => {
  return priceData.price.price;
};

export const getConfidenceInterval = (priceData: PriceData): [number, number] => {
  const price = priceData.price.price;
  const confidence = priceData.price.confidence;
  return [price - confidence, price + confidence];
};