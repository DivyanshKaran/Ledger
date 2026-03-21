import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Recipe, getScaledIngredients } from "@/data/recipes";
import { useCurrency } from "@/hooks/useCurrency";
import jsPDF from "jspdf";
import { toast } from "sonner";

// Import images dynamically using eager loading
const imageModules = import.meta.glob<{ default: string }>('@/assets/recipe-*.jpg', { eager: true });

const getImageUrl = (imagePath: string): string => {
  const filename = imagePath.split('/').pop();
  const key = `/src/assets/${filename}`;
  return imageModules[key]?.default || imagePath;
};

interface RecipePDFGeneratorProps {
  recipe: Recipe;
  servings: number;
}

export default function RecipePDFGenerator({ recipe, servings }: RecipePDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { formatPrice, currency } = useCurrency();

  const loadImageAsBase64 = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let yPos = margin;

      // Colors
      const primaryColor: [number, number, number] = [218, 165, 32]; // Saffron-ish
      const accentColor: [number, number, number] = [139, 69, 19]; // Paprika-ish
      const textColor: [number, number, number] = [51, 51, 51];
      const mutedColor: [number, number, number] = [128, 128, 128];

      // Helper function to add new page if needed
      const checkNewPage = (requiredSpace: number) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // ==================== PAGE 1: TITLE PAGE WITH PHOTO ====================
      
      // Load recipe image
      const imageUrl = getImageUrl(recipe.image);
      const imageBase64 = await loadImageAsBase64(imageUrl);

      if (imageBase64) {
        // Full width image at top
        pdf.addImage(imageBase64, 'JPEG', 0, 0, pageWidth, 80);
        
        // Gradient overlay effect (dark strip for title)
        pdf.setFillColor(0, 0, 0);
        pdf.rect(0, 60, pageWidth, 25, 'F');
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 60, pageWidth, 0.5, 'F');
        
        // Title on overlay
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(28);
        pdf.setFont("helvetica", "bold");
        const titleLines = pdf.splitTextToSize(recipe.title, contentWidth);
        pdf.text(titleLines, pageWidth / 2, 75, { align: "center" });
        
        yPos = 95;
      } else {
        // Fallback without image
        pdf.setFillColor(...primaryColor);
        pdf.rect(0, 0, pageWidth, 60, "F");
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(28);
        pdf.setFont("helvetica", "bold");
        const titleLines = pdf.splitTextToSize(recipe.title, contentWidth);
        pdf.text(titleLines, pageWidth / 2, 25, { align: "center" });
        
        yPos = 70;
      }
      
      // Cuisine, Servings & Difficulty
      pdf.setTextColor(...mutedColor);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      const subtitleParts = [recipe.cuisine, `${servings} Servings`];
      if (recipe.difficulty) subtitleParts.push(recipe.difficulty);
      pdf.text(subtitleParts.join(" • "), pageWidth / 2, yPos, { align: "center" });
      yPos += 12;

      // Description
      if (recipe.description) {
        pdf.setTextColor(...textColor);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "italic");
        const descLines = pdf.splitTextToSize(recipe.description, contentWidth);
        pdf.text(descLines, margin, yPos);
        yPos += descLines.length * 5 + 10;
      }

      // Time Info Box
      pdf.setFillColor(250, 250, 245);
      pdf.roundedRect(margin, yPos, contentWidth, 25, 3, 3, "F");
      
      pdf.setTextColor(...mutedColor);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      
      const timeItems = [
        { label: "Prep", value: recipe.prepTime },
        { label: "Cook", value: recipe.cookTime },
        { label: "Total", value: recipe.totalTime }
      ];
      
      const colWidth = contentWidth / 3;
      timeItems.forEach((item, idx) => {
        const xCenter = margin + colWidth * idx + colWidth / 2;
        pdf.text(item.label, xCenter, yPos + 8, { align: "center" });
        pdf.setTextColor(...textColor);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(item.value, xCenter, yPos + 18, { align: "center" });
        pdf.setTextColor(...mutedColor);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
      });
      
      yPos += 35;

      // ==================== INGREDIENTS SECTION ====================
      checkNewPage(50);
      
      pdf.setFillColor(...accentColor);
      pdf.rect(margin, yPos, contentWidth, 10, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("INGREDIENTS", margin + 5, yPos + 7);
      yPos += 15;

      const scaledIngredients = getScaledIngredients(recipe.ingredients, servings, recipe.servings);
      let totalCost = 0;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      scaledIngredients.forEach((ing, idx) => {
        checkNewPage(10);
        
        const ingCost = ing.quantity * ing.pricePerUnit;
        totalCost += ingCost;
        
        // Alternating background
        if (idx % 2 === 0) {
          pdf.setFillColor(250, 250, 245);
          pdf.rect(margin, yPos - 3, contentWidth, 8, "F");
        }
        
        pdf.setTextColor(...textColor);
        pdf.text(`• ${ing.name}`, margin + 3, yPos);
        
        pdf.setTextColor(...mutedColor);
        const qtyText = `${ing.quantity.toFixed(1)} ${ing.unit}`;
        pdf.text(qtyText, margin + contentWidth - 50, yPos);
        
        pdf.setTextColor(...primaryColor);
        const priceText = formatPrice(ingCost);
        pdf.text(priceText, margin + contentWidth - 10, yPos, { align: "right" });
        
        yPos += 8;
      });

      // Total Cost
      yPos += 5;
      pdf.setFillColor(...primaryColor);
      pdf.rect(margin + contentWidth - 60, yPos - 3, 60, 10, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Total: ${formatPrice(totalCost)}`, margin + contentWidth - 5, yPos + 4, { align: "right" });
      yPos += 20;

      // ==================== PAGE 2: COOKING STEPS ====================
      pdf.addPage();
      yPos = margin;
      
      pdf.setFillColor(...accentColor);
      pdf.rect(margin, yPos, contentWidth, 10, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("COOKING INSTRUCTIONS", margin + 5, yPos + 7);
      yPos += 20;

      recipe.steps.forEach((step, idx) => {
        const stepHeight = 25 + (step.description ? Math.ceil(step.description.length / 80) * 5 : 0);
        checkNewPage(stepHeight);
        
        // Step number circle
        pdf.setFillColor(...primaryColor);
        pdf.circle(margin + 8, yPos, 6, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text(String(idx + 1), margin + 8, yPos + 3, { align: "center" });
        
        // Step title
        pdf.setTextColor(...textColor);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(step.title, margin + 20, yPos + 1);
        
        // Duration
        if (step.duration) {
          pdf.setTextColor(...mutedColor);
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          pdf.text(`${step.duration} min`, margin + contentWidth - 5, yPos + 1, { align: "right" });
        }
        
        yPos += 8;
        
        // Step description
        if (step.description) {
          pdf.setTextColor(...textColor);
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          const descLines = pdf.splitTextToSize(step.description, contentWidth - 25);
          pdf.text(descLines, margin + 20, yPos);
          yPos += descLines.length * 5 + 5;
        }

        // Tips
        if (step.tips) {
          pdf.setTextColor(...primaryColor);
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "italic");
          const tipLines = pdf.splitTextToSize(`* Tip: ${step.tips}`, contentWidth - 25);
          pdf.text(tipLines, margin + 20, yPos);
          yPos += tipLines.length * 4 + 5;
        }
        
        yPos += 5;
      });

      // ==================== PAGE 3: NUTRITION ====================
      pdf.addPage();
      yPos = margin;

      pdf.setFillColor(...accentColor);
      pdf.rect(margin, yPos, contentWidth, 10, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("NUTRITION INFORMATION", margin + 5, yPos + 7);
      yPos += 20;

      pdf.setTextColor(...mutedColor);
      pdf.setFontSize(9);
      pdf.text("Per serving", margin, yPos);
      yPos += 10;

      const nutritionItems = [
        { label: "Calories", value: `${recipe.nutrition.calories}`, unit: "kcal" },
        { label: "Protein", value: `${recipe.nutrition.protein}`, unit: "g" },
        { label: "Carbohydrates", value: `${recipe.nutrition.carbs}`, unit: "g" },
        { label: "Fat", value: `${recipe.nutrition.fat}`, unit: "g" },
        { label: "Fiber", value: `${recipe.nutrition.fiber}`, unit: "g" },
        { label: "Sugar", value: `${recipe.nutrition.sugar}`, unit: "g" },
        { label: "Sodium", value: `${recipe.nutrition.sodium}`, unit: "mg" }
      ];

      nutritionItems.forEach((item, idx) => {
        if (idx % 2 === 0) {
          pdf.setFillColor(250, 250, 245);
          pdf.rect(margin, yPos - 3, contentWidth, 10, "F");
        }
        
        pdf.setTextColor(...textColor);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        pdf.text(item.label, margin + 5, yPos + 3);
        
        pdf.setFont("helvetica", "bold");
        pdf.text(`${item.value} ${item.unit}`, margin + contentWidth - 5, yPos + 3, { align: "right" });
        
        yPos += 10;
      });

      // Footer on last page
      yPos = pageHeight - 20;
      pdf.setDrawColor(...primaryColor);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPos - 5, margin + contentWidth, yPos - 5);
      
      pdf.setTextColor(...mutedColor);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated from Ledger • ${new Date().toLocaleDateString()}`, margin, yPos);
      pdf.text(`${currency.code}`, margin + contentWidth, yPos, { align: "right" });

      // Save the PDF
      const fileName = `${recipe.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_recipe.pdf`;
      pdf.save(fileName);
      
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={generatePDF}
      disabled={isGenerating}
      className="gap-1.5 h-9"
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">Download PDF</span>
    </Button>
  );
}
