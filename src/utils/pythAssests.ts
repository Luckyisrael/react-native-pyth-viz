export const PYTH_ASSET_IDS = {
    'BTC/USD': 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
    'ETH/USD': 'c96458d393fe9deb7a7d63a0ac41e2898a67a7750dbd166673279e06c868df0a',
    
  } as const;
  
  export type PythAssetSymbol = keyof typeof PYTH_ASSET_IDS;
  
  export function getPythId(symbol: PythAssetSymbol): string {
    return PYTH_ASSET_IDS[symbol];
  }
  
  export function isPythAssetSymbol(symbol: unknown): symbol is PythAssetSymbol {
    return typeof symbol === 'string' && symbol in PYTH_ASSET_IDS;
  }