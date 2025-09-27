import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  width?: string | number;
  height?: string | number;
  interval?: string;
  theme?: 'light' | 'dark';
  style?: '1' | '2' | '3' | '8';
  locale?: string;
  toolbar_bg?: string;
  enable_publishing?: boolean;
  allow_symbol_change?: boolean;
  container_id?: string;
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = memo(({
  symbol,
  width = "100%",
  height = 400,
  interval = "D",
  theme = "light",
  style = "1",
  locale = "en",
  toolbar_bg = "#f1f3f6",
  enable_publishing = false,
  allow_symbol_change = true,
  container_id
}) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "width": "${width}",
        "height": "${height}",
        "symbol": "${symbol}",
        "interval": "${interval}",
        "timezone": "Etc/UTC",
        "theme": "${theme}",
        "style": "${style}",
        "locale": "${locale}",
        "toolbar_bg": "${toolbar_bg}",
        "enable_publishing": ${enable_publishing},
        "allow_symbol_change": ${allow_symbol_change},
        "calendar": false,
        "support_host": "https://www.tradingview.com"
      }`;

    // Clear the container and add the script
    container.current.innerHTML = '';
    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol, width, height, interval, theme, style, locale, toolbar_bg, enable_publishing, allow_symbol_change]);

  return (
    <div className="tradingview-widget-container w-full">
      <div 
        ref={container} 
        className="tradingview-widget w-full overflow-hidden rounded-lg" 
        id={container_id}
        style={{ minHeight: height }}
      />
    </div>
  );
});

TradingViewWidget.displayName = 'TradingViewWidget';