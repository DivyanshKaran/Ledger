import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, Calculator, Users, Clock, ChefHat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useCountUp } from "@/hooks/useCountUp";
import heroImage from "@/assets/hero-food.jpg";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const navigate = useNavigate();
  
  const recipeCount = useCountUp(100, 1200);
  const saveCount = useCountUp(50, 1400);
  const userCount = useCountUp(10, 1000);

  const stats = [
    { icon: Calculator, countUp: recipeCount, suffix: "+", label: "Recipes" },
    { icon: TrendingUp, countUp: saveCount, suffix: "%", label: "Save on meals" },
    { icon: Users, countUp: userCount, suffix: "K+", label: "Happy cooks" },
  ];

  const features = [
    { icon: Clock, title: "Quick Prep", desc: "15-30 min recipes" },
    { icon: ChefHat, title: "Easy to Follow", desc: "Step-by-step guides" },
    { icon: Calculator, title: "Cost Tracking", desc: "Know before you cook" },
  ];

  return (
    <section className="relative min-h-[75vh] sm:min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Delicious food spread" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/55 sm:via-background/80 sm:to-background/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Content */}
          <div className="max-w-2xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-8"
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-primary">Ledger</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.1] mb-4 sm:mb-6 text-shadow-soft"
            >
              Cook with
              <br />
              <span className="text-primary">confidence</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-6 sm:mb-10 max-w-xl"
            >
              Your personal kitchen companion. Calculate recipe costs down to the penny, 
              scale servings effortlessly, and plan meals that delight without breaking the bank.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col xs:flex-row gap-3 sm:gap-4 mb-10 sm:mb-16"
            >
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="text-sm sm:text-base px-6 sm:px-8 h-12 sm:h-14 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all w-full xs:w-auto"
              >
                Explore Recipes
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/auth?mode=signup")}
                className="text-sm sm:text-base px-6 sm:px-8 h-12 sm:h-14 bg-background/50 backdrop-blur-sm w-full xs:w-auto"
              >
                Get Started Free
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4 sm:gap-8"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-2 sm:gap-3"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div ref={stat.countUp.ref}>
                      <p className="text-lg sm:text-2xl font-display font-bold">{stat.countUp.count}{stat.suffix}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Right Column - Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="hidden lg:flex flex-col gap-4"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.15 }}
                  whileHover={{ x: 10 }}
                  className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-1">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">{feature.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
