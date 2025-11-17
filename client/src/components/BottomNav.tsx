import { useLocation } from "wouter";
import { BarChart3, ShoppingCart, Package, Users } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
  roles: string[];
}

/**
 * Bottom navigation bar component with beautiful icon-only navigation
 * Active icon is larger and highlighted with background
 */
export default function BottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  // Navigation items based on user role
  const navItems: NavItem[] = [
    {
      path: "/dashboard",
      icon: <BarChart3 />,
      label: "Dashboard",
      roles: ["owner", "manager"],
    },
    {
      path: "/sales",
      icon: <ShoppingCart />,
      label: "Vendas",
      roles: ["owner", "manager", "seller"],
    },
    {
      path: "/products",
      icon: <Package />,
      label: "Produtos",
      roles: ["owner", "manager"],
    },
    {
      path: "/users",
      icon: <Users />,
      label: "Usuários",
      roles: ["owner", "manager"],
    },
  ];

  // Filter items based on user role
  const availableItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground border-t-2 border-primary/30 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-around h-24 px-4 max-w-4xl mx-auto">
        {availableItems.map((item) => {
          const isActive = location === item.path;

          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex items-center justify-center transition-all duration-300 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-foreground/50 relative group ${
                isActive
                  ? "bg-primary-foreground/20 scale-110 shadow-lg"
                  : "hover:bg-primary-foreground/10 scale-100"
              }`}
              title={item.label}
              aria-label={item.label}
            >
              <div
                className={`transition-all duration-300 ${
                  isActive ? "w-8 h-8" : "w-6 h-6"
                } text-primary-foreground`}
              >
                {item.icon}
              </div>
              
              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute bottom-1 w-1.5 h-1.5 bg-primary-foreground rounded-full"></div>
              )}
              
              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
