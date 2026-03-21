import { motion } from "framer-motion";
import { Heart, Check, Loader2 } from "lucide-react";

// Animated heart button for favorites
export function AnimatedHeart({ 
  isFavorite, 
  onClick, 
  size = "default" 
}: { 
  isFavorite: boolean; 
  onClick: () => void;
  size?: "small" | "default" | "large";
}) {
  const sizeClasses = {
    small: "w-8 h-8",
    default: "w-10 h-10",
    large: "w-12 h-12"
  };
  
  const iconSizes = {
    small: "w-4 h-4",
    default: "w-5 h-5",
    large: "w-6 h-6"
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`${sizeClasses[size]} rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-lg border border-border hover:border-rose-300 transition-colors`}
    >
      <motion.div
        animate={isFavorite ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Heart 
          className={`${iconSizes[size]} transition-colors ${
            isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
          }`} 
        />
      </motion.div>
    </motion.button>
  );
}

// Loading spinner with pulse animation
export function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-4 py-12"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <Loader2 className="w-8 h-8 text-primary" />
      </motion.div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-muted-foreground text-sm"
      >
        {text}
      </motion.p>
    </motion.div>
  );
}

// Success checkmark animation
export function SuccessCheck({ show }: { show: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={show ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center"
    >
      <motion.div
        initial={{ pathLength: 0 }}
        animate={show ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Check className="w-8 h-8 text-white" strokeWidth={3} />
      </motion.div>
    </motion.div>
  );
}

// Floating action button with scale animation
export function FloatingButton({ 
  onClick, 
  icon: Icon, 
  label 
}: { 
  onClick: () => void; 
  icon: any; 
  label: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-xl shadow-primary/30 flex items-center gap-2 font-medium z-50"
    >
      <Icon className="w-5 h-5" />
      {label}
    </motion.button>
  );
}

// Staggered list animation wrapper
export function StaggeredList({ 
  children, 
  delay = 0.05 
}: { 
  children: React.ReactNode[]; 
  delay?: number;
}) {
  return (
    <>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * delay }}
        >
          {child}
        </motion.div>
      ))}
    </>
  );
}

// Pulse indicator for new items
export function PulseIndicator() {
  return (
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
    </span>
  );
}

// Shimmer effect overlay
export function ShimmerOverlay() {
  return (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  );
}

// Number counter animation
export function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-block"
    >
      {prefix}{value.toLocaleString()}{suffix}
    </motion.span>
  );
}
