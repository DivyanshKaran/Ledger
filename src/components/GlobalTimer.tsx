import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, RotateCcw, Clock, CheckCircle2, Timer, 
  ChevronDown, ChevronUp, Lightbulb, SkipForward, Volume2, VolumeX
} from "lucide-react";
import { RecipeStep } from "@/data/recipes";

interface GlobalTimerProps {
  steps: RecipeStep[];
  recipeName: string;
}

export default function GlobalTimer({ steps, recipeName }: GlobalTimerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(steps[0]?.duration * 60 || 0);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentStep = steps[currentStepIndex];
  const totalTime = steps.reduce((sum, step) => sum + step.duration, 0);
  const completedTime = steps
    .filter((_, i) => completedSteps.has(i))
    .reduce((sum, step) => sum + step.duration, 0);
  const progress = totalTime > 0 ? (completedTime / totalTime) * 100 : 0;

  // Calculate flowing progress for current step
  const stepProgress = currentStep && currentStep.duration > 0
    ? ((currentStep.duration * 60 - timeRemaining) / (currentStep.duration * 60)) * 100
    : 0;

  // Play notification sound
  const playNotification = useCallback(() => {
    if (!soundEnabled) return;
    
    // Create a simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log("Audio not supported");
    }
  }, [soundEnabled]);

  // Timer effect
  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Timer complete - auto advance
          playNotification();
          handleStepComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, playNotification]);

  const handleStepComplete = useCallback(() => {
    setIsRunning(false);
    setCompletedSteps(prev => new Set([...prev, currentStepIndex]));

    // Auto advance to next step
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setTimeRemaining(steps[nextIndex].duration * 60);
      setExpandedSteps(prev => new Set([...prev, nextIndex]));
      
      // Auto-start next step with timed duration
      if (steps[nextIndex].duration > 0) {
        setTimeout(() => setIsRunning(true), 500);
      }
    }
  }, [currentStepIndex, steps]);

  const goToStep = (index: number) => {
    setIsRunning(false);
    setCurrentStepIndex(index);
    setTimeRemaining(steps[index].duration * 60);
    setExpandedSteps(prev => new Set([...prev, index]));
  };

  const resetAll = () => {
    setIsRunning(false);
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());
    setTimeRemaining(steps[0]?.duration * 60 || 0);
    setExpandedSteps(new Set([0]));
  };

  const toggleExpanded = (index: number) => {
    setExpandedSteps(prev => {
      const updated = new Set(prev);
      if (updated.has(index)) {
        updated.delete(index);
      } else {
        updated.add(index);
      }
      return updated;
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const skipToNext = () => {
    if (currentStepIndex < steps.length - 1) {
      handleStepComplete();
    }
  };

  return (
    <div className="space-y-6">
      {/* Global Timer Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="recipe-card p-6 bg-gradient-to-br from-card to-muted/30"
      >
        {/* Master Controls */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Timer className="w-5 h-5 text-primary" />
              Cooking Timer
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Step {currentStepIndex + 1} of {steps.length}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                soundEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={resetAll}
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Step Timer Display */}
        <div className="text-center mb-6">
          <motion.p
            key={currentStep?.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-muted-foreground mb-2"
          >
            {currentStep?.title}
          </motion.p>
          
          <motion.div
            key={timeRemaining}
            initial={{ scale: 1.02 }}
            animate={{ scale: 1 }}
            className={`text-6xl font-mono font-bold mb-4 ${
              timeRemaining < 60 && timeRemaining > 0
                ? "text-accent animate-pulse"
                : "text-foreground"
            }`}
          >
            {formatTime(timeRemaining)}
          </motion.div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              disabled={currentStep?.duration === 0}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-warm ${
                isRunning
                  ? "bg-accent text-accent-foreground"
                  : "bg-primary text-primary-foreground"
              } hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRunning ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </button>

            <button
              onClick={skipToNext}
              disabled={currentStepIndex >= steps.length - 1}
              className="w-12 h-12 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">{completedSteps.size} steps done</span>
            <span className="font-medium text-primary">{completedTime} / {totalTime} min</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-secondary rounded-full absolute left-0"
            />
            {/* Flowing current step indicator */}
            {!completedSteps.has(currentStepIndex) && currentStep?.duration > 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(1 / steps.length) * stepProgress}%`,
                  left: `${progress}%`
                }}
                transition={{ duration: 0.3 }}
                className="h-full bg-saffron-gradient rounded-full absolute"
                style={{ 
                  boxShadow: "0 0 10px hsl(var(--primary) / 0.5)"
                }}
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* Steps Timeline */}
      <div className="relative">
        {/* Flowing Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ height: 0 }}
            animate={{ 
              height: `${((currentStepIndex + (stepProgress / 100)) / steps.length) * 100}%` 
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full bg-gradient-to-b from-primary via-primary to-primary/50"
            style={{
              boxShadow: "0 0 10px hsl(var(--primary) / 0.5)"
            }}
          />
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const isExpanded = expandedSteps.has(index);
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStepIndex;
            const isPast = index < currentStepIndex;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative pl-14 ${isCompleted || isPast ? "opacity-70" : ""}`}
              >
                {/* Step Number Circle */}
                <motion.button
                  onClick={() => goToStep(index)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`absolute left-3 w-7 h-7 rounded-full flex items-center justify-center transition-all z-10 ${
                    isCompleted
                      ? "bg-secondary text-secondary-foreground"
                      : isCurrent
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse"
                      : "bg-muted text-muted-foreground hover:bg-primary/20"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </motion.button>

                {/* Step Card */}
                <div
                  className={`recipe-card overflow-hidden transition-all ${
                    isCurrent && !isCompleted ? "ring-2 ring-primary/30 shadow-warm" : ""
                  }`}
                >
                  {/* Step Header */}
                  <button
                    onClick={() => toggleExpanded(index)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className={`font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                        {step.title}
                      </h4>
                      {step.duration > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{step.duration} min</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Active Timer Badge */}
                      {isCurrent && isRunning && step.duration > 0 && (
                        <motion.span
                          initial={{ scale: 0.8 }}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-mono font-semibold"
                        >
                          {formatTime(timeRemaining)}
                        </motion.span>
                      )}

                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0 border-t border-border">
                          <p className="text-muted-foreground mt-4 leading-relaxed">
                            {step.description}
                          </p>

                          {step.tips && (
                            <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
                              <div className="flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-primary">
                                  <span className="font-medium">Tip:</span> {step.tips}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Quick Actions */}
                          {isCurrent && !isCompleted && (
                            <div className="mt-4 flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsRunning(!isRunning);
                                }}
                                disabled={step.duration === 0}
                                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                                  isRunning
                                    ? "bg-accent text-accent-foreground"
                                    : "bg-primary text-primary-foreground"
                                } disabled:opacity-50`}
                              >
                                {isRunning ? "Pause" : "Start Timer"}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStepComplete();
                                }}
                                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-all"
                              >
                                Done
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
