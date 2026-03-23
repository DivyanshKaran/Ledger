import { motion } from "framer-motion";
import { TrendingDown, Utensils, Users, Star } from "lucide-react";
import { useStats } from "@/hooks/useStats";

export default function StatsBar() {
  const { recipeCount, userCount, averageRating, loading } = useStats();

  const stats = [
    { icon: TrendingDown, value: "£40+", label: "Average weekly savings", suffix: "" },
    { icon: Utensils, value: loading ? "—" : `${recipeCount}+`, label: "Curated recipes", suffix: "" },
    { icon: Users, value: loading ? "—" : userCount > 1000 ? `${(userCount / 1000).toFixed(1)}K+` : `${userCount}+`, label: "Active cooks", suffix: "" },
    { icon: Star, value: loading ? "—" : averageRating > 0 ? averageRating.toFixed(1) : "New", label: "Average rating", suffix: averageRating > 0 ? "/5" : "" },
  ];

  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-card/50 border-y border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3 group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                  {stat.value}<span className="text-muted-foreground text-lg">{stat.suffix}</span>
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
