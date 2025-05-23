'use client'; // Required for hooks

import React from 'react'; // Only import React
import Image from 'next/image';
import styles from './Layout.module.css'; // Import the CSS module
import FooterComponent from './FooterComponent';
import { useQuery } from '@tanstack/react-query';

const COINGECKO_BTC_PRICE_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
const getBtcPrice = async (): Promise<number> => {
  const response = await fetch(COINGECKO_BTC_PRICE_URL);
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded for CoinGecko API');
    }
    throw new Error(`Failed to fetch BTC price from CoinGecko: ${response.status}`);
  }
  const data = await response.json();
  if (!data.bitcoin || !data.bitcoin.usd) throw new Error('Invalid response format from CoinGecko');
  return data.bitcoin.usd;
};

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const {
    data: btcPriceUsd,
    isLoading: isBtcPriceLoading,
    error: btcPriceError,
  } = useQuery<number, Error>({
    queryKey: ['btcPriceUsd'],
    queryFn: getBtcPrice,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  // WORKAROUND REMOVED: No longer force disconnect wallet on initial mount.
  // This fixes the bug where multiple sign-in popups appeared on refresh.

  return (
    // Apply styles using the styles object
    <div className={styles.container}>
      {/* The main "window" */}
      <div className={styles.window}>
        {/* Optional Title Bar */}
        <div className={styles.titleBar}>
          <span className={styles.titleBarRow}>
  <Image src="/icons/runesswap_logo.png" alt="RunesSwap.app Logo" aria-hidden="true" width={18} height={18} style={{ imageRendering: 'pixelated' }} priority />
  RunesSwap.app
</span>
          {/* Placeholder for window controls maybe? */}
        </div>
        {/* Window Content Area */}
        <div className={styles.content}>
          {children}
        </div>
      </div>
      <FooterComponent btcPriceUsd={btcPriceUsd} isBtcPriceLoading={isBtcPriceLoading} btcPriceError={btcPriceError} />
    </div>
  );
}

export default Layout;