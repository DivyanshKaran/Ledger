 import { useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { motion } from "framer-motion";
 import { Users, ArrowLeft, Search, ChefHat, CheckCircle } from "lucide-react";
 import { useAuthors, useFollow } from "@/hooks/useAuthors";
 import { useAuth } from "@/hooks/useAuth";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Badge } from "@/components/ui/badge";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import Navbar from "@/components/Navbar";
 import PageTransition from "@/components/PageTransition";
 import PageSkeleton from "@/components/PageSkeleton";
 
 export default function Authors() {
   const navigate = useNavigate();
   const { user } = useAuth();
   const { authors, loading } = useAuthors();
   const { isFollowing, toggleFollow } = useFollow();
   const [searchQuery, setSearchQuery] = useState("");
 
   const filteredAuthors = authors.filter(
     (a) =>
       a.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       a.bio?.toLowerCase().includes(searchQuery.toLowerCase())
   );
 
  if (loading) {
    return <PageSkeleton variant="grid" />;
  }

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
 
         {/* Header */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex items-center gap-3 mb-6"
         >
           <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
             <Users className="w-6 h-6 text-primary-foreground" />
           </div>
           <div>
             <h1 className="font-display text-2xl sm:text-3xl font-bold">Recipe Authors</h1>
             <p className="text-muted-foreground">
               Discover and follow talented home chefs
             </p>
           </div>
         </motion.div>
 
         {/* Search */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="mb-8"
         >
           <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
             <Input
               type="text"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search authors..."
               className="pl-12 h-10 sm:h-12"
             />
           </div>
         </motion.div>
 
      {/* Authors List */}
        {filteredAuthors.length > 0 ? (
           <div className="space-y-3">
             {filteredAuthors.map((author, index) => {
               const initial = author.display_name?.charAt(0).toUpperCase() || "A";
               const following = isFollowing(author.user_id);
               const isOwnProfile = user?.id === author.user_id;
 
               return (
                 <motion.div
                   key={author.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.05 }}
                   className="bg-card rounded-xl border border-border p-3 sm:p-4 hover:border-primary/50 transition-all"
                 >
                   <div className="flex items-center gap-3 sm:gap-4">
                     <button
                       onClick={() => navigate(`/author/${author.user_id}`)}
                       className="flex-shrink-0"
                     >
                       <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-primary/20">
                         <AvatarImage src={author.avatar_url || undefined} />
                         <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xl font-bold">
                           {initial}
                         </AvatarFallback>
                       </Avatar>
                     </button>
 
                     <div className="flex-1 min-w-0">
                       <button
                         onClick={() => navigate(`/author/${author.user_id}`)}
                         className="text-left"
                       >
                         <div className="flex items-center gap-2">
                           <h3 className="font-medium truncate hover:text-primary transition-colors">
                             {author.display_name || "Anonymous Chef"}
                           </h3>
                           {author.is_verified && (
                             <Badge className="gap-1 bg-primary/10 text-primary border-primary/20 text-xs">
                               <CheckCircle className="w-3 h-3" />
                             </Badge>
                           )}
                         </div>
                       </button>
                       {author.bio && (
                         <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                           {author.bio}
                         </p>
                       )}
                       <div className="flex items-center gap-2 sm:gap-4 mt-2 text-xs text-muted-foreground">
                         <span className="flex items-center gap-1">
                           <ChefHat className="w-3 h-3" />
                           {author.recipe_count || 0} recipes
                         </span>
                         <span>{author.follower_count || 0} followers</span>
                       </div>
                     </div>
 
                     {!isOwnProfile && (
                       <Button
                         size="sm"
                         variant={following ? "outline" : "default"}
                         onClick={() => toggleFollow(author.user_id)}
                         className="flex-shrink-0"
                       >
                         {following ? "Following" : "Follow"}
                       </Button>
                     )}
 
                     {isOwnProfile && (
                       <Badge variant="secondary">You</Badge>
                     )}
                   </div>
                 </motion.div>
               );
             })}
           </div>
         ) : (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-muted/30 rounded-2xl p-12 text-center"
           >
             <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
             <h2 className="font-display text-xl font-semibold mb-2">No authors found</h2>
             <p className="text-muted-foreground">
               {searchQuery
                 ? `No authors match "${searchQuery}"`
                 : "Be the first to create and share recipes!"}
             </p>
           </motion.div>
         )}
      </div>
    </div>
    </PageTransition>
  );
 }