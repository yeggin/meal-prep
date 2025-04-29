import { useLocation, Link } from 'react-router-dom';
import { CalendarDays, ChefHat, Home, Sparkles } from "lucide-react";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Meal Plans", href: "/mealplans", icon: CalendarDays },
  { name: "Recipes", href: "/recipes", icon: ChefHat },
  { name: "AI Assistant", href: "/generate-recipes", icon: Sparkles },
];

export default function Navbar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          // Determine link class based on active state
          const linkClassName = "flex flex-col items-center justify-center gap-1 text-xs " +
            (isActive ? "text-primary" : "text-muted-foreground");
            
          // Determine icon class based on active state
          const iconClassName = "h-5 w-5 " + 
            (isActive ? "text-primary" : "text-muted-foreground");
            
          return (
            <Link key={item.href} to={item.href} className={linkClassName}>
              <Icon className={iconClassName} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}