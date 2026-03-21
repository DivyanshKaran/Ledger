 import { useState, useEffect } from "react";
 import { useParams, useNavigate } from "react-router-dom";
 import { motion } from "framer-motion";
 import { ArrowLeft, MapPin, Globe, Calendar, ChefHat, Users, Heart, CheckCircle, Clock } from "lucide-react";
 import { useAuthor, useFollow } from "@/hooks/useAuthors";
 import { useAuthorRecipes } from "@/hooks/useRecipes";
 import { useAuth } from "@/hooks/useAuth";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import PageTransition from "@/components/PageTransition";
 import PageSkeleton from "@/components/PageSkeleton";
 
 import Navbar from "@/components/Navbar";
 import { calculateRecipeCost } from "@/data/recipes";
 import { useCurrency } from "@/hooks/useCurrency";
 import { sanitizeExternalUrl } from "@/lib/security";
 import { format } from "date-fns";
 
 export default function AuthorPage() {
   const { userId } = useParams<{ userId: string }>();
   const navigate = useNavigate();
   const { user } = useAuth();
   const { author, loading: authorLoading } = useAuthor(userId);
   const { recipes, loading: recipesLoading } = useAuthorRecipes(userId);
   const { isFollowing, toggleFollow, loading: followLoading } = useFollow();
   const { formatPrice } = useCurrency();
 
   const isOwnProfile = user?.id === userId;
   const following = userId ? isFollowing(userId) : false;
 
  if (authorLoading) {
    return <PageSkeleton variant="profile" />;
  }
 
   if (!author) {
     return (
       <div className="min-h-screen bg-background">
         <Navbar onLogoClick={() => navigate("/")} />
         <div className="max-w-4xl mx-auto px-4 py-16 text-center">
           <ChefHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
           <h1 className="text-2xl font-display font-semibold mb-2">Author Not Found</h1>
           <p className="text-muted-foreground mb-6">
             This author profile doesn't exist or has been removed.
           </p>
           <Button onClick={() => navigate("/")}>Back to Home</Button>
         </div>
       </div>
     );
   }
 
   const initial = author.display_name?.charAt(0).toUpperCase() || "A";
   const websiteUrl = sanitizeExternalUrl(author.website);
 
  return (
    <PageTransition>
    <div className="min-h-screen bg-background">
       <Navbar onLogoClick={() => navigate("/")} />
 
       <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8">
         {/* Back Button */}
         <Button
           variant="ghost"
           size="sm"
           onClick={() => navigate(-1)}
           className="mb-6 gap-2"
         >
           <ArrowLeft className="w-4 h-4" />
           Back
         </Button>
 
         {/* Author Header */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-card rounded-2xl border border-border p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8"
         >
           <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
             {/* Avatar */}
             <Avatar className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 border-4 border-primary/20">
               <AvatarImage src={author.avatar_url || undefined} />
               <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-3xl font-bold">
                 {initial}
               </AvatarFallback>
             </Avatar>
 
             {/* Info */}
             <div className="flex-1 text-center sm:text-left">
               <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                 <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold">
                   {author.display_name || "Anonymous Chef"}
                 </h1>
                 {author.is_verified && (
                   <Badge className="gap-1 bg-primary/10 text-primary border-primary/20">
                     <CheckCircle className="w-3 h-3" />
                     Verified
                   </Badge>
                 )}
               </div>
 
               {author.bio && (
                 <p className="text-muted-foreground mb-4 max-w-xl">{author.bio}</p>
               )}
 
               {/* Meta Info */}
               <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-4">
                 {author.location && (
                   <div className="flex items-center gap-1">
                     <MapPin className="w-4 h-4" />
                     {author.location}
                   </div>
                 )}
                 {websiteUrl && (
                   <a
                     href={websiteUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center gap-1 text-primary hover:underline"
                   >
                     <Globe className="w-4 h-4" />
                     Website
                   </a>
                 )}
                 <div className="flex items-center gap-1">
                   <Calendar className="w-4 h-4" />
                   Joined {format(new Date(author.created_at), "MMM yyyy")}
                 </div>
               </div>
 
               {/* Stats */}
               <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6 mb-4">
                 <div className="text-center">
                   <p className="font-display text-lg sm:text-xl font-bold">{author.recipe_count || 0}</p>
                   <p className="text-xs text-muted-foreground">Recipes</p>
                 </div>
                 <div className="text-center">
                   <p className="font-display text-lg sm:text-xl font-bold">{author.follower_count || 0}</p>
                   <p className="text-xs text-muted-foreground">Followers</p>
                 </div>
                 <div className="text-center">
                   <p className="font-display text-lg sm:text-xl font-bold">{author.following_count || 0}</p>
                   <p className="text-xs text-muted-foreground">Following</p>
                 </div>
               </div>
 
               {/* Actions */}
               {!isOwnProfile && (
                 <Button
                   onClick={() => userId && toggleFollow(userId)}
                   disabled={followLoading}
                   variant={following ? "outline" : "default"}
                   className="gap-2"
                 >
                   {following ? (
                     <>
                       <Users className="w-4 h-4" />
                       Following
                     </>
                   ) : (
                     <>
                       <Heart className="w-4 h-4" />
                       Follow
                     </>
                   )}
                 </Button>
               )}
 
               {isOwnProfile && (
                 <Button
                   onClick={() => navigate("/profile")}
                   variant="outline"
                   className="gap-2"
                 >
                   Edit Profile
                 </Button>
               )}
             </div>
           </div>
         </motion.div>
 
         {/* Recipes */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
         >
           <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
             <ChefHat className="w-5 h-5 text-primary" />
             Recipes by {author.display_name || "this chef"}
           </h2>
 
          {recipesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
           ) : recipes.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
               {recipes.map((recipe) => (
                 <motion.div
                   key={recipe.id}
                   onClick={() => navigate(`/recipe/${recipe.id}`)}
                   whileHover={{ y: -4 }}
                   className="bg-card rounded-xl border border-border overflow-hidden cursor-pointer hover:border-primary/50 transition-all"
                 >
                   <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                     <ChefHat className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/30" />
                     <div className="absolute top-2 right-2 bg-primary px-2 py-1 rounded-full">
                       <span className="text-xs font-semibold text-primary-foreground">
                         {formatPrice(calculateRecipeCost(recipe.ingredients, recipe.servings, recipe.servings))}
                       </span>
                     </div>
                   </div>
                   <div className="p-3">
                     <h3 className="font-medium truncate mb-1">{recipe.title}</h3>
                     <div className="flex items-center gap-3 text-xs text-muted-foreground">
                       <span className="flex items-center gap-1">
                         <Clock className="w-3 h-3" />
                         {recipe.totalTime}
                       </span>
                       <span className="flex items-center gap-1">
                         <Users className="w-3 h-3" />
                         {recipe.servings}
                       </span>
                     </div>
                   </div>
                 </motion.div>
               ))}
             </div>
           ) : (
             <div className="bg-muted/30 rounded-xl p-8 text-center">
               <ChefHat className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
               <p className="text-muted-foreground">No public recipes yet</p>
             </div>
           )}
         </motion.div>
      </div>
    </div>
    </PageTransition>
  );
 }
