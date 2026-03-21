import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Calendar, Menu, X, Search, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import UserMenu from "./UserMenu";
import ThemeToggle from "./ThemeToggle";
import CurrencySelector from "./CurrencySelector";
import { Button } from "./ui/button";

interface NavbarProps {
  onLogoClick: () => void;
  onOpenPlanner?: () => void;
  onShowFavorites?: () => void;
  onShowCustomRecipes?: () => void;
  onOpenSearch?: () => void;
}

export default function Navbar({
  onLogoClick,
  onOpenPlanner,
  onShowFavorites,
  onShowCustomRecipes,
  onOpenSearch,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: "Recipes", path: "/recipes", icon: UtensilsCrossed },
    { label: "Create", path: "/create-recipe" },
    { label: "Favorites", path: "/favorites" },
    { label: "Authors", path: "/authors" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <motion.button
            onClick={onLogoClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Go to home"
            className="flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <ChefHat className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              Ledger
            </span>
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.path)}
                className={`font-medium text-sm transition-colors ${
                  isActive(item.path)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Button>
            ))}

            {onOpenPlanner && (
              <Button
                size="sm"
                variant="outline"
                onClick={onOpenPlanner}
                className="gap-1.5 font-medium text-sm ml-1 border-primary/30 text-primary hover:bg-primary/10"
              >
                <Calendar className="w-3.5 h-3.5" />
                Meal Plan
              </Button>
            )}

            <div className="w-px h-5 bg-border mx-2" />

            {onOpenSearch && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={onOpenSearch}
                aria-label="Open search"
              >
                <Search className="w-4 h-4" />
              </Button>
            )}
            <CurrencySelector />
            <ThemeToggle />

            <div className="w-px h-5 bg-border mx-1" />

            <UserMenu
              onShowFavorites={onShowFavorites}
              onShowCustomRecipes={onShowCustomRecipes}
            />
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-0.5">
            {onOpenSearch && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground"
                onClick={onOpenSearch}
                aria-label="Open search"
              >
                <Search className="w-4 h-4" />
              </Button>
            )}
            <ThemeToggle />
            <UserMenu
              onShowFavorites={onShowFavorites}
              onShowCustomRecipes={onShowCustomRecipes}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-border/40"
            >
              <div className="flex flex-col gap-1 py-3">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`justify-start h-11 font-medium ${
                      isActive(item.path)
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </Button>
                ))}

                {onOpenPlanner && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onOpenPlanner();
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start gap-2 h-11 border-primary/30 text-primary"
                  >
                    <Calendar className="w-4 h-4" />
                    Meal Planner
                  </Button>
                )}

                <div className="flex items-center gap-2 px-4 pt-2">
                  <CurrencySelector />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
