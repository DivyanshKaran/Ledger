import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderPlus, Trash2, Globe, Lock, Plus, BookOpen, MoreVertical } from "lucide-react";
import { useCollections } from "@/hooks/useCollections";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface RecipeCollectionsProps {
  onSelectCollection?: (collectionId: string) => void;
}

export default function RecipeCollections({ onSelectCollection }: RecipeCollectionsProps) {
  const { collections, loading, createCollection, deleteCollection, updateCollection } = useCollections();
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createCollection(newName.trim(), newDesc.trim() || undefined);
    setNewName("");
    setNewDesc("");
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Create Collection Button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="mb-4 gap-2">
            <FolderPlus className="w-4 h-4" />
            New Collection
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input
              placeholder="Collection name (e.g., Weeknight Dinners)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            <Input
              placeholder="Description (optional)"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
            />
            <Button onClick={handleCreate} disabled={!newName.trim()} className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Create Collection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No collections yet. Create one to organize your recipes!</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {collections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => onSelectCollection?.(collection.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {collection.name}
                    </h3>
                    {collection.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{collection.description}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        updateCollection(collection.id, { is_public: !collection.is_public });
                      }}>
                        {collection.is_public ? (
                          <><Lock className="w-3.5 h-3.5 mr-2" /> Make Private</>
                        ) : (
                          <><Globe className="w-3.5 h-3.5 mr-2" /> Make Public</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCollection(collection.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {collection.recipe_count || 0} recipes
                  </Badge>
                  {collection.is_public ? (
                    <Badge variant="outline" className="text-[10px] h-5 gap-1">
                      <Globe className="w-2.5 h-2.5" /> Public
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] h-5 gap-1">
                      <Lock className="w-2.5 h-2.5" /> Private
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Add to Collection Popover for Recipe Detail page
export function AddToCollectionButton({ recipeId }: { recipeId: string }) {
  const { collections, addRecipeToCollection, createCollection } = useCollections();
  const [open, setOpen] = useState(false);
  const [quickName, setQuickName] = useState("");

  const handleAdd = async (collectionId: string) => {
    await addRecipeToCollection(collectionId, recipeId);
    setOpen(false);
  };

  const handleQuickCreate = async () => {
    if (!quickName.trim()) return;
    const col = await createCollection(quickName.trim());
    if (col) {
      await addRecipeToCollection(col.id, recipeId);
      setQuickName("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-9">
          <FolderPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Collection</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
          {collections.map(c => (
            <button
              key={c.id}
              onClick={() => handleAdd(c.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.recipe_count || 0} recipes</p>
              </div>
              <Plus className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="New collection name..."
            value={quickName}
            onChange={e => setQuickName(e.target.value)}
            className="text-sm h-9"
            onKeyDown={e => e.key === "Enter" && handleQuickCreate()}
          />
          <Button size="sm" onClick={handleQuickCreate} disabled={!quickName.trim()} className="h-9">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
