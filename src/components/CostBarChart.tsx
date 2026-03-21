import { motion } from "framer-motion";
import { useCurrency } from "@/hooks/useCurrency";

interface CostBarChartProps {
  data: { name: string; value: number }[];
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(40, 90%, 55%)",
  "hsl(12, 70%, 45%)",
  "hsl(95, 25%, 35%)",
  "hsl(200, 60%, 50%)",
  "hsl(280, 50%, 50%)",
  "hsl(42, 85%, 65%)",
];

export default function CostBarChart({ data }: CostBarChartProps) {
  const { formatPrice } = useCurrency();
  
  // Sort by value descending and take top 8
  const sortedData = [...data]
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  
  const maxValue = Math.max(...sortedData.map(d => d.value));

  return (
    <div className="space-y-3">
      {sortedData.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;
        
        return (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs sm:text-sm font-medium truncate max-w-[60%]">
                {item.name}
              </span>
              <span className="text-xs sm:text-sm text-primary font-semibold">
                {formatPrice(item.value)}
              </span>
            </div>
            <div className="h-3 sm:h-4 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.6, delay: index * 0.05, ease: "easeOut" }}
                className="h-full rounded-full relative"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              >
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </div>
          </motion.div>
        );
      })}
      
      {data.length > 8 && (
        <p className="text-xs text-muted-foreground text-center pt-2">
          + {data.length - 8} more ingredients
        </p>
      )}
    </div>
  );
}
