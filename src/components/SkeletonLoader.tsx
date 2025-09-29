import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "card" | "text" | "avatar" | "button" | "table";
}

export function SkeletonLoader({ className, variant = "text" }: SkeletonLoaderProps) {
  const variants = {
    card: "h-32 w-full",
    text: "h-4 w-full",
    avatar: "h-12 w-12 rounded-full",
    button: "h-10 w-20",
    table: "h-6 w-full"
  };

  return (
    <div 
      className={cn("animate-pulse bg-muted rounded", variants[variant], className)} 
    />
  );
}

export function WalletSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-lg rounded-2xl p-6">
          <div className="mb-4">
            <SkeletonLoader className="h-6 w-24 bg-white/20" />
          </div>
          <SkeletonLoader className="h-8 w-32 bg-white/20" />
        </div>
      ))}
    </div>
  );
}

export function PortfolioSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="text-center">
          <SkeletonLoader className="h-8 w-24 mx-auto mb-2" />
          <SkeletonLoader className="h-4 w-20 mx-auto mb-2" />
          <SkeletonLoader className="h-6 w-16 mx-auto" />
        </div>
      ))}
    </div>
  );
}

export function WatchlistSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
          <div className="space-y-2">
            <SkeletonLoader className="h-4 w-16" />
            <SkeletonLoader className="h-3 w-24" />
          </div>
          <div className="text-right space-y-2">
            <SkeletonLoader className="h-4 w-20" />
            <SkeletonLoader className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TransactionSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between py-3">
          <div className="space-y-2">
            <SkeletonLoader className="h-4 w-20" />
            <SkeletonLoader className="h-3 w-32" />
          </div>
          <div className="text-right space-y-2">
            <SkeletonLoader className="h-4 w-16" />
            <SkeletonLoader className="h-5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MarketCardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
              <SkeletonLoader className="h-5 w-16" />
              <SkeletonLoader className="h-3 w-24" />
            </div>
            <SkeletonLoader variant="avatar" className="h-6 w-6" />
          </div>
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <SkeletonLoader className="h-6 w-20" />
              <SkeletonLoader className="h-4 w-16" />
            </div>
            <SkeletonLoader className="h-6 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}