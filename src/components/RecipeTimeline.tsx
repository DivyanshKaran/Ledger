import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Clock, CheckCircle2, Circle, Timer, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { RecipeStep } from "@/data/recipes";

interface RecipeTimelineProps {
  steps: RecipeStep[];
  recipeName: string;
}

interface StepTimerState {
  isRunning: boolean;
  timeRemaining: number;
  isComplete: boolean;
}

export default function RecipeTimeline({ steps, recipeName }: RecipeTimelineProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [timers, setTimers] = useState<Record<number, StepTimerState>>(() => {
    const initial: Record<number, StepTimerState> = {};
    steps.forEach((step, index) => {
      initial[index] = {
        isRunning: false,
        timeRemaining: step.duration * 60,
        isComplete: false,
      };
    });
    return initial;
  });

  // Timer tick effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated = { ...prev };
        let hasChanges = false;

        Object.keys(updated).forEach((key) => {
          const index = parseInt(key);
          if (updated[index].isRunning && updated[index].timeRemaining > 0) {
            updated[index] = {
              ...updated[index],
              timeRemaining: updated[index].timeRemaining - 1,
            };
            hasChanges = true;
          } else if (updated[index].isRunning && updated[index].timeRemaining === 0) {
            updated[index] = {
              ...updated[index],
              isRunning: false,
              isComplete: true,
            };
            hasChanges = true;
            // Play sound or notification here
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`${recipeName}: Step Complete!`, {
                body: steps[index].title,
              });
            }
          }
        });

        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [steps, recipeName]);

  const toggleTimer = useCallback((index: number) => {
    setTimers((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        isRunning: !prev[index].isRunning,
      },
    }));
  }, []);

  const resetTimer = useCallback((index: number) => {
    setTimers((prev) => ({
      ...prev,
      [index]: {
        isRunning: false,
        timeRemaining: steps[index].duration * 60,
        isComplete: false,
      },
    }));
  }, [steps]);

  const toggleStepComplete = useCallback((index: number) => {
    setCompletedSteps((prev) => {
      const updated = new Set(prev);
      if (updated.has(index)) {
        updated.delete(index);
      } else {
        updated.add(index);
        // Auto-expand next step
        if (index < steps.length - 1) {
          setExpandedSteps((prev) => new Set([...prev, index + 1]));
          setCurrentStepIndex(index + 1);
        }
      }
      return updated;
    });
  }, [steps.length]);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedSteps((prev) => {
      const updated = new Set(prev);
      if (updated.has(index)) {
        updated.delete(index);
      } else {
        updated.add(index);
      }
      return updated;
    });
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const totalTime = steps.reduce((sum, step) => sum + step.duration, 0);
  const completedTime = steps
    .filter((_, i) => completedSteps.has(i))
    .reduce((sum, step) => sum + step.duration, 0);
  const progress = totalTime > 0 ? (completedTime / totalTime) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="recipe-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Timer className="w-5 h-5 text-primary" />
              Cooking Timeline
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {completedSteps.size} of {steps.length} steps completed
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-display font-semibold text-primary">
              {completedTime} min
            </p>
            <p className="text-sm text-muted-foreground">of {totalTime} min</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-saffron-gradient rounded-full"
          />
        </div>
      </div>

      {/* Steps Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-4">
          {steps.map((step, index) => {
            const isExpanded = expandedSteps.has(index);
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStepIndex;
            const timer = timers[index];

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative pl-14 ${isCompleted ? "opacity-70" : ""}`}
              >
                {/* Step Number Circle */}
                <button
                  onClick={() => toggleStepComplete(index)}
                  className={`absolute left-3 w-7 h-7 rounded-full flex items-center justify-center transition-all z-10 ${
                    isCompleted
                      ? "bg-secondary text-secondary-foreground"
                      : isCurrent
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground hover:bg-primary/20"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </button>

                {/* Step Card */}
                <div
                  className={`recipe-card overflow-hidden transition-all ${
                    isCurrent && !isCompleted ? "ring-2 ring-primary/30" : ""
                  }`}
                >
                  {/* Step Header - Always Visible */}
                  <button
                    onClick={() => toggleExpanded(index)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1">
                      <h4
                        className={`font-medium ${
                          isCompleted ? "line-through text-muted-foreground" : ""
                        }`}
                      >
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
                      {/* Mini Timer Display */}
                      {step.duration > 0 && timer.isRunning && (
                        <motion.span
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-mono font-semibold"
                        >
                          {formatTime(timer.timeRemaining)}
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
                          {/* Description */}
                          <p className="text-muted-foreground mt-4 leading-relaxed">
                            {step.description}
                          </p>

                          {/* Tip */}
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

                          {/* Timer Controls */}
                          {step.duration > 0 && (
                            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleTimer(index);
                                    }}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                      timer.isRunning
                                        ? "bg-accent text-accent-foreground"
                                        : "bg-primary text-primary-foreground"
                                    } hover:scale-105`}
                                  >
                                    {timer.isRunning ? (
                                      <Pause className="w-5 h-5" />
                                    ) : (
                                      <Play className="w-5 h-5 ml-0.5" />
                                    )}
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      resetTimer(index);
                                    }}
                                    className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                  </button>
                                </div>

                                <motion.div
                                  key={timer.timeRemaining}
                                  initial={{ scale: 1.05 }}
                                  animate={{ scale: 1 }}
                                  className={`text-3xl font-mono font-bold ${
                                    timer.isComplete
                                      ? "text-secondary"
                                      : timer.timeRemaining < 60
                                      ? "text-accent"
                                      : "text-foreground"
                                  }`}
                                >
                                  {formatTime(timer.timeRemaining)}
                                </motion.div>
                              </div>

                              {timer.isComplete && (
                                <motion.p
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="text-center text-secondary font-medium mt-3"
                                >
                                  <CheckCircle2 className="w-4 h-4 inline-block mr-1 align-text-bottom" /> Timer complete!
                                </motion.p>
                              )}
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
