import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare, Send, Trash2, User } from "lucide-react";
import { useRecipeRatings, useRecipeComments } from "@/hooks/useReviews";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RecipeReviewsProps {
  recipeId: string;
}

function StarRating({ 
  rating, 
  onRate, 
  interactive = false,
  size = "md" 
}: { 
  rating: number; 
  onRate?: (rating: number) => void;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (interactive && hoverRating > 0) 
          ? star <= hoverRating 
          : star <= Math.round(rating);
        
        return (
          <motion.button
            key={star}
            type="button"
            whileHover={interactive ? { scale: 1.15 } : {}}
            whileTap={interactive ? { scale: 0.9 } : {}}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && onRate?.(star)}
            disabled={!interactive}
            className={`${interactive ? "cursor-pointer" : "cursor-default"} transition-colors`}
          >
            <Star 
              className={`${sizeClasses[size]} ${
                filled 
                  ? "fill-primary text-primary" 
                  : "text-muted-foreground/40"
              }`} 
            />
          </motion.button>
        );
      })}
    </div>
  );
}

export default function RecipeReviews({ recipeId }: RecipeReviewsProps) {
  const { user } = useAuth();
  const { averageRating, ratingCount, userRating, submitRating, loading: ratingsLoading } = useRecipeRatings(recipeId);
  const { comments, addComment, deleteComment, currentUserId, loading: commentsLoading } = useRecipeComments(recipeId);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    const success = await addComment(newComment);
    if (success) {
      setNewComment("");
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-display font-bold text-primary">
                {averageRating > 0 ? averageRating.toFixed(1) : "—"}
              </p>
              <StarRating rating={averageRating} size="sm" />
              <p className="text-sm text-muted-foreground mt-1">
                {ratingCount} {ratingCount === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>

          {user ? (
            <div className="flex flex-col items-start sm:items-end gap-2">
              <p className="text-sm font-medium">
                {userRating ? "Your rating" : "Rate this recipe"}
              </p>
              <StarRating 
                rating={userRating || 0} 
                onRate={submitRating}
                interactive 
                size="lg"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sign in to rate this recipe
            </p>
          )}
        </div>
      </motion.div>

      {/* Comments Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border overflow-hidden"
      >
        <div className="p-5 border-b border-border bg-muted/30">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Comments
            <span className="text-sm font-normal text-muted-foreground">
              ({comments.length})
            </span>
          </h3>
        </div>

        {/* Add Comment */}
        {user ? (
          <div className="p-5 border-b border-border">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on this recipe..."
                  className="min-h-[80px] resize-none bg-background"
                  maxLength={1000}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {newComment.length}/1000
                  </span>
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submitting}
                    size="sm"
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 border-b border-border text-center">
            <p className="text-muted-foreground">Sign in to leave a comment</p>
          </div>
        )}

        {/* Comments List */}
        <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {comments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center"
              >
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No comments yet</p>
                <p className="text-sm text-muted-foreground">Be the first to share your thoughts!</p>
              </motion.div>
            ) : (
              comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-5 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-secondary">
                        {comment.display_name?.charAt(0).toUpperCase() || "A"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-medium truncate">
                          {comment.display_name || "Anonymous"}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                          {currentUserId === comment.user_id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteComment(comment.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export { StarRating };
