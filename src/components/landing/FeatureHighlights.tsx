import { motion } from "framer-motion";
import { 
  Calculator, 
  ChefHat, 
  Scale, 
  BookOpen, 
  Brain, 
  ShoppingCart,
  TrendingDown,
  Timer
} from "lucide-react";

const features = [
  {
    icon: Calculator,
    title: "Penny-Perfect Costing",
    description: "Know the exact cost of every recipe before you shop. Break down expenses by ingredient and never overspend again.",
    accent: "from-primary to-saffron-dark",
  },
  {
    icon: Scale,
    title: "Instant Scaling",
    description: "Cooking for 2 or 20? Adjust servings with one tap and watch ingredients, costs, and nutrition update in real time.",
    accent: "from-accent to-paprika-dark",
  },
  {
    icon: Brain,
    title: "AI Kitchen Companion",
    description: "Ask our AI assistant for ingredient substitutions, dietary adaptations, and cooking tips—right from any recipe.",
    accent: "from-secondary to-olive-dark",
  },
  {
    icon: BookOpen,
    title: "Curated Collections",
    description: "Organise your favourites into personal cookbooks. Share your collections publicly or keep them private.",
    accent: "from-saffron to-primary",
  },
  {
    icon: Timer,
    title: "Cooking Mode",
    description: "Distraction-free, step-by-step guidance with built-in timers. Your screen stays awake so your hands stay free.",
    accent: "from-olive to-secondary",
  },
  {
    icon: ShoppingCart,
    title: "Smart Meal Planning",
    description: "Plan your week, generate shopping lists, and track your weekly food spend with beautiful cost insights.",
    accent: "from-paprika to-accent",
  },
];

export default function FeatureHighlights() {
  return (
    <section id="features" className="py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-muted/10 border-y border-border/40 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <span className="inline-block text-[11px] sm:text-xs font-semibold tracking-[0.18em] text-primary/80 mb-4">
            Everything you need
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold mb-5 max-w-3xl mx-auto leading-tight">
            Your kitchen, <span className="text-primary">transformed</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            From cost calculations to AI-powered cooking assistance, every tool you need 
            to cook smarter is right at your fingertips.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="relative h-full bg-card rounded-2xl border border-border/70 p-5 sm:p-8 shadow-warm transition-all duration-500 hover:border-primary/30 hover:shadow-warm-lg">
                  {/* Gradient glow on hover */}
                  <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500 -z-10`} />
                  
                  {/* Icon */}
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${feature.accent} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-lg sm:text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
