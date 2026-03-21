import { motion } from "framer-motion";
import { Apple, Wheat, Leaf, Layers, Droplet, Flame } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const illustrations: { icon: LucideIcon; delay: number; x: number; y: number; rotate: number }[] = [
  { icon: Apple,   delay: 0,   x: -50, y:  20, rotate: -15 },
  { icon: Wheat,   delay: 0.1, x:  30, y: -30, rotate:  10 },
  { icon: Leaf,    delay: 0.2, x: -30, y:  50, rotate: -20 },
  { icon: Layers,  delay: 0.3, x:  60, y:  40, rotate:  15 },
  { icon: Droplet, delay: 0.4, x: -60, y: -10, rotate: -10 },
  { icon: Flame,   delay: 0.5, x:  40, y: -50, rotate:  20 },
];

interface IngredientIllustrationProps {
  className?: string;
}

export default function IngredientIllustration({ className = "" }: IngredientIllustrationProps) {
  return (
    <div className={`relative ${className}`}>
      {illustrations.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            x: item.x, 
            y: item.y, 
            rotate: item.rotate 
          }}
          transition={{ 
            delay: item.delay, 
            type: "spring", 
            stiffness: 200,
            damping: 15 
          }}
          className="absolute text-primary/70"
          style={{ left: '50%', top: '50%' }}
        >
          <motion.span
            animate={{
              y: [0, -5, 0],
              rotate: [item.rotate, item.rotate + 5, item.rotate]
            }}
            transition={{
              repeat: Infinity,
              duration: 2 + index * 0.3,
              ease: "easeInOut"
            }}
            className="inline-block"
          >
            <item.icon className="w-8 h-8" />
          </motion.span>
        </motion.div>
      ))}
    </div>
  );
}
