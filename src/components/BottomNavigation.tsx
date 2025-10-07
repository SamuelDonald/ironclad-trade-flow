import { Home, BarChart3, Wallet, User, Settings, LucideIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface NavBubbleItemProps {
  item: { icon: LucideIcon; label: string; path: string };
  isActive: boolean;
  onClick: () => void;
}

const NavBubbleItem = ({ item, isActive, onClick }: NavBubbleItemProps) => {
  const Icon = item.icon;
  
  return (
    <button
      onClick={onClick}
      aria-label={item.label}
      aria-current={isActive ? "page" : undefined}
      className={`
        relative flex flex-col items-center justify-center gap-1 
        transition-all duration-500 ease-out
        ${isActive ? 'translate-y-[-16px]' : 'translate-y-0'}
        w-[60px] cursor-pointer group
      `}
    >
      {/* Bubble Background Circle */}
      <div className={`
        relative flex items-center justify-center
        w-[56px] h-[56px] rounded-full
        transition-all duration-500 will-change-transform
        ${isActive 
          ? 'bg-gradient-to-br from-primary to-primary-light shadow-lg shadow-primary/30 scale-110 bubble-active animate-bubble-float dark:from-primary-dark dark:to-primary' 
          : 'bg-transparent scale-100 group-hover:bg-muted/50 dark:group-hover:bg-muted/30'
        }
      `}
      style={{
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
      >
        {/* Icon */}
        <Icon className={`
          transition-all duration-300
          ${isActive 
            ? 'w-6 h-6 text-primary-foreground' 
            : 'w-5 h-5 text-muted-foreground group-hover:text-foreground'
          }
        `} />
      </div>
      
      {/* Label */}
      <span className={`
        text-[10px] font-medium transition-all duration-300
        ${isActive 
          ? 'text-primary opacity-100 translate-y-0' 
          : 'text-muted-foreground opacity-60 translate-y-[-2px] group-hover:opacity-80'
        }
      `}>
        {item.label}
      </span>
    </button>
  );
};

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: BarChart3, label: "Market", path: "/market" },
    { icon: Wallet, label: "Wallet", path: "/wallet" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const activeIndex = navItems.findIndex(item => item.path === location.pathname);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Main Floating Container */}
      <div className="relative navbar-bubble rounded-t-[32px] w-full overflow-visible">
        
        {/* Gooey Background Animation Layer */}
        <div 
          className="gooey-background animate-gooey-morph"
          style={{
            left: `${activeIndex >= 0 ? activeIndex * (100 / navItems.length) : 0}%`,
            width: `${100 / navItems.length}%`
          }}
        />
        
        {/* Navigation Items Container */}
        <div className="relative flex items-end justify-around h-[70px] px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <NavBubbleItem 
                key={item.path}
                item={item}
                isActive={isActive}
                onClick={() => navigate(item.path)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;