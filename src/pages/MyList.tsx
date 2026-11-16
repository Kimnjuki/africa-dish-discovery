import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSavedItems, type SavedItemType } from "@/hooks/useSavedItems";
import { Heart, Trash2, BookMarked, Plus } from "lucide-react";
import {
  createFolder,
  deleteFolder,
  getRecipeBox,
  removeFromFolder,
  type RecipeBoxState,
} from "@/lib/recipeBox";
import { getRecentlyViewed, type RecentRecipe } from "@/lib/recentlyViewed";
import { toast } from "sonner";

const TABS: { id: SavedItemType; label: string; path: (s: string) => string }[] = [
  { id: "dish", label: "Dishes", path: (s) => `/dish/${s}` },
  { id: "recipe", label: "Recipes", path: (s) => `/recipe/${s}` },
  { id: "country", label: "Countries", path: (s) => `/country/${s}` },
];

const MyList = () => {
  const { user, items, loading, remove } = useSavedItems();
  const [box, setBox] = useState<RecipeBoxState>(() => getRecipeBox());
  const [recent, setRecent] = useState<RecentRecipe[]>(() => getRecentlyViewed());
  const [newFolder, setNewFolder] = useState("");
  const [activeFolder, setActiveFolder] = useState("favorites");

  useEffect(() => {
    const onChange = () => setBox(getRecipeBox());
    const onRecent = () => setRecent(getRecentlyViewed());
    window.addEventListener("ladhaquest:recipe-box", onChange);
    window.addEventListener("ladhaquest:recently-viewed", onRecent);
    return () => {
      window.removeEventListener("ladhaquest:recipe-box", onChange);
      window.removeEventListener("ladhaquest:recently-viewed", onRecent);
    };
  }, []);

  const folderEntries = box.entries.filter((e) => e.folderId === activeFolder);

  const handleCreateFolder = () => {
    if (!newFolder.trim()) return;
    const next = createFolder(newFolder);
    setBox(next);
    setNewFolder("");
    toast.success("Folder created");
  };

  return (
    <div className="min-h-screen">
      <PageMeta
        title="My list | LadhaQuest"
        description="Your saved African dishes, recipes, Recipe Box folders and countries."
        noIndex
      />
      <Navigation />
      <main className="pt-24 pb-16 container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-6 flex items-center gap-3">
          <Heart className="w-8 h-8 text-primary" />
          My list
        </h1>

        {recent.length > 0 && (
          <section className="mb-10 space-y-4">
            <h2 className="text-xl font-semibold">Continue cooking</h2>
            <p className="text-sm text-muted-foreground">Recently opened recipes on this device.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recent.slice(0, 9).map((r) => (
                <Card key={r.id}>
                  <CardContent className="p-4">
                    <Link to={`/recipe/${r.slug}`} className="font-medium hover:text-primary block truncate">
                      {r.name}
                    </Link>
                    {r.country && (
                      <p className="text-xs text-muted-foreground">{r.country}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section className="mb-10 space-y-4">
          <div className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Recipe Box</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Folders work offline on this device. Save recipes from any recipe page.
          </p>
          <div className="flex flex-wrap gap-2">
            {box.folders.map((folder) => (
              <Button
                key={folder.id}
                type="button"
                size="sm"
                variant={activeFolder === folder.id ? "default" : "outline"}
                onClick={() => setActiveFolder(folder.id)}
              >
                {folder.name} ({box.entries.filter((e) => e.folderId === folder.id).length})
              </Button>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:max-w-md">
            <Input
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
              placeholder="New folder name"
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            />
            <Button type="button" onClick={handleCreateFolder}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add folder
            </Button>
            {!["favorites", "weeknight", "cooked"].includes(activeFolder) && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setBox(deleteFolder(activeFolder));
                  setActiveFolder("favorites");
                  toast.success("Folder removed");
                }}
              >
                Delete folder
              </Button>
            )}
          </div>
          {folderEntries.length === 0 ? (
            <p className="text-muted-foreground">
              Nothing in this folder yet — use Recipe Box on a recipe page.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {folderEntries.map((entry) => (
                <Card key={`${entry.folderId}-${entry.recipeId}`}>
                  <CardContent className="p-4 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        to={`/recipe/${entry.slug}`}
                        className="font-medium hover:text-primary truncate block"
                      >
                        {entry.name}
                      </Link>
                      {entry.country && (
                        <p className="text-xs text-muted-foreground">{entry.country}</p>
                      )}
                      {entry.cookedAt && (
                        <p className="text-xs text-muted-foreground">
                          Cooked {new Date(entry.cookedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Remove from folder"
                      onClick={() => {
                        setBox(removeFromFolder(entry.recipeId, entry.folderId));
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : !user ? (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <p>Sign in to sync hearts across devices. Recipe Box folders above still work offline.</p>
              <Button asChild variant="hero">
                <Link to="/auth">Sign in</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="dish">
            <TabsList className="mb-6">
              {TABS.map((t) => (
                <TabsTrigger key={t.id} value={t.id}>
                  {t.label} ({items.filter((i) => i.item_type === t.id).length})
                </TabsTrigger>
              ))}
            </TabsList>
            {TABS.map((t) => {
              const list = items.filter((i) => i.item_type === t.id);
              return (
                <TabsContent key={t.id} value={t.id}>
                  {list.length === 0 ? (
                    <p className="text-muted-foreground">
                      Nothing saved yet — tap the heart on any{" "}
                      {t.label.toLowerCase().slice(0, -1)} page.
                    </p>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {list.map((i) => (
                        <Card key={i.id}>
                          <CardContent className="p-4 flex items-center justify-between gap-2">
                            <Link
                              to={t.path(i.item_slug)}
                              className="font-medium hover:text-primary truncate"
                            >
                              {i.label || i.item_slug}
                            </Link>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Remove"
                              onClick={() => remove(i.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyList;
