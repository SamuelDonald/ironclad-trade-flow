import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MoreVertical } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileFABProps {
  options: {
    label: string;
    value: string;
    onClick: () => void;
  }[];
  activeValue?: string;
}

export function MobileFAB({ options, activeValue }: MobileFABProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed top-4 right-4 z-50 h-10 w-10 rounded-full p-0 bg-background border border-border shadow-lg md:hidden"
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Menu</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="end">
        <div className="space-y-1">
          {options.map((option) => (
            <Button
              key={option.value}
              variant={activeValue === option.value ? "secondary" : "ghost"}
              className="w-full justify-start text-sm"
              onClick={() => {
                option.onClick();
                setOpen(false);
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}