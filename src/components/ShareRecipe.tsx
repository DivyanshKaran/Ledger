import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Link, Copy, Check, X, Facebook, Twitter, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { PostgrestError } from "@supabase/supabase-js";

interface ShareRecipeProps {
  recipeId: string;
  recipeTitle: string;
  isCustom?: boolean;
}

function generateShareCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const randomBytes = new Uint32Array(8);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes, (value) => chars[value % chars.length]).join("");
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function generateShareSecret(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export default function ShareRecipe({ recipeId, recipeTitle, isCustom }: ShareRecipeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const createShareLink = async () => {
    if (!user?.id) {
      toast.error("Please sign in to create a share link");
      return;
    }

    setLoading(true);
    try {
      const maxAttempts = 5;
      let createdCode: string | null = null;
      let createdSecret: string | null = null;
      let lastError: PostgrestError | null = null;

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const shareCode = generateShareCode();
        const shareSecret = generateShareSecret();
        const shareSecretHash = await sha256Hex(shareSecret);
        const shareData = {
          share_code: shareCode,
          share_secret_hash: shareSecretHash,
          shared_by: user.id,
          ...(isCustom
            ? { recipe_id: recipeId, preset_recipe_id: null }
            : { recipe_id: null, preset_recipe_id: recipeId }
          ),
        };

        const { error } = await supabase
          .from("shared_recipes")
          .insert(shareData);

        if (!error) {
          createdCode = shareCode;
          createdSecret = shareSecret;
          break;
        }

        lastError = error;
        if (error.code !== "23505") break;
      }

      if (!createdCode || !createdSecret) {
        throw lastError || new Error("Failed to create share link");
      }

      const shareToken = `${createdCode}.${createdSecret}`;
      const url = `${window.location.origin}?share=${encodeURIComponent(shareToken)}`;
      setShareUrl(url);
    } catch (error) {
      toast.error("Failed to create share link");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const shareToSocial = (platform: "facebook" | "twitter" | "email") => {
    if (!shareUrl) return;
    
    const text = `Check out this recipe: ${recipeTitle}`;
    let url = "";

    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "email":
        url = `mailto:?subject=${encodeURIComponent(`Recipe: ${recipeTitle}`)}&body=${encodeURIComponent(`${text}\n\n${shareUrl}`)}`;
        break;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(true);
          if (!shareUrl) createShareLink();
        }}
        className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">Share</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl w-full max-w-md shadow-warm-lg overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold">Share Recipe</h3>
                  <p className="text-sm text-muted-foreground">{recipeTitle}</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-muted rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-5">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : shareUrl ? (
                  <>
                    {/* Share URL */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Share Link</label>
                      <div className="flex gap-2">
                        <div className="flex-1 px-4 py-3 bg-muted rounded-xl text-sm truncate flex items-center gap-2">
                          <Link className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{shareUrl}</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={copyToClipboard}
                          className={`px-4 py-3 rounded-xl flex items-center gap-2 transition-colors ${
                            copied 
                              ? "bg-green-500 text-white" 
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </motion.button>
                      </div>
                    </div>

                    {/* Social Share */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Share on</label>
                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => shareToSocial("facebook")}
                          className="flex-1 py-3 bg-[#1877F2] text-white rounded-xl flex items-center justify-center gap-2"
                        >
                          <Facebook className="w-5 h-5" />
                          <span className="hidden sm:inline">Facebook</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => shareToSocial("twitter")}
                          className="flex-1 py-3 bg-[#1DA1F2] text-white rounded-xl flex items-center justify-center gap-2"
                        >
                          <Twitter className="w-5 h-5" />
                          <span className="hidden sm:inline">Twitter</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => shareToSocial("email")}
                          className="flex-1 py-3 bg-muted rounded-xl flex items-center justify-center gap-2"
                        >
                          <Mail className="w-5 h-5" />
                          <span className="hidden sm:inline">Email</span>
                        </motion.button>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
