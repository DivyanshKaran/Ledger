import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How accurate are the recipe cost calculations?",
    answer:
      "Our cost engine uses default UK grocery prices as a baseline, but you can customise every ingredient price to match your local supermarket. Costs update in real time when you adjust servings, swap ingredients, or change your currency — so the figure you see is always as accurate as the prices you enter.",
  },
  {
    question: "Where do the recipes come from?",
    answer:
      "Ledger ships with a curated library of professionally tested recipes spanning global cuisines. You can also create your own recipes, import shared recipes from friends, and browse public recipes contributed by the community.",
  },
  {
    question: "How reliable are the dietary filters?",
    answer:
      "Every preset recipe is manually tagged with dietary labels such as Vegetarian, Vegan, Gluten-Free, and Keto. When you create a custom recipe, our AI can auto-suggest appropriate tags. Filters match against these tags, so accuracy depends on correct labelling — we encourage the community to flag any mislabelled recipes.",
  },
  {
    question: "Is the AI cooking assistant free to use?",
    answer:
      "Yes — the AI Kitchen Companion is included at no extra cost for all registered users. It can suggest recipes based on ingredients you have, recommend substitutions, and offer cooking tips for any step.",
  },
  {
    question: "Can I use Ledger without creating an account?",
    answer:
      "Absolutely. You can browse recipes, view costs, and use dietary filters without signing up. Creating a free account unlocks additional features like saving favourites, building collections, meal planning, and syncing data across devices.",
  },
  {
    question: "How does the meal planner work?",
    answer:
      "Drag recipes into any day of the week to build your meal plan. The planner automatically calculates your total weekly food cost and generates a consolidated shopping list grouped by ingredient category — ready to take to the shop.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-background section-divider">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-[0.18em] text-primary/80 mb-4">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold mb-5 leading-tight">
            Common <span className="text-primary">questions</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Everything you need to know about Ledger.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border/70 rounded-xl px-4 sm:px-6 data-[state=open]:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="text-left text-sm sm:text-base font-semibold hover:no-underline hover:text-primary transition-colors py-4 sm:py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pb-4 sm:pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
