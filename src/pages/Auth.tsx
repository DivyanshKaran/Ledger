import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Mail, Lock, User, Loader2, ArrowLeft, ChefHat, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle, Cloud, Heart, BarChart3, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import PageTransition from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { getAuthErrorFromParams, getRedirectTarget, isOAuthReturn, signInWithGoogleOAuth } from "@/services/authService";
import { trackError, trackEvent } from "@/lib/telemetry";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getSiteUrl } from "@/lib/siteUrl";
import PageSkeleton from "@/components/PageSkeleton";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const modeParam = searchParams.get("mode");
  const initialMode = modeParam === "signup" ? "signup" : modeParam === "reset" ? "reset" : "login";
  
  const [mode, setMode] = useState<"login" | "signup" | "reset">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const showNoticeOnly = showEmailVerification || resetSent;

  const redirectTarget = getRedirectTarget(searchParams, location.state);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(redirectTarget, { replace: true });
    }
  }, [user, navigate, redirectTarget]);

  useEffect(() => {
    const errorFromQuery = getAuthErrorFromParams(searchParams);
    if (errorFromQuery) {
      setAuthError(errorFromQuery);
      trackError("auth_oauth_callback_error", new Error(errorFromQuery));
      return;
    }

    if (isOAuthReturn(searchParams)) {
      trackEvent("auth_oauth_callback_received", { hasCode: searchParams.has("code") });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success("Welcome back!");
        navigate(redirectTarget, { replace: true });
     } else if (mode === "reset") {
         const siteUrl = getSiteUrl() || window.location.origin;
         const { error } = await supabase.auth.resetPasswordForEmail(email, {
           redirectTo: `${siteUrl}/auth?mode=login`,
         });
         if (error) throw error;
         setResetSent(true);
         toast.success("Password reset email sent!");
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) throw error;
         setShowEmailVerification(true);
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
      trackError("auth_submit_error", error, { mode });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setAuthError(null);
    try {
      const { error } = await signInWithGoogleOAuth(redirectTarget);
      if (error) throw error;
      trackEvent("auth_google_oauth_start", { redirectTarget });
    } catch (error: any) {
      toast.error(error.message || "Google sign-in failed");
      trackError("auth_google_oauth_error", error);
      setGoogleLoading(false);
    }
  };

  const features: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }[] = [
    { icon: Cloud,     title: "Save Recipes",   desc: "Sync across all devices" },
    { icon: Heart,     title: "Favorites",       desc: "Quick access to loved recipes" },
    { icon: BarChart3, title: "Cost Tracking",   desc: "Custom ingredient prices" },
    { icon: Users,     title: "Follow Authors",  desc: "Discover new chefs" },
  ];

  if (authLoading) {
    return <PageSkeleton variant="auth" />;
  }

  return (
    <PageTransition>
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/70 relative overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-foreground/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-24 h-24 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8"
            >
              <ChefHat className="w-12 h-12" />
            </motion.div>
            
            <h1 className="font-display text-4xl font-bold mb-4">
              <span className="opacity-80">Ledger</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-12 max-w-md">
              Your personal kitchen companion. Know exactly what you'll spend before you cook.
            </p>

            {/* Feature Cards */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-4 bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4"
                >
                  <feature.icon className="w-6 h-6 shrink-0" />
                  <div className="text-left">
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-primary-foreground/70">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="lg:hidden flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-semibold text-primary">
                Ledger
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/recipes")}
              className="gap-2 text-muted-foreground hover:text-foreground ml-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </div>

           {authError && (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="mb-4"
             >
               <Alert variant="destructive">
                 <AlertCircle className="h-4 w-4" />
                 <AlertDescription className="text-sm">{authError}</AlertDescription>
               </Alert>
             </motion.div>
           )}

           {isOAuthReturn(searchParams) && !user && !authError && (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="mb-4"
             >
               <Alert className="border-primary/50 bg-primary/5">
                 <Loader2 className="h-4 w-4 animate-spin text-primary" />
                 <AlertDescription className="text-sm">
                   Completing Google sign-in...
                 </AlertDescription>
               </Alert>
             </motion.div>
           )}

           <div className="bg-card rounded-2xl border border-border/70 shadow-warm-lg overflow-hidden">
            {showNoticeOnly ? (
              <div className="p-6 sm:p-7 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  {showEmailVerification ? (
                    <CheckCircle className="w-6 h-6 text-primary" />
                  ) : (
                    <Mail className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold mb-1.5">
                    {showEmailVerification ? "Check your email" : "Password reset sent"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {showEmailVerification
                      ? `We've sent a verification link to ${email}. Please verify to finish registration.`
                      : `Check your inbox at ${email} for instructions to reset your password.`}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEmailVerification(false);
                    setResetSent(false);
                    setMode("login");
                  }}
                  className="w-full h-11"
                >
                  Back to Sign In
                </Button>
                <p className="text-xs text-muted-foreground">
                  Didn&apos;t receive it? Check your spam folder or try again.
                </p>
              </div>
            ) : (
              <>
                {/* Tab Switcher */}
                {mode !== "reset" && (
                  <div className="flex border-b border-border/70">
                    {(["login", "signup"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => {
                          setMode(tab);
                          setShowEmailVerification(false);
                          setResetSent(false);
                        }}
                        className={`flex-1 py-3 text-[13px] sm:text-sm font-medium transition-colors relative ${
                          mode === tab 
                            ? "text-foreground" 
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {tab === "login" ? "Sign In" : "Create Account"}
                        {mode === tab && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {mode === "reset" && (
                  <div className="flex border-b border-border/70">
                    <button
                      onClick={() => {
                        setMode("login");
                        setResetSent(false);
                      }}
                      className="flex-1 py-3 text-[13px] sm:text-sm font-medium text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Sign In
                    </button>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={mode}
                      initial={{ opacity: 0, x: mode === "signup" ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: mode === "signup" ? -20 : 20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="text-center mb-4">
                        <h2 className="font-display text-xl sm:text-2xl font-semibold mb-1.5">
                          {mode === "login" ? "Welcome back" : mode === "reset" ? "Reset Password" : "Join Ledger"}
                        </h2>
                        <p className="text-muted-foreground text-[13px] sm:text-sm">
                          {mode === "login" 
                            ? "Sign in to access your saved recipes and preferences." 
                            : mode === "reset"
                            ? "Enter your email to receive a reset link."
                            : "Create an account to save recipes and track costs."}
                        </p>
                      </div>

                      {/* Google Sign In Button */}
                      {mode !== "reset" && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleGoogleSignIn}
                            disabled={googleLoading}
                            className="w-full h-11 gap-3 text-sm"
                          >
                            {googleLoading ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                              </svg>
                            )}
                            Continue with Google
                          </Button>

                          <div className="relative my-1">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-border/70" />
                            </div>
                            <div className="relative flex justify-center text-[11px] tracking-[0.16em] text-muted-foreground">
                              <span className="bg-card px-2">Or use email</span>
                            </div>
                          </div>
                        </>
                      )}

                      {mode === "signup" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <label className="block text-sm font-medium mb-1.5">Display Name</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              type="text"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              placeholder="Your name"
                              className="pl-11 h-11"
                            />
                          </div>
                        </motion.div>
                      )}

                      <div>
                        <label className="block text-sm font-medium mb-1.5">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="pl-11 h-11"
                          />
                        </div>
                      </div>

                      {mode !== "reset" && (
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              required
                              minLength={6}
                              className="pl-11 pr-11 h-11"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={showPassword ? "Hide password" : "Show password"}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      )}

                      {mode === "login" && (
                        <button
                          type="button"
                          onClick={() => setMode("reset")}
                          className="text-xs text-primary hover:underline text-left"
                        >
                          Forgot your password?
                        </button>
                      )}

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 text-sm shadow-warm"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            {mode === "login" ? "Signing in..." : mode === "reset" ? "Sending..." : "Creating account..."}
                          </>
                        ) : (
                          <>
                            {mode === "login" ? "Sign In" : mode === "reset" ? "Send Reset Link" : "Create Account"}
                            <Sparkles className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </AnimatePresence>
                </form>
              </>
            )}
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-muted-foreground mt-5">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
    </PageTransition>
  );
}
