import { type PythAssetSymbol, getPythId } from '../utils/pythAssests'
import { type PriceData, type ConnectionStatus } from '../types';

const HERMES_API_ENDPOINT = 'https://hermes.pyth.network/v2';
const CACHE_EXPIRY = 60 * 1000; // 1 minute

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export class DataFeedModule {
  private streamControllers: Map<PythAssetSymbol, AbortController> = new Map();
  private connectionStatus: ConnectionStatus = 'disconnected';
  private onConnectionStatusChange: ((status: ConnectionStatus) => void) | null = null;
  private cache: Map<string, CacheItem<PriceData>> = new Map();

  private setConnectionStatus(status: ConnectionStatus): void {
    this.connectionStatus = status;
    if (this.onConnectionStatusChange) {
      this.onConnectionStatusChange(status);
    }
  }

  public setConnectionStatusChangeListener(listener: (status: ConnectionStatus) => void): void {
    this.onConnectionStatusChange = listener;
  }

  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  private getCachedData(key: string): PriceData | null {
    const cachedItem = this.cache.get(key);
    if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_EXPIRY) {
      return cachedItem.data;
    }
    return null;
  }

  private setCachedData(key: string, data: PriceData): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  public async getLatestPriceUpdates(symbols: PythAssetSymbol[]): Promise<PriceData[]> {
    const results: PriceData[] = [];
    const symbolsToFetch: PythAssetSymbol[] = [];
  
    symbols.forEach(symbol => {
      const cachedData = this.getCachedData(symbol);
      if (cachedData) {
        results.push(cachedData);
      } else {
        symbolsToFetch.push(symbol);
      }
    });
  
    if (symbolsToFetch.length > 0) {
      try {
        const ids = symbolsToFetch.map(getPythId);
        const idsParam = ids.map(id => `ids[]=${encodeURIComponent(id)}`).join('&');
        const url = `${HERMES_API_ENDPOINT}/updates/price/latest?${idsParam}`;
        console.log('Fetching from URL:', url); // Log the URL being fetched
  
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch latest price updates: ${response.status} ${response.statusText}. ${errorText}`);
        }
  
        const data = await response.json();
        data.parsed.forEach((item: any) => {
          const symbol = symbolsToFetch[ids.indexOf(item.id)];
          const priceData = this.parsePriceData(item, symbol);
          results.push(priceData);
          this.setCachedData(symbol, priceData);
        });
      } catch (error) {
        console.error('Error fetching latest price updates:', error);
        throw error;
      }
    }
  
    return results;
  }

  private parsePriceData(item: any, symbol: PythAssetSymbol): PriceData {
    return {
      symbol,
      price: {
        price: parseFloat(item.price.price) * Math.pow(10, item.price.expo),
        confidence: parseFloat(item.price.conf) * Math.pow(10, item.price.expo),
        publishTime: item.price.publish_time
      },
      emaPrice: {
        price: parseFloat(item.ema_price.price) * Math.pow(10, item.ema_price.expo),
        confidence: parseFloat(item.ema_price.conf) * Math.pow(10, item.ema_price.expo),
        publishTime: item.ema_price.publish_time
      }
    };
  }

  public subscribeToLiveUpdates(symbol: PythAssetSymbol, callback: (priceData: PriceData) => void): { unsubscribe: () => void } {
    const id = getPythId(symbol);
    let intervalId: NodeJS.Timeout | null = null;
  
    const fetchAndProcessData = async () => {
      try {
        const url = `${HERMES_API_ENDPOINT}/updates/price/latest?ids[]=${encodeURIComponent(id)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.parsed && data.parsed.length > 0) {
          const priceData = this.parsePriceData(data.parsed[0], symbol);
          this.setCachedData(symbol, priceData);
          callback(priceData);
        }
      } catch (error) {
        console.error('Error fetching price update:', error);
      }
    };
  
    // Try to use streaming if supported, otherwise fall back to polling
    if (typeof ReadableStream !== 'undefined' && 'body' in Response.prototype) {
      const streamUrl = `${HERMES_API_ENDPOINT}/updates/price/stream?ids[]=${encodeURIComponent(id)}`;
      
      fetch(streamUrl)
        .then(response => {
          if (!response.body) {
            throw new Error('ReadableStream not supported');
          }
  
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
  
          const processStream = async (): Promise<void> => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim() !== '');
  
                for (const line of lines) {
                  const data = JSON.parse(line);
                  if (data.parsed && data.parsed.length > 0) {
                    const priceData = this.parsePriceData(data.parsed[0], symbol);
                    this.setCachedData(symbol, priceData);
                    callback(priceData);
                  }
                }
              }
            } catch (error) {
              console.error('Stream error:', error);
              this.setConnectionStatus('disconnected');
            }
          };
  
          this.setConnectionStatus('connected');
          processStream();
        })
        .catch(error => {
          console.error('Fetch error:', error);
          this.setConnectionStatus('disconnected');
          // Fall back to polling if streaming fails
          intervalId = setInterval(fetchAndProcessData, 5000); // Poll every 5 seconds
        });
    } else {
      // Environment doesn't support ReadableStream, use polling
      intervalId = setInterval(fetchAndProcessData, 5000); // Poll every 5 seconds
    }
  
    return {
      unsubscribe: () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      }
    };
  }

  public cleanup(): void {
    this.streamControllers.forEach(controller => controller.abort());
    this.streamControllers.clear();
  }
}

export default DataFeedModule;