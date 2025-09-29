import { ChevronDown, ChevronUp, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePersistedState } from "@/hooks/usePersistedState";

interface PortfolioData {
  totalValue: number;
  cashBalance: number;
  investedAmount: number;
  freeMargin: number;
  dailyChange: number;
  dailyChangePercent: number;
}

interface CollapsiblePortfolioProps {
  portfolio: PortfolioData;
  showDetails: boolean;
}

export function CollapsiblePortfolio({ portfolio, showDetails }: CollapsiblePortfolioProps) {
  const [isExpanded, setIsExpanded] = usePersistedState('portfolio-expanded', true);

  return (
    <div className="space-y-4">
      {/* Collapsed Header - Always visible */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <p className={`text-3xl font-bold transition-all duration-300 ${showDetails ? 'opacity-100' : 'opacity-0'}`}>
              {showDetails ? `$${portfolio.totalValue.toLocaleString()}` : '••••••'}
            </p>
            <p className="text-sm text-muted-foreground">Total Value</p>
            <div className="flex items-center justify-center mt-2">
              {portfolio.dailyChange >= 0 ? (
                <TrendingUp className="w-4 h-4 text-profit mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-loss mr-1" />
              )}
              <span className={`${portfolio.dailyChange >= 0 ? "text-profit" : "text-loss"} transition-all duration-300`}>
                {showDetails ? `$${Math.abs(portfolio.dailyChange).toLocaleString()} (${portfolio.dailyChangePercent}%)` : '••••••'}
              </span>
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground hover:text-foreground"
          aria-label={isExpanded ? "Collapse portfolio details" : "Expand portfolio details"}
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Expandable Details */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
          <div className="text-center">
            <p className={`text-xl font-semibold transition-all duration-300`}>
              {showDetails ? `$${portfolio.cashBalance.toLocaleString()}` : '••••••'}
            </p>
            <p className="text-sm text-muted-foreground">Cash Balance</p>
          </div>
          <div className="text-center">
            <p className={`text-xl font-semibold transition-all duration-300`}>
              {showDetails ? `$${portfolio.investedAmount.toLocaleString()}` : '••••••'}
            </p>
            <p className="text-sm text-muted-foreground">Invested Balance</p>
          </div>
          <div className="text-center">
            <p className={`text-xl font-semibold transition-all duration-300`}>
              {showDetails ? `$${portfolio.freeMargin.toLocaleString()}` : '••••••'}
            </p>
            <p className="text-sm text-muted-foreground">Free Margin</p>
          </div>
        </div>
      </div>
    </div>
  );
}