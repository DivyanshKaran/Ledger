import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Printer, ShoppingCart } from "lucide-react";

interface FloatingTotalProps {
  total: number;
  itemCount: number;
  onPrint?: () => void;
}

export default function FloatingTotal({ total, itemCount, onPrint }: FloatingTotalProps) {
  const [displayTotal, setDisplayTotal] = useState(total);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousTotal = useRef(total);

  useEffect(() => {
    if (total !== previousTotal.current) {
      setIsAnimating(true);
      
      // Animate the number
      const duration = 400;
      const startTime = Date.now();
      const startValue = previousTotal.current;
      const endValue = total;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (endValue - startValue) * easeOut;
        
        setDisplayTotal(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          previousTotal.current = total;
        }
      };

      requestAnimationFrame(animate);
    }
  }, [total]);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 no-print"
    >
      <motion.div
        animate={isAnimating ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 0.3 }}
        className="bg-card border-2 border-primary/20 rounded-2xl shadow-warm-xl px-6 py-4 flex items-center gap-6"
      >
        {/* Item Count */}
        <div className="flex items-center gap-2 pr-6 border-r border-border">
          <div className="w-10 h-10 rounded-full bg-olive-gradient flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Items</p>
            <motion.p
              key={itemCount}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="font-semibold text-lg"
            >
              {itemCount}
            </motion.p>
          </div>
        </div>

        {/* Total Cost */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-saffron-gradient flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Cost</p>
            <div className="flex items-baseline gap-1">
              <span className="text-muted-foreground">$</span>
              <motion.span
                className={`text-2xl font-display font-bold number-animate ${
                  isAnimating ? "text-primary" : "text-foreground"
                }`}
              >
                {displayTotal.toFixed(2)}
              </motion.span>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPrint}
          className="ml-2 w-12 h-12 rounded-xl bg-paprika-gradient flex items-center justify-center text-accent-foreground shadow-warm hover:shadow-warm-lg transition-shadow"
        >
          <Printer className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
