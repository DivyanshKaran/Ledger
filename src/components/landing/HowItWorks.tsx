import { motion } from "framer-motion";
import { Search, Calculator, ShoppingCart, ChefHat } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Browse & Discover",
    description: "Explore our curated collection or search by cuisine, dietary needs, or ingredients you have on hand.",
  },
  {
    number: "02",
    icon: Calculator,
    title: "See the Cost",
    description: "Every recipe shows a detailed cost breakdown. Adjust servings and watch prices update in real time.",
  },
  {
    number: "03",
    icon: ShoppingCart,
    title: "Plan & Shop",
    description: "Add recipes to your weekly meal plan and generate a consolidated shopping list with exact quantities.",
  },
  {
    number: "04",
    icon: ChefHat,
    title: "Cook with Confidence",
    description: "Follow step-by-step instructions in Cooking Mode with built-in timers and AI assistance at the ready.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-14 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-muted/20 border-y border-border/40">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <span className="inline-block text-[11px] sm:text-xs font-semibold tracking-[0.18em] text-primary/80 mb-4">
            Simple as 1-2-3-4
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-5">
            How it <span className="text-primary">works</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line - desktop only */}
          <div className="hidden lg:block absolute top-24 left-[calc(12.5%+28px)] right-[calc(12.5%+28px)] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="text-center relative group"
                >
                  {/* Step number & icon */}
                  <div className="relative inline-block mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-card border-2 border-border group-hover:border-primary/50 flex items-center justify-center transition-all duration-300 shadow-warm group-hover:shadow-warm-lg mx-auto">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg">
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-base sm:text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
