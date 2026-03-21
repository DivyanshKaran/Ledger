import { motion } from "framer-motion";
import { useCurrency, CURRENCIES } from "@/hooks/useCurrency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 h-9 px-2 font-medium">
          <motion.span
            key={currency.code}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-base"
          >
            {currency.symbol}
          </motion.span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {currency.code}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto scrollbar-thin">
        <div className="px-2 py-1.5 text-xs text-muted-foreground border-b border-border mb-1">
          Prices adjusted for local cost of living
        </div>
        {CURRENCIES.map((c) => (
          <DropdownMenuItem
            key={c.code}
            onClick={() => setCurrency(c)}
            className={currency.code === c.code ? "bg-muted" : ""}
          >
            <span className="w-6 text-center font-medium">{c.symbol}</span>
            <span className="ml-2 flex-1">{c.name}</span>
            <span className="text-xs text-muted-foreground">
              {c.costMultiplier < 1 ? `${Math.round(c.costMultiplier * 100)}%` : c.code}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
