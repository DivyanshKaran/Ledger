import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";
import IngredientIllustration from "./IngredientIllustration";

export default function Header() {
  return (
    <header className="relative py-12 px-4 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-warm-gradient opacity-50" />
      
      {/* Floating ingredients */}
      <IngredientIllustration className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-saffron-gradient shadow-warm-lg mb-6"
        >
          <ChefHat className="w-10 h-10 text-primary-foreground" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display text-5xl md:text-6xl font-semibold mb-4"
        >
          <span className="text-gradient-saffron">The Culinary</span>{" "}
          <span className="text-foreground">Ledger</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-muted-foreground max-w-md mx-auto"
        >
          Calculate ingredient costs, plan your meals, and cook with confidence
        </motion.p>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-8 h-px w-48 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent"
        />
      </div>
    </header>
  );
}
