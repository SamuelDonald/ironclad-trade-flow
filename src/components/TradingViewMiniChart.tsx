import React, { useEffect, useRef, memo } from 'react';

interface TradingViewMiniChartProps {
  symbol: string;
  width?: string | number;
  height?: string | number;
  isTransparent?: boolean;
  autosize?: boolean;
  container_id?: string;
}

export const TradingViewMiniChart: React.FC<TradingViewMiniChartProps> = memo(({
  symbol,
  width = "100%",
  height = 70,
  isTransparent = false,
  autosize = true,
  container_id
}) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "symbol": "${symbol}",
        "width": "${width}",
        "height": "${height}",
        "locale": "en",
        "dateRange": "12M",
        "colorTheme": "light",
        "isTransparent": ${isTransparent},
        "autosize": ${autosize},
        "largeChartUrl": ""
      }`;

    // Clear the container and add the script
    container.current.innerHTML = '';
    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol, width, height, isTransparent, autosize]);

  return (
    <div className="tradingview-widget-container">
      <div ref={container} className="tradingview-widget" id={container_id} />
    </div>
  );
});

TradingViewMiniChart.displayName = 'TradingViewMiniChart';