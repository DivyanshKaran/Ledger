import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChefHat, Heart, Star, MessageSquare, UserPlus, Clock, TrendingUp } from "lucide-react";
import { useActivityFeed, ActivityItem } from "@/hooks/useActivityFeed";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const getActivityIcon = (type: string) => {
  switch (type) {
    case "new_recipe": return <ChefHat className="w-4 h-4 text-primary" />;
    case "cooked": return <Star className="w-4 h-4 text-amber-500" />;
    case "review": return <MessageSquare className="w-4 h-4 text-blue-500" />;
    case "follow": return <UserPlus className="w-4 h-4 text-green-500" />;
    case "favorite": return <Heart className="w-4 h-4 text-rose-500" />;
    default: return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
};

const getActivityText = (activity: ActivityItem) => {
  const name = activity.user_name || "Someone";
  switch (activity.activity_type) {
    case "new_recipe":
      return <><strong>{name}</strong> shared a new recipe: <strong>{activity.metadata?.recipe_title || "a recipe"}</strong></>;
    case "cooked":
      return <><strong>{name}</strong> cooked <strong>{activity.metadata?.recipe_title || "a recipe"}</strong></>;
    case "review":
      return <><strong>{name}</strong> reviewed <strong>{activity.metadata?.recipe_title || "a recipe"}</strong></>;
    case "follow":
      return <><strong>{name}</strong> started following <strong>{activity.metadata?.target_name || "someone"}</strong></>;
    case "favorite":
      return <><strong>{name}</strong> favorited <strong>{activity.metadata?.recipe_title || "a recipe"}</strong></>;
    default:
      return <><strong>{name}</strong> was active</>;
  }
};

export default function ActivityFeed() {
  const { activities, loading } = useActivityFeed();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <TrendingUp className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No activity yet. Be the first to cook something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => {
            if (activity.target_id && ["new_recipe", "cooked", "review", "favorite"].includes(activity.activity_type)) {
              navigate(`/recipe/${activity.target_id}`);
            }
          }}
        >
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={activity.user_avatar || undefined} />
            <AvatarFallback className="text-[10px] bg-muted">
              {(activity.user_name || "?").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-sm leading-snug">
              {getActivityText(activity)}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {getActivityIcon(activity.activity_type)}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
