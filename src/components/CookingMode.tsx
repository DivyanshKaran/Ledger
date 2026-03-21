import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Timer, Volume2, VolumeX, Maximize, CheckCircle2, Lightbulb } from "lucide-react";
import { Recipe, RecipeStep } from "@/data/recipes";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

interface CookingModeProps {
  recipe: Recipe;
  onClose: () => void;
}

export default function CookingMode({ recipe, onClose }: CookingModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSpeaking, setIsSpeaking] = useState(false);

  const step = recipe.steps[currentStep];
  const progress = ((currentStep + 1) / recipe.steps.length) * 100;

  // Keep screen awake
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await (navigator as any).wakeLock.request("screen");
        }
      } catch { /* silent fail */ }
    };
    requestWakeLock();
    return () => { wakeLock?.release(); };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!timerRunning || timer === null || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev === null || prev <= 1) {
          setTimerRunning(false);
          // Play notification sound
          try {
            const audio = new AudioContext();
            const oscillator = audio.createOscillator();
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(800, audio.currentTime);
            oscillator.connect(audio.destination);
            oscillator.start();
            oscillator.stop(audio.currentTime + 0.3);
          } catch { /* silent */ }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, timer]);

  // Initialize timer when step changes
  useEffect(() => {
    if (step.duration > 0) {
      setTimer(step.duration * 60);
      setTimerRunning(false);
    } else {
      setTimer(null);
      setTimerRunning(false);
    }
  }, [currentStep, step.duration]);

  const nextStep = () => {
    setCompletedSteps(prev => new Set(prev).add(currentStep));
    if (currentStep < recipe.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const speakStep = () => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(`Step ${currentStep + 1}: ${step.title}. ${step.description}`);
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); nextStep(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prevStep(); }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentStep]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border">
        <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Exit Cooking Mode</span>
        </Button>
        <h2 className="font-display text-sm sm:text-lg font-semibold truncate max-w-[200px] sm:max-w-none">
          {recipe.title}
        </h2>
        <div className="text-sm text-muted-foreground">
          {currentStep + 1}/{recipe.steps.length}
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="h-1 rounded-none" />

      {/* Step Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-8 max-w-3xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="text-center w-full"
          >
            {/* Step number badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-sm font-medium ${
              completedSteps.has(currentStep) ? "bg-green-500/10 text-green-600" : "bg-primary/10 text-primary"
            }`}>
              {completedSteps.has(currentStep) ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {currentStep + 1}
                </span>
              )}
              {step.title}
            </div>

            {/* Description */}
            <p className="text-xl sm:text-3xl lg:text-4xl font-display leading-relaxed mb-8 text-foreground">
              {step.description}
            </p>

            {/* Tips */}
            {step.tips && (
              <div className="bg-accent/10 border border-accent/20 rounded-xl px-6 py-4 mb-6 text-sm sm:text-base text-accent-foreground">
                <Lightbulb className="w-4 h-4 inline-block mr-1 align-text-bottom" /><span className="font-medium">Tip:</span> {step.tips}
              </div>
            )}

            {/* Timer */}
            {timer !== null && (
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className={`text-4xl sm:text-6xl font-mono font-bold ${
                  timer === 0 ? "text-green-500" : timer < 60 ? "text-destructive" : "text-foreground"
                }`}>
                  {formatTime(timer)}
                </div>
                <Button
                  size="lg"
                  variant={timerRunning ? "destructive" : "default"}
                  onClick={() => {
                    if (timer === 0) setTimer(step.duration * 60);
                    setTimerRunning(!timerRunning);
                  }}
                  className="gap-2"
                >
                  <Timer className="w-5 h-5" />
                  {timer === 0 ? "Reset" : timerRunning ? "Pause" : "Start"}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-t border-border bg-muted/30">
        <Button
          variant="outline"
          size="lg"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={speakStep} className="h-10 w-10">
            {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
        </div>

        {currentStep < recipe.steps.length - 1 ? (
          <Button size="lg" onClick={nextStep} className="gap-2">
            <span className="hidden sm:inline">Next Step</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="w-5 h-5" />
          </Button>
        ) : (
          <Button size="lg" onClick={onClose} className="gap-2 bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <span className="hidden sm:inline">Done!</span>
            <span className="sm:hidden">Done</span>
          </Button>
        )}
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-1.5 py-3 bg-muted/30">
        {recipe.steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentStep(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === currentStep
                ? "bg-primary scale-125"
                : completedSteps.has(i)
                ? "bg-green-500"
                : "bg-border hover:bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
