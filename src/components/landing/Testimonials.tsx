import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  quote: string;
  rating: number;
  highlight?: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah Mitchell",
    role: "Home Cook & Food Blogger",
    avatar: "SM",
    quote: "Ledger completely changed how I plan meals. I used to overspend by £40 a week — now I know exactly what every recipe costs before I even step into the shop.",
    rating: 5,
    highlight: "Saved £40/week",
  },
  {
    name: "James Chen",
    role: "University Student",
    avatar: "JC",
    quote: "As a student on a tight budget, the cost scaling feature is a lifesaver. I can halve any recipe and see the exact price per serving. The AI substitution suggestions are brilliant too.",
    rating: 5,
    highlight: "Perfect for students",
  },
  {
    name: "Priya Sharma",
    role: "Family of Five",
    avatar: "PS",
    quote: "Meal planning for a large family was chaos until I found this. The weekly planner with shopping lists saves me hours, and my kids love the step-by-step cooking mode.",
    rating: 5,
    highlight: "Family favourite",
  },
  {
    name: "Oliver Reid",
    role: "Amateur Chef",
    avatar: "OR",
    quote: "The recipe comparison tool helped me choose between similar dishes based on cost and nutrition. It's like having a personal sous chef who also does the maths.",
    rating: 4,
    highlight: "Smart comparisons",
  },
  {
    name: "Emma Blackwood",
    role: "Nutritionist",
    avatar: "EB",
    quote: "I recommend Ledger to all my clients. The nutrition panels and dietary filters make it incredibly easy to find meals that fit specific dietary needs.",
    rating: 5,
    highlight: "Expert recommended",
  },
  {
    name: "David Okonkwo",
    role: "Busy Professional",
    avatar: "DO",
    quote: "The AI cooking assistant answered my questions faster than any cookbook. I asked 'what can I make with what's in my fridge?' and got three brilliant suggestions instantly.",
    rating: 5,
    highlight: "AI-powered answers",
  },
];

interface LiveReview {
  name: string;
  role: string;
  avatar: string;
  quote: string;
  rating: number;
}

function useTopReviews(): { reviews: LiveReview[]; loading: boolean } {
  const [reviews, setReviews] = useState<LiveReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await supabase
          .from("recipe_comments")
          .select("content, rating, user_id, created_at")
          .gte("rating", 4)
          .not("content", "is", null)
          .order("created_at", { ascending: false })
          .limit(6);

        if (!data || data.length === 0) { setLoading(false); return; }

        const userIds = [...new Set(data.map((r) => r.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p.display_name]) ?? []);

        setReviews(data.map((r) => {
          const name = profileMap.get(r.user_id) || "Anonymous";
          const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
          return {
            name,
            role: "Verified user",
            avatar: initials || "?",
            quote: r.content,
            rating: r.rating ?? 5,
          };
        }));
      } catch {
        // fall through to static
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return { reviews, loading };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < rating ? "text-primary fill-primary" : "text-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const { reviews: liveReviews, loading } = useTopReviews();
  const displayed = !loading && liveReviews.length > 0 ? liveReviews : testimonials;

  return (
    <section id="testimonials" className="py-12 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-muted/30 relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <span className="inline-block text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-primary mb-4">
            Loved by home cooks
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-5 max-w-3xl mx-auto leading-tight">
            What our <span className="text-primary">community</span> says
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Join thousands of cooks who've transformed their kitchen routines.
          </p>
        </motion.div>

        {/* Testimonials Grid — Masonry-like with varying heights */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 sm:gap-6 space-y-4 sm:space-y-6">
          {displayed.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="break-inside-avoid"
            >
              <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 lg:p-7 hover:border-primary/20 hover:shadow-warm transition-all duration-300 group">
                {/* Quote icon */}
                <Quote className="w-8 h-8 text-primary/15 mb-4 group-hover:text-primary/25 transition-colors" />

                {/* Highlight badge */}
                {"highlight" in testimonial && testimonial.highlight && (
                  <span className="inline-block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-4">
                    {testimonial.highlight}
                  </span>
                )}

                {/* Quote text */}
                <p className="text-foreground/90 text-sm sm:text-base leading-relaxed mb-5 italic">
                  "{testimonial.quote}"
                </p>

                {/* Rating */}
                <div className="mb-4">
                  <StarRating rating={testimonial.rating} />
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
