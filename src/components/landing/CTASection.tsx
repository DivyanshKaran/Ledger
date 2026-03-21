import { motion } from "framer-motion";
import { ArrowRight, ChefHat, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function CTASection() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Rich gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-saffron-dark" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-80 h-80 bg-primary-foreground/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "32px 32px",
          color: "white",
        }} />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Floating icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm mb-8"
        >
          <ChefHat className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-primary-foreground mb-6 leading-tight"
        >
          Ready to transform
          <br />
          your kitchen?
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-base sm:text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Join thousands of home cooks who've taken control of their food budget. 
          Start calculating, planning, and cooking smarter — completely free.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {user ? (
            <Button
              size="lg"
              onClick={() => navigate("/profile")}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-base px-8 h-14 shadow-xl gap-2 w-full sm:w-auto"
            >
              Go to Your Dashboard
              <ArrowRight className="w-5 h-5" />
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                onClick={() => navigate("/auth?mode=signup")}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-base px-8 h-14 shadow-xl gap-2 w-full sm:w-auto"
              >
                <Sparkles className="w-5 h-5" />
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth?mode=login")}
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base px-8 h-14 w-full sm:w-auto"
              >
                Sign In
              </Button>
            </>
          )}
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-primary-foreground/60 text-xs sm:text-sm"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/60" />
            Free to use
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/60" />
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/60" />
            100+ recipes included
          </span>
        </motion.div>
      </div>
    </section>
  );
}
